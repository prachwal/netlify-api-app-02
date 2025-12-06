import { Context } from "@netlify/functions";
import { apiResponse } from "../types";
import winston from 'winston';

// Types for the API wrapper
interface CacheOptions {
  enabled: boolean;
  ttl: number; // Time to live in seconds
}

interface RetryOptions {
  maxAttempts: number;
  backoffMs: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface WrapperOptions {
  cache?: CacheOptions;
  retry?: RetryOptions;
  rateLimit?: RateLimitOptions;
  logging?: boolean;
  skipRetry?: boolean;
}

// In-memory cache storage
const cache = new Map<string, { data: any; expiry: number }>();

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-wrapper' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

class ApiWrapper {
  private options: WrapperOptions;

  constructor(options: WrapperOptions = {}) {
    this.options = {
      cache: {
        enabled: false,
        ttl: 300, // 5 minutes default
        ...options.cache
      },
      retry: {
        maxAttempts: 3,
        backoffMs: 1000,
        ...options.retry
      },
      rateLimit: {
        windowMs: 60000, // 1 minute default
        maxRequests: 100,
        ...options.rateLimit
      },
      logging: options.logging ?? true
    };
  }

  /**
   * Check if request is within rate limit
   */
  private checkRateLimit(identifier: string): boolean {
    if (!this.options.rateLimit) return true;

    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    const current = rateLimitMap.get(key);

    if (!current || now > current.resetTime) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + this.options.rateLimit.windowMs
      });
      return true;
    }

    if (current.count >= this.options.rateLimit.maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  /**
   * Get data from cache if available and not expired
   */
  private getFromCache(key: string): any | null {
    if (!this.options.cache?.enabled) return null;

    const cached = cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      if (this.options.logging) {
        logger.debug('Cache hit', { key });
      }
      return cached.data;
    }

    if (cached) {
      cache.delete(key); // Remove expired entry
    }

    return null;
  }

  /**
   * Store data in cache
   */
  private setCache(key: string, data: any): void {
    if (!this.options.cache?.enabled) return;

    const expiry = Date.now() + (this.options.cache.ttl * 1000);
    cache.set(key, { data, expiry });

    if (this.options.logging) {
      logger.debug('Data cached', { key, ttl: this.options.cache.ttl });
    }
  }

  /**
   * Generate cache key based on request
   */
  private generateCacheKey(request: Request, context: Context): string {
    const url = new URL(request.url);
    const path = url.pathname;
    const query = url.search;
    const method = request.method;
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    return `${method}:${path}:${query}:${userAgent}:${context.ip}`;
  }

  /**
   * Execute function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.options.retry!.maxAttempts; attempt++) {
      try {
        if (this.options.logging && attempt > 1) {
          logger.info(`Retry attempt ${attempt}/${this.options.retry!.maxAttempts}`, { operationName });
        }

        const result = await fn();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.options.retry!.maxAttempts) {
          break; // Last attempt failed, throw error
        }

        // Wait before retry with exponential backoff
        const delay = this.options.retry!.backoffMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Create standardized error response
   */
  private createErrorResponse(
    error: string | Error,
    statusCode: number = 500,
    metadata: any = {}
  ): Response {
    const message = error instanceof Error ? error.message : error;
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response: apiResponse<null> = {
      status: false,
      error: message,
      metadata: {
        timestamp: new Date().toISOString(),
        errorId,
        ...metadata
      }
    };

    if (this.options.logging) {
      logger.error('API Error', {
        errorId,
        message,
        statusCode,
        metadata
      });
    }

    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Id': errorId
      }
    });
  }

  /**
   * Create standardized success response
   */
  private createSuccessResponse<T>(
    data: T,
    metadata: any = {}
  ): Response {
    const response: apiResponse<T> = {
      status: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Main wrapper function
   */
  public async handleRequest<T>(
    request: Request,
    context: Context,
    handler: (request: Request, context: Context) => Promise<T>,
    options: {
      cacheKey?: string;
      skipCache?: boolean;
      skipRateLimit?: boolean;
      skipRetry?: boolean;
      metadata?: any;
    } = {}
  ): Promise<Response> {
    const startTime = Date.now();
    
    try {
      // Check rate limit
      if (!options.skipRateLimit && !this.checkRateLimit(context.ip)) {
        return this.createErrorResponse(
          'Rate limit exceeded',
          429,
          { 
            retryAfter: Math.ceil(this.options.rateLimit!.windowMs / 1000),
            maxRequests: this.options.rateLimit!.maxRequests,
            windowMs: this.options.rateLimit!.windowMs
          }
        );
      }

      // Generate cache key
      const cacheKey = options.cacheKey || this.generateCacheKey(request, context);

      // Check cache (skip if explicitly disabled)
      if (!options.skipCache) {
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
          const response = this.createSuccessResponse(cachedData, {
            ...options.metadata,
            cached: true,
            responseTime: Date.now() - startTime
          });

          return response;
        }
      }

      // Execute handler with retry logic
      const result = options.skipRetry 
        ? await handler(request, context)
        : await this.executeWithRetry(
            () => handler(request, context),
            'API Handler'
          );

      // Cache the result if caching is enabled and not skipped
      if (!options.skipCache && this.options.cache?.enabled) {
        this.setCache(cacheKey, result);
      }

      // Create success response
      const response = this.createSuccessResponse(result, {
        ...options.metadata,
        cached: false,
        responseTime: Date.now() - startTime
      });

      // Log successful request
      if (this.options.logging) {
        logger.info('Request completed successfully', {
          method: request.method,
          url: request.url,
          responseTime: Date.now() - startTime,
          cached: !options.skipCache && this.options.cache?.enabled
        });
      }

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (this.options.logging) {
        logger.error('Request failed', {
          method: request.method,
          url: request.url,
          error: error instanceof Error ? error.message : String(error),
          responseTime,
          stack: error instanceof Error ? error.stack : undefined
        });
      }

      return this.createErrorResponse(error instanceof Error ? error.message : String(error), 500, {
        ...options.metadata,
        responseTime
      });
    }
  }

  /**
   * Clean expired cache entries
   */
  public cleanCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of cache.entries()) {
      if (now >= value.expiry) {
        cache.delete(key);
        cleaned++;
      }
    }

    if (this.options.logging && cleaned > 0) {
      logger.info('Cache cleaned', { cleanedEntries: cleaned });
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: cache.size,
      keys: Array.from(cache.keys())
    };
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    cache.clear();
    if (this.options.logging) {
      logger.info('Cache cleared');
    }
  }
}

// Export default instance with optimal settings for performance
export const apiWrapper = new ApiWrapper({
  cache: {
    enabled: true,
    ttl: 300 // 5 minutes
  },
  retry: {
    maxAttempts: 3,
    backoffMs: 1000
  },
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 100
  },
  logging: true
});

// Export class for custom instances
export { ApiWrapper };

// Export types
export type { WrapperOptions, CacheOptions, RetryOptions, RateLimitOptions };
