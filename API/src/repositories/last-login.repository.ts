import { Constructor, inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { BibleStoriesDataSource } from '../datasources';
import { LastLogin, LastLoginRelations } from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class LastLoginRepository extends TimeStampRepositoryMixin<
  LastLogin,
  typeof LastLogin.prototype.id,
  Constructor<
    DefaultCrudRepository<LastLogin, typeof LastLogin.prototype.id, LastLoginRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.bibleStories') dataSource: BibleStoriesDataSource,
  ) {
    super(LastLogin, dataSource);
  }
}
