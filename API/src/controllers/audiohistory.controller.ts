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
              storyId: {
                type: 'number',
                description: 'Story ID',
              },
              languageId: {
                type: 'number',
                description: 'Language ID',
              },
              actionStatus: {
                type: 'string',
                description: "Action ('paused', 'moved', 'completed')",
              },
              duration: {
                type: 'number',
                description: 'Current duration where action takes place',
              },
            },
          },
        },
      },
    })
    requestBody: {
      storyId: number;
      languageId: number;
      actionStatus: string;
      duration: number;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { storyId, languageId, actionStatus, duration } = requestBody;
  
      // Fetching story...
      const story = await this.storiesRepository.findById(storyId);
      if (!story) {
        throw new HttpErrors.NotFound('Story not found');
      }
  
      // Fetching user...
      const user = await this.usersRepository.findById(currentUser.id);
      if (!user) {
        throw new HttpErrors.BadRequest('User not found');
      }
  
      const filterAudio = story?.audios?.find((audio: any) => audio?.language?.id === languageId);
      if (!filterAudio) {
        throw new HttpErrors.BadRequest('Invalid language ID or audio not found');
      }
  
      const languageData : any = filterAudio?.language;
  
      const audioHistory = await this.audioHistoryRepository.findOne({
        where: {
          usersId: user.id,
          storiesId: storyId,
          language: languageData.id,
        },
      });
  
      if (actionStatus === 'paused') {
        // Handle 'paused' action
        if (audioHistory) {
          let { cumulativeListeningDuration, listeningCount, lastDuration } = audioHistory;
  
          if (lastDuration > duration) {
            lastDuration = duration;
            await this.audioHistoryRepository.updateById(audioHistory.id, { lastDuration });
          } else if (lastDuration <= duration) {
            const differenceDuration = duration - lastDuration;
            cumulativeListeningDuration += differenceDuration;
            if (duration === filterAudio.duration) {
              console.log('entered3');
              listeningCount += 1;
              lastDuration = 0;
              
            }else{
              lastDuration = duration;
            }
  
            await this.audioHistoryRepository.updateById(audioHistory.id, {
              lastDuration,
              cumulativeListeningDuration,
              listeningCount,
            });
          }
        } else {
          // Create new audio history for paused action
          await this.audioHistoryRepository.create({
            usersId: user.id,
            storiesId: story.id,
            language: languageData.id,
            lastDuration: duration,
            cumulativeListeningDuration: duration,
            listeningCount: 0,
          });
        }
      } else if (actionStatus === 'moved') {
        // Handle 'moved' action
        if (audioHistory) {
          await this.audioHistoryRepository.updateById(audioHistory.id, {
            lastDuration: duration,
          });
        } else {
          await this.audioHistoryRepository.create({
            usersId: user.id,
            storiesId: story.id,
            language: languageData?.id,
            lastDuration: duration,
            cumulativeListeningDuration: 0,
            listeningCount: 0,
          });
        }
      } else if (actionStatus === 'completed') {
        // Handle 'completed' action
        if (audioHistory) {
          const { cumulativeListeningDuration, listeningCount } = audioHistory;
  
          const newCumulativeListeningDuration = cumulativeListeningDuration + duration;
          const newListeningCount = listeningCount + 1;
  
          await this.audioHistoryRepository.updateById(audioHistory.id, {
            lastDuration: 0,
            cumulativeListeningDuration: newCumulativeListeningDuration,
            listeningCount: newListeningCount,
          });
        } else {
          await this.audioHistoryRepository.create({
            usersId: user.id,
            storiesId: story.id,
            language: languageData?.id,
            lastDuration: 0,
            cumulativeListeningDuration: duration,
            listeningCount: 1,
          });
        }
      } else {
        throw new HttpErrors.BadRequest(`Invalid action status: ${actionStatus}`);
      }
  
      return {
        success: true,
        message: 'Audio history updated successfully',
      };
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message || 'An error occurred');
    }
  }
  
}


// List of API's
// posting audio duration => logic : On paused on changed bar sending back to backend we will add it to history with increasin cumulative audio count.
// suppose there 5.02 min song and im currently listening at 3 suddenly i feld to listen again then instead of adding count again we will kept cumulative count as it is and we aill change last duration...

