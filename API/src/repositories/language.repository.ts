import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {Language, LanguageRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

// export class LanguageRepository extends DefaultCrudRepository<
//   Language,
//   typeof Language.prototype.id,
//   LanguageRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(Language, dataSource);
//   }
// }

export class LanguageRepository extends TimeStampRepositoryMixin<
Language,
  typeof Language.prototype.id,
  Constructor<
    DefaultCrudRepository<Language, typeof Language.prototype.id, LanguageRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
  ) {
    super(Language, dataSource);
  }
}
