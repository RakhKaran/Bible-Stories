import { inject } from "@loopback/core";
import { authenticate } from "@loopback/authentication";
import { get, HttpErrors, param, post } from "@loopback/rest";
import { BibleStoriesDataSource } from "../datasources";
import { PermissionKeys } from "../authorization/permission-keys";
import { repository } from "@loopback/repository";
import { AudioHistoryRepository, DownloadStoriesRepository, GuestUsersRepository, LanguageRepository, LikedStoriesRepository, StoriesRepository, UserAnalyticsRepository, UsersRepository } from "../repositories";

interface AnalyticsData {
  year: number;
  month: number;
  count: number;
  returningUsers: number;
  newUsers: number;
}

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
    @repository(UserAnalyticsRepository)
    public userAnalyticsRepository: UserAnalyticsRepository,
  ) { }

  // analytics blocks...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN]
  })
  @get('/analytics-blocks')
  async analyticsBlocks(): Promise<{ success: boolean, message: string, data: object }> {
    try {
      const filter: any = {
        where: { or: [{ permissions: { like: `%["admin"]%` } }, { permissions: { like: `%["listener"]%` } }] }
      }

      const usersList = await this.usersRepository.find(filter);

      const usersCount = usersList.length;

      const storiesCount = await this.storiesRepository.count();

      const languageCount = await this.languageRepository.count();

      const guestUsersCount = await this.guestUsersRepository.count();

      return {
        success: true,
        message: 'Analytics block data',
        data: {
          usersCount: usersCount,
          storiesCount: storiesCount.count,
          languageCount: languageCount.count,
          guestUsersCount: guestUsersCount.count
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // Top listeners...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN],
  })
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

      likedStories.forEach((likedStory: any) => {
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

      downloadedStories.forEach((downloadedStory: any) => {
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

  // Analytics by story...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN],
  })
  @get('/analytics-by-storyId/{storyId}')
  async storyAnalyticsById(
    @param.path.number('storyId') storyId: number,
  ): Promise<{ success: boolean; message: string; data: object }> {
    try {
      // Fetching story data
      const story = await this.storiesRepository.findOne({
        where: {
          id: storyId,
        },
        include: [
          { relation: 'category' }
        ]
      });

      if (!story) {
        throw new HttpErrors.NotFound('Story Not Found');
      }

      // Fetching audio history data for the particular story
      const filterAudioHistory = await this.audioHistoryRepository.find({
        where: {
          storiesId: story.id,
        },
      });

      if (filterAudioHistory.length === 0) {
        const cumulativeListeningDuration = 0;
        const usersCount = filterAudioHistory.length;

        // Initializing an array to track language-wise duration and users count
        let languageWiseDuration: any = [];

        // Populating the language-wise duration array with each audio's language
        story.audios.forEach((audio) => {
          if (audio.language) {
            languageWiseDuration.push({
              ...audio.language,
              usersCount: 0,
              cumulativeListeningDuration: 0,
            });
          }
        });

        // liked count for this story...
        const likedStories = await this.likedStorieRepository.find({ where: { storiesId: story.id } });
        const likesCount = likedStories.length;

        // downloads count for this story...
        const downloadStories = await this.downloadStoriesRepository.find({ where: { storiesId: story.id } });
        const downloadCount = downloadStories.length;

        const data = {
          storyData: story,
          languageWiseData: languageWiseDuration,
          cumulativeListeningDuration: cumulativeListeningDuration,
          usersCount: usersCount,
          likes: likesCount,
          downloadCount: downloadCount,
        };

        return {
          success: true,
          message: 'Analytics of story',
          data: data,
        };
      }

      let cumulativeListeningDuration = 0;
      const usersCount = filterAudioHistory.length;

      // for overall duration and users count
      for (const audio of filterAudioHistory) {
        if (audio.cumulativeListeningDuration) {
          cumulativeListeningDuration += audio.cumulativeListeningDuration;
        }
      }

      // Initializing an array to track language-wise duration and users count
      let languageWiseDuration: any = [];

      // Populating the language-wise duration array with each audio's language
      story.audios.forEach((audio) => {
        if (audio.language) {
          languageWiseDuration.push({
            ...audio.language,
            usersCount: 0,
            cumulativeListeningDuration: 0,
          });
        }
      });

      // Accumulating the listening duration for each language
      for (const audioHistory of filterAudioHistory) {
        const audioLanguage = audioHistory.language; // Assuming language is stored in the history
        const language = languageWiseDuration.find(
          (lang: any) => lang.id === audioLanguage
        );

        if (language) {
          // Update cumulative listening duration for the language
          language.cumulativeListeningDuration += audioHistory.cumulativeListeningDuration;

          // Increment the users count for the language
          language.usersCount += 1;
        }
      }

      // liked count for this story...
      const likedStories = await this.likedStorieRepository.find({ where: { storiesId: story.id } });
      const likesCount = likedStories.length;

      // downloads count for this story...
      const downloadStories = await this.downloadStoriesRepository.find({ where: { storiesId: story.id } });
      const downloadCount = downloadStories.length;

      const data = {
        storyData: story,
        languageWiseData: languageWiseDuration,
        cumulativeListeningDuration: cumulativeListeningDuration,
        usersCount: usersCount,
        likes: likesCount,
        downloadCount: downloadCount,
      };

      return {
        success: true,
        message: 'Analytics of story',
        data: data,
      };
    } catch (error) {
      throw error;
    }
  }

  // Top stories...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN],
  })
  @get('/top-stories')
  async topStoriesBlocks(
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

      // Query the database to get top stories by the selected time period
      const topStories = await this.audioHistoryRepository.dataSource.execute(
        `
        SELECT
          ah.storiesId,
          SUM(${timeColumn}) AS totalListeningDuration,
          u.title,
          u.subTitle,
          u.images
        FROM
          AudioHistory ah
        INNER JOIN
          Stories u
        ON
          ah.storiesId = u.id
        GROUP BY
          ah.storiesId, u.title, u.subTitle, u.images
        ORDER BY
          totalListeningDuration DESC
        LIMIT 10;
        `,
      );

      return {
        success: true,
        message: 'Top stories retrieved successfully',
        data: topStories,
      };
    } catch (error) {
      console.error('Error retrieving top stories:', error);
      throw new HttpErrors.InternalServerError('Failed to retrieve top stories');
    }
  }

  // Top languages...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN],
  })
  @get('/top-languages')
  async topLanguagesBlocks(
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

      // Query the database to get top languages by the selected time period
      const topLanguages = await this.audioHistoryRepository.dataSource.execute(
        `
        SELECT
          ah.language,
          SUM(${timeColumn}) AS totalListeningDuration,
          u.langName,
          u.code,
          u.nativeLangName
        FROM
          AudioHistory ah
        INNER JOIN
          Language u
        ON
          ah.language = u.id
        GROUP BY
          ah.language, u.langName, u.code, u.nativeLangName
        ORDER BY
          totalListeningDuration DESC
        LIMIT 10;
        `,
      );

      return {
        success: true,
        message: 'Top languages retrieved successfully',
        data: topLanguages,
      };
    } catch (error) {
      console.error('Error retrieving top languages:', error);
      throw new HttpErrors.InternalServerError('Failed to retrieve top languages');
    }
  }

  // users based analytics...
  @authenticate({
    strategy: 'jwt',
    options: [PermissionKeys.ADMIN],
  })
  @get('/users-analytics')
  async usersAnalyticsGraphBlocks(): Promise<{ success: boolean; message: string; data: object[] }> {
    try {
      // Fetch all user analytics data
      const userAnalyticsData = await this.userAnalyticsRepository.find();

      // Fetch all users to filter new users by registration date
      const users = await this.usersRepository.find();

      // Group analytics data by year and month
      const groupedAnalytics: { [key: string]: AnalyticsData } = userAnalyticsData.reduce((acc, analytics) => {
        analytics.analytics.forEach((data) => {
          const yearMonthKey = `${data.year}-${data.month}`;
          if (!acc[yearMonthKey]) {
            acc[yearMonthKey] = {
              year: data.year,
              month: data.month,
              count: 0,
              returningUsers: 0,
              newUsers: 0,
            };
          }
          acc[yearMonthKey].count += data.count;

          // Check for returning users
          const returningUserStatus = analytics.monthlyUserStatus.find(
            (status) => status.year === data.year && status.month === data.month
          );
          if (returningUserStatus && returningUserStatus.isReturningUser) {
            acc[yearMonthKey].returningUsers += data.count;
          }
        });
        return acc;
      }, {} as { [key: string]: AnalyticsData });

      users.forEach((user) => {
        // Ensure user.createdAt is not undefined
        if (user.createdAt) {
          const registrationDate = new Date(user.createdAt);  // Safely create a Date object
          const registrationYear = registrationDate.getFullYear();
          const registrationMonth = registrationDate.getMonth() + 1; // Month is 0-based

          const yearMonthKey = `${registrationYear}-${registrationMonth}`;
          if (groupedAnalytics[yearMonthKey]) {
            groupedAnalytics[yearMonthKey].newUsers += 1;  // Increment new user count for the year-month
          } else {
            groupedAnalytics[yearMonthKey] = {
              year: registrationYear,
              month: registrationMonth,
              count: 0,            // Initialize count to 0 (will be updated elsewhere)
              returningUsers: 0,    // Initialize returning user count to 0
              newUsers: 1,         // Initialize new user count to 1 for this month
            };
          }
        }
      });

      // Prepare the result data for graph
      const resultData = Object.values(groupedAnalytics).map((data) => ({
        year: data.year,
        month: data.month,
        totalVisits: data.count,
        returningUsers: data.returningUsers,
        newUsers: data.newUsers,
      }));

      return {
        success: true,
        message: 'User analytics fetched successfully.',
        data: resultData,
      };
    } catch (error) {
      console.error('Error while fetching user analytics data:', error);
      throw error;
    }
  }

  // @authenticate({
  //   strategy: 'jwt',
  //   options: [PermissionKeys.ADMIN],
  // })
  @get('/analytics-by-userId/{userId}')
  async userAnalyticsById(
    @param.path.number('userId') userId: number,
  ): Promise<{ success: boolean; message: string; data: object }> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.NotFound('User not found');
      }

      // 1. Audio History Data
      const audioHistoryData: any = await this.audioHistoryRepository.find({
        where: {
          usersId: userId,
        },
        include: [
          { relation: 'stories' },
          { relation: 'languageData' },
        ],
      });

      // Calculate cumulative listening duration
      let cumulativeListeningDuration = 0;
      let languageWiseDuration: any[] = [];

      for (const entry of audioHistoryData) {
        cumulativeListeningDuration += entry.cumulativeListeningDuration || 0;

        const language: any = entry.languageData;
        if (language) {
          const existingLang = languageWiseDuration.find((l: any) => l.id === language.id);
          if (existingLang) {
            existingLang.cumulativeListeningDuration += entry.cumulativeListeningDuration || 0;
            existingLang.usersCount += 1;
          } else {
            languageWiseDuration.push({
              ...language,
              cumulativeListeningDuration: entry.cumulativeListeningDuration || 0,
              usersCount: 1,
            });
          }
        }
      }

      // 2. Liked Stories
      const likedStories = await this.likedStorieRepository.find({
        where: {
          usersId: userId,
        },
        include: [{ relation: 'stories' }],
      });

      // 3. Downloaded Stories
      const downloadStories = await this.downloadStoriesRepository.find({
        where: {
          usersId: userId,
        },
        include: [{ relation: 'stories' }],
      });

      // 4. Build structured data
      const data = {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
        analytics: {
          cumulativeListeningDuration,
          languageWiseData: languageWiseDuration,
          audioHistory: audioHistoryData,
          likedStoriesCount: likedStories.length,
          downloadStoriesCount: downloadStories.length,
          likedStories: likedStories,
          downloadedStories: downloadStories,
        },
      };

      return {
        success: true,
        message: 'User analytics fetched successfully',
        data: data,
      };
    } catch (error) {
      throw error;
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