import { Context } from "@netlify/functions";
import { apiWrapper } from "../../lib/api-wrapper.mts";
import { MongoDBHandler } from "../../lib/mongodb";

interface UserSettings {
  _id?: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  emailUpdates: boolean;
}

/**
 * Business logic handler for settings endpoint
 */
async function settingsHandler(request: Request, context: Context): Promise<UserSettings | { deletedUserId: string } | null> {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'netlify-api-app';
  const mongoHandler = new MongoDBHandler(mongoUri, dbName);

  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(p => p);
  const userId = pathParts[pathParts.indexOf('settings') + 1];

  await mongoHandler.connect();

  try {
    if (request.method === 'GET') {
      // Get user settings - create default if not exists
      let settings = await mongoHandler.findOne('settings', { userId }) as UserSettings | null;
      if (!settings) {
        // Create default settings
        const defaultSettings = {
          userId: userId,
          theme: 'light' as const,
          language: 'en',
          notifications: true,
          emailUpdates: false
        };
        await mongoHandler.insertOne('settings', defaultSettings);
        settings = defaultSettings;
      }
      return settings;

    } else if (request.method === 'POST') {
      // Create user settings
      const requestBody = await request.json();
      const body = requestBody.body || requestBody;
      
      if (!userId) {
        throw new Error("User ID required");
      }

      const existingSettings = await mongoHandler.findOne('settings', { userId });
      if (existingSettings) {
        throw new Error("Settings already exist for this user");
      }

      const validSettings: UserSettings = {
        userId,
        theme: body.theme || 'light',
        language: body.language || 'en',
        notifications: body.notifications !== undefined ? body.notifications : true,
        emailUpdates: body.emailUpdates !== undefined ? body.emailUpdates : false
      };
      
      await mongoHandler.insertOne('settings', validSettings);
      return validSettings;

    } else if (request.method === 'PUT') {
      // Update user settings
      const requestBody = await request.json();
      const body = requestBody.body || requestBody;
      
      if (!userId) {
        throw new Error("User ID required");
      }

      const validSettings = {
        theme: body.theme,
        language: body.language,
        notifications: body.notifications,
        emailUpdates: body.emailUpdates
      };
      
      await mongoHandler.updateOne(
        'settings',
        { userId },
        { $set: validSettings }
      );
      
      const updatedSettings = await mongoHandler.findOne('settings', { userId }) as UserSettings;
      return updatedSettings;

    } else if (request.method === 'DELETE') {
      // Delete user settings
      if (!userId) {
        throw new Error("User ID required");
      }

      const existingSettings = await mongoHandler.findOne('settings', { userId });
      if (!existingSettings) {
        throw new Error("Settings not found for this user");
      }

      await mongoHandler.deleteOne('settings', { userId });
      return { deletedUserId: userId };
    }

    throw new Error(`Method ${request.method} not allowed`);
  } finally {
    await mongoHandler.disconnect();
  }
}

/**
 * Settings function wrapped with apiWrapper
 * Provides caching, rate limiting, retry logic, and MongoDB integration
 */
export default async (request: Request, context: Context) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Extract userId from URL for metadata
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(p => p);
  const userId = pathParts[pathParts.indexOf('settings') + 1];

  return apiWrapper.handleRequest(
    request,
    context,
    settingsHandler,
    {
      metadata: {
        endpoint: 'settings',
        service: 'user-settings',
        userId: userId
      },
      skipCache: request.method !== 'GET', // Don't cache write operations
      skipRetry: request.method !== 'GET', // Don't retry mutations due to body consumption
      cacheKey: `settings:${userId}:${request.method}` // Cache per user and method
    }
  );
};
