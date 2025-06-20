import { DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { AudioHistoryRepository, CategoryRepository, DownloadStoriesRepository, LikedStoriesRepository, StoriesRepository, UsersRepository } from "../repositories";
import { get, getJsonSchemaRef, getModelSchemaRef, HttpErrors, param, patch, post, Request, requestBody, response, RestBindings } from "@loopback/rest";
import { Stories } from "../models";
import { BibleStoriesDataSource } from "../datasources";
import { inject } from "@loopback/core";
import { authenticate, AuthenticationBindings } from "@loopback/authentication";
import { PermissionKeys } from "../authorization/permission-keys";
import { UserProfile } from "@loopback/security";
import { JWTService } from "../services/jwt-service";
import { UserAnalyticsService } from "../services/user-analytics.service";

export class StoriesController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(StoriesRepository)
    public storiesRepository: StoriesRepository,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
    @repository(LikedStoriesRepository)
    public likedStoriesRepository: LikedStoriesRepository,
    @repository(DownloadStoriesRepository)
    public downloadStoriesRepository: DownloadStoriesRepository,
    @repository(AudioHistoryRepository)
    public audioHistoryRepository: AudioHistoryRepository,
    @inject('service.jwt.service')
    public jwtService: JWTService,
    @inject('service.user-analytics.service')
    public userAnalyticsService: UserAnalyticsService,
  ) { }

  // fetching token from header and returning userProfile...
  async validateCredentials(authHeader: string) {
    try {
      if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
          throw new HttpErrors.BadRequest('Verify token! incorrect signature');
        }
        const token = parts[1];
        const userProfile = await this.jwtService.verifyToken(token);

        return userProfile
      }
    } catch (error) {
      throw error;
    }
  }

  // new story..
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN] },
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
    try {
      const story = await this.storiesRepository.create(storyData, {
        transaction: tx,
      });
      await tx.commit();

      await this.setDailyAudio(story.id!);

      return {
        success: true,
        message: 'New story Created'
      }
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  // get Stories..
  @get('/story-list')
  async fetchStories(
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<{ success: boolean; message: string; data: object }> {
    try {
      // checking for header
      const authHeader = request.headers.authorization;
      let currentUser: any = {};
      if (authHeader && authHeader !== '' && authHeader !== null && authHeader !== undefined && authHeader !== 'Bearer') {
        currentUser = await this.validateCredentials(authHeader);
      }
      // Fetching user for audio language
      let user: any = {}
      if (currentUser.id) {
        user = await this.usersRepository.findById(currentUser.id);
      }

      // Fetching all stories
      const stories = await this.storiesRepository.find({ order: ['createdAt DESC'] });

      let filteredStories: any = stories;

      // Check if user exists and has an audio language preference
      if (user && user.audioLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = stories.map((story) => {
          const filteredAudios = story.audios.filter((audio: any) =>
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
          const filteredAudios = story.audios.filter((audio: any) =>
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
      else {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = stories.map((story) => {
          const filteredAudios = story.audios.filter((audio: any) =>
            audio?.language?.code === 'en'
          )?.length > 0 ? story.audios.filter((audio: any) =>
            audio?.language?.code === 'en'
          ) : [story.audios[0]];

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
    @param.path.number('storyId') storyId: number
  ): Promise<{ success: boolean, message: string, data: Stories }> {
    try {
      const story = await this.storiesRepository.findById(storyId);

      if (!story) {
        throw new HttpErrors.NotFound('Story not found');
      }

      return {
        success: true,
        message: "Story data",
        data: story
      }
    } catch (error) {
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
      let currentUser: any = {};
      if (authHeader && authHeader !== '' && authHeader !== null && authHeader !== undefined && authHeader !== 'Bearer') {
        currentUser = await this.validateCredentials(authHeader);
      }

      let user: any = {};
      if (currentUser.id) {
        user = await this.usersRepository.findById(currentUser.id);
      }

      let filteredAudios: any = story.audios;

      let isLiked = false;

      let isDownload = false;

      let lastDuration = 0;

      // checking whether story is liked or not...
      if (user && Object.keys(user).length > 0) {
        const likedStory = await this.likedStoriesRepository.findOne({
          where: {
            and: [
              { usersId: user.id },
              { storiesId: story.id }
            ]
          }
        });
        if (likedStory) {
          isLiked = true;
        }
      }
      if (user && user.audioLanguage) {
        // Filter first by user's audio language
        filteredAudios = story.audios.filter(
          (audio: any) => audio.language.id === user.audioLanguage
        );

        // If no audio matches the user's audio language, fallback to English
        if (filteredAudios.length === 0) {
          filteredAudios = story.audios.filter(
            (audio: any) => audio.language.code === 'en'
          );
        }

        const likedStory = await this.likedStoriesRepository.findOne({
          where: {
            and: [
              { usersId: user.id },
              { storiesId: story.id }
            ]
          }
        });


        if (likedStory) {
          isLiked = true;
        }

        const downloadStory = await this.downloadStoriesRepository.findOne({
          where: { usersId: user.id, storiesId: story.id },
        });

        if (downloadStory) {
          isDownload = true;
        }
      } else if (user && !user.audioLanguage && user.appLanguage) {
        // Similar logic for app language, prioritize app language first
        filteredAudios = story.audios.filter(
          (audio: any) =>
            audio.language.langName?.toLowerCase() === user.appLanguage?.toLowerCase()
        );

        if (filteredAudios.length === 0) {
          filteredAudios = story.audios.filter(
            (audio: any) => audio.language.code === 'en'
          )?.length > 0 ? story.audios.filter(
            (audio: any) => audio.language.code === 'en'
          ) : [story?.audios[0]]
        }

        const likedStory = await this.likedStoriesRepository.findOne({
          where: { usersId: user.id, storiesId: story.id },
        });

        if (likedStory) {
          isLiked = true;
        }

        const downloadStory = await this.downloadStoriesRepository.findOne({
          where: { usersId: user.id, storiesId: story.id },
        });

        if (downloadStory) {
          isDownload = true;
        }
      } else {
        // Default to English audio
        filteredAudios = story.audios.filter(
          (audio: any) => audio.language.code === 'en'
        )?.length > 0 ? filteredAudios = story.audios.filter(
          (audio: any) => audio.language.code === 'en'
        ) : [story?.audios[0]];
      }

      if (user && Object.keys(user).length > 0) {
        const audioHistory = await this.audioHistoryRepository.findOne({
          where: {
            usersId: user.id,
            storiesId: story.id,
            language: filteredAudios[0].language?.id
          }
        });


        if (audioHistory) {
          lastDuration = audioHistory.lastDuration
        }
      }

      const filteredStory = {
        ...story,
        audios: filteredAudios,
        isLiked,
        isDownload,
        lastDuration
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
    @param.path.number('storyId') storyId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Stories, { partial: true }),
        },
      },
    })
    storyData: Stories,
  ): Promise<{ success: boolean, message: string }> {
    try {
      const story = await this.storiesRepository.findById(storyId);

      if (!story) {
        throw new HttpErrors.NotFound('Story Not Found');
      }

      await this.storiesRepository.updateById(story.id, storyData);

      return {
        success: true,
        message: "Story updated"
      }
    } catch (error) {
      throw error;
    }
  }


  // // testing only...
  // @get('/get-user-details')
  // async getUserDetails(
  //   @inject(RestBindings.Http.REQUEST) request: Request
  // ) : Promise<{success : boolean, message : string}>{
  //   try{
  //     const authHeader = request.headers.authorization;

  //     if(authHeader){
  //       const parts = authHeader.split(' ');
  //       if(parts.length !== 2){
  //         throw new HttpErrors.NotFound('parts...');
  //       }
  //       const token = parts[1]; 
  //       console.log('token',token);
  //       const decodedToken = await this.jwtService.verifyToken(token);

  //       console.log('userprofile',decodedToken);

  //       return{
  //         success : true,
  //         message : 'working....'
  //       }
  //     }else{

  //       console.log('auth header is missing')
  //       return{
  //         success : false,
  //         message : 'not working'
  //       }
  //     }
  //   }catch(error){
  //     throw error;
  //   }
  // }

  // audio-list with categories...
  @get('/home-page-audio-list')
  async homePageAudioList(
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<{
    success: boolean,
    message: string,
    data: {
      oldTestamentStories: Array<object>,
      newTestamentStories: Array<object>
    }
  }> {
    try {
      const authHeader = request.headers.authorization;

      let currentUser: any = {};

      let user: any = {};

      if (authHeader && authHeader !== '' && authHeader !== null && authHeader !== undefined && authHeader !== 'Bearer') {
        currentUser = await this.validateCredentials(authHeader);
      }

      if (currentUser.id) {
        user = await this.usersRepository.findById(currentUser.id);
      };

      // updating analytics..
      if (user && Array.isArray(user.permissions) && user.permissions.includes('listener')) {
        await this.userAnalyticsService.userAnalyticsUpdate(user.id);
      }

      // fetching categories..
      const categories = await this.categoryRepository.find();

      if (!categories) {
        throw new HttpErrors.BadRequest('Something went wrong, No Categories');
      }

      let oldTestamentStories: any = [];
      let newTestamentStories: any = [];

      await Promise.all(categories.map(async (cat) => {
        const stories = await this.storiesRepository.find({
          where: { categoryId: cat.id },
          order: ['createdAt DESC'],
          // limit : 5
        });

        if (cat.categoryName.trim().toLowerCase() === 'Old Testament'.trim().toLowerCase()) {
          if (user && user.audioLanguage) {
            // Filter stories to include only audio matching the user's selected language
            await Promise.all(
              stories.map(async (story: any) => {
                const filteredAudios = story.audios.filter((audio: any) =>
                  audio?.language?.id === user.audioLanguage
                );

                // if any story is not available in that audio language
                // const fallbackAudios : any = filteredAudios.length
                //   ? filteredAudios
                //   : story.audios.filter((audio: any) => audio?.language?.code === 'en');

                if (filteredAudios?.length > 0) {
                  let lastDuration = 0;

                  const audioHistory = await this.audioHistoryRepository.findOne({
                    where: {
                      usersId: user.id,
                      storiesId: story.id,
                      language: filteredAudios[0].language?.id
                    }
                  });


                  if (audioHistory) {
                    lastDuration = audioHistory.lastDuration
                  }

                  oldTestamentStories.push({
                    ...story,
                    audios: filteredAudios,
                    lastDuration
                  });
                }
              })
            )
          }

          // user exists but audio language yet not set then try to compare with app lang...
          // else if (user && !user.audioLanguage && user.appLanguage) {
          //   // Filter stories to include only audio matching the user's selected language
          //   await Promise.all(
          //     stories.map(async (story: any) => {
          //       const filteredAudios = story.audios.filter((audio: any) =>
          //         audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
          //       );

          //       // if any story is not available in that audio language
          //       const fallbackAudios: any = filteredAudios.length
          //         ? filteredAudios
          //         : story.audios.filter((audio: any) => audio?.language?.code === 'en');

          //       let lastDuration = 0;

          //       const audioHistory = await this.audioHistoryRepository.findOne({
          //         where: {
          //           usersId: user.id,
          //           storiesId: story.id,
          //           language: fallbackAudios?.length > 0 ? fallbackAudios[0].language?.id : story?.audios[0].language?.id
          //         }
          //       });


          //       if (audioHistory) {
          //         lastDuration = audioHistory.lastDuration
          //       }

          //       oldTestamentStories.push({
          //         ...story,
          //         audios: fallbackAudios?.length > 0 ? fallbackAudios : [story?.audios[0]], // Replace audios array with the filtered or fallback one
          //         lastDuration
          //       });

          //     })
          //   )
          // }

          // returning english lang audio file...
          else {
            // Filter stories to include only audio matching the user's selected language
            stories.map((story) => {
              const filteredAudios = story.audios.filter((audio: any) =>
                audio?.language?.code === 'en'
              ).length > 0 ? story.audios.filter((audio: any) =>
                audio?.language?.code === 'en'
              ) : story?.audios[0];

              const lastDuration = 0;

              oldTestamentStories.push({
                ...story,
                audios: filteredAudios, // Replace audios array with the filtered or fallback one
                lastDuration
              });

            });
          }
        } else {
          if (user && user.audioLanguage) {
            // Filter stories to include only audio matching the user's selected language
            await Promise.all(
              stories.map(async (story: any) => {
                const filteredAudios = story.audios.filter((audio: any) =>
                  audio?.language?.id === user.audioLanguage
                );

                // // if any story is not available in that audio language
                // const fallbackAudios: any = filteredAudios.length
                //   ? filteredAudios
                //   : story.audios.filter((audio: any) => audio?.language?.code === 'en');

                if (filteredAudios?.length > 0) {

                  let lastDuration = 0;

                  const audioHistory = await this.audioHistoryRepository.findOne({
                    where: {
                      usersId: user.id,
                      storiesId: story.id,
                      language: filteredAudios[0].language?.id
                    }
                  });

                  if (audioHistory) {
                    lastDuration = audioHistory.lastDuration
                  }

                  newTestamentStories.push({
                    ...story,
                    audios: filteredAudios, // Replace audios array with the filtered or fallback one
                    lastDuration
                  });
                }
              })
            )
          }

          // user exists but audio language yet not set then try to compare with app lang...
          // else if (user && !user.audioLanguage && user.appLanguage) {
          //   // Filter stories to include only audio matching the user's selected language
          //   await Promise.all(
          //     stories.map(async (story: any) => {
          //       const filteredAudios = story.audios.filter((audio: any) =>
          //         audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
          //       );

          //       // if any story is not available in that audio language
          //       const fallbackAudios: any = filteredAudios.length
          //         ? filteredAudios
          //         : story.audios.filter((audio: any) => audio?.language?.code === 'en');

          //       let lastDuration = 0;

          //       const audioHistory = await this.audioHistoryRepository.findOne({
          //         where: {
          //           usersId: user.id,
          //           storiesId: story.id,
          //           language: fallbackAudios?.length > 0 ? fallbackAudios[0].language?.id : story?.audios[0]?.language?.id
          //         }
          //       });


          //       if (audioHistory) {
          //         lastDuration = audioHistory.lastDuration
          //       }

          //       newTestamentStories.push({
          //         ...story,
          //         audios: fallbackAudios?.length > 0 ? fallbackAudios : [story?.audios[0]], // Replace audios array with the filtered or fallback one
          //         lastDuration
          //       });

          //     })
          //   )
          // }

          // returning english lang audio file...
          else {
            // Filter stories to include only audio matching the user's selected language
            stories.map((story) => {
              const filteredAudios = story.audios.filter((audio: any) =>
                audio?.language?.code === 'en'
              )?.length > 0 ? story.audios.filter((audio: any) =>
                audio?.language?.code === 'en'
              ) : story?.audios[0];

              const lastDuration = 0;

              newTestamentStories.push({
                ...story,
                audios: filteredAudios, // Replace audios array with the filtered or fallback one
                lastDuration
              });
            });
          }
        }
      }))

      let finalOldTestamentStories = oldTestamentStories;

      if (oldTestamentStories?.length > 5) {
        finalOldTestamentStories = oldTestamentStories?.slice(0, 4);
      }

      let finalNewTestamentStories = newTestamentStories;

      if (newTestamentStories?.length > 5) {
        finalNewTestamentStories = newTestamentStories?.slice(0, 4);
      }

      const response = {
        success: true,
        message: 'Audio list',
        data: {
          oldTestamentStories: finalOldTestamentStories,
          newTestamentStories: finalNewTestamentStories
        }
      }

      return {
        success: true,
        message: 'Audio list',
        data: {
          oldTestamentStories: finalOldTestamentStories,
          newTestamentStories: finalNewTestamentStories
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // audio-list by cateogory...
  @get('/stories-by-category/{categoryId}')
  async StoriesByCategory(
    @param.path.number('categoryId') categoryId: number,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('skip') skip: number = 0,
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<{ success: boolean, message: string, data: Array<object> }> {
    try {
      const authHeader = request.headers.authorization;

      let currentUser: any = {};
      let user: any = {};

      if (
        authHeader &&
        authHeader !== '' &&
        authHeader !== null &&
        authHeader !== undefined &&
        authHeader !== 'Bearer'
      ) {
        currentUser = await this.validateCredentials(authHeader);
      }

      if (currentUser.id) {
        user = await this.usersRepository.findById(currentUser.id);
      }

      const allStories = await this.storiesRepository.find({
        where: { categoryId },
        order: ['createdAt DESC'],
      });

      let filteredStories: any[] = [];

      console.log('user', user);

      for (const story of allStories) {
        let selectedAudios : any = [];

        if (user && user.audioLanguage) {
          selectedAudios = story.audios.filter(
            (audio: any) => audio?.language?.id === user.audioLanguage
          );
        } else {
          selectedAudios = story.audios.filter(
            (audio: any) => audio?.language?.code === 'en'
          );

          if (selectedAudios.length === 0 && story.audios.length > 0) {
            selectedAudios = [story.audios[0]];
          }
        }

        if (selectedAudios.length === 0) continue;

        let lastDuration = 0;
        if (user && user.audioLanguage) {
          const audioHistory = await this.audioHistoryRepository.findOne({
            where: {
              usersId: user.id,
              storiesId: story.id,
              language: selectedAudios[0].language?.id,
            },
          });

          if (audioHistory) {
            lastDuration = audioHistory.lastDuration;
          }
        }

        filteredStories.push({
          ...story,
          audios: selectedAudios,
          lastDuration,
        });

        // Stop if we have enough
        if (filteredStories.length >= skip + limit) break;
      }

      const paginatedStories = filteredStories.slice(skip, skip + limit);

      console.log('paginated stories', paginatedStories);

      return {
        success: true,
        message: 'Audio list through category',
        data: paginatedStories,
      };
    } catch (error) {
      throw error;
    }
  }


  // update story by id...
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN] },
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
          schema: getModelSchemaRef(Stories, { partial: true }),
        },
      },
    })
    story: Stories,
  ): Promise<{ success: boolean, message: string }> {
    try {
      await this.storiesRepository.updateById(id, story);
      return {
        success: true,
        message: 'Update success'
      }
    } catch (error) {
      throw error;
    }
  }

  //set daily audio...
  async setDailyAudio(id: number): Promise<{ success: boolean; message: string }> {
    try {
      // Find the current daily audio
      const dailyAudio = await this.storiesRepository.findOne({
        where: { isDailyAudio: true },
      });

      // If there's already a daily audio, update it to false
      if (dailyAudio) {
        await this.storiesRepository.updateById(dailyAudio.id, { isDailyAudio: false });
      }

      // Set the new daily audio
      await this.storiesRepository.updateById(id, { isDailyAudio: true });

      return {
        success: true,
        message: 'Audio set as daily audio successfully',
      };
    } catch (error) {
      console.log('Error while setting daily audio:', error);
      return {
        success: false,
        message: 'Failed to set daily audio. Please try again later.',
      };
    }
  }

  //update audio as daily audio...
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN] },
  })
  @patch('/daily-audio-story/{id}')
  async updateDailyAudio(
    @param.path.number('id') storyId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find the story by ID
      const story = await this.storiesRepository.findById(storyId);

      if (!story) {
        throw new HttpErrors.NotFound('Story not found');
      }

      const result = await this.setDailyAudio(story.id!);

      if (!result.success) {
        throw new Error('Failed to update daily audio');
      }

      return {
        success: true,
        message: 'Daily audio updated successfully',
      };
    } catch (error) {
      console.log('Error while updating daily audio:', error);
      throw new HttpErrors.InternalServerError('Error updating daily audio');
    }
  }

  // get daily audio story with id for customer..
  @get('/daily-audio')
  async fetchDailyAudioStoryById(
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<{ success: boolean; message: string; data: object }> {
    try {
      const story = await this.storiesRepository.findOne({
        where: { isDailyAudio: true },
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
      let currentUser: any = {};
      if (authHeader && authHeader !== '' && authHeader !== null && authHeader !== undefined && authHeader !== 'Bearer') {
        currentUser = await this.validateCredentials(authHeader);
      }

      let user: any = {};
      if (currentUser.id) {
        user = await this.usersRepository.findById(currentUser.id);
      }

      let filteredAudios: any = story.audios;

      let isLiked = false;

      let isDownload = false;

      let lastDuration = 0;

      // checking whether story is liked or not...
      if (user) {
        const likedStory = await this.likedStoriesRepository.findOne({ where: { usersId: user.id, storiesId: story.id } });

        if (likedStory) {
          isLiked = true;
        }
      }
      if (user && user.audioLanguage) {
        // Filter first by user's audio language
        filteredAudios = story.audios.filter(
          (audio: any) => audio.language.id === user.audioLanguage
        );

        // If no audio matches the user's audio language, fallback to English
        if (filteredAudios.length === 0) {
          filteredAudios = story.audios.filter(
            (audio: any) => audio.language.code === 'en'
          )?.length > 0 ? story.audios.filter(
            (audio: any) => audio.language.code === 'en'
          ) : [story?.audios[0]];
        }


        const likedStory = await this.likedStoriesRepository.findOne({
          where: { usersId: user.id, storiesId: story.id },
        });

        if (likedStory) {
          isLiked = true;
        }

        const downloadStory = await this.downloadStoriesRepository.findOne({
          where: { usersId: user.id, storiesId: story.id },
        });

        if (downloadStory) {
          isDownload = true;
        }
      } else if (user && !user.audioLanguage && user.appLanguage) {
        // Similar logic for app language, prioritize app language first
        filteredAudios = story.audios.filter(
          (audio: any) =>
            audio.language.langName?.toLowerCase() === user.appLanguage?.toLowerCase()
        );

        if (filteredAudios.length === 0) {
          filteredAudios = story.audios.filter(
            (audio: any) => audio.language.code === 'en'
          )?.length > 0 ? story.audios.filter(
            (audio: any) => audio.language.code === 'en'
          ) : [story?.audios[0]];
        }

        const likedStory = await this.likedStoriesRepository.findOne({
          where: { usersId: user.id, storiesId: story.id },
        });

        if (likedStory) {
          isLiked = true;
        }

        const downloadStory = await this.downloadStoriesRepository.findOne({
          where: { usersId: user.id, storiesId: story.id },
        });

        if (downloadStory) {
          isDownload = true;
        }
      } else {
        // Default to English audio
        filteredAudios = story.audios.filter(
          (audio: any) => audio.language.code === 'en'
        )?.length > 0 ? story.audios.filter(
          (audio: any) => audio.language.code === 'en'
        ) : [story?.audios[0]];
      }

      if (user) {
        const audioHistory = await this.audioHistoryRepository.findOne({
          where: {
            usersId: user.id,
            storiesId: story.id,
            language: filteredAudios[0].language?.id
          }
        });

        if (audioHistory) {
          lastDuration = audioHistory.lastDuration
        }
      }

      const filteredStory = {
        ...story,
        audios: filteredAudios,
        isLiked,
        isDownload,
        lastDuration
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
}