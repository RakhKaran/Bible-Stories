import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService {
  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.NotFound(
        'Error while generating token: UserProfile is null',
      );
    }

    let token = '';
    try {
      token = await signAsync(userProfile, 'mushroom', {
        expiresIn: '1y', // 100 years
      });
    } catch (err) {
      throw new HttpErrors.Unauthorized(`Error generating token: ${err}`);
    }

    return token;
  }

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        "Error verifying token: 'token is null'",
      );
    }

    let userProfile: UserProfile;
    try {
      const decryptedToken = await verifyAsync(token, 'mushroom');
      userProfile = Object.assign(
        {id: '', name: '', [securityId]: '', permissions: ''},
        {
          id: decryptedToken.id,
          name: decryptedToken.name,
          [securityId]: decryptedToken.id,
          permissions: decryptedToken.permissions,
        },
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token: ${error.message}`,
      );
    }

    return userProfile;
  }
}
