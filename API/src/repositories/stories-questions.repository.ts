import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {StoriesQuestions, StoriesQuestionsRelations, Stories} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {StoriesRepository} from './stories.repository';

// export class StoriesQuestionsRepository extends DefaultCrudRepository<
//   StoriesQuestions,
//   typeof StoriesQuestions.prototype.id,
//   StoriesQuestionsRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(StoriesQuestions, dataSource);
//   }
// }

export class StoriesQuestionsRepository extends TimeStampRepositoryMixin<
StoriesQuestions,
  typeof StoriesQuestions.prototype.id,
  Constructor<
    DefaultCrudRepository<StoriesQuestions, typeof StoriesQuestions.prototype.id, StoriesQuestionsRelations>
  >
>(DefaultCrudRepository) {

  public readonly stories: BelongsToAccessor<Stories, typeof StoriesQuestions.prototype.id>;

  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource, @repository.getter('StoriesRepository') protected storiesRepositoryGetter: Getter<StoriesRepository>,
  ) {
    super(StoriesQuestions, dataSource);
    this.stories = this.createBelongsToAccessorFor('stories', storiesRepositoryGetter,);
    this.registerInclusionResolver('stories', this.stories.inclusionResolver);
  }
}
