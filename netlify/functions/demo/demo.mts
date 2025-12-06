import { Context } from "@netlify/functions";
import { apiResponse } from "../../types";

export default (request: Request, context: Context) => {

  try {
    const url = new URL(request.url);
    const subject = url.searchParams.get("name") || "World";

    const response: apiResponse<string> = {
      status: true,
      data: `Hello ${subject}`,
      metadata: {
        timestamp: new Date().toISOString(),
        requestUrl: request.url,
      },
    };

    return new Response(JSON.stringify(response));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const response: apiResponse<string> = {
      status: false,
      error: message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestUrl: request.url,
      },
    };
    return new Response(JSON.stringify(response), {
      status: 500,
    });
  }
};
