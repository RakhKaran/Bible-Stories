import { inject } from "@loopback/core";
import { repository } from "@loopback/repository";
import { get, getModelSchemaRef, HttpErrors, param, post, requestBody } from "@loopback/rest";
import { authenticate, AuthenticationBindings } from "@loopback/authentication";
import { BibleStoriesDataSource } from "../datasources";
import { CategoryRepository, PushNotificationsRepository, StoriesRepository, UsersRepository } from "../repositories";
import { PermissionKeys } from "../authorization/permission-keys";
import { PushNotifications, Stories } from "../models";
import { NotificationService } from "../services/notification.service";
import { NotificationCronJob } from "../services/cronjob.service";
import { UserProfile } from "@loopback/security";

export class PushNotificationController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,  
    @repository(PushNotificationsRepository)
    public pushNotificationsRepository : PushNotificationsRepository,
    @repository(UsersRepository)
    public usersRepository : UsersRepository,
    @repository(CategoryRepository)
    public categoryRepository : CategoryRepository,
    @repository(StoriesRepository)
    public storiesRepository : StoriesRepository,
    @inject('service.cronjob.service')
    private notificationCronJob : NotificationCronJob
  ) {}

    // users list which allow push notification...
    @authenticate({
      strategy : 'jwt',
      options : [PermissionKeys.ADMIN]
    })
    @get('/push-notifications/users-list')
    async fetchUsersList() : Promise<{success : boolean, message : string, data : object}>{
      try{
        const filter: any = {
          where: { 
            and: 
              [
                { permissions: { like: `%["listener"]%` } }, 
                { isAllowingPushNotifications : true  },
              ]
            },
            fields: {  // Limit the fields to be returned
              id: true,
              firstName: true,
              avatar: true,
            },
        };

        const users = await this.usersRepository.find(filter);

        return{
          success : true,
          message : 'Users List',
          data : users
        }
      }catch(error){
        throw error;
      }
    }

    // for optional data...
    @authenticate({
      strategy : 'jwt',
      options : [PermissionKeys.ADMIN]
    })
    @get('/fetch-optional-data/{option}')
    async fetchOptionalData(
      @param.path.string('option') option : string
    ) : Promise<{success : boolean; message: string; data: Array<object>}>{
      try{
        if(option && option !== 'none'){
          if(option === 'category'){
            const categoriesOption = await this.categoryRepository.find({fields : ['image', 'categoryName', 'id']});

            return{
              success : true,
              message : 'category Data',
              data : categoriesOption,
            }
          }

          if(option === 'story'){
            const storiesOption = await this.storiesRepository.find({fields : ['id', 'images', 'title']});

            return{
              success : true,
              message : 'category Data',
              data : storiesOption,
            }
          }
        }
        return{
          success : false,
          message : 'None Value Passed',
          data : []
        }
      }catch(error){
        throw error;
      }
    }

    // sending new notification...
    @authenticate({
      strategy: 'jwt',
      options: [PermissionKeys.ADMIN],
    })
    @post('/push-notifications')
    async sendNewPushNotification(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(PushNotifications, {
              title: 'Push Notifications',
              exclude: ['id'],
            }),
          },
        },
      })
      pushNotifications: Omit<PushNotifications, 'id'>,
    ): Promise<{ success: boolean; message: string }> {
      let notification : any;
      try {
        // Step 1: Create the notification
        notification = await this.pushNotificationsRepository.create(pushNotifications);
    
        // Step 2: Collect FCM tokens of the target users
        const fcmTokens: Array<string> = [];
        await Promise.all(
          notification.targetUsers.map(async (userId : any) => {
            const userData = await this.usersRepository.findById(userId);
            if (userData?.fcmToken) {
              fcmTokens.push(userData.fcmToken);
            }
          }),
        );
    
        // Step 3: Prepare the data for sending the FCM notification
        let data: any = {
          // clientTokens: fcmTokens,
          title: notification.title, // Pass the title from the notification data
          body: notification.messageBody, // Pass the body from the notification data
          optionalData: notification.optionalData,
        };
    
        // Optionally include image if it exists
        if (notification.image) {
          data.image = notification.image?.fileUrl;
        }
    
        // Step 4: Pass data to the cron job
      this.notificationCronJob.setJobData(notification.id, fcmTokens, data); // Pass the FCM tokens and notification data

      // Step 5: Return success message
      return {
        success: true,
        message: 'Push notification job started successfully.',
      };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return {
        success: false,
        message: 'Failed to start push notification job.',
      };
    }
    }

    // get notifications on admin panel...
    @authenticate({
      strategy: 'jwt',
      options: [PermissionKeys.ADMIN],
    })
    @get('/push-notifications/list')
    async fetchNewPushNotification(): Promise<{ success: boolean; message: string, data: PushNotifications[] }> {
      try{
        const notifications = await this.pushNotificationsRepository.find({order: ['createdAt DESC']});

        return{
          success: true,
          message: 'Push Notifications List',
          data: notifications
        }
      }catch(error){
        throw error;
      }
    }

    @authenticate({
      strategy: 'jwt',
      options: [PermissionKeys.LISTENER],
    })
    @get('/users-notifications')
    async fetchUsersNotification(
      @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile
    ): Promise<{ success: boolean; message: string; data: PushNotifications[] }> {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Set to the start of today
    
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999); // Set to the end of today
    
        // Fetch notifications for today where currentUser.id is in targetUsers array
        const id = Number(currentUser.id);
        const notifications = await this.pushNotificationsRepository.find({
          where: {
            createdAt: { gte: todayStart, lte: todayEnd },
          },
          order: ['createdAt DESC'],
        });

        const filteredNotifications = notifications.filter((not) => not.targetUsers.some((num) => num === id));
      
        return {
          success: true,
          message: 'Notifications fetched successfully',
          data: filteredNotifications,
        };
      } catch (error) {
        throw error;
      }
    }
}
