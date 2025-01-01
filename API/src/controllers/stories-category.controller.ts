import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Stories,
  Category,
} from '../models';
import {StoriesRepository} from '../repositories';

export class StoriesCategoryController {
  constructor(
    @repository(StoriesRepository)
    public storiesRepository: StoriesRepository,
  ) { }

  @get('/stories/{id}/category', {
    responses: {
      '200': {
        description: 'Category belonging to Stories',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Category),
          },
        },
      },
    },
  })
  async getCategory(
    @param.path.number('id') id: typeof Stories.prototype.id,
  ): Promise<Category> {
    return this.storiesRepository.category(id);
  }
}
