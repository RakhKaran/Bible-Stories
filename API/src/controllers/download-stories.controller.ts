import { inject } from "@loopback/core";
import { DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { authenticate, AuthenticationBindings } from "@loopback/authentication";
import { get, param, post } from "@loopback/rest";
import { UserProfile } from "@loopback/security";
import { BibleStoriesDataSource } from "../datasources";
import { DownloadStoriesRepository, UsersRepository } from "../repositories";
import { PermissionKeys } from "../authorization/permission-keys";
import { LikedStories } from "../models";

export class DownloadStoriesController{
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(DownloadStoriesRepository)
    public downloadStoriesRepository : DownloadStoriesRepository,
    @repository(UsersRepository)
    public usersRepository : UsersRepository,
  ) {}

  // download story...
  @authenticate({
    strategy : 'jwt',
    options : [PermissionKeys.ADMIN, PermissionKeys.LISTENER]
  })
  @post('/downloadStories/{storyId}')
  async downloadStory(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser : UserProfile,
    @param.path.number('storyId') storyId : number
  ) : Promise<{success : boolean, message : string}>{
    try{
      // const downloadStory = await this.downloadStoriesRepository.findOne({
      //   where : {
      //     usersId : currentUser.id,
      //     storiesId : storyId
      //   }
      // });

      // if(!downloadStory){
      //   const data = {
      //     usersId : currentUser.id,
      //     storiesId : storyId
      //   };
      //   await this.downloadStoriesRepository.create(data);

      //   return{
      //     success : true,
      //     message : 'Story downloaded successfully'
      //   }
      // }else{
      //   await this.downloadStoriesRepository.deleteById(downloadStory.id);

      //   return{
      //     success : true,
      //     message : 'Story removed from downloads successfully'
      //   }
      // }
      const data = {
        usersId : currentUser.id,
        storiesId : storyId
      };
      await this.downloadStoriesRepository.create(data);

      return{
        success : true,
        message : 'Story downloaded successfully'
      }
    }catch(error){
      throw error;
    }
  }

  // get all download stories of users...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN, PermissionKeys.LISTENER],
  })
  @get('/downloadStories')
  async downloadStories(
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
  
      // Fetch downloaded stories with the constructed filter
      const downloadedStories = await this.downloadStoriesRepository.find(filter);
  
      // Filter out downloaded stories that have an empty 'stories' relation
      const filteredDownloadedStories = downloadedStories.filter((downloadedStory: any) => downloadedStory.stories);
  
      let filteredStories: any = filteredDownloadedStories;
  
      if (user && user.audioLanguage) {
        filteredStories = filteredDownloadedStories.map((story: any) => {
          const filteredAudios = story?.stories?.audios?.filter((audio: any) =>
            audio?.language?.id === user.audioLanguage
          );
  
          const fallbackAudios = filteredAudios.length
            ? filteredAudios
            : story?.stories?.audios?.filter((audio: any) => audio?.language?.code === 'en');
  
          return {
            ...story,
            stories: {
              ...story.stories,
              audios: fallbackAudios.length > 0 ? fallbackAudios : [story?.audios[0]],
            },
          };
        });
      } else if (user && !user.audioLanguage && user.appLanguage) {
        filteredStories = filteredDownloadedStories.map((story: any) => {
          const filteredAudios = story?.stories?.audios?.filter((audio: any) =>
            audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
          );
  
          const fallbackAudios = filteredAudios.length
            ? filteredAudios
            : story?.stories?.audios?.filter((audio: any) => audio?.language?.code === 'en');
  
          return {
            ...story,
            stories: {
              ...story.stories,
              audios: fallbackAudios.length > 0 ? fallbackAudios : [story?.audios[0]],
            },
          };
        });
      } else {
        filteredStories = filteredDownloadedStories.map((story: any) => {
          const filteredAudios = story?.stories?.audios?.filter((audio: any) =>
            audio?.language?.code === 'en'
          )?.length > 0 ? story?.stories?.audios?.filter((audio: any) =>
            audio?.language?.code === 'en'
          ) : [story?.audios[0]];
  
          return {
            ...story,
            stories: {
              ...story.stories,
              audios: filteredAudios,
            },
          };
        });
      }
  
      return {
        success: true,
        message: 'Downloaded stories retrieved successfully.',
        data: filteredStories,
      };
    } catch (error) {
      throw error;
    }
  }
  
}

