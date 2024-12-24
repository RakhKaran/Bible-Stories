import { HttpErrors } from '@loopback/rest';
import * as admin from 'firebase-admin';

export class FirebaseAdmin {
  constructor() {
    admin.initializeApp();
  }
  
  async verifyCustomer(token : string):Promise<{message : string, phoneNumber: string}>{
    try{
      const decodeToken = await admin.auth().verifyIdToken(token);
      const { phone_number } = decodeToken;

      if(phone_number){
        return{
          message : 'user phone number',
          phoneNumber : phone_number
        }
      }

      throw new HttpErrors.BadRequest('Invalid Token');
    }catch(error){
      throw error;
    }
  }
}
