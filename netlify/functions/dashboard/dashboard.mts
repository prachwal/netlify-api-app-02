import { Context } from "@netlify/functions";
import { apiWrapper } from "../../lib/api-wrapper.mts";

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

/**
 * Business logic handler for dashboard endpoint
 */
async function dashboardHandler(request: Request, context: Context): Promise<DashboardData> {
  if (request.method !== 'GET') {
    throw new Error("Method not allowed");
  }

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

  return currentData;
}

/**
 * Dashboard function wrapped with apiWrapper
 * Provides caching (1 minute for real-time feel), rate limiting, retry logic, and structured logging
 */
export default async (request: Request, context: Context) => {
  return apiWrapper.handleRequest(
    request,
    context,
    dashboardHandler,
    {
      metadata: {
        endpoint: 'dashboard',
        service: 'dashboard'
      },
      cacheKey: `dashboard:${Date.now() - (Date.now() % 60000)}` // Cache for 1 minute
    }
  );
};
