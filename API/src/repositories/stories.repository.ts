import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {Stories, StoriesRelations, Category} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {CategoryRepository} from './category.repository';

// export class StoriesRepository extends DefaultCrudRepository<
//   Stories,
//   typeof Stories.prototype.id,
//   StoriesRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(Stories, dataSource);
//   }
// }

export class StoriesRepository extends TimeStampRepositoryMixin<
Stories,
  typeof Stories.prototype.id,
  Constructor<
    DefaultCrudRepository<Stories, typeof Stories.prototype.id, StoriesRelations>
  >
>(DefaultCrudRepository) {

  public readonly category: BelongsToAccessor<Category, typeof Stories.prototype.id>;

  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Stories, dataSource);
    this.category = this.createBelongsToAccessorFor('category', categoryRepositoryGetter,);
    this.registerInclusionResolver('category', this.category.inclusionResolver);
  }
}
