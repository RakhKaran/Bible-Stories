import { inject } from "@loopback/core";
import { DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { authenticate, AuthenticationBindings } from "@loopback/authentication";
import { get, param, post } from "@loopback/rest";
import { UserProfile } from "@loopback/security";
import { BibleStoriesDataSource } from "../datasources";
import { LikedStoriesRepository, UsersRepository } from "../repositories";
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
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile
  ): Promise<{ success: boolean; message: string; data: LikedStories[] }> {
    try {
      const user = await this.usersRepository.findById(currentUser.id);
  
      // users liked stories..
      const likedStories = await this.likedStoriesRepository.find({
        where: {
          usersId: currentUser.id,
        },
        include: [
          { relation: 'stories' },
        ],
      });
  
      let filteredStories: any = likedStories;
  
      // Check if user exists and has an audio language preference
      if (user && user.audioLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = likedStories.map((story: any) => {
          const filteredAudios = story?.stories?.audios?.filter((audio: any) =>
            audio?.language?.id === user.audioLanguage
          );
  
          // if any story is not available in that audio language
          const fallbackAudios = filteredAudios.length
            ? filteredAudios
            : story?.stories?.audios?.filter((audio: any) => audio?.language?.code === 'en');
  
          return {
            ...story,
            stories: {
              ...story.stories,
              audios: fallbackAudios, // Replace audios array with the filtered or fallback one
            },
          };
        });
      }
  
      // user exists but audio language yet not set, then try to compare with app language...
      else if (user && !user.audioLanguage && user.appLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = likedStories.map((story : any) => {
          const filteredAudios = story?.stories?.audios?.filter((audio: any) =>
            audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
          );
  
          // if any story is not available in that audio language
          const fallbackAudios = filteredAudios.length
            ? filteredAudios
            : story?.stories?.audios?.filter((audio: any) => audio?.language?.code === 'en');
  
          return {
            ...story,
            stories: {
              ...story.stories,
              audios: fallbackAudios, // Replace audios array with the filtered or fallback one
            },
          };
        });
      }
  
      // returning english language audio file...
      else {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = likedStories.map((story : any) => {
          const filteredAudios = story?.stories?.audios?.filter((audio: any) =>
            audio?.language?.code === 'en'
          );
  
          return {
            ...story,
            stories: {
              ...story.stories,
              audios: filteredAudios, // Replace audios array with the filtered or fallback one
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
