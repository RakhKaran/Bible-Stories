import { inject } from "@loopback/core";
import { repository } from "@loopback/repository";
import { authenticate, AuthenticationBindings } from "@loopback/authentication";
import { HttpErrors, post, requestBody } from "@loopback/rest";
import { UserProfile } from "@loopback/security";
import { BibleStoriesDataSource } from "../datasources";
import { AudioHistoryRepository, StoriesRepository, UsersRepository } from "../repositories";
import { PermissionKeys } from "../authorization/permission-keys";

export class AudiohistoryController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(AudioHistoryRepository)
    public audioHistoryRepository: AudioHistoryRepository,
    @repository(StoriesRepository)
    public storiesRepository: StoriesRepository,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
  ) {}

  // audio history api for checking duration and changing it based on status like paused, moved, and completed...
  // @authenticate({
  //   strategy: 'jwt',
  //   options: [PermissionKeys.ADMIN, PermissionKeys.LISTENER],
  // })
  // @post('/audio-history')
  // async controlAudioHistory(
  //   @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'object',
  //           required: ['storyId', 'languageId', 'actionStatus', 'duration'],
  //           properties: {
  //             storyId: {
  //               type: 'number',
  //               description: 'Story ID',
  //             },
  //             languageId: {
  //               type: 'number',
  //               description: 'Language ID',
  //             },
  //             actionStatus: {
  //               type: 'string',
  //               description: "Action ('paused', 'moved', 'completed')",
  //             },
  //             duration: {
  //               type: 'number',
  //               description: 'Current duration where action takes place',
  //             },
  //           },
  //         },
  //       },
  //     },
  //   })
  //   requestBody: {
  //     storyId: number;
  //     languageId: number;
  //     actionStatus: string;
  //     duration: number;
  //   },
  // ): Promise<{ success: boolean; message: string }> {
  //   try {
  //     const { storyId, languageId, actionStatus, duration } = requestBody;
  
  //     // Fetching story...
  //     const story = await this.storiesRepository.findById(storyId);
  //     if (!story) {
  //       throw new HttpErrors.NotFound('Story not found');
  //     }
  
  //     // Fetching user...
  //     const user = await this.usersRepository.findById(currentUser.id);
  //     if (!user) {
  //       throw new HttpErrors.BadRequest('User not found');
  //     }
  
  //     const filterAudio = story?.audios?.find((audio: any) => audio?.language?.id === languageId);
  //     if (!filterAudio) {
  //       throw new HttpErrors.BadRequest('Invalid language ID or audio not found');
  //     }
  
  //     const languageData : any = filterAudio?.language;
  
  //     const audioHistory = await this.audioHistoryRepository.findOne({
  //       where: {
  //         usersId: user.id,
  //         storiesId: storyId,
  //         language: languageData.id,
  //       },
  //     });
  
  //     if (actionStatus === 'paused') {
  //       // Handle 'paused' action
  //       if (audioHistory) {
  //         let { cumulativeListeningDuration, listeningCount, lastDuration } = audioHistory;
  
  //         if (lastDuration > duration) {
  //           lastDuration = duration;
  //           await this.audioHistoryRepository.updateById(audioHistory.id, { lastDuration });
  //         } else if (lastDuration <= duration) {
  //           const differenceDuration = duration - lastDuration;
  //           cumulativeListeningDuration += differenceDuration;
  //           if (duration === filterAudio.duration) {
  //             console.log('entered3');
  //             listeningCount += 1;
  //             lastDuration = 0;
              
  //           }else{
  //             lastDuration = duration;
  //           }
  
  //           await this.audioHistoryRepository.updateById(audioHistory.id, {
  //             lastDuration,
  //             cumulativeListeningDuration,
  //             listeningCount,
  //           });
  //         }
  //       } else {
  //         // Create new audio history for paused action
  //         await this.audioHistoryRepository.create({
  //           usersId: user.id,
  //           storiesId: story.id,
  //           language: languageData.id,
  //           lastDuration: duration,
  //           cumulativeListeningDuration: duration,
  //           listeningCount: 0,
  //         });
  //       }
  //     } else if (actionStatus === 'moved') {
  //       // Handle 'moved' action
  //       if (audioHistory) {
  //         await this.audioHistoryRepository.updateById(audioHistory.id, {
  //           lastDuration: duration,
  //         });
  //       } else {
  //         await this.audioHistoryRepository.create({
  //           usersId: user.id,
  //           storiesId: story.id,
  //           language: languageData?.id,
  //           lastDuration: duration,
  //           cumulativeListeningDuration: 0,
  //           listeningCount: 0,
  //         });
  //       }
  //     } else if (actionStatus === 'completed') {
  //       // Handle 'completed' action
  //       if (audioHistory) {
  //         const { cumulativeListeningDuration, listeningCount } = audioHistory;
  
  //         const newCumulativeListeningDuration = cumulativeListeningDuration + duration;
  //         const newListeningCount = listeningCount + 1;
  
  //         await this.audioHistoryRepository.updateById(audioHistory.id, {
  //           lastDuration: 0,
  //           cumulativeListeningDuration: newCumulativeListeningDuration,
  //           listeningCount: newListeningCount,
  //         });
  //       } else {
  //         await this.audioHistoryRepository.create({
  //           usersId: user.id,
  //           storiesId: story.id,
  //           language: languageData?.id,
  //           lastDuration: 0,
  //           cumulativeListeningDuration: duration,
  //           listeningCount: 1,
  //         });
  //       }
  //     } else {
  //       throw new HttpErrors.BadRequest(`Invalid action status: ${actionStatus}`);
  //     }
  
  //     return {
  //       success: true,
  //       message: 'Audio history updated successfully',
  //     };
  //   } catch (error) {
  //     throw new HttpErrors.InternalServerError(error.message || 'An error occurred');
  //   }
  // }

  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN, PermissionKeys.LISTENER],
  })
  @post('/audio-history')
  async controlAudioHistory(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['storyId', 'languageId', 'actionStatus', 'duration'],
            properties: {
              storyId: { type: 'number', description: 'Story ID' },
              languageId: { type: 'number', description: 'Language ID' },
              actionStatus: { type: 'string', description: "Action ('paused', 'moved', 'completed')" },
              duration: { type: 'number', description: 'Current duration where action takes place' },
            },
          },
        },
      }})
    requestBody: {
      storyId: number;
      languageId: number;
      actionStatus: string;
      duration: number;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { storyId, languageId, actionStatus, duration } = requestBody;
  
      // Fetch the story, user, and language data as before
      const story = await this.storiesRepository.findById(storyId);
      if (!story) throw new HttpErrors.NotFound('Story not found');
  
      const user = await this.usersRepository.findById(currentUser.id);
      if (!user) throw new HttpErrors.BadRequest('User not found');
  
      const filterAudio = story?.audios?.find((audio: any) => audio?.language?.id === languageId);
      if (!filterAudio) throw new HttpErrors.BadRequest('Invalid language ID or audio not found');
  
      const languageData: any = filterAudio?.language;
      const audioHistory = await this.audioHistoryRepository.findOne({
        where: { usersId: user.id, storiesId: storyId, language: languageData.id },
      });
  
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
      if (audioHistory) {
        let {
          lastDuration,
          cumulativeListeningDuration,
          dailyCumulativeListeningDuration,
          weeklyCumulativeListeningDuration,
          monthlyCumulativeListeningDuration,
          lastUpdatedDate,
          listeningCount
        } = audioHistory;
  
        // If `lastUpdatedDate` is undefined or null, we assume it is the first update
        if (!lastUpdatedDate) lastUpdatedDate = new Date(0); // Set a default date to reset everything
  
        // Reset daily, weekly, and monthly durations if the date has changed
        if (lastUpdatedDate < startOfDay) {
          dailyCumulativeListeningDuration = 0;
        }
  
        if (lastUpdatedDate < startOfWeek) {
          weeklyCumulativeListeningDuration = 0;
        }
  
        if (lastUpdatedDate < startOfMonth) {
          monthlyCumulativeListeningDuration = 0;
        }
  
        // Update logic for paused, moved, and completed
        if (actionStatus === 'paused') {
          if(lastDuration <= duration){
            const differenceDuration = duration - lastDuration;
            cumulativeListeningDuration += differenceDuration;
            dailyCumulativeListeningDuration += differenceDuration;
            weeklyCumulativeListeningDuration += differenceDuration;
            monthlyCumulativeListeningDuration += differenceDuration;
            lastDuration = duration;
    
            const tolerance = 0.0001;

            if(Math.abs(duration - filterAudio.duration) < tolerance){
              lastDuration = 0;
              listeningCount += 1;
            }
          }else{
            lastDuration = duration;
          }
          await this.audioHistoryRepository.updateById(audioHistory.id, {
            lastDuration,
            listeningCount,
            cumulativeListeningDuration,
            dailyCumulativeListeningDuration,
            weeklyCumulativeListeningDuration,
            monthlyCumulativeListeningDuration,
            lastUpdatedDate: now,
          });
        } else if (actionStatus === 'moved') {
          await this.audioHistoryRepository.updateById(audioHistory.id, {
            lastDuration: duration,
            lastUpdatedDate: now, // Update the lastUpdatedDate field
          });
        } else if (actionStatus === 'completed') {
          const differenceDuration = duration - audioHistory.lastDuration;
          await this.audioHistoryRepository.updateById(audioHistory.id, {
            lastDuration: 0,
            cumulativeListeningDuration: audioHistory.cumulativeListeningDuration + differenceDuration,
            dailyCumulativeListeningDuration: audioHistory.dailyCumulativeListeningDuration + differenceDuration,
            weeklyCumulativeListeningDuration: audioHistory.weeklyCumulativeListeningDuration + differenceDuration,
            monthlyCumulativeListeningDuration: audioHistory.monthlyCumulativeListeningDuration + differenceDuration,
            listeningCount: audioHistory.listeningCount + 1,
            lastUpdatedDate: now, // Update the lastUpdatedDate field
          });
        } else {
          throw new HttpErrors.BadRequest(`Invalid action status: ${actionStatus}`);
        }
      } else {
        // If no audioHistory exists, create a new record
        await this.audioHistoryRepository.create({
          usersId: user.id,
          storiesId: story.id,
          language: languageData.id,
          lastDuration: duration,
          cumulativeListeningDuration: duration,
          dailyCumulativeListeningDuration: duration,
          weeklyCumulativeListeningDuration: duration,
          monthlyCumulativeListeningDuration: duration,
          listeningCount: 0,
          lastUpdatedDate: now, // Set the lastUpdatedDate field
        });
      }
  
      return { success: true, message: 'Audio history updated successfully' };
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message || 'An error occurred');
    }
  }
  
}


// List of API's
// posting audio duration => logic : On paused on changed bar sending back to backend we will add it to history with increasin cumulative audio count.
// suppose there 5.02 min song and im currently listening at 3 suddenly i feld to listen again then instead of adding count again we will kept cumulative count as it is and we aill change last duration...

