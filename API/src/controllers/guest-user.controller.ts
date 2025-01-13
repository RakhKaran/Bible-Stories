import { repository } from "@loopback/repository";
import { inject } from "@loopback/core";
import { getModelSchemaRef, post, requestBody } from "@loopback/rest";
import { GuestUsersRepository } from "../repositories";
import { BibleStoriesDataSource } from "../datasources";
import { GuestUsers } from "../models";

export class GuestUserController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(GuestUsersRepository)
    public guestUsersRepository: GuestUsersRepository
  ) {}

  @post('/auth/guest-user')
  async verifyGuestUser(
    @requestBody({
      content : {
        'application/json' : {
          schema: getModelSchemaRef(GuestUsers, {
            title: 'NewGuestUser',
            exclude: ['id'],
          }),
        }
      }
    })
    guestUser : Omit<GuestUsers, 'id'>
  ) : Promise<{success : boolean, message : string, data : object}>{
    try{
      const { guestUserId } = guestUser;

      const guestUserData = await this.guestUsersRepository.findOne({
        where : 
          { 
            guestUserId : guestUserId
          }
        }
      );

      if(guestUserData){
        return{
          success : true,
          message : 'Guest User Data',
          data : guestUserData
        }
      };

      const newGuestUser = await this.guestUsersRepository.create(guestUser);

      if(newGuestUser){
        return{
          success : true,
          message : 'Guest User Data',
          data : newGuestUser
        }
      }else{
        return{
          success : false,
          message : 'Guest User Data',
          data : {}
        }
      }
    }catch(error){
      throw error;
    }
  }
}
