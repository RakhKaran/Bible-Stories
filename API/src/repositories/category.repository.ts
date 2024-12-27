import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {Category, CategoryRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

// export class CategoryRepository extends DefaultCrudRepository<
//   Category,
//   typeof Category.prototype.id,
//   CategoryRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(Category, dataSource);
//   }
// }

export class CategoryRepository extends TimeStampRepositoryMixin<
Category,
  typeof Category.prototype.id,
  Constructor<
    DefaultCrudRepository<Category, typeof Category.prototype.id, CategoryRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
  ) {
    super(Category, dataSource);
  }
}
