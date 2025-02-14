import { BindingScope, inject, injectable } from "@loopback/core";
import { repository } from "@loopback/repository";
import { UserAnalyticsRepository, UsersRepository } from "../repositories";
import { BibleStoriesDataSource } from "../datasources";

@injectable({ scope: BindingScope.TRANSIENT })
export class UserAnalyticsService {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(UserAnalyticsRepository)
    public userAnalyticsRepository : UserAnalyticsRepository,
    @repository(UsersRepository)
    public usersRepository: UsersRepository
  ) {}

  async userAnalyticsUpdate(userId: number): Promise<{ success: boolean, message: string }> {
    try {
      // Fetch the user by ID
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        console.log('User with user id not found');
        return {
          success: false,
          message: 'No user found with the given id'
        };
      }

      // Find existing user analytics
      const userAnalytics = await this.userAnalyticsRepository.findOne({
        where: { usersId: user.id }
      });

      const date = new Date();
      const month = date.getMonth() + 1; // Get current month (1-12)
      const year = date.getFullYear();  // Get current year

      if (!userAnalytics) {
        // If no analytics exist, create a new analytics record
        const newUserAnalytics = {
          usersId: user.id,
          analytics: [{ year, month, count: 1 }], // First visit in the month
          monthlyUserStatus: [{ year, month, isReturningUser: false }], // New user for the month
        };

        await this.userAnalyticsRepository.create(newUserAnalytics);
        return {
          success: true,
          message: 'User analytics created successfully.'
        };
      }

      // If analytics exist, check if the current month and year are already in the analytics
      const existingMonthData = userAnalytics.analytics.find(
        (data) => data.year === year && data.month === month
      );

      
      const previousMonth = month === 1 ? 12 : month - 1; // Handle December (0) -> January (11)
      const previousYear = month === 1 ? year - 1 : year; // Handle December to previous year

      const existingUserStatus = userAnalytics.monthlyUserStatus.find(
        (status) => status.year === previousYear && status.month === previousMonth
      );

      if (existingMonthData) {
        // If the month data exists, update the visit count
        existingMonthData.count += 1; // Increment the visit count for the current month

        // Mark as returning user if the status was not set already
        if(existingUserStatus){
            if (!existingUserStatus.isReturningUser) {
                existingUserStatus.isReturningUser = true; // Update status to returning user
            }
        }
        await this.userAnalyticsRepository.updateById(userAnalytics.id, userAnalytics);

        return {
          success: true,
          message: 'User analytics updated successfully.'
        };
      } else {
        // If the month data doesn't exist, add a new entry for the current month
        userAnalytics.analytics.push({
          year,
          month,
          count: 1, // First visit in the month
        });

        userAnalytics.monthlyUserStatus.push({
          year,
          month,
          isReturningUser: false, // New user for this month
        });

        await this.userAnalyticsRepository.updateById(userAnalytics.id, userAnalytics);

        return {
          success: true,
          message: 'New month added to user analytics.'
        };
      }
    } catch (error) {
      console.log('Error while updating user analytics', error);
      return {
        success: false,
        message: 'Error while updating user analytics.'
      };
    }
  }

  async getUserLastLogin(userId: number): Promise<{ success: boolean, message: string, loginDate: string }> {
    try {
      const userAnalytics = await this.userAnalyticsRepository.findOne({
        where: { usersId: userId }
      });
  
      return {
        success: true,
        message: 'User\'s Last Login',
        loginDate: userAnalytics?.updatedAt?.toString() || ''
      };
    } catch (error) {
      console.log("Error while fetching last login: ", error);
      return {
        success: false,
        message: 'Error fetching last login',
        loginDate: ''
      };
    }
  }
}
