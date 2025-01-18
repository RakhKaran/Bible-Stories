import { inject } from '@loopback/core';
import {NotificationService} from './notification.service';

export class NotificationCron {
  constructor(
    @inject('services.notification.service')
    private notificationService: NotificationService,
  ) {}

  /**
   * Send notifications with throttling and track failed tokens.
   * @param fcmTokens - List of FCM tokens to send notifications to.
   * @param notificationData - Data for the notification (title, body, image).
   */
  async sendNotificationsWithThrottleAndFailures(
    fcmTokens: string[], 
    notificationData: {title: string; body: string; image?: string}
  ) {
    const failedTokens: string[] = [];
    const delay = 100; // Millisecond delay between requests

    for (let i = 0; i < fcmTokens.length; i++) {
      const token = fcmTokens[i];
      const response = await this.notificationService.sendFCMNotification(token, notificationData);

      if (!response.success) {
        console.error(`Failed to send notification to token: ${token}, Error: ${response.error}`);
        failedTokens.push(token); // Track failed tokens
      }

      // Throttle requests to avoid hitting rate limits
      if (i < fcmTokens.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Log the final status of failed tokens after sending notifications
    console.log('Notifications sent with throttling. Failed tokens:', failedTokens);
  }
}
