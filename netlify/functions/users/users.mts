import { Context } from "@netlify/functions";
import { apiWrapper, ApiError } from "../../lib/api-wrapper.mts";
import { MongoDBHandler } from "../../lib/mongodb";

interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  created_at: string;
  settings?: Record<string, any>;
}

interface UsersResponse {
  users?: User[];
  user?: User;
  deletedCount?: number;
}

/**
 * Business logic handler for users endpoint
 */
async function usersHandler(request: Request, context: Context): Promise<UsersResponse> {
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    NETLIFY: process.env.NETLIFY,
    NETLIFY_DEV: process.env.NETLIFY_DEV,
    CONTEXT: process.env.CONTEXT
  });

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
          throw new ApiError("User not found", 404);
        }
        return { user: user as User };
      } else {
        // Get all users
        const users = await mongoHandler.find('users');
        console.log('Found users:', users); // Debug log
        console.log('Users count:', users.length); // Debug log
        return { users: users as User[] };
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
      return { user: newUser };
    } else if (request.method === 'PUT') {
      // Update user
      if (!id || id === 'users') {
        throw new ApiError("User ID required for update", 400);
      }

      const body = await request.json();
      const updateCount = await mongoHandler.updateOne('users', { id }, { $set: body });
      if (updateCount === 0) {
        throw new ApiError("User not found", 404);
      }

      const updatedUser = await mongoHandler.findOne('users', { id });
      return { user: updatedUser as User };
    } else if (request.method === 'DELETE') {
      // Delete user
      if (!id || id === 'users') {
        throw new ApiError("User ID required for deletion", 400);
      }

      const deleteCount = await mongoHandler.deleteOne('users', { id });
      if (deleteCount === 0) {
        throw new ApiError("User not found", 404);
      }

      return { deletedCount: deleteCount };
    }

    // Method not allowed
    throw new ApiError("Method not allowed", 405);

  } finally {
    await mongoHandler.disconnect();
  }
}

/**
 * Users function wrapped with apiWrapper
 * Provides caching, rate limiting, retry logic, and structured logging
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

  return apiWrapper.handleRequest(
    request,
    context,
    usersHandler,
    {
      metadata: {
        endpoint: 'users',
        service: 'user-management'
      },
      skipRetry: request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE',
      skipCache: process.env.NETLIFY_DEV === 'true' || !process.env.NETLIFY // Netlify dev mode or local
    }
  );
};
