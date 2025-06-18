import { inject } from "@loopback/core";
import { DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { authenticate, AuthenticationBindings } from "@loopback/authentication";
import { get, param, post } from "@loopback/rest";
import { UserProfile } from "@loopback/security";
import { BibleStoriesDataSource } from "../datasources";
import { AudioHistoryRepository, LikedStoriesRepository, UsersRepository } from "../repositories";
import { PermissionKeys } from "../authorization/permission-keys";
import { LikedStories } from "../models";

export class LikedStoriesController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(LikedStoriesRepository)
    public likedStoriesRepository : LikedStoriesRepository,
    @repository(UsersRepository)
    public usersRepository : UsersRepository,
        @repository(AudioHistoryRepository)
        public audioHistoryRepository : AudioHistoryRepository,
  ) {}

  // liked or disliked story...
  @authenticate({
    strategy : 'jwt',
    options : [PermissionKeys.ADMIN, PermissionKeys.LISTENER]
  })
  @post('/likedStories/{storyId}')
  async likedStory(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser : UserProfile,
    @param.path.number('storyId') storyId : number
  ) : Promise<{success : boolean, message : string}>{
    try{
      const likedStory = await this.likedStoriesRepository.findOne({
        where : {
          usersId : currentUser.id,
          storiesId : storyId
        }
      });

      if(!likedStory){
        const data = {
          usersId : currentUser.id,
          storiesId : storyId
        };
        await this.likedStoriesRepository.create(data);

        return{
          success : true,
          message : 'Story liked successfully'
        }
      }else{
        await this.likedStoriesRepository.deleteById(likedStory.id);

        return{
          success : true,
          message : 'Story disliked successfully'
        }
      }
    }catch(error){
      throw error;
    }
  }

  // get all liked stories of users...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN, PermissionKeys.LISTENER],
  })
  @get('/likedStories')
  async likedStories(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.query.string('search') search?: string, // Optional search query parameter
    @param.query.number('skip') skip: number = 0,   // Optional pagination, default is 0
    @param.query.number('limit') limit: number = 10  // Optional pagination, default is 10
  ): Promise<{ success: boolean; message: string; data: LikedStories[] }> {
    try {
      const user = await this.usersRepository.findById(currentUser.id);
  
      // Build the filter object
      const filter: any = {
        where: {
          usersId: currentUser.id,
        },
        include: [
          {
            relation: 'stories',
            scope: {
              where: search
                ? { title: { like: `%${search}%` } } // Search for the title in the 'stories' relation
                : undefined,
            },
          },
        ],
        skip,   // Skips the first 'skip' records
        limit,  // Limits the number of records returned to 'limit'
      };
  
      // Fetch liked stories with the constructed filter
      const likedStories = await this.likedStoriesRepository.find(filter);
  
      // Filter out liked stories that have an empty 'stories' relation
      const filteredLikedStories = likedStories.filter((likedStory: any) => likedStory.stories);
  
      let filteredStories: any = filteredLikedStories;
  
      if (user && user.audioLanguage) {
        filteredStories = await Promise.all(
            filteredLikedStories.map(async(story: any) => {
            const filteredAudios = story?.stories?.audios?.filter((audio: any) =>
              audio?.language?.id === user.audioLanguage
            );
    
            const fallbackAudios : any = filteredAudios.length
              ? filteredAudios
              : story?.stories?.audios?.filter((audio: any) => audio?.language?.code === 'en');
    
              let lastDuration = 0;

              const audioHistory = await this.audioHistoryRepository.findOne({
                where : {
                  usersId : user.id,
                  storiesId : story?.stories?.id,
                  language : fallbackAudios?.length > 0 ? fallbackAudios[0].language?.id : story?.audios[0]?.language?.id
                }
              });
    
    
              if(audioHistory){
                lastDuration = audioHistory.lastDuration
              }

            return {
              ...story,
              stories: {
                ...story.stories,
                audios: fallbackAudios?.length > 0 ? fallbackAudios : [story?.audios[0]],
                lastDuration
              },
            };
          })
        )
      } else if (user && !user.audioLanguage && user.appLanguage) {
          filteredStories = await Promise.all(
            filteredLikedStories.map(async(story: any) => {
            const filteredAudios = story?.stories?.audios?.filter((audio: any) =>
              audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
            );
    
            const fallbackAudios : any = filteredAudios.length
              ? filteredAudios
              : story?.stories?.audios?.filter((audio: any) => audio?.language?.code === 'en');
    
              let lastDuration = 0;

              const audioHistory = await this.audioHistoryRepository.findOne({
                where : {
                  usersId : user.id,
                  storiesId : story?.stories?.id,
                  language : fallbackAudios?.length > 0 ? fallbackAudios[0].language?.id : story?.audios[0]?.language?.id
                }
              });
    
    
              if(audioHistory){
                lastDuration = audioHistory.lastDuration
              }

            return {
              ...story,
              stories: {
                ...story.stories,
                audios: fallbackAudios?.length > 0 ? fallbackAudios : [story?.audios[0]],
                lastDuration
              },
            };
          })
        )
      } else {
        filteredStories = filteredLikedStories.map((story: any) => {
          const filteredAudios = story?.stories?.audios?.filter((audio: any) =>
            audio?.language?.code === 'en'
          ).length > 0 ? story?.stories?.audios?.filter((audio: any) =>
            audio?.language?.code === 'en'
          ) : [story?.audios[0]];
          
          const lastDuration = 0;
          return {
            ...story,
            stories: {
              ...story.stories,
              audios: filteredAudios,
              lastDuration
            },
          };
        });
      }
  
      return {
        success: true,
        message: 'Liked stories retrieved successfully.',
        data: filteredStories,
      };
    } catch (error) {
      throw error;
    }
  }    
}
