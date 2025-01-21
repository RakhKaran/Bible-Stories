import {Entity, model, property} from '@loopback/repository';

@model()
export class PushNotifications extends Entity {
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
    type: 'string'
  })
  messageBody: string;

  @property({
    type: 'object',
  })
  image?: object;

  @property({
    type: 'string'
  })
  status: string;

  @property({
    type: 'object',
    itemType : 'number'
  })
  notificationData: {
    sentCount: number;
    failedCount: number;
  }

  @property({
    type: 'date',
  })
  sendTime?: Date; 

  @property({
    type: 'array',
    itemType: 'number'
  })
  targetUsers: Array<number>;

  @property({
    type: 'object',
  })
  optionalData?: {
    type: string;
    value: number;
  };

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;
  constructor(data?: Partial<PushNotifications>) {
    super(data);
  }
}

export interface PushNotificationsRelations {
  // describe navigational properties here
}

export type PushNotificationsWithRelations = PushNotifications & PushNotificationsRelations;
