import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Users } from './users.model';
import { Stories } from './stories.model';
import { Language } from './language.model';

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

  @belongsTo(() => Language, { name: 'languageData' })
  language: number;

  @property({
    type: 'number',
    mysql: {
      columnType: 'DECIMAL(10,8)', // For MySQL/MariaDB.
    },
    default: 0,
  })
  lastDuration: number;

  @property({
    type: 'number',
    default: 0,
  })
  listeningCount: number;

  @property({
    type: 'number',
    mysql: {
      columnType: 'DECIMAL(10,8)',
    },
    default: 0,
  })
  cumulativeListeningDuration: number;

  @property({
    type: 'number',
    mysql: {
      columnType: 'DECIMAL(10,8)', // Store as DECIMAL for daily tracking
    },
    default: 0,
  })
  dailyCumulativeListeningDuration: number; // New property for daily tracking

  @property({
    type: 'number',
    mysql: {
      columnType: 'DECIMAL(10,8)', // Store as DECIMAL for weekly tracking
    },
    default: 0,
  })
  weeklyCumulativeListeningDuration: number; // New property for weekly tracking

  @property({
    type: 'number',
    mysql: {
      columnType: 'DECIMAL(10,8)', // Store as DECIMAL for monthly tracking
    },
    default: 0,
  })
  monthlyCumulativeListeningDuration: number; // New property for monthly tracking

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'date',
  })
  lastUpdatedDate?: Date; // New property to track last update date

  constructor(data?: Partial<AudioHistory>) {
    super(data);
  }
}

export interface AudioHistoryRelations {
  // describe navigational properties here
}

export type AudioHistoryWithRelations = AudioHistory & AudioHistoryRelations;
