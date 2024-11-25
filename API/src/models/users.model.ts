import {Entity, model, property} from '@loopback/repository';

@model()
export class Users extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type : 'string',
    required : true,
  })
  firstName : string;

  @property({
    type : 'string',
  })
  lastName : string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      uniqueItems: true,
    },
  })
  phoneNumber: string;

  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  password: string;

  @property({
    type : 'string',
    required : true
  })
  city : string;

  @property({
    type : 'string',
    required : true
  })
  state : string;

  @property({
    type : 'string',
    required : true,
  })
  country : string;

  @property({
    type: 'object',
  })
  avatar?: object;

  @property({
    type: 'array',
    itemType: 'string', // This should be an array of strings
  })
  permissions: string[];

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

  @property({
    type: 'string',
  })
  otp?: string;

  @property({
    type: 'string',
  })
  otpExpireAt: string;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<Users>) {
    super(data);
  }
}

export interface UsersRelations {
  // describe navigational properties here
}

export type UsersWithRelations = Users & UsersRelations;
