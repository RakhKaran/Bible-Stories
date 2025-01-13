import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {GuestUsers, GuestUsersRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

// export class GuestUsersRepository extends DefaultCrudRepository<
//   GuestUsers,
//   typeof GuestUsers.prototype.id,
//   GuestUsersRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(GuestUsers, dataSource);
//   }
// }

export class GuestUsersRepository extends TimeStampRepositoryMixin<
GuestUsers,
  typeof GuestUsers.prototype.id,
  Constructor<
    DefaultCrudRepository<GuestUsers, typeof GuestUsers.prototype.id, GuestUsersRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
  ) {
    super(GuestUsers, dataSource);
  }
}

