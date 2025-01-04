import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {GeneralQuestions, GeneralQuestionsRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

// export class GeneralQuestionsRepository extends DefaultCrudRepository<
//   GeneralQuestions,
//   typeof GeneralQuestions.prototype.id,
//   GeneralQuestionsRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(GeneralQuestions, dataSource);
//   }
// }

export class GeneralQuestionsRepository extends TimeStampRepositoryMixin<
GeneralQuestions,
  typeof GeneralQuestions.prototype.id,
  Constructor<
    DefaultCrudRepository<GeneralQuestions, typeof GeneralQuestions.prototype.id, GeneralQuestionsRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
  ) {
    super(GeneralQuestions, dataSource);
  }
}
