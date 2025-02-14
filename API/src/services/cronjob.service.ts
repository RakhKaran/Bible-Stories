import { CronJob, cronJob } from '@loopback/cron';
import { inject } from '@loopback/core';
import { NotificationCron } from '../services/notificationCron.service';
import { AudioHistoryRepository } from '../repositories';
import { repository } from '@loopback/repository';

export class DailyNotificationCronJob extends CronJob {
  constructor(
    @repository(AudioHistoryRepository)
    private audioHistoryRepository: AudioHistoryRepository,
  ) {
    super({
      cronTime: '0 0 * * *',
      onTick: async () => {
        console.log('Running daily notification job');
        await this.audioHistoryRepository.updateAll({ dailyCumulativeListeningDuration: 0 });
      },
      start: true,
    });
  }
}

export class WeeklyNotificationCronJob extends CronJob {
  constructor(
    @repository(AudioHistoryRepository)
    private audioHistoryRepository: AudioHistoryRepository,
  ) {
    super({
      cronTime: '0 0 * * 0',
      onTick: async () => {
        console.log('Running weekly notification job');
        await this.audioHistoryRepository.updateAll({ weeklyCumulativeListeningDuration: 0 });
      },
      start: true,
    });
  }
}

export class MonthlyNotificationCronJob extends CronJob {
  constructor(
    @repository(AudioHistoryRepository)
    private audioHistoryRepository: AudioHistoryRepository,
  ) {
    super({
      cronTime: '0 0 1 * *',
      onTick: async () => {
        console.log('Running monthly notification job');
        await this.audioHistoryRepository.updateAll({ monthlyCumulativeListeningDuration: 0 });
      },
      start: true,
    });
  }
}


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
