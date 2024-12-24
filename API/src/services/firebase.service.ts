import { HttpErrors } from '@loopback/rest';
import * as admin from 'firebase-admin';

export class FirebaseAdmin {
  constructor() {
    admin.initializeApp();
  }

  async sendOtp(phoneNumber: string): Promise<string> {
    // Send OTP via Firebase
    const otpId = await admin.auth().createCustomToken(phoneNumber);
    return otpId;
  }

//   async verifyOtp(phoneNumber: string, otp: string, otpId: string): Promise<boolean> {
//     try {
//         // Create PhoneAuth credential using the verification ID (otpId) and OTP
//         const credential = admin.auth.PhoneAuthProvider.credential(otpId, otp);

//         // Verify the OTP and sign in the user
//         const userCredential = await admin.auth().signInWithCredential(credential);

//         // Optionally, you can check the user info and any other details you need
//         const user = userCredential.user;

//         // If the user is authenticated, return true (OTP verified)
//         if (user) {
//         return true;
//         } else {
//         // If no user is found, return false (OTP not verified)
//         return false;
//         }
//     } catch (error) {
//         console.error('Error during OTP verification:', error);
//         // Return false if verification fails
//         return false;
//     }
//     }

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
