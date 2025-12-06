import { Context } from "@netlify/functions";
import { apiResponse } from "../../types";
import { MongoDBHandler } from "../../lib/mongodb";
import winston from 'winston';

interface UserSettings {
  _id?: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  emailUpdates: boolean;
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'settings-function' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export default async (request: Request, context: Context) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'netlify-api-app';
  const mongoHandler = new MongoDBHandler(mongoUri, dbName);

  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(p => p);
  const userId = pathParts[pathParts.indexOf('settings') + 1]; // Get userId from path: /settings/{userId}

  logger.info(`Request received: ${request.method} ${request.url}`, { userId, userAgent: request.headers.get('user-agent') });

  try {
    await mongoHandler.connect();
    if (request.method === 'OPTIONS') {
      logger.debug('Handling CORS preflight request');
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method === 'GET') {
      logger.debug(`Getting settings for user: ${userId}`);
      // Get user settings - create default if not exists
      let settings = await mongoHandler.findOne('settings', { userId }) as UserSettings | null;
      if (!settings) {
        logger.info(`Creating default settings for new user: ${userId}`);
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

      logger.info(`Returning settings for user: ${userId}`, { 
        theme: settings.theme, 
        language: settings.language,
        fullSettings: settings 
      });

      const response: apiResponse<UserSettings> = {
        status: true,
        data: settings,
        metadata: {
          timestamp: new Date().toISOString(),
          requestUrl: request.url,
          userId: userId
        },
      };
      return new Response(JSON.stringify(response));

    } else if (request.method === 'POST') {
      logger.debug(`Creating settings for user: ${userId}`);
      // Create user settings
      const requestBody = await request.json();
      logger.info('Create settings request body', { body: requestBody, userId });

      if (!userId) {
        logger.warn('User ID required for POST');
        const response: apiResponse<null> = {
          status: false,
          error: "User ID required",
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
          },
        };
        return new Response(JSON.stringify(response), { status: 400 });
      }

      const existingSettings = await mongoHandler.findOne('settings', { userId });
      if (existingSettings) {
        logger.warn(`Settings already exist for user: ${userId}`);
        const response: apiResponse<null> = {
          status: false,
          error: "Settings already exist for this user",
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
            userId: userId
          },
        };
        return new Response(JSON.stringify(response), { status: 409 });
      }

      // Extract actual settings from nested body
      const body = requestBody.body || requestBody;
      
      // Only use valid settings fields for creation
      const validSettings: UserSettings = {
        userId,
        theme: body.theme || 'light',
        language: body.language || 'en',
        notifications: body.notifications !== undefined ? body.notifications : true,
        emailUpdates: body.emailUpdates !== undefined ? body.emailUpdates : false
      };
      
      // Create new settings
      await mongoHandler.insertOne('settings', validSettings);
      logger.info(`Created settings for user: ${userId}`, validSettings);

      const response: apiResponse<UserSettings> = {
        status: true,
        data: validSettings,
        metadata: {
          timestamp: new Date().toISOString(),
          requestUrl: request.url,
          userId: userId
        },
      };
      return new Response(JSON.stringify(response), { status: 201 });

    } else if (request.method === 'PUT') {
      logger.debug(`Updating settings for user: ${userId}`);
      // Update user settings
      const requestBody = await request.json();
      logger.info('Update settings request body', { body: requestBody, userId });

      if (!userId) {
        logger.warn('User ID required for PUT');
        const response: apiResponse<null> = {
          status: false,
          error: "User ID required",
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
          },
        };
        return new Response(JSON.stringify(response), { status: 400 });
      }

      // Extract actual settings from nested body
      const body = requestBody.body || requestBody;
      
      // Only update valid settings fields
      const validSettings = {
        theme: body.theme,
        language: body.language,
        notifications: body.notifications,
        emailUpdates: body.emailUpdates
      };
      
      // Update settings in MongoDB
      await mongoHandler.updateOne(
        'settings',
        { userId },
        { $set: validSettings }
      );
      
      // Fetch updated settings
      const updatedSettings = await mongoHandler.findOne('settings', { userId }) as UserSettings;
      logger.info(`Updated settings for user: ${userId}`, updatedSettings);

      const response: apiResponse<UserSettings> = {
        status: true,
        data: updatedSettings,
        metadata: {
          timestamp: new Date().toISOString(),
          requestUrl: request.url,
          userId: userId
        },
      };
      return new Response(JSON.stringify(response));

    } else if (request.method === 'DELETE') {
      logger.debug(`Deleting settings for user: ${userId}`);
      // Delete user settings
      if (!userId) {
        logger.warn('User ID required for DELETE');
        const response: apiResponse<null> = {
          status: false,
          error: "User ID required",
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
          },
        };
        return new Response(JSON.stringify(response), { status: 400 });
      }

      const existingSettings = await mongoHandler.findOne('settings', { userId });
      if (!existingSettings) {
        logger.warn(`Settings not found for user: ${userId}`);
        const response: apiResponse<null> = {
          status: false,
          error: "Settings not found for this user",
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
            userId: userId
          },
        };
        return new Response(JSON.stringify(response), { status: 404 });
      }

      await mongoHandler.deleteOne('settings', { userId });
      logger.info(`Deleted settings for user: ${userId}`);

      const response: apiResponse<{ deletedUserId: string }> = {
        status: true,
        data: { deletedUserId: userId },
        metadata: {
          timestamp: new Date().toISOString(),
          requestUrl: request.url,
          userId: userId
        },
      };
      return new Response(JSON.stringify(response));

    }

    // Method not allowed
    logger.warn(`Method not allowed: ${request.method}`, { userId });
    const response: apiResponse<null> = {
      status: false,
      error: "Method not allowed",
      metadata: {
        timestamp: new Date().toISOString(),
        requestUrl: request.url,
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
      },
    };
    return new Response(JSON.stringify(response), { status: 405 });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error in settings function', { error: message, userId, stack: error instanceof Error ? error.stack : undefined });
    const response: apiResponse<null> = {
      status: false,
      error: message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestUrl: request.url,
      },
    };
    return new Response(JSON.stringify(response), { status: 500 });
  } finally {
    await mongoHandler.disconnect();
  }
};
