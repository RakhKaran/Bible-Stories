import { DefaultTransactionalRepository, IsolationLevel, repository } from '@loopback/repository';
import { CommentsRepository, DownloadStoriesRepository, LastLoginRepository, LikedStoriesRepository, UsersRepository } from '../repositories';
import { del, get, getJsonSchemaRef, getModelSchemaRef, HttpErrors, param, patch, post, requestBody } from '@loopback/rest';
import { Users } from '../models';
import { BibleStoriesDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { validateCredentialsForPhoneLogin } from '../services/validator';
import { BcryptHasher } from '../services/hash.password.bcrypt';
import { JWTService } from '../services/jwt-service';
import _ from 'lodash';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { UserProfile } from '@loopback/security';
import { MyUserService } from '../services/user-service';
import { PermissionKeys } from '../authorization/permission-keys';
import SITE_SETTINGS from '../utils/config';
import { EmailManagerBindings } from '../keys';
import { EmailManager } from '../services/email.service';
import AdminForgotPasswordEmailTemplate from '../templates/adminForgetPassword.template';
import { FirebaseAdmin } from '../services/firebase.service';
import { CurrentUser } from '../types';
import { UserAnalyticsService } from '../services/user-analytics.service';

// ----------------------------------------------------------------------------
export class UsersController {
  private passwordHasher: BcryptHasher;

  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @inject('service.user.service')
    public userService: MyUserService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
    @inject('service.user-analytics.service')
    public userAnalyticsService: UserAnalyticsService,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
    @inject('service.firebase-admin')
    public firebaseAdmin: FirebaseAdmin,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
    @repository(LikedStoriesRepository)
    public likedStoriesRepository: LikedStoriesRepository,
    @repository(DownloadStoriesRepository)
    public downloadStoriesRepository: DownloadStoriesRepository,
    @repository(CommentsRepository)
    public commentsRepository: CommentsRepository,
    @repository(LastLoginRepository)
    public lastLoginRepo: LastLoginRepository,
  ) {
    this.passwordHasher = new BcryptHasher();
  }

  // Me call to check which user is logged in.
  @get('/auth/me')
  @authenticate('jwt')
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
  ): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: {
        id: currentUser.id,
      },
    });

    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }

    const userData = _.omit(user, 'password');
    return {
      ...userData,
      displayName: `${userData.firstName} ${userData.lastName}`,
    };
  }

  // registration api's
  // User registration API...
  @post('/auth/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(Users),
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            exclude: ['id'],
          }),
        },
      },
    })
    userData: Omit<Users, 'id'>,
  ) {
    const repo = new DefaultTransactionalRepository(Users, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      // Check if the user already exists based on phone number
      const existingUser = await this.usersRepository.findOne({
        where: {
          or: [
            { phoneNumber: userData.phoneNumber },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.isUserDeleted) {
          // Update the existing user with the new data
          const updatedData = {
            ...existingUser, // Retain existing properties
            ...userData, // Override with new data
            isUserDeleted: false, // Mark as active
            isAllowingAutoplay: true,
            isAllowingPushNotifications: true
          };

          // Hash the password if provided
          if (userData.password) {
            updatedData.password = await this.passwordHasher.hashPassword(userData.password);
          }

          // Update the user in the database
          const updatedUser = await this.usersRepository.updateById(existingUser.id, updatedData, {
            transaction: tx,
          });

          // Commit the transaction
          await tx.commit();

          return {
            success: true,
            userData: updatedData,
            message: 'User reactivated and updated successfully',
          };
        } else {
          throw new HttpErrors.BadRequest('User already exists');
        }
      }

      // Validate phone number credentials
      validateCredentialsForPhoneLogin(userData.phoneNumber);

      // Hash the password if provided
      let hashedPassword: string | undefined;
      if (userData.password) {
        hashedPassword = await this.passwordHasher.hashPassword(userData.password);
      }

      // Create a new user
      const userInfo = { ...userData, password: hashedPassword };
      const savedUser = await this.usersRepository.create({
        ...userInfo,
        isAllowingAutoplay: true,
        isAllowingPushNotifications: true
      }, {
        transaction: tx,
      });

      // Commit the transaction
      await tx.commit();

      // Return response
      return {
        success: true,
        userData: savedUser,
        message: 'User registered successfully',
      };
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  // admin authentication api's

  // Admin login authentication API using email and password.
  @post('/auth/admin-login')
  async adminLogin(
    @requestBody({
      description: 'Login with email for admin',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string', description: 'Admin Email Id' },
              password: { type: 'string', description: 'Admin password' },
            },
          },
        },
      },
    })
    requestBody: { email: string; password: string },
  ): Promise<any> {
    try {
      const { email, password } = requestBody;

      // Find user by email
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpErrors.BadRequest('Email does not exist');
      }

      // Check if the user is active
      if (!user.isActive) {
        throw new HttpErrors.BadRequest('User is not active');
      }

      // Compare password
      const passwordMatch = await this.passwordHasher.comparePassword(password, user.password);
      if (passwordMatch) {
        // Generate JWT token and return user data
        const userProfile = this.userService.convertToUserProfile(user);
        const userData = _.omit(userProfile, 'password'); // Omit the password field
        const token = await this.jwtService.generateToken(userProfile);
        await this.lastLoginRepo.create({
          usersId: user.id,
        });
        return {
          success: true,
          accessToken: token,
          userData,
          message: 'User is successfully logged in.',
        };
      } else {
        throw new HttpErrors.BadRequest('Invalid credentials');
      }
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) {
        // If the error is a known HttpError, return it as is
        throw error;
      } else {
        // Otherwise, throw an internal server error
        console.error('Unexpected error during login:', error); // Log the unexpected error
        throw new HttpErrors.InternalServerError('An error occurred during login');
      }
    }
  }

  // update admin password
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN] }
  })
  @patch('/update-password')
  async updatePassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              userId: {
                type: 'number',
              },
              oldPassword: {
                type: 'string',
                description: 'Old Password is required'
              },
              newPassword: {
                type: 'string',
                description: 'New password to change'
              }
            }
          }
        }
      }
    })
    requestBody: {
      userId: number;
      oldPassword: string;
      newPassword: string;
    }
  ): Promise<object> {
    try {
      const { userId, oldPassword, newPassword } = requestBody;
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        throw new HttpErrors.BadRequest('User for given id not found');
      }

      const password = user.password;

      const isOldPasswordValid = await this.passwordHasher.comparePassword(oldPassword, password);

      if (isOldPasswordValid) {
        const newHashedPassword = await this.passwordHasher.hashPassword(newPassword);

        await this.usersRepository.updateById(user.id, { password: newHashedPassword });

        return {
          success: true,
          message: 'Password Updated',
        }
      } else {
        return {
          success: false,
          message: 'Password not matched'
        }
      }

    } catch (error) {
      throw error;
    }
  }

  // forget admin password
  @post('/forget-password')
  async forgetPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              email: {
                type: 'string',
                description: 'email to reset password for user'
              }
            }
          }
        }
      }
    })
    requestBody: {
      email: string;
    }
  ): Promise<object> {
    try {
      const { email } = requestBody;
      const user = await this.usersRepository.findOne({
        where: {
          email: email
        }
      });

      if (!user) {
        throw new HttpErrors.BadRequest("User don't exist");
      }

      const otp = Math.floor(100000 + Math.random() * 900000);

      const data = {
        adminName: `${user.firstName} ${user.lastName}`, // Assuming the user object has a name field
        email: user.email,
        otp: otp.toString(), // OTP is passed as string
      }

      const template = AdminForgotPasswordEmailTemplate(data);

      await this.usersRepository.updateById(user.id,
        {
          otp: data.otp,
          otpExpireAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }
      );

      const mailOptions = {
        from: SITE_SETTINGS.fromMail,
        to: data.email,
        subject: 'Reset Password',
        html: template.html,
      };
      await this.emailManager
        .sendMail(mailOptions)
        .then((res: any) => {
          return {
            success: true,
            message: `OTP send successfully `,
          };
        })
        .catch((err: any) => {
          console.log(err);
          throw new HttpErrors.UnprocessableEntity(err);
        });

      return {
        success: true,
        message: "Otp send successfully"
      }
    } catch (error) {
      throw error;
    }
  }

  // opt-match for forget password
  @post('/reset-password')
  async resetPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              email: {
                type: 'string',
                description: 'email to identify user'
              },
              otp: {
                type: 'string',
                description: 'to verify user'
              }
            }
          }
        }
      }
    })
    requestBody: {
      email: string;
      otp: string;
    }
  ): Promise<Object> {
    try {
      const { email, otp } = requestBody;

      const userData = await this.usersRepository.findOne({
        where: {
          email: email
        }
      });

      if (!userData) {
        throw new HttpErrors.BadRequest("User not found");
      }

      const currentTime = new Date();

      if (currentTime <= new Date(userData.otpExpireAt)) {
        if (userData.otp === otp) {
          return {
            success: 'true',
            message: 'User is authenticated'
          }
        } else {
          return {
            success: 'false',
            message: 'Invalid otp'
          }
        }
      } else {
        return {
          success: false,
          message: 'otp expired'
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // update new password
  @patch('/update-new-password')
  async updateNewPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              email: {
                type: 'string',
                description: 'email of user'
              },
              password: {
                type: 'string',
                description: 'new password'
              }
            }
          }
        }
      }
    })
    requestBody: {
      email: string;
      password: string;
    }
  ): Promise<object> {
    try {
      const { email, password } = requestBody;

      const userData = await this.usersRepository.findOne({
        where: {
          email: email
        }
      });

      if (!userData) {
        throw new HttpErrors.BadRequest('User not found');
      }

      const hashedPassword = await this.passwordHasher.hashPassword(password);

      await this.usersRepository.updateById(userData.id, { password: hashedPassword, otp: undefined, otpExpireAt: undefined });

      return {
        success: true,
        message: 'Password Updated'
      }
    } catch (error) {
      throw error;
    }
  }

  // customer authentication api's

  // customer login authentication API using phone number and password.
  @post('/auth/customer-login')
  async customerLogin(
    @requestBody({
      description: 'Login with phone number for customer',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              phoneNumber: { type: 'string', description: 'Customer Login' },
              password: { type: 'string', description: 'Customer password' },
            },
          },
        },
      },
    })
    requestBody: { phoneNumber: string; password: string },
  ): Promise<any> {
    try {
      const { phoneNumber, password } = requestBody;

      // Find user by email
      const user = await this.usersRepository.findOne({ where: { phoneNumber } });
      if (!user) {
        throw new HttpErrors.BadRequest('Phone number does not exist');
      }

      // Check if the user is active
      if (!user.isActive) {
        throw new HttpErrors.BadRequest('User is not active');
      }

      // Compare password
      const passwordMatch = await this.passwordHasher.comparePassword(password, user.password);
      if (passwordMatch) {
        // Generate JWT token and return user data
        const userProfile = this.userService.convertToUserProfile(user);
        const userData = _.omit(userProfile, 'password'); // Omit the password field
        const token = await this.jwtService.generateToken(userProfile);
        return {
          success: true,
          accessToken: token,
          userData,
          message: 'User is successfully logged in.',
        };
      } else {
        throw new HttpErrors.BadRequest('Invalid credentials');
      }
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) {
        // If the error is a known HttpError, return it as is
        throw error;
      } else {
        // Otherwise, throw an internal server error
        console.error('Unexpected error during login:', error); // Log the unexpected error
        throw new HttpErrors.InternalServerError('An error occurred during login');
      }
    }
  }

  // Verify OTP and Generate Token
  @post('/auth/verify-customer', {
    responses: {
      '200': {
        description: 'Customer Verification',
      },
    },
  })
  async verifyCustomer(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: { type: 'string', description: 'firebase returned token' },
            },
            required: ['token'],
          },
        },
      },
    })
    body: { token: string },
  ) {
    const { token } = body;

    const firebaseResponse = await this.firebaseAdmin.verifyCustomer(token);

    if (!firebaseResponse) {
      throw new HttpErrors.BadRequest('Invalid token id');
    }
    // Step 2: Find the user in the database
    const user = await this.usersRepository.findOne({ where: { phoneNumber: firebaseResponse.phoneNumber } });

    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }

    // Step 3: Generate JWT Token
    const userProfile = this.userService.convertToUserProfile(user);
    const jwtToken = await this.jwtService.generateToken(userProfile);

    // Step 4: Return user profile and token
    return {
      success: true,
      accessToken: jwtToken,
      userData: _.omit(user, 'password'),
      message: 'User successfully logged in',
    };
  }

  // update new password
  @patch('/customer/update-new-password')
  async customerUpdateNewPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              phoneNumber: {
                type: 'string',
                description: 'phone number of user'
              },
              password: {
                type: 'string',
                description: 'new password'
              }
            }
          }
        }
      }
    })
    requestBody: {
      phoneNumber: string;
      password: string;
    }
  ): Promise<object> {
    try {
      const { phoneNumber, password } = requestBody;

      const userData = await this.usersRepository.findOne({
        where: {
          phoneNumber: phoneNumber
        }
      });

      if (!userData) {
        throw new HttpErrors.BadRequest('User not found');
      }

      const hashedPassword = await this.passwordHasher.hashPassword(password);

      await this.usersRepository.updateById(userData.id, { password: hashedPassword, otp: undefined, otpExpireAt: undefined });

      return {
        success: true,
        message: 'Password Updated'
      }
    } catch (error) {
      throw error;
    }
  }

  // users api's

  // update user profile
  @patch('/update-profile/{userId}')
  async updateProfile(
    @param.path.number('userId') userId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            exclude: ['id'],
          }),
        },
      }
    })
    userData: Omit<Users, 'id'>
  ): Promise<object> {
    try {
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        throw new HttpErrors.BadRequest(`User with id ${userId} dont exist`);
      }

      await this.usersRepository.updateById(user.id, userData);

      return {
        success: true,
        message: 'User Updated'
      }
    } catch (error) {
      throw error;
    }
  }

  // update-user-profile
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN] },
  })
  @patch('/update-user-profile')
  async updateUserProfile(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              firstName: {
                type: 'string',
                description: 'Users first name'
              },
              avatar: {
                type: 'object',
                description: 'Users profile Image'
              }
            }
          }
        }
      }
    })
    requestBody: {
      firstName: string;
      avatar: {
        fileUrl: string;
      }
    },
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: CurrentUser,
  ): Promise<{ success: boolean, message: string }> {
    try {
      const { firstName, avatar } = requestBody;

      let updateData: any = {};

      if (firstName) {
        updateData.firstName = firstName;
      }

      if (avatar) {
        updateData.avatar = avatar;
      }

      await this.usersRepository.updateById(Number(currentUser.id), updateData);

      return {
        success: true,
        message: 'Profile updated'
      }
    } catch (error) {
      throw error;
    }
  }

  // get user by id
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN] },
  })
  @get('/users/{userId}')
  async fetchUserById(
    @param.path.number('userId') userId: number,
  ): Promise<Object> {
    try {
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        throw new HttpErrors.BadRequest(`User with id ${userId} dont exist`);
      }

      if (user && !user.isActive) {
        throw new HttpErrors.BadRequest('User is not active');
      }

      return {
        success: true,
        message: "User Data",
        data: user
      }
    } catch (error) {
      throw error;
    }
  }

  // fetch users
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN] },
  })
  @get('/users')
  async fetchUsers(): Promise<object> {
    try {
      const users = await this.usersRepository.find({ include: ['lastLogins'] });

      if (users.length <= 0) {
        return {
          success: false,
          message: 'No users data found'
        };
      }
      return {
        success: true,
        message: 'Users Data',
        data: users
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        message: 'Error fetching user data'
      };
    }
  }

  // setting app language
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN, PermissionKeys.LISTENER] },
  })
  @post('/users/set-lang')
  async setAppLanguage(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              appLanguage: {
                type: 'string',
                description: 'app language for app'
              },
              audioLanguage: {
                type: 'number',
                description: 'Users Preffered audio language'
              }
            }
          }
        }
      }
    })
    requestBody: {
      appLanguage: string;
      audioLanguage: number;
    }
  ): Promise<{ success: boolean, message: string }> {
    try {
      const { appLanguage, audioLanguage } = requestBody;
      const userData = await this.usersRepository.findById(currentUser.id);

      if (!userData) {
        throw new HttpErrors.BadRequest('User not found');
      }

      await this.usersRepository.updateById(currentUser.id, {
        appLanguage: appLanguage ? appLanguage : userData.appLanguage,
        audioLanguage: audioLanguage ? audioLanguage : userData.audioLanguage
      });

      return {
        success: true,
        message: 'Language set successfully',
      }
    } catch (error) {
      throw error;
    }
  }

  // push notification toggle api
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN, PermissionKeys.LISTENER] },
  })
  @post('/users/set-push-notification')
  async setPushNotifications(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              pushNotification: {
                type: 'boolean',
                description: 'push notification for app'
              },
            }
          }
        }
      }
    })
    requestBody: {
      pushNotification: boolean;
    }
  ): Promise<{ success: boolean, message: string }> {
    try {
      const { pushNotification } = requestBody;
      const userData = await this.usersRepository.findById(currentUser.id);

      if (!userData) {
        throw new HttpErrors.BadRequest('User not found');
      }

      await this.usersRepository.updateById(currentUser.id, {
        isAllowingPushNotifications: (pushNotification !== null || pushNotification !== undefined) ? pushNotification : userData.isAllowingPushNotifications,
      });

      return {
        success: true,
        message: 'Push Notification set successfully',
      }
    } catch (error) {
      throw error;
    }
  }

  // Autoplay toggle api
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN, PermissionKeys.LISTENER] },
  })
  @post('/users/set-autoplay')
  async setAutoplay(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              autoplay: {
                type: 'boolean',
                description: 'autoplay for app'
              },
            }
          }
        }
      }
    })
    requestBody: {
      autoplay: boolean;
    }
  ): Promise<{ success: boolean, message: string }> {
    try {
      const { autoplay } = requestBody;
      const userData = await this.usersRepository.findById(currentUser.id);

      if (!userData) {
        throw new HttpErrors.BadRequest('User not found');
      }

      await this.usersRepository.updateById(currentUser.id, {
        isAllowingAutoplay: (autoplay !== null || autoplay !== undefined) ? autoplay : userData.isAllowingAutoplay,
      });

      return {
        success: true,
        message: 'Autoplay set successfully',
      }
    } catch (error) {
      throw error;
    }
  }

  // Setting FCMToken...
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN, PermissionKeys.LISTENER] },
  })
  @post('/users/set-fcmToken')
  async setUsersFcmToken(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              fcmToken: {
                type: 'string',
                description: 'FCM Token For sending notifications'
              }
            }
          }
        }
      }
    })
    requestBody: {
      fcmToken: string;
    }
  ): Promise<{ success: boolean, message: string }> {
    try {
      const { fcmToken } = requestBody;

      const user = await this.usersRepository.findById(currentUser.id);

      if (!user) {
        throw new HttpErrors.BadRequest('User not found');
      }

      await this.usersRepository.updateById(user.id, { fcmToken: fcmToken });

      return {
        success: true,
        message: "FCM token set successfully"
      }
    } catch (error) {
      throw error;
    }
  }

  // delete user...
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN, PermissionKeys.LISTENER] },
  })
  @del('/delete-user')
  async deleteUser(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find the user
      const user = await this.usersRepository.findById(currentUser.id);

      if (!user) {
        throw new HttpErrors.BadRequest('User does not exist');
      }

      if (user.isUserDeleted) {
        throw new HttpErrors.BadRequest('User is already deleted');
      }

      // Mark user as deleted
      await this.usersRepository.updateById(user.id,
        {
          isUserDeleted: true,
          lastName: undefined,
          appLanguage: undefined,
          audioLanguage: undefined,
          isAllowingAutoplay: false,
          isAllowingPushNotifications: false,
        }
      );

      // Delete related liked stories
      await this.likedStoriesRepository.deleteAll({ usersId: user.id });

      // Delete related downloaded stories
      await this.downloadStoriesRepository.deleteAll({ usersId: user.id });

      // Find and delete all comments and their replies recursively
      const deleteCommentsRecursive = async (commentIds: number[]): Promise<void> => {
        for (const commentId of commentIds) {
          // Find replies to the current comment
          const replies: any = await this.commentsRepository.find({
            where: { repliedCommentId: commentId },
          });

          if (replies.length > 0) {
            // Recursively delete replies
            await deleteCommentsRecursive(replies.map((reply: any) => reply.id));
          }

          // Delete the current comment
          await this.commentsRepository.deleteById(commentId);
        }
      };

      // Start by deleting all root comments of the user
      const userComments = await this.commentsRepository.find({ where: { usersId: user.id } });
      const userCommentIds: any = userComments.length > 0 ? userComments.map((comment) => comment.id) : [];

      if (userCommentIds.length > 0) {
        await deleteCommentsRecursive(userCommentIds);
      }

      // Optionally, delete user's own comments as well
      await this.commentsRepository.deleteAll({ usersId: user.id });

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }


  @authenticate({
    strategy: 'jwt',
  })
  @post('/users/user-session')
  async storeSession(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ipAddress: { type: 'string' },
              deviceInfo: { type: 'string' },
            },
          },
        },
      },
    })
    sessionData: { ipAddress?: string; deviceInfo?: string },
  ): Promise<any> {
    const userId = currentUser.id;

    const lastLoginDetails = await this.lastLoginRepo.create({
      usersId: userId,
      ip_address: sessionData?.ipAddress ?? undefined,
      device_info: sessionData?.deviceInfo ?? undefined,
    });

    return {
      success: true,
      message: 'Session stored successfully',
      data: lastLoginDetails,
    };
  }
}
