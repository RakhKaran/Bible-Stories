import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {DownloadStories, DownloadStoriesRelations, Users, Stories} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {UsersRepository} from './users.repository';
import {StoriesRepository} from './stories.repository';

// export class DownloadStoriesRepository extends DefaultCrudRepository<
//   DownloadStories,
//   typeof DownloadStories.prototype.id,
//   DownloadStoriesRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(DownloadStories, dataSource);
//   }
// }

export class DownloadStoriesRepository extends TimeStampRepositoryMixin<
DownloadStories,
  typeof DownloadStories.prototype.id,
  Constructor<
    DefaultCrudRepository<DownloadStories, typeof DownloadStories.prototype.id, DownloadStoriesRelations>
  >
>(DefaultCrudRepository) {

  public readonly users: BelongsToAccessor<Users, typeof DownloadStories.prototype.id>;

  public readonly stories: BelongsToAccessor<Stories, typeof DownloadStories.prototype.id>;

  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource, @repository.getter('UsersRepository') protected usersRepositoryGetter: Getter<UsersRepository>, @repository.getter('StoriesRepository') protected storiesRepositoryGetter: Getter<StoriesRepository>,
  ) {
    super(DownloadStories, dataSource);
    this.stories = this.createBelongsToAccessorFor('stories', storiesRepositoryGetter,);
    this.registerInclusionResolver('stories', this.stories.inclusionResolver);
    this.users = this.createBelongsToAccessorFor('users', usersRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}
