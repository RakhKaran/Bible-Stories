import { inject } from "@loopback/core";
import { repository } from "@loopback/repository";
import { get, getModelSchemaRef, HttpErrors, post, requestBody } from "@loopback/rest";
import { authenticate } from "@loopback/authentication";
import { BibleStoriesDataSource } from "../datasources";
import { PushNotificationsRepository, UsersRepository } from "../repositories";
import { PermissionKeys } from "../authorization/permission-keys";
import { PushNotifications } from "../models";
import { NotificationService } from "../services/notification.service";

export class PushNotificationController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,  
    @repository(PushNotificationsRepository)
    public pushNotificationsRepository : PushNotificationsRepository,
    @repository(UsersRepository)
    public usersRepository : UsersRepository,
    @inject('services.notification.service')
    private notificationService: NotificationService,
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

    // sending new notification...
    @authenticate({
      strategy: 'jwt',
      options: [PermissionKeys.ADMIN],
    })
    @post('/push-notifications/list')
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
      let notification;
      try {
        // Step 1: Create the notification
        notification = await this.pushNotificationsRepository.create(pushNotifications);
    
        // Step 2: Collect FCM tokens of the target users
        const fcmTokens: Array<string> = [];
        await Promise.all(
          notification.targetUsers.map(async (userId) => {
            const userData = await this.usersRepository.findById(userId);
            if (userData?.fcmToken) {
              fcmTokens.push(userData.fcmToken);
            }
          }),
        );
    
        // Step 3: Prepare the data for sending the FCM notification
        let data: any = {
          clientTokens: fcmTokens,
          title: notification.title, // Pass the title from the notification data
          body: notification.messageBody, // Pass the body from the notification data
        };
    
        // Optionally include image if it exists
        if (notification.image) {
          data.image = notification.image;
        }
    
        // Step 4: Send the notification using the notification service
        const response = await this.notificationService.sendFCMNotification(data);
    
        // Step 5: Update the notification status based on FCM response
        if (response?.success) {
          await this.pushNotificationsRepository.updateById(notification.id, {
            status: 'sent', // Status set as sent if the notification was successfully sent
          });
        } else {
          await this.pushNotificationsRepository.updateById(notification.id, {
            status: 'failed', // Status set as failed if the notification could not be sent
          });
        }
    
        return {
          success: true,
          message: 'Notification sent successfully.',
        };
      } catch (error) {
        // Step 6: Handle any errors and update the status if necessary
        if (notification?.id) {
          await this.pushNotificationsRepository.updateById(notification.id, {
            status: 'failed', // Set the status to failed if an error occurs during processing
          });
        }
    
        console.error('Error in sending notification:', error); // Log error for debugging purposes
        throw new Error('Failed to send push notification'); // Throw a proper error message to the client
      }
    }
}
