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

  // Function to split an array into chunks
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  // Function to send FCM notifications in batches
  async sendFCMNotification({
    clientTokens,
    title,
    body,
    image,
    data,
  }: {
    clientTokens: string[]; // Multiple client device FCM tokens
    title: string;
    body: string;
    image?: string; // Optional image URL
    data?: FCMData; // Optional additional data
  }): Promise<any> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      console.error('No access token generated!');
      throw new Error('Access token not available');
    }

    // Break clientTokens into batches of 500 (FCM limit)
    const tokenBatches = this.chunkArray(clientTokens, 500);

    // Loop through each batch and send notifications
    const batchPromises = tokenBatches.map(async (tokens) => {
      const batchMessageData = {
        message: {
          notification: {
            title,
            body,
            image,
          },
          tokens, // Send to multiple tokens in one batch
          data, // Optional additional data
        },
      };

      try {
        const response = await this.axiosInstance.post(
          'https://fcm.googleapis.com/v1/projects/biblestories-733b5/messages:send',
          batchMessageData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Dynamic access token
            },
          }
        );
        console.log(`Batch notification sent successfully:`, response.data);
        return response.data;
      } catch (error) {
        console.error(
          `Error sending batch notification:`,
          error.response ? error.response.data : error.message
        );
        throw error;
      }
    });

    // Wait for all batches to be processed
    try {
      const results = await Promise.all(batchPromises);
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      throw new Error('Error sending batch notifications');
    }
  }
}
