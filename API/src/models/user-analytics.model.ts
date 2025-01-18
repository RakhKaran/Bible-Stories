import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Users} from './users.model';

@model()
export class UserAnalytics extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => Users)
  usersId: number;

  @property.array(
    {
      type: 'object',
      properties: {
        year: {type: 'number'},
        month: {type: 'number'},
        count: {type: 'number'},
      },
    },
    {
      required: true,
      default: [],
    },
  )
  analytics: Array<{
    year: number;
    month: number;
    count: number;
  }>;

  @property.array(
    {
      type: 'object',
      properties: {
        year: { type: 'number' },
        month: { type: 'number' },
        isReturningUser: { type: 'boolean' },
      },
    },
    {
      required: true,
      default: [],
    },
  )
  monthlyUserStatus: Array<{
    year: number;
    month: number;
    isReturningUser: boolean;
  }>;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<UserAnalytics>) {
    super(data);
  }
}

export interface UserAnalyticsRelations {
  // describe navigational properties here
}

export type UserAnalyticsWithRelations = UserAnalytics & UserAnalyticsRelations;
