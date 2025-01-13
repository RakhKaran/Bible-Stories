import {Entity, model, property} from '@loopback/repository';

@model()
export class GuestUsers extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string'
  })
  guestUserId: string;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;
  constructor(data?: Partial<GuestUsers>) {
    super(data);
  }
}

export interface GuestUsersRelations {
  // describe navigational properties here
}

export type GuestUsersWithRelations = GuestUsers & GuestUsersRelations;
