import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Users,
  LastLogin,
} from '../models';
import {UsersRepository} from '../repositories';

export class UsersLastLoginController {
  constructor(
    @repository(UsersRepository) protected usersRepository: UsersRepository,
  ) { }

  @get('/users/{id}/last-logins', {
    responses: {
      '200': {
        description: 'Array of Users has many LastLogin',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(LastLogin)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<LastLogin>,
  ): Promise<LastLogin[]> {
    return this.usersRepository.lastLogins(id).find(filter);
  }

  @post('/users/{id}/last-logins', {
    responses: {
      '200': {
        description: 'Users model instance',
        content: {'application/json': {schema: getModelSchemaRef(LastLogin)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Users.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LastLogin, {
            title: 'NewLastLoginInUsers',
            exclude: ['id'],
            optional: ['usersId']
          }),
        },
      },
    }) lastLogin: Omit<LastLogin, 'id'>,
  ): Promise<LastLogin> {
    return this.usersRepository.lastLogins(id).create(lastLogin);
  }

  @patch('/users/{id}/last-logins', {
    responses: {
      '200': {
        description: 'Users.LastLogin PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LastLogin, {partial: true}),
        },
      },
    })
    lastLogin: Partial<LastLogin>,
    @param.query.object('where', getWhereSchemaFor(LastLogin)) where?: Where<LastLogin>,
  ): Promise<Count> {
    return this.usersRepository.lastLogins(id).patch(lastLogin, where);
  }

  @del('/users/{id}/last-logins', {
    responses: {
      '200': {
        description: 'Users.LastLogin DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(LastLogin)) where?: Where<LastLogin>,
  ): Promise<Count> {
    return this.usersRepository.lastLogins(id).delete(where);
  }
}
