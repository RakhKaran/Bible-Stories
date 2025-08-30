import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Stories } from './stories.model';
import { Users } from './users.model';

@model()
export class Comments extends Entity {
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
  commentType: string;

  @property({
    type: 'string',
  })
  comment: string;

  @property({
    type: 'object',
  })
  audio: object;

  @property({
    type: 'number',
  })
  audioDuration: number;

  @property({
    type: 'boolean',
    required: true
  })
  isParentComment: boolean;

  @property({
    type: 'number',
  })
  repliedCommentId: number;

  @belongsTo(() => Stories)
  storiesId: number;

  @belongsTo(() => Users)
  usersId: number;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<Comments>) {
    super(data);
  }
}

export interface CommentsRelations {
  // describe navigational properties here
}

export type CommentsWithRelations = Comments & CommentsRelations;
