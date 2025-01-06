import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Users} from './users.model';
import {Stories} from './stories.model';

@model()
export class AudioHistory extends Entity {
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
    type: 'object'
  })
  language: object;

  @property({
    type: 'number',
    default: 0
  })
  lastDuration: number;

  @property({
    type: 'number',
    default: 0
  })
  listeningCount: number;

  @property({
    type: 'number',
    default: 0
  })
  cumulativeListeningCount: 0;

  @property({
    type: 'boolean',
    default : false
  })
  isCompleted: boolean;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<AudioHistory>) {
    super(data);
  }
}

export interface AudioHistoryRelations {
  // describe navigational properties here
}

export type AudioHistoryWithRelations = AudioHistory & AudioHistoryRelations;
