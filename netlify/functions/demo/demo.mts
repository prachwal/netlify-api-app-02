import { Context } from "@netlify/functions";

/**
 * Business logic handler for demo endpoint
 */
async function demoHandler(request: Request, context: Context) {
  const url = new URL(request.url);
  const subject = url.searchParams.get("name") || "World";
  
  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return { message: `Hello ${subject}` };
}

/**
 * Demo function - direct response without apiWrapper for testing
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

  try {
    const data = await demoHandler(request, context);
    const response = {
      status: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: 'demo',
        service: 'greeting'
      }
    };
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errorResponse = {
      status: false,
      error: error instanceof Error ? error.message : String(error),
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: 'demo'
      }
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
