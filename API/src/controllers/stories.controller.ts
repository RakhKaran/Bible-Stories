import { DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { CategoryRepository, DownloadStoriesRepository, LikedStoriesRepository, StoriesRepository, UsersRepository } from "../repositories";
import { get, getJsonSchemaRef, getModelSchemaRef, HttpErrors, param, patch, post, Request, requestBody, response, RestBindings } from "@loopback/rest";
import { Stories } from "../models";
import { BibleStoriesDataSource } from "../datasources";
import { inject } from "@loopback/core";
import { authenticate, AuthenticationBindings } from "@loopback/authentication";
import { PermissionKeys } from "../authorization/permission-keys";
import { UserProfile } from "@loopback/security";
import { JWTService } from "../services/jwt-service";

export class StoriesController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(StoriesRepository)
    public storiesRepository : StoriesRepository,
    @repository(UsersRepository)
    public usersRepository : UsersRepository,
    @repository(CategoryRepository)
    public categoryRepository : CategoryRepository,
    @repository(LikedStoriesRepository)
    public likedStoriesRepository : LikedStoriesRepository,
    @repository(DownloadStoriesRepository)
    public downloadStoriesRepository : DownloadStoriesRepository,
    @inject('service.jwt.service')
    public jwtService: JWTService,
  ) {}

  // fetching token from header and returning userProfile...
  async validateCredentials(authHeader : string){
    try{
      if(authHeader){
        const parts = authHeader.split(' ');
        if(parts.length !== 2){
          throw new HttpErrors.BadRequest('Verify token! incorrect signature');
        }
        const token = parts[1]; 
        const userProfile = await this.jwtService.verifyToken(token);

        return userProfile
      }
    }catch(error){
      throw error;
    }
  }

  // new story..
  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @post('/stories', {
    responses: {
      '200': {
        description: 'Stories',
        content: {
          schema: getJsonSchemaRef(Stories),
        },
      },
    },
  })
  async newStory(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Stories, {
            exclude: ['id'],
          }),
        },
      },
    })
    storyData: Omit<Stories, 'id'>,
  ) {
    const repo = new DefaultTransactionalRepository(Stories, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try{
      await this.storiesRepository.create(storyData,{
        transaction: tx,
      });
      await tx.commit();

      return{
        success : true,
        message : 'New story Created'
      }
    }catch(error){
      await tx.rollback();
      throw error;
    }
  }

  // get Stories..
  @get('/story-list')
  async fetchStories(
    @inject(RestBindings.Http.REQUEST) request : Request,
  ): Promise<{ success: boolean; message: string; data: object }> {
    try {
      // checking for header
      const authHeader = request.headers.authorization;
      let currentUser : any = {};
      if(authHeader){
        currentUser = await this.validateCredentials(authHeader);
      }
      // Fetching user for audio language
      let user : any = {}
      if(currentUser.id){
        user = await this.usersRepository.findById(currentUser.id);
      }

      // Fetching all stories
      const stories = await this.storiesRepository.find();

      let filteredStories : any = stories;

      // Check if user exists and has an audio language preference
      if (user && user.audioLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = stories.map((story) => {
          const filteredAudios = story.audios.filter((audio : any) => 
            audio?.language?.id === user.audioLanguage
          );

        // if any story is not available in that audio language
        const fallbackAudios = filteredAudios.length
          ? filteredAudios
          : story.audios.filter((audio: any) => audio?.language?.code === 'en');

        return {
          ...story,
          audios: fallbackAudios, // Replace audios array with the filtered or fallback one
        };

        });
      }

      // user exists but audio language yet not set then try to compare with app lang...
      else if (user && !user.audioLanguage && user.appLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = stories.map((story) => {
          const filteredAudios = story.audios.filter((audio : any) => 
            audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
          );

        // if any story is not available in that audio language
        const fallbackAudios = filteredAudios.length
          ? filteredAudios
          : story.audios.filter((audio: any) => audio?.language?.code === 'en');

        return {
          ...story,
          audios: fallbackAudios, // Replace audios array with the filtered or fallback one
        };

        });
      }

      // returning english lang audio file...
      else{
        // Filter stories to include only audio matching the user's selected language
        filteredStories = stories.map((story) => {
          const filteredAudios = story.audios.filter((audio : any) => 
            audio?.language?.code === 'en'
          );

        return {
          ...story,
          audios: filteredAudios, // Replace audios array with the filtered or fallback one
        };

        });
      }

      return {
        success: true,
        message: 'Stories fetched successfully',
        data: filteredStories,
      };
    } catch (error) {
      throw error;
    }
  }

  // get story with id for admin..
  @get('/story-by-id-admin/{storyId}')
  async fetchStoryByIdForAdmin(
    @param.path.number('storyId') storyId : number
  ) : Promise<{success : boolean, message : string, data : Stories}>{
    try{
      const story = await this.storiesRepository.findById(storyId);

      if(!story){
        throw new HttpErrors.NotFound('Story not found');
      }

      return{
        success : true,
        message : "Story data",
        data : story
      }
    }catch(error){
      throw error;
    }
  }

  // get story with id for customer..
  @get('/story-by-id/{storyId}')
  async fetchStoryById(
    @param.path.number('storyId') storyId: number,
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<{ success: boolean; message: string; data: object }> {
    try {
      const story = await this.storiesRepository.findOne({
        where: { id: storyId },
        include: [
          {
            relation: 'category',
            scope: {
              fields: {
                id: true,
                categoryName: true,
              },
            },
          },
        ],
      });

      if (!story) {
        throw new HttpErrors.NotFound('Story not found');
      }

      // checking for header
      const authHeader = request.headers.authorization;
      let currentUser : any = {};
      if(authHeader){
        currentUser = await this.validateCredentials(authHeader);
      }

      let user: any = {};
      if (currentUser.id) {
        user = await this.usersRepository.findById(currentUser.id);
      }

      let filteredAudios = story.audios;

      let isLiked = false;

      let isDownload = false;

      // checking whether story is liked or not...
      if(user){
        const likedStory = await this.likedStoriesRepository.findOne({where : {usersId : user.id, storiesId : story.id}});

        if(likedStory){
          isLiked = true;
        }
      }

      if (user && user.audioLanguage) {
        // Filter by user's audio language, fallback to English if not found
        filteredAudios = story.audios.filter(
          (audio: any) =>
            audio.language.id === user.audioLanguage || audio.language.code === 'en'
        );

        const likedStory = await this.likedStoriesRepository.findOne({where : {usersId : user.id, storiesId : story.id}});

        if(likedStory){
          isLiked = true;
        }

        const downloadStory = await this.downloadStoriesRepository.findOne({where : {usersId : user.id, storiesId : story.id}});

        if(downloadStory){
          isDownload = true;
        }
      } else if (user && !user.audioLanguage && user.appLanguage) {
        // Filter by user's app language, fallback to English
        filteredAudios = story.audios.filter(
          (audio: any) =>
            audio.language.langName?.toLowerCase() === user.appLanguage?.toLowerCase() ||
            audio.language.code === 'en'
        );

        const likedStory = await this.likedStoriesRepository.findOne({where : {usersId : user.id, storiesId : story.id}});

        if(likedStory){
          isLiked = true;
        }

        const downloadStory = await this.downloadStoriesRepository.findOne({where : {usersId : user.id, storiesId : story.id}});

        if(downloadStory){
          isDownload = true;
        }
      } else {
        // Default to English audio
        filteredAudios = story.audios.filter(
          (audio: any) => audio.language.code === 'en'
        );
      }

      const filteredStory = {
        ...story,
        audios: filteredAudios,
        isLiked,
        isDownload
      };

      return {
        success: true,
        message: 'Story data',
        data: filteredStory,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update Story api..
  @patch('/stories/{storyId}')
  async updateStoryById(
    @param.path.number('storyId') storyId : number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Stories, {partial: true}),
        },
      },
    })
    storyData: Stories,
  ) : Promise<{success : boolean, message : string}>{
    try{
      const story = await this.storiesRepository.findById(storyId);

      if(!story){
        throw new HttpErrors.NotFound('Story Not Found');
      }

      await this.storiesRepository.updateById(story.id, storyData);

      return{
        success : true,
        message : "Story updated"
      }
    }catch(error){
      throw error;
    }
  }


  // testing only...
  @get('/get-user-details')
  async getUserDetails(
    @inject(RestBindings.Http.REQUEST) request: Request
  ) : Promise<{success : boolean, message : string}>{
    try{
      const authHeader = request.headers.authorization;

      if(authHeader){
        const parts = authHeader.split(' ');
        if(parts.length !== 2){
          throw new HttpErrors.NotFound('parts...');
        }
        const token = parts[1]; 
        console.log('token',token);
        const decodedToken = await this.jwtService.verifyToken(token);

        console.log('userprofile',decodedToken);

        return{
          success : true,
          message : 'working....'
        }
      }else{

        console.log('auth header is missing')
        return{
          success : false,
          message : 'not working'
        }
      }
    }catch(error){
      throw error;
    }
  }

  // audio-list with categories...
  @get('/home-page-audio-list')
  async homePageAudioList(
    @inject(RestBindings.Http.REQUEST) request : Request,
  ) : Promise<{
    success : boolean, 
    message : string, 
    data : {
      oldTestamentStories : Array<object>, 
      newTestamentStories : Array<object>
    }
  }>{
    try{
      const authHeader = request.headers.authorization;

      let currentUser : any = {};

      let user : any = {};

      if(authHeader){
        currentUser = await this.validateCredentials(authHeader);
      }

      if(currentUser.id){
        user = await this.usersRepository.findById(currentUser.id);
      };
      // fetching categories..
      const categories = await this.categoryRepository.find();

      if(!categories){
        throw new HttpErrors.BadRequest('Something went wrong, No Categories');
      }

      let oldTestamentStories : any = [];
      let newTestamentStories : any = [];

      await Promise.all(categories.map(async (cat) => {
        const stories = await this.storiesRepository.find({
          where: { categoryId: cat.id },
          limit : 5
        });   
        
        if(cat.categoryName.trim().toLowerCase() === 'Old Testament'.trim().toLowerCase()){
            console.log('entered...')
          if (user && user.audioLanguage) {
            // Filter stories to include only audio matching the user's selected language
            stories.map((story) => {
              const filteredAudios = story.audios.filter((audio : any) => 
                audio?.language?.id === user.audioLanguage
              );
    
            // if any story is not available in that audio language
            const fallbackAudios = filteredAudios.length
              ? filteredAudios
              : story.audios.filter((audio: any) => audio?.language?.code === 'en');
    
            oldTestamentStories.push({
              ...story,
              audios: fallbackAudios, // Replace audios array with the filtered or fallback one
            });
    
            });
          }
    
          // user exists but audio language yet not set then try to compare with app lang...
          else if (user && !user.audioLanguage && user.appLanguage) {
            // Filter stories to include only audio matching the user's selected language
            stories.map((story) => {
              const filteredAudios = story.audios.filter((audio : any) => 
                audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
              );
    
            // if any story is not available in that audio language
            const fallbackAudios = filteredAudios.length
              ? filteredAudios
              : story.audios.filter((audio: any) => audio?.language?.code === 'en');
    
              oldTestamentStories.push({
                ...story,
                audios: fallbackAudios, // Replace audios array with the filtered or fallback one
              });
    
            });
          }
    
          // returning english lang audio file...
          else{
            // Filter stories to include only audio matching the user's selected language
            stories.map((story) => {
              const filteredAudios = story.audios.filter((audio : any) => 
                audio?.language?.code === 'en'
              );
              
              oldTestamentStories.push({
                ...story,
                audios: filteredAudios, // Replace audios array with the filtered or fallback one
              });
    
            });
          }
        }else{
          if (user && user.audioLanguage) {
            // Filter stories to include only audio matching the user's selected language
            stories.map((story) => {
              const filteredAudios = story.audios.filter((audio : any) => 
                audio?.language?.id === user.audioLanguage
              );
    
            // if any story is not available in that audio language
            const fallbackAudios = filteredAudios.length
              ? filteredAudios
              : story.audios.filter((audio: any) => audio?.language?.code === 'en');
    
            newTestamentStories.push({
              ...story,
              audios: fallbackAudios, // Replace audios array with the filtered or fallback one
            });
    
            });
          }
    
          // user exists but audio language yet not set then try to compare with app lang...
          else if (user && !user.audioLanguage && user.appLanguage) {
            // Filter stories to include only audio matching the user's selected language
            stories.map((story) => {
              const filteredAudios = story.audios.filter((audio : any) => 
                audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
              );
    
            // if any story is not available in that audio language
            const fallbackAudios = filteredAudios.length
              ? filteredAudios
              : story.audios.filter((audio: any) => audio?.language?.code === 'en');
    
              newTestamentStories.push({
                ...story,
                audios: fallbackAudios, // Replace audios array with the filtered or fallback one
              });
    
            });
          }
    
          // returning english lang audio file...
          else{
            // Filter stories to include only audio matching the user's selected language
            stories.map((story) => {
              const filteredAudios = story.audios.filter((audio : any) => 
                audio?.language?.code === 'en'
              );
    
              newTestamentStories.push({
                ...story,
                audios: filteredAudios, // Replace audios array with the filtered or fallback one
              });    
            });
          }
        }
      }))
      
      return{
        success : true,
        message : 'Audio list',
        data : {
          oldTestamentStories : oldTestamentStories,
          newTestamentStories : newTestamentStories
        }
      }
    }catch(error){
      throw error;
    }
  }

  // audio-list by cateogory...
  @get('/stories-by-category/{categoryId}')
  async StoriesByCategory(
    @param.path.number('categoryId') categoryId : number,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('skip') skip: number = 0,   
    @inject(RestBindings.Http.REQUEST) request : Request,
  ) : Promise<{success : boolean, message : string, data : Array<object>}>{
    try{
      const authHeader = request.headers.authorization;

      let currentUser : any = {};
      let user : any = {};

      if(authHeader){
        currentUser = await this.validateCredentials(authHeader);
      };

      if(currentUser.id){
        user = await this.usersRepository.findById(currentUser.id);
      };

      const stories = await this.storiesRepository.find(
        {
          where : {
            categoryId : categoryId
          },
          limit : limit,
          skip : skip
        }
      );

      let filteredStories : any = stories;

      if (user && user.audioLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = stories.map((story) => {
          const filteredAudios = story.audios.filter((audio : any) => 
            audio?.language?.id === user.audioLanguage
          );

        // if any story is not available in that audio language
        const fallbackAudios = filteredAudios.length
          ? filteredAudios
          : story.audios.filter((audio: any) => audio?.language?.code === 'en');

        return {
          ...story,
          audios: fallbackAudios, // Replace audios array with the filtered or fallback one
        };

        });
      }

      // user exists but audio language yet not set then try to compare with app lang...
      else if (user && !user.audioLanguage && user.appLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = stories.map((story) => {
          const filteredAudios = story.audios.filter((audio : any) => 
            audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
          );

        // if any story is not available in that audio language
        const fallbackAudios = filteredAudios.length
          ? filteredAudios
          : story.audios.filter((audio: any) => audio?.language?.code === 'en');

        return {
          ...story,
          audios: fallbackAudios, // Replace audios array with the filtered or fallback one
        };

        });
      }

      // returning english lang audio file...
      else{
        // Filter stories to include only audio matching the user's selected language
        filteredStories = stories.map((story) => {
          const filteredAudios = story.audios.filter((audio : any) => 
            audio?.language?.code === 'en'
          );

        return {
          ...story,
          audios: filteredAudios, // Replace audios array with the filtered or fallback one
        };

        });
      }

      return {
        success : true,
        message : 'Audio list through category',
        data : filteredStories
      }
    }catch(error){
      throw error;
    }
  }

  // update story by id...
  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @patch('/stories/{id}')
  @response(204, {
    description: 'Category PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Stories, {partial: true}),
        },
      },
    })
    story: Stories,
  ): Promise<{success: boolean, message: string}> {
    try{
      await this.storiesRepository.updateById(id, story);
      return{
        success : true,
        message : 'Update success'
      }
    }catch(error){
      throw error;
    }
  }
}