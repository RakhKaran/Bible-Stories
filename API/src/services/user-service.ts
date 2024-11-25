import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {Users} from '../models';
import {Credentials, UsersRepository} from '../repositories/users.repository';
import {BcryptHasher} from './hash.password.bcrypt';

export class MyUserService implements UserService<Users, Credentials> {
  constructor(
    @repository(UsersRepository)
    public userRepository: UsersRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<Users> {
    const getUser = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!getUser) {
      throw new HttpErrors.BadRequest('Email not found');
    }

    if (!getUser.isActive) {
      throw new HttpErrors.BadRequest('User not active');
    }

    const passswordCheck = await this.hasher.comparePassword(
      credentials.password,
      getUser.password,
    );
    if (passswordCheck) {
      return getUser;
    }
    throw new HttpErrors.BadRequest('password doesnt match');
  }

  convertToUserProfile(user: Users): UserProfile {
    return {
      id: `${user.id}`,
      firstName: `${user.firstName}`,
      lastName: `${user.lastName}`,
      email: user.email,
      phoneNumber:user.phoneNumber,
      [securityId]: `${user.id}`,
      permissions: user.permissions,
    };
  }
}
