import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Users} from './users.model';
import {Stories} from './stories.model';
import {Language} from './language.model';

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

  @belongsTo(() => Language, {name: 'languageData'})
  language: number;

  @property({
    type: 'number',
    mysql: {
      columnType: 'DECIMAL(10,8)', // For MySQL/MariaDB.
    },
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
    mysql: {
      columnType: 'DECIMAL(10,8)',
    },
    default: 0
  })
  cumulativeListeningDuration: number;

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
