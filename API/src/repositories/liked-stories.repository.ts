import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {LikedStories, LikedStoriesRelations, Users, Stories} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {UsersRepository} from './users.repository';
import {StoriesRepository} from './stories.repository';

// export class LikedStoriesRepository extends DefaultCrudRepository<
//   LikedStories,
//   typeof LikedStories.prototype.id,
//   LikedStoriesRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(LikedStories, dataSource);
//   }
// }

export class LikedStoriesRepository extends TimeStampRepositoryMixin<
LikedStories,
  typeof LikedStories.prototype.id,
  Constructor<
    DefaultCrudRepository<LikedStories, typeof LikedStories.prototype.id, LikedStoriesRelations>
  >
>(DefaultCrudRepository) {

  public readonly users: BelongsToAccessor<Users, typeof LikedStories.prototype.id>;

  public readonly stories: BelongsToAccessor<Stories, typeof LikedStories.prototype.id>;

  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource, @repository.getter('UsersRepository') protected usersRepositoryGetter: Getter<UsersRepository>, @repository.getter('StoriesRepository') protected storiesRepositoryGetter: Getter<StoriesRepository>,
  ) {
    super(LikedStories, dataSource);
    this.stories = this.createBelongsToAccessorFor('stories', storiesRepositoryGetter,);
    this.registerInclusionResolver('stories', this.stories.inclusionResolver);
    this.users = this.createBelongsToAccessorFor('users', usersRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}