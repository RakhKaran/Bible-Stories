import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Users} from './users.model';
import {Stories} from './stories.model';

@model()
export class LikedStories extends Entity {
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

  constructor(data?: Partial<LikedStories>) {
    super(data);
  }
}

export interface LikedStoriesRelations {
  // describe navigational properties here
}

export type LikedStoriesWithRelations = LikedStories & LikedStoriesRelations;
