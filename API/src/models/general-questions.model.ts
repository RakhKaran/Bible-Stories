import {Entity, model, property} from '@loopback/repository';

@model()
export class GeneralQuestions extends Entity {
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

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;
  constructor(data?: Partial<GeneralQuestions>) {
    super(data);
  }
}

export interface GeneralQuestionsRelations {
  // describe navigational properties here
}

export type GeneralQuestionsWithRelations = GeneralQuestions & GeneralQuestionsRelations;
