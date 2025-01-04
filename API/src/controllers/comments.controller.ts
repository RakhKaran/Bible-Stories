import { inject } from "@loopback/core";
import { Count, DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { get, getModelSchemaRef, param, post, requestBody, del } from "@loopback/rest";
import { authenticate, AuthenticationBindings } from "@loopback/authentication";
import { BibleStoriesDataSource } from "../datasources";
import { CommentsRepository } from "../repositories";
import { Comments } from "../models";
import { PermissionKeys } from "../authorization/permission-keys";
import { UserProfile } from "@loopback/security";

// ----------------------------------------------------------------------------------------------------------------------

export class CommentsController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(CommentsRepository)
    public commentsRepository : CommentsRepository,
  ) {}

  // add new comment...
  @authenticate({
    strategy : 'jwt',
    options : [PermissionKeys.ADMIN, PermissionKeys.LISTENER]
  })
  @post('/comment')
  async newComment(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser : UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Comments, {
            title: 'NewComment',
            exclude: ['id'],
          }),
        },
      },
    })
    commentData : Omit<Comments, 'id'>
  ) : Promise<{success : boolean, message : string}>{
    const repo = new DefaultTransactionalRepository(Comments, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try{
      const data = {
        ...commentData,
        usersId : currentUser.id
      };
      await this.commentsRepository.create(data, {
        transaction: tx,
      });

      await tx.commit();

      return{
        success : true,
        message : 'Comment Added Successfully'
      }
    }catch(error){
      await tx.rollback();
      throw error;
    }
  }

  // get parent comments....
  // @authenticate({
  //   strategy : 'jwt',
  //   options : [PermissionKeys.ADMIN, PermissionKeys.LISTENER]
  // })
  @get('/comments/{storyId}')
  async getParentComments(
    @param.path.number('storyId') storyId : number,
    @param.query.number('limit') limit : number,
    @param.query.number('skip') skip : number,
  ) : Promise<{success : boolean, message : string, data: object, commentsCount: Count}>{
    try{
      // fetching comments...
      const comments = await this.commentsRepository.find(
        {
          where : {
            storiesId : storyId,
            isParentComment : true
          },
          limit : limit || 10,
          skip : skip || 0,
          include : [
            {
              relation: 'users',
              scope: {
                fields: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                },
              },
            },
          ]
        }
      );

      // fetching comments count....
      const commentsCount = await this.commentsRepository.count({isParentComment : true, storiesId : storyId});

      let filteredComments : any = [];

      // fetching reply count of each comment...
      await Promise.all(comments.map(async (comment) => {
        const replies = await this.commentsRepository.find({where : {repliedCommentId : comment.id}});

        const repliesCount = replies.length;

        filteredComments.push({
          ...comment,
          repliesCount : repliesCount
        })
      }))

      return{
        success : true,
        message : 'comments list',
        data : filteredComments,
        commentsCount : commentsCount,
      }
    }catch(error){
      throw error;
    }
  }

  // get comments replies...
  @get('/comment-replies/{commentId}')
  async getCommentReplies(
    @param.path.number('commentId') commentId : number,
    @param.query.number('limit') limit : number,
    @param.query.number('skip') skip : number
  ) : Promise<{success: boolean, message: string, data: object, repliesCount : Count}>{
    try{
      // fetching replies...
      const replies = await this.commentsRepository.find(
        {
          where : {
            repliedCommentId : commentId
          },
          limit : limit || 10,
          skip : skip || 0,
          include : [
            {
              relation: 'users',
              scope: {
                fields: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                },
              },
            },
          ]
        }
      );

      // fetching replies count...
      const repliesCount = await this.commentsRepository.count({repliedCommentId : commentId});

      let finalReplies : any = []

      // fetching nested replies count...
      await Promise.all(replies.map(async(reply) => {
        const nestedReplies = await this.commentsRepository.find({where : {repliedCommentId : reply.id}});

        const repliesCount = nestedReplies.length;

        finalReplies.push({
          ...reply,
          repliesCount : repliesCount
        })
      }))

      return{
        success : true,
        message : 'Replies on comment',
        data : finalReplies,
        repliesCount : repliesCount
      }
    }catch(error){
      throw error;
    }
  }

  // delete comment and its replies...
  @del('/comment/{commentId}')
  async deleteCommentById(
    @param.path.number('commentId') commentId : number
  ) : Promise<{success : boolean, message : string}>{
    try{
      await this.commentsRepository.deleteById(commentId);

      await this.commentsRepository.deleteAll({repliedCommentId : commentId});

      return{
        success : true,
        message : 'Comment Deleted'
      }
    }catch(error){
      throw error;
    }
  }
}
