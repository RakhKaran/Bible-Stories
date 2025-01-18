import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {UserAnalytics, UserAnalyticsRelations, Users} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {UsersRepository} from './users.repository';

// export class UserAnalyticsRepository extends DefaultCrudRepository<
//   UserAnalytics,
//   typeof UserAnalytics.prototype.id,
//   UserAnalyticsRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(UserAnalytics, dataSource);
//   }
// }

export class UserAnalyticsRepository extends TimeStampRepositoryMixin<
UserAnalytics,
  typeof UserAnalytics.prototype.id,
  Constructor<
    DefaultCrudRepository<UserAnalytics, typeof UserAnalytics.prototype.id, UserAnalyticsRelations>
  >
>(DefaultCrudRepository) {

  public readonly users: BelongsToAccessor<Users, typeof UserAnalytics.prototype.id>;

  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource, @repository.getter('UsersRepository') protected usersRepositoryGetter: Getter<UsersRepository>,
  ) {
    super(UserAnalytics, dataSource);
    this.users = this.createBelongsToAccessorFor('users', usersRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}