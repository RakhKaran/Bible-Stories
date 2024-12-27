import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Users,
  Language,
} from '../models';
import {UsersRepository} from '../repositories';

export class UsersLanguageController {
  constructor(
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
  ) { }

  @get('/users/{id}/language', {
    responses: {
      '200': {
        description: 'Language belonging to Users',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Language),
          },
        },
      },
    },
  })
  async getLanguage(
    @param.path.number('id') id: typeof Users.prototype.id,
  ): Promise<Language> {
    return this.usersRepository.audioLanguageRelation(id);
  }
}
