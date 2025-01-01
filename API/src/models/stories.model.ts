import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Category} from './category.model';

@model()
export class Stories extends Entity {
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
  title: string;

  @property({
    type: 'string',
    required: true
  })
  subTitle: string;

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
    type: 'array',
    itemType: 'object',
    required: true
  })
  images: Array<{
    fileUrl: string,
    fileName: string
  }>

  @belongsTo(() => Category)
  categoryId: number;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;


  constructor(data?: Partial<Stories>) {
    super(data);
  }
}

export interface StoriesRelations {
  // describe navigational properties here
}

export type StoriesWithRelations = Stories & StoriesRelations;
