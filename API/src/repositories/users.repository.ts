import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {BibleStoriesDataSource} from '../datasources';
import {Users, UsersRelations, Language} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {LanguageRepository} from './language.repository';

// export class UsersRepository extends DefaultCrudRepository<
//   Users,
//   typeof Users.prototype.id,
//   UsersRelations
// > {
//   constructor(
//     @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
//   ) {
//     super(Users, dataSource);
//   }
// }

export type Credentials = {
  email: string;
  password: string;
};

export class UsersRepository extends TimeStampRepositoryMixin<
Users,
  typeof Users.prototype.id,
  Constructor<
    DefaultCrudRepository<Users, typeof Users.prototype.id, UsersRelations>
  >
>(DefaultCrudRepository) {

  public readonly audioLanguageRelation: BelongsToAccessor<Language, typeof Users.prototype.id>;

  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource, @repository.getter('LanguageRepository') protected languageRepositoryGetter: Getter<LanguageRepository>,
  ) {
    super(Users, dataSource);
    this.audioLanguageRelation = this.createBelongsToAccessorFor('audioLanguageRelation', languageRepositoryGetter,);
    this.registerInclusionResolver('audioLanguageRelation', this.audioLanguageRelation.inclusionResolver);
  }
}

