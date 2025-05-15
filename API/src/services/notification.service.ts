import { injectable, BindingScope } from '@loopback/core';
import { GoogleAuth } from 'google-auth-library';
import axios, { AxiosInstance } from 'axios';
import path from 'path';

// Define the path to your service account JSON file
const serviceAccountPath = path.resolve(__dirname, '../../src/services/bibleStoriesFCM.json');

// FCMData interface
interface FCMData {
  [key: string]: string | number | boolean;
}

@injectable({ scope: BindingScope.TRANSIENT })
export class NotificationService {
  private accessToken: string | null = null;
  private accessTokenExpiry: number | null = null; // Store expiry timestamp
  private axiosInstance: AxiosInstance; // Axios instance with default configurations

  constructor() {
    // Initialize Axios instance with default headers
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Function to get the FCM access token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.accessTokenExpiry && Date.now() < this.accessTokenExpiry) {
      return this.accessToken; // Return existing token if it hasn't expired
    }

    try {
      const auth = new GoogleAuth({
        keyFile: serviceAccountPath, // Service account JSON file
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'], // Scope for FCM
      });

      const client = await auth.getClient(); // Get the authenticated client
      const accessToken = await client.getAccessToken(); // Generate the access token
      this.accessToken = accessToken.token as string;

      // Set token expiration (Google tokens generally expire after 1 hour)
      this.accessTokenExpiry = Date.now() + 3600000; // Expiry time is 1 hour from now

      return this.accessToken;
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  // Function to send FCM notifications in batches
  async sendFCMNotification(token: string, notificationData: {
    title: string;
    body: string;
    image?: string;
    optionalData?: { type: string; value: number | string };
  }) {
    const accessToken = await this.getAccessToken(); // Get the Bearer Token
    if (!accessToken) {
      console.error('No access token generated!');
      throw new Error('Access token not available');
    }

    const messageData = {
      message: {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          image: notificationData.image, // Optional: Image URL for notification
        },
        data: {
          type: notificationData.optionalData?.type || '',
          value: notificationData.optionalData?.value?.toString() || '',
        }, // Optional: Custom payload
        token, // Send message to a single token
      },
    };

    try {
      const response = await this.axiosInstance.post(
        'https://fcm.googleapis.com/v1/projects/bible-stories-vzdejw/messages:send', // FCM v1 endpoint
        messageData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`Notification sent successfully to ${token}:`, response);
      return { success: true, token };
    } catch (error) {
      console.error(`Failed to send notification to token ${token}:`, error.response ? error.response.data : error.message);
      return { success: false, token, error: error.response ? error.response.data : error.message };
    }
  }
}