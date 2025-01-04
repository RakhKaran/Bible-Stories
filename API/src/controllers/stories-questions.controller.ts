import { DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { StoriesQuestionsRepository, UsersRepository } from "../repositories";
import { get, getJsonSchemaRef, getModelSchemaRef, HttpErrors, param, patch, post, Request, requestBody, response, RestBindings } from "@loopback/rest";
import { Stories, StoriesQuestions } from "../models";
import { BibleStoriesDataSource } from "../datasources";
import { inject } from "@loopback/core";
import { authenticate } from "@loopback/authentication";
import { PermissionKeys } from "../authorization/permission-keys";
import { JWTService } from "../services/jwt-service";

export class StoriesQuestionsController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(StoriesQuestionsRepository)
    public storiesQuestionsRepository : StoriesQuestionsRepository,
    @repository(UsersRepository)
    public usersRepository : UsersRepository,
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

  // new story question..
  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @post('/stories-questions', {
    responses: {
      '200': {
        description: 'Stories Questions',
        content: {
          schema: getJsonSchemaRef(StoriesQuestions),
        },
      },
    },
  })
  async newStoryQuestion(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StoriesQuestions, {
            exclude: ['id'],
          }),
        },
      },
    })
    storyQuestionData: Omit<StoriesQuestions, 'id'>,
  ) {
    const repo = new DefaultTransactionalRepository(Stories, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try{
      await this.storiesQuestionsRepository.create(storyQuestionData,{
        transaction: tx,
      });
      await tx.commit();

      return{
        success : true,
        message : 'New question Created'
      }
    }catch(error){
      await tx.rollback();
      throw error;
    }
  }

  // get Stories Questions..
  @get('/story-question-list/{storyId}')
  async fetchStoriesQuestions(
    @param.path.number('storyId') storyId : number,
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
      const storiesQuestions = await this.storiesQuestionsRepository.find({where : {storiesId : storyId}});

      let filteredStories : any = storiesQuestions;

      // Check if user exists and has an audio language preference
      if (user && user.audioLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = storiesQuestions.map((question) => {
          const filteredAudios = question.audios.filter((audio : any) => 
            audio?.language?.id === user.audioLanguage
          );

        // if any story is not available in that audio language
        const fallbackAudios = filteredAudios.length
          ? filteredAudios
          : question.audios.filter((audio: any) => audio?.language?.code === 'en');

        return {
          ...question,
          audios: fallbackAudios, // Replace audios array with the filtered or fallback one
        };

        });
      }

      // user exists but audio language yet not set then try to compare with app lang...
      else if (user && !user.audioLanguage && user.appLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = storiesQuestions.map((question) => {
          const filteredAudios = question.audios.filter((audio : any) => 
            audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
          );

        // if any story is not available in that audio language
        const fallbackAudios = filteredAudios.length
          ? filteredAudios
          : question.audios.filter((audio: any) => audio?.language?.code === 'en');

        return {
          ...question,
          audios: fallbackAudios, // Replace audios array with the filtered or fallback one
        };

        });
      }

      // returning english lang audio file...
      else{
        // Filter stories to include only audio matching the user's selected language
        filteredStories = storiesQuestions.map((question) => {
          const filteredAudios = question.audios.filter((audio : any) => 
            audio?.language?.code === 'en'
          );

        return {
          ...question,
          audios: filteredAudios, // Replace audios array with the filtered or fallback one
        };

        });
      }

      return {
        success: true,
        message: 'Stories questions fetched successfully',
        data: filteredStories,
      };
    } catch (error) {
      throw error;
    }
  }

  // get story questions with id for admin..
  @get('/story-question-by-id-admin/{questionId}')
  async fetchStoryQuestionByIdForAdmin(
    @param.path.number('questionId') questionId : number
  ) : Promise<{success : boolean, message : string, data : StoriesQuestions}>{
    try{
      const storyQuestion = await this.storiesQuestionsRepository.findById(questionId);

      if(!storyQuestion){
        throw new HttpErrors.NotFound('Story question not found');
      }

      return{
        success : true,
        message : "Story question data",
        data : storyQuestion
      }
    }catch(error){
      throw error;
    }
  }

  // get story question with id for customer..
  @get('/story-question-by-id/{questionId}')
  async fetchStoryQuestionById(
    @param.path.number('questionId') questionId: number,
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<{ success: boolean; message: string; data: object }> {
    try {
      const storyQuestion = await this.storiesQuestionsRepository.findById(questionId);

      if (!storyQuestion) {
        throw new HttpErrors.NotFound('Story question not found');
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

      let filteredAudios = storyQuestion.audios;

      if (user && user.audioLanguage) {
        // Filter by user's audio language, fallback to English if not found
        filteredAudios = storyQuestion.audios.filter(
          (audio: any) =>
            audio.language.id === user.audioLanguage || audio.language.code === 'en'
        );
      } else if (user && !user.audioLanguage && user.appLanguage) {
        // Filter by user's app language, fallback to English
        filteredAudios = storyQuestion.audios.filter(
          (audio: any) =>
            audio.language.langName?.toLowerCase() === user.appLanguage?.toLowerCase() ||
            audio.language.code === 'en'
        );
      } else {
        // Default to English audio
        filteredAudios = storyQuestion.audios.filter(
          (audio: any) => audio.language.code === 'en'
        );
      }

      const filteredStory = {
        ...storyQuestion,
        audios: filteredAudios,
      };

      return {
        success: true,
        message: 'Story question data',
        data: filteredStory,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update Story api..
  @patch('/stories-questions/{questionId}')
  async updateStoryQuestionById(
    @param.path.number('questionId') questionId : number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StoriesQuestions, {partial: true}),
        },
      },
    })
    storyQuestionData: StoriesQuestions,
  ) : Promise<{success : boolean, message : string}>{
    try{
      const storyQuestion = await this.storiesQuestionsRepository.findById(questionId);

      if(!storyQuestion){
        throw new HttpErrors.NotFound('Story question Not Found');
      }

      await this.storiesQuestionsRepository.updateById(storyQuestion.id, storyQuestionData);

      return{
        success : true,
        message : "Story question updated"
      }
    }catch(error){
      throw error;
    }
  }

}
