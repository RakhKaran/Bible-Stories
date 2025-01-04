import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {Comments, CommentsRelations, Stories, Users} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {StoriesRepository} from './stories.repository';
import {UsersRepository} from './users.repository';

// export class CommentsRepository extends DefaultCrudRepository<
//   Comments,
//   typeof Comments.prototype.id,
//   CommentsRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(Comments, dataSource);
//   }
// }

export class CommentsRepository extends TimeStampRepositoryMixin<
Comments,
  typeof Comments.prototype.id,
  Constructor<
    DefaultCrudRepository<Comments, typeof Comments.prototype.id, CommentsRelations>
  >
>(DefaultCrudRepository) {

  public readonly stories: BelongsToAccessor<Stories, typeof Comments.prototype.id>;

  public readonly users: BelongsToAccessor<Users, typeof Comments.prototype.id>;

  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource, @repository.getter('StoriesRepository') protected storiesRepositoryGetter: Getter<StoriesRepository>, @repository.getter('UsersRepository') protected usersRepositoryGetter: Getter<UsersRepository>,
  ) {
    super(Comments, dataSource);
    this.users = this.createBelongsToAccessorFor('users', usersRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
    this.stories = this.createBelongsToAccessorFor('stories', storiesRepositoryGetter,);
    this.registerInclusionResolver('stories', this.stories.inclusionResolver);
  }
}
