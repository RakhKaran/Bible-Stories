import { inject } from "@loopback/core";
import { BibleStoriesDataSource } from "../datasources";
import { repository } from "@loopback/repository";
import { LanguageRepository, StoriesRepository, UsersRepository } from "../repositories";
import { authenticate } from "@loopback/authentication";
import { PermissionKeys } from "../authorization/permission-keys";
import { get } from "@loopback/rest";

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
  ) {}

  // analytics blocks...
  @authenticate({
    strategy : 'jwt',
    options : [PermissionKeys.ADMIN, PermissionKeys.LISTENER]
  })
  @get('/analytics-blocks')
  async analyticsBlocks() : Promise<{success : true, message : string, data : object}>{
    try{
      const filter: any = {
        where: { or: [{ permissions: { like: `%["admin"]%` } }, { permissions: { like: `%["listener"]%` } }] }
      }

      const usersList = await this.usersRepository.find(filter);

      const usersCount = usersList.length;

      const storiesCount = await this.storiesRepository.count();

      const languageCount = await this.languageRepository.count();

      const guestUsersCount = 1;

      return{
        success : true,
        message : 'Analytics block data',
        data : {
          usersCount : usersCount,
          storiesCount : storiesCount.count,
          languageCount : languageCount.count,
          guestUsersCount : guestUsersCount
        }
      }
    }catch(error){
      throw error;
    }
  }

  // comming soon...
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