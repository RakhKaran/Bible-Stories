import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Stories} from './stories.model';

@model()
export class StoriesQuestions extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true
  })
  question: string;

  @property({
    type: 'array',
    itemType: 'object',
    required: true
  })
  audios: Array<{
    language: object,
    audio: object,
    duration: number
  }>

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

  constructor(data?: Partial<StoriesQuestions>) {
    super(data);
  }
}

export interface StoriesQuestionsRelations {
  // describe navigational properties here
}

export type StoriesQuestionsWithRelations = StoriesQuestions & StoriesQuestionsRelations;
