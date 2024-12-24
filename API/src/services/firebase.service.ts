import { HttpErrors } from '@loopback/rest';
import * as admin from 'firebase-admin';

export class FirebaseAdmin {
  private firebaseApp: admin.app.App;

  constructor() {
    // Check if a Firebase app is already initialized
    if (!admin.apps.length) {
      this.firebaseApp = admin.initializeApp();
    } else {
      this.firebaseApp = admin.app(); // Use existing app instance
    }
  }

  async verifyCustomer(token: string): Promise<{ message: string; phoneNumber: string }> {
    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(token);
      const { phone_number } = decodedToken;

      if (phone_number) {
        return {
          message: 'User phone number',
          phoneNumber: phone_number,
        };
      }

      throw new HttpErrors.BadRequest('Invalid Token');
    } catch (error) {
      throw error;
    }
  }
}
