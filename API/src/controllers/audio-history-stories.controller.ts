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
  Stories,
} from '../models';
import {AudioHistoryRepository} from '../repositories';

export class AudioHistoryStoriesController {
  constructor(
    @repository(AudioHistoryRepository)
    public audioHistoryRepository: AudioHistoryRepository,
  ) { }

  @get('/audio-histories/{id}/stories', {
    responses: {
      '200': {
        description: 'Stories belonging to AudioHistory',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Stories),
          },
        },
      },
    },
  })
  async getStories(
    @param.path.number('id') id: typeof AudioHistory.prototype.id,
  ): Promise<Stories> {
    return this.audioHistoryRepository.stories(id);
  }
}
