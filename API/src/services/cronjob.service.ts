// import { CronJob, cronJob } from '@loopback/cron';
// import { inject } from '@loopback/core';
// import { NotificationCron } from '../services/notificationCron.service';

// @cronJob()
// export class NotificationCronJob extends CronJob {
//   private fcmTokens: string[] = [];
//   private notificationData: any = {};

//   constructor(
//     @inject('service.notificationcronjob.service')
//     private notificationCron: NotificationCron,
//   ) {
//     super({
//       cronTime: '0 * * * *', // Every hour, for example, adjust as needed
//       onTick: async () => {
//         await this.runJob();
//       },
//     });
//   }

//   // Method to set the data that will be used when the job runs
//   setJobData(fcmTokens: string[], notificationData: any) {
//     this.fcmTokens = fcmTokens;
//     this.notificationData = notificationData;
//   }

//   async runJob() {
//     console.log('Notification cron job started at', new Date());
//     if (this.fcmTokens.length > 0) {
//       await this.notificationCron.sendNotificationsWithThrottleAndFailures(
//         this.fcmTokens,
//         this.notificationData,
//       );
//     }
//     console.log('Notification cron job finished at', new Date());
//   }
// }


import { CronJob, cronJob } from '@loopback/cron';
import { inject } from '@loopback/core';
import { NotificationCron } from '../services/notificationCron.service';

@cronJob()
export class NotificationCronJob{
  private id: number;
  private fcmTokens: string[] = [];
  private notificationData: any = {};
  private isJobRunning = false;

  constructor(
    @inject('service.notificationcronjob.service')
    private notificationCron: NotificationCron,
  ) {}

  // Method to set the data and start the job
  setJobData(id: number, fcmTokens: string[], notificationData: any) {
    // Set the data for the job
    this.id = id;
    this.fcmTokens = fcmTokens;
    this.notificationData = notificationData;

    // Start the job
    this.runJob();
  }

  // Method to run the job
  async runJob() {
    // Prevent re-running if a job is already in progress
    if (this.isJobRunning) {
      console.log('A job is already running.');
      return;
    }

    console.log('Notification cron job started at', new Date());
    this.isJobRunning = true; // Set the flag to indicate the job is running

    // Send notifications in batches or individually
    while (this.fcmTokens.length > 0) {
      const token = this.fcmTokens.shift(); // Get the first token
      if (token) {
        // Send notification for this token
        await this.notificationCron.sendNotificationsWithThrottleAndFailures(
          this.id,
          [token],
          this.notificationData,
        );
      }
    }

    // Job complete
    this.isJobRunning = false;
    console.log('Notification cron job finished at', new Date());
  }
}
