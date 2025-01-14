import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {PushNotifications, PushNotificationsRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

// export class PushNotificationsRepository extends DefaultCrudRepository<
//   PushNotifications,
//   typeof PushNotifications.prototype.id,
//   PushNotificationsRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(PushNotifications, dataSource);
//   }
// }

export class PushNotificationsRepository extends TimeStampRepositoryMixin<
PushNotifications,
  typeof PushNotifications.prototype.id,
  Constructor<
    DefaultCrudRepository<PushNotifications, typeof PushNotifications.prototype.id, PushNotificationsRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
  ) {
    super(PushNotifications, dataSource);
  }
}
