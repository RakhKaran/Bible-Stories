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
  Language,
} from '../models';
import {AudioHistoryRepository} from '../repositories';

export class AudioHistoryLanguageController {
  constructor(
    @repository(AudioHistoryRepository)
    public audioHistoryRepository: AudioHistoryRepository,
  ) { }

  @get('/audio-histories/{id}/language', {
    responses: {
      '200': {
        description: 'Language belonging to AudioHistory',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Language),
          },
        },
      },
    },
  })
  async getLanguage(
    @param.path.number('id') id: typeof AudioHistory.prototype.id,
  ): Promise<Language> {
    return this.audioHistoryRepository.languageData(id);
  }
}
