import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  AudioHistory,
  Users,
} from '../models';
import {AudioHistoryRepository} from '../repositories';

export class AudioHistoryUsersController {
  constructor(
    @repository(AudioHistoryRepository)
    public audioHistoryRepository: AudioHistoryRepository,
  ) { }

  @get('/audio-histories/{id}/users', {
    responses: {
      '200': {
        description: 'Users belonging to AudioHistory',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Users),
          },
        },
      },
    },
  })
  async getUsers(
    @param.path.number('id') id: typeof AudioHistory.prototype.id,
  ): Promise<Users> {
    return this.audioHistoryRepository.users(id);
  }
}
