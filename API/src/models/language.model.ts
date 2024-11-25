import {Entity, model, property} from '@loopback/repository';

@model()
export class Language extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type : 'string',
    required : true,
    unique: true
  })
  langName: string;

  @property({
    type : 'string',
    required : true,
    unique: true
  })
  nativeLangName: string;

  @property({
    type : 'string',
    required : true,
    unique: true
  })
  code : string;

  @property({
    type : 'boolean',
    required : true,
  })
  isActive : boolean;
  
  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<Language>) {
    super(data);
  }
}

export interface LanguageRelations {
  // describe navigational properties here
}

export type LanguageWithRelations = Language & LanguageRelations;
