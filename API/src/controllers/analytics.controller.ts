import { inject } from "@loopback/core";
import { authenticate } from "@loopback/authentication";
import { get, HttpErrors, param, post } from "@loopback/rest";
import { BibleStoriesDataSource } from "../datasources";
import { PermissionKeys } from "../authorization/permission-keys";
import { repository } from "@loopback/repository";
import { AudioHistoryRepository, DownloadStoriesRepository, GuestUsersRepository, LanguageRepository, LikedStoriesRepository, StoriesRepository, UsersRepository } from "../repositories";

export class AnalyticsController {
  constructor(
      @inject('datasources.bibleStories')
      public dataSource: BibleStoriesDataSource,
      @repository(UsersRepository)
      public usersRepository: UsersRepository,
      @repository(StoriesRepository)
      public storiesRepository: StoriesRepository,
      @repository(LanguageRepository)
      public languageRepository: LanguageRepository,
      @repository(GuestUsersRepository)
      public guestUsersRepository: GuestUsersRepository,
      @repository(AudioHistoryRepository)
      public audioHistoryRepository: AudioHistoryRepository,
      @repository(LikedStoriesRepository)
      public likedStorieRepository: LikedStoriesRepository,
      @repository(DownloadStoriesRepository)
      public downloadStoriesRepository: DownloadStoriesRepository,
  ) {}

  // analytics blocks...
  @authenticate({
    strategy : 'jwt',
    options : [PermissionKeys.ADMIN]
  })
  @get('/analytics-blocks')
  async analyticsBlocks() : Promise<{success : boolean, message : string, data : object}>{
    try{
      const filter: any = {
        where: { or: [{ permissions: { like: `%["admin"]%` } }, { permissions: { like: `%["listener"]%` } }] }
      }

      const usersList = await this.usersRepository.find(filter);

      const usersCount = usersList.length;

      const storiesCount = await this.storiesRepository.count();

      const languageCount = await this.languageRepository.count();

      const guestUsersCount = await this.guestUsersRepository.count();

      return{
        success : true,
        message : 'Analytics block data',
        data : {
          usersCount : usersCount,
          storiesCount : storiesCount.count,
          languageCount : languageCount.count,
          guestUsersCount : guestUsersCount.count
        }
      }
    }catch(error){
      throw error;
    }
  }

  // Top listeners...
  @get('/top-listeners')
  async topListenersBlocks(
    @param.query.string('timePeriod') timePeriod: string = 'all',  // Default to 'all'
  ): Promise<{ success: boolean; message: string; data: object[] }> {
    try {
      // Construct query based on the timePeriod
      let timeColumn = 'ah.cumulativeListeningDuration'; // Default to 'all'
      
      // Adjust the column based on the time period requested
      if (timePeriod === 'daily') {
        timeColumn = 'ah.dailyCumulativeListeningDuration';
      } else if (timePeriod === 'weekly') {
        timeColumn = 'ah.weeklyCumulativeListeningDuration';
      } else if (timePeriod === 'monthly') {
        timeColumn = 'ah.monthlyCumulativeListeningDuration';
      } else if (timePeriod !== 'all') {
        throw new HttpErrors.BadRequest('Invalid time period. Use "daily", "weekly", "monthly", or "all".');
      }
  
      // Query the database to get top listeners by the selected time period
      const topListeners = await this.audioHistoryRepository.dataSource.execute(
        `
        SELECT
          ah.usersId,
          SUM(${timeColumn}) AS totalListeningDuration,
          u.avatar,
          u.firstname,
          u.email,
          u.phonenumber
        FROM
          AudioHistory ah
        INNER JOIN
          Users u
        ON
          ah.usersId = u.id
        GROUP BY
          ah.usersId, u.avatar, u.firstname, u.email, u.phonenumber
        ORDER BY
          totalListeningDuration DESC
        LIMIT 10;
        `,
      );
  
      return {
        success: true,
        message: 'Top listeners retrieved successfully',
        data: topListeners,
      };
    } catch (error) {
      console.error('Error retrieving top listeners:', error);
      throw new Error('Failed to retrieve top listeners');
    }
  }
  

  // Most liked stories...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN],
  })
  @get('/most-liked-stories')
  async mostLikedStories(): Promise<{ success: boolean, message: string, data: object }> {
    try {
      // Fetching liked stories...
      const likedStories = await this.likedStorieRepository.find({
        include: [
          {
            relation: 'stories', // Include the related story data
            scope: {
              fields: { audios: false }, // Exclude the 'audios' field from the story relation
            },
          },
        ],
      });

      // Group liked stories by their storyId to calculate the like count
      const storyMap: Map<number, { likeCount: number; story: object }> = new Map();

      likedStories.forEach((likedStory : any) => {
        const storyId = likedStory.storiesId;

        // Initialize the entry for the storyId if not already present
        if (!storyMap.has(storyId)) {
          storyMap.set(storyId, {
            likeCount: 0,
            story: likedStory.stories,
          });
        }

        // Increment the like count for the story
        const storyEntry = storyMap.get(storyId)!;
        storyEntry.likeCount += 1;
      });

      // Transform the data into an array and sort by like count in descending order
      const sortedStories = Array.from(storyMap.entries())
        .map(([storyId, { likeCount, story }]) => ({
          storyId,
          likeCount,
          story,
        }))
        .sort((a, b) => b.likeCount - a.likeCount);

      return {
        success: true,
        message: 'Most liked stories retrieved successfully',
        data: sortedStories,
      };
    } catch (error) {
      console.error('Error retrieving most liked stories:', error);
      throw new Error('Failed to retrieve most liked stories');
    }
  }

  // Most Downloaded Stories...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN],
  })
  @get('/most-download-stories')
  async mostDownloadStories(): Promise<{ success: boolean; message: string; data: object }> {
    try {
      // Fetching download stories...
      const downloadedStories = await this.downloadStoriesRepository.find({
        include: [
          {
            relation: 'stories', // Include the related story data
            scope: {
              fields: { audios: false }, // Exclude the 'audios' field from the story relation
            },
          },
        ],
      });

      // Group download stories by their storyId to calculate the download count
      const storyMap: Map<number, { downloadCount: number; story: object }> = new Map();

      downloadedStories.forEach((downloadedStory : any) => {
        const storyId = downloadedStory.storiesId;

        // Initialize the entry for the storyId if not already present
        if (!storyMap.has(storyId)) {
          storyMap.set(storyId, {
            downloadCount: 0,
            story: downloadedStory.stories,
          });
        }

        // Increment the download count for the story
        const storyEntry = storyMap.get(storyId)!;
        storyEntry.downloadCount += 1;
      });

      // Transform the data into an array and sort by download count in descending order
      const sortedStories = Array.from(storyMap.entries())
        .map(([storyId, { downloadCount, story }]) => ({
          storyId,
          downloadCount,
          story,
        }))
        .sort((a, b) => b.downloadCount - a.downloadCount);

      return {
        success: true,
        message: 'Most downloaded stories retrieved successfully',
        data: sortedStories,
      };
    } catch (error) {
      console.error('Error retrieving most downloaded stories:', error);
      throw new Error('Failed to retrieve most downloaded stories');
    }
  }

}



// reports

// 4 blocks..

// 1 => Users Count
// 2 => Guest Users Count
// 3 => Stories Count
// 4 => No of languages

// App analytics graph and pie chart..

// Top stories with which language...
// (based on listened time...)

// Most Liked Stories...
// (based on likes count)

// Most downloaded stories and language

// Based on village we can show Top stories and language

// user based report
// report contain 
// users fav. stories
// users avg time on app
// users most listened stories