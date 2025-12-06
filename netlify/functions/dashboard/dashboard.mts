import { Context } from "@netlify/functions";
import { apiResponse } from "../../types";

interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  recentActivity: Array<{
    id: string;
    type: 'user_registered' | 'user_logged_in' | 'settings_updated';
    description: string;
    timestamp: string;
  }>;
  stats: {
    messages: number;
    notifications: number;
    apiCalls: number;
  };
}

const mockDashboardData: DashboardData = {
  totalUsers: 1250,
  activeUsers: 320,
  totalRevenue: 45000,
  recentActivity: [
    {
      id: "1",
      type: "user_registered",
      description: "Nowy użytkownik się zarejestrował",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 min ago
    },
    {
      id: "2",
      type: "user_logged_in",
      description: "Użytkownik zalogował się",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 min ago
    },
    {
      id: "3",
      type: "settings_updated",
      description: "Ustawienia zostały zaktualizowane",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
    }
  ],
  stats: {
    messages: 89,
    notifications: 45,
    apiCalls: 1024
  }
};

export default (request: Request, context: Context) => {
  try {
    if (request.method === 'GET') {
      // Add some randomness to simulate live data
      const currentData = {
        ...mockDashboardData,
        totalUsers: mockDashboardData.totalUsers + Math.floor(Math.random() * 10),
        activeUsers: mockDashboardData.activeUsers + Math.floor(Math.random() * 5),
        stats: {
          ...mockDashboardData.stats,
          apiCalls: mockDashboardData.stats.apiCalls + Math.floor(Math.random() * 20)
        }
      };

      const response: apiResponse<DashboardData> = {
        status: true,
        data: currentData,
        metadata: {
          timestamp: new Date().toISOString(),
          requestUrl: request.url,
          lastUpdated: new Date().toISOString()
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
        allowedMethods: ["GET"]
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
  }
};
