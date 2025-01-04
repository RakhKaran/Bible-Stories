import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Users} from './users.model';
import {Stories} from './stories.model';

@model()
export class DownloadStories extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => Users)
  usersId: number;

  @belongsTo(() => Stories)
  storiesId: number;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<DownloadStories>) {
    super(data);
  }
}

export interface DownloadStoriesRelations {
  // describe navigational properties here
}

export type DownloadStoriesWithRelations = DownloadStories & DownloadStoriesRelations;
