import { Entity, model, property } from '@loopback/repository';

@model()
export class LastLogin extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  ip_address?: string;

  @property({
    type: 'string',
  })
  device_info?: string;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'number',
  })
  usersId?: number;

  constructor(data?: Partial<LastLogin>) {
    super(data);
  }
}

export interface LastLoginRelations {
  // describe navigational properties here
}

export type LastLoginWithRelations = LastLogin & LastLoginRelations;
