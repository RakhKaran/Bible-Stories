import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {AudioHistory, AudioHistoryRelations, Users, Stories} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {UsersRepository} from './users.repository';
import {StoriesRepository} from './stories.repository';

// export class AudioHistoryRepository extends DefaultCrudRepository<
//   AudioHistory,
//   typeof AudioHistory.prototype.id,
//   AudioHistoryRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(AudioHistory, dataSource);
//   }
// }

export class AudioHistoryRepository extends TimeStampRepositoryMixin<
AudioHistory,
  typeof AudioHistory.prototype.id,
  Constructor<
    DefaultCrudRepository<AudioHistory, typeof AudioHistory.prototype.id, AudioHistoryRelations>
  >
>(DefaultCrudRepository) {

  public readonly users: BelongsToAccessor<Users, typeof AudioHistory.prototype.id>;

  public readonly stories: BelongsToAccessor<Stories, typeof AudioHistory.prototype.id>;

  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource, @repository.getter('UsersRepository') protected usersRepositoryGetter: Getter<UsersRepository>, @repository.getter('StoriesRepository') protected storiesRepositoryGetter: Getter<StoriesRepository>,
  ) {
    super(AudioHistory, dataSource);
    this.stories = this.createBelongsToAccessorFor('stories', storiesRepositoryGetter,);
    this.registerInclusionResolver('stories', this.stories.inclusionResolver);
    this.users = this.createBelongsToAccessorFor('users', usersRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}