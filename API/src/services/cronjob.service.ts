import {CronJob, cronJob} from '@loopback/cron';

@cronJob()
export class SyncProductCron extends CronJob {
  constructor() {
    super({
      cronTime: '0 12 * * *',
      onTick: () => {
        this.runJob();
      },
    });
  }

  runJob() {
    console.log('Cron job is running at', new Date());
  }
}
