import { Context } from "@netlify/functions";
import { apiResponse } from "../../types";
import { MongoDBHandler } from "../../lib/mongodb";

interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  created_at: string;
  settings?: Record<string, any>;
}

export default async (request: Request, context: Context) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'netlify-api-app';
  const mongoHandler = new MongoDBHandler(mongoUri, dbName);

  try {
    await mongoHandler.connect();

    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // Get ID from URL path

    if (request.method === 'GET') {
      if (id && id !== 'users') {
        // Get specific user by ID
        const user = await mongoHandler.findOne('users', { id });
        if (!user) {
          const response: apiResponse<null> = {
            status: false,
            error: "User not found",
            metadata: {
              timestamp: new Date().toISOString(),
              requestUrl: request.url,
            },
          };
          return new Response(JSON.stringify(response), { status: 404 });
        }

        const response: apiResponse<User> = {
          status: true,
          data: user as User,
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
          },
        };
        return new Response(JSON.stringify(response));
      } else {
        // Get all users
        const users = await mongoHandler.find('users');
        const response: apiResponse<User[]> = {
          status: true,
          data: users as User[],
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
            total: users.length
          },
        };
        return new Response(JSON.stringify(response));
      }
    } else if (request.method === 'POST') {
      // Create new user
      const body = await request.json();
      const newUser: User = {
        id: Date.now().toString(),
        name: body.name,
        email: body.email,
        created_at: new Date().toISOString(),
        settings: body.settings || {}
      };
      const insertedId = await mongoHandler.insertOne('users', newUser);
      newUser._id = insertedId.toString();

      const response: apiResponse<User> = {
        status: true,
        data: newUser,
        metadata: {
          timestamp: new Date().toISOString(),
          requestUrl: request.url,
        },
      };
      return new Response(JSON.stringify(response), { status: 201 });
    } else if (request.method === 'PUT') {
      // Update user
      if (!id || id === 'users') {
        const response: apiResponse<null> = {
          status: false,
          error: "User ID required for update",
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
          },
        };
        return new Response(JSON.stringify(response), { status: 400 });
      }

      const body = await request.json();
      const updateCount = await mongoHandler.updateOne('users', { id }, { $set: body });
      if (updateCount === 0) {
        const response: apiResponse<null> = {
          status: false,
          error: "User not found",
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
          },
        };
        return new Response(JSON.stringify(response), { status: 404 });
      }

      const updatedUser = await mongoHandler.findOne('users', { id });
      const response: apiResponse<User> = {
        status: true,
        data: updatedUser as User,
        metadata: {
          timestamp: new Date().toISOString(),
          requestUrl: request.url,
        },
      };
      return new Response(JSON.stringify(response));
    } else if (request.method === 'DELETE') {
      // Delete user
      if (!id || id === 'users') {
        const response: apiResponse<null> = {
          status: false,
          error: "User ID required for deletion",
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
          },
        };
        return new Response(JSON.stringify(response), { status: 400 });
      }

      const deleteCount = await mongoHandler.deleteOne('users', { id });
      if (deleteCount === 0) {
        const response: apiResponse<null> = {
          status: false,
          error: "User not found",
          metadata: {
            timestamp: new Date().toISOString(),
            requestUrl: request.url,
          },
        };
        return new Response(JSON.stringify(response), { status: 404 });
      }

      const response: apiResponse<{ deletedCount: number }> = {
        status: true,
        data: { deletedCount: deleteCount },
        metadata: {
          timestamp: new Date().toISOString(),
          requestUrl: request.url,
        },
      };
      return new Response(JSON.stringify(response));
    }

    // Method not allowed
    const response: apiResponse<null> = {
      status: false,
      error: "Method not allowed",
      metadata: {
        timestamp: new Date().toISOString(),
        requestUrl: request.url,
        allowedMethods: ["GET", "POST", "PUT", "DELETE"]
      },
    };
    return new Response(JSON.stringify(response), { status: 405 });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
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
