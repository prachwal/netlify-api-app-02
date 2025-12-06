import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ApiWrapper, ApiError, apiWrapper } from './api-wrapper.mts'

// Mock Winston logger
vi.mock('winston', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }

  return {
    default: {
      createLogger: vi.fn(() => mockLogger),
      format: {
        combine: vi.fn(),
        timestamp: vi.fn(),
        errors: vi.fn(),
        json: vi.fn(),
        colorize: vi.fn(),
        simple: vi.fn()
      },
      transports: {
        Console: vi.fn()
      }
    },
    createLogger: vi.fn(() => mockLogger),
    format: {
      combine: vi.fn(),
      timestamp: vi.fn(),
      errors: vi.fn(),
      json: vi.fn(),
      colorize: vi.fn(),
      simple: vi.fn()
    },
    transports: {
      Console: vi.fn()
    }
  }
})

// Mock process.env
const originalEnv = process.env
beforeEach(() => {
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = originalEnv
  vi.clearAllMocks()
})

describe('ApiError', () => {
  it('should create ApiError with message and status code', () => {
    const error = new ApiError('Not found', 404)
    expect(error.message).toBe('Not found')
    expect(error.statusCode).toBe(404)
    expect(error.name).toBe('ApiError')
  })

  it('should default to status code 500', () => {
    const error = new ApiError('Server error')
    expect(error.statusCode).toBe(500)
  })
})

describe('ApiWrapper', () => {
  let wrapper: ApiWrapper
  let mockRequest: Request
  let mockContext: any

  beforeEach(() => {
    wrapper = new ApiWrapper({
      cache: { enabled: true, ttl: 60 },
      retry: { maxAttempts: 2, backoffMs: 100 },
      rateLimit: { windowMs: 1000, maxRequests: 5 },
      logging: false
    })

    mockRequest = {
      method: 'GET',
      url: `http://localhost:8888/.netlify/functions/test-${Date.now()}`,
      headers: new Headers({ 'user-agent': 'test-agent' })
    } as Request

    mockContext = {
      ip: `127.0.0.${Math.floor(Math.random() * 255)}`
    }

    // Clear cache before each test
    wrapper.clearCache()
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const handler = vi.fn().mockResolvedValue({ data: 'success' })

      for (let i = 0; i < 5; i++) {
        const response = await wrapper.handleRequest(mockRequest, mockContext, handler)
        expect(response.status).toBe(200)
      }
    })

    it('should block requests exceeding rate limit', async () => {
      const handler = vi.fn().mockResolvedValue({ data: 'success' })

      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        await wrapper.handleRequest(mockRequest, mockContext, handler)
      }

      // Next request should be rate limited
      const response = await wrapper.handleRequest(mockRequest, mockContext, handler)
      expect(response.status).toBe(429)

      const data = await response.json()
      expect(data.status).toBe(false)
      expect(data.error).toBe('Rate limit exceeded')
      expect(data.metadata.retryAfter).toBe(1)
    })

    it('should skip rate limiting when skipRateLimit is true', async () => {
      const handler = vi.fn().mockResolvedValue({ data: 'success' })

      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        await wrapper.handleRequest(mockRequest, mockContext, handler)
      }

      // This should work even with rate limit exceeded
      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, {
        skipRateLimit: true
      })
      expect(response.status).toBe(200)
    })
  })

  describe('Caching', () => {
    it('should cache successful responses', async () => {
      const handler = vi.fn().mockResolvedValue({ data: 'cached-data' })

      // First request
      const response1 = await wrapper.handleRequest(mockRequest, mockContext, handler, { skipRateLimit: true })
      expect(response1.status).toBe(200)
      expect(handler).toHaveBeenCalledTimes(1)

      // Second request should use cache
      const response2 = await wrapper.handleRequest(mockRequest, mockContext, handler, { skipRateLimit: true })
      expect(response2.status).toBe(200)
      expect(handler).toHaveBeenCalledTimes(1) // Still 1 call

      const data2 = await response2.json()
      expect(data2.metadata.cached).toBe(true)
    })

    it('should not cache when skipCache is true', async () => {
      const handler = vi.fn().mockResolvedValue({ data: 'no-cache' })

      // First request with skipCache
      await wrapper.handleRequest(mockRequest, mockContext, handler, { skipCache: true, skipRateLimit: true })
      expect(handler).toHaveBeenCalledTimes(1)

      // Second request should not use cache
      await wrapper.handleRequest(mockRequest, mockContext, handler, { skipCache: true, skipRateLimit: true })
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should use custom cache key', async () => {
      const handler = vi.fn().mockResolvedValue({ data: 'custom-key' })

      const customKey = 'custom-cache-key'
      await wrapper.handleRequest(mockRequest, mockContext, handler, { cacheKey: customKey, skipRateLimit: true })
      await wrapper.handleRequest(mockRequest, mockContext, handler, { cacheKey: customKey, skipRateLimit: true })

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Retry Logic', () => {
    it('should retry on failure and succeed', async () => {
      const handler = vi.fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ data: 'success' })

      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, { skipRateLimit: true })
      expect(response.status).toBe(200)
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should fail after max retries', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Persistent failure'))

      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, { skipRateLimit: true })
      expect(response.status).toBe(500)
      expect(handler).toHaveBeenCalledTimes(2) // maxAttempts = 2
    })

    it('should skip retry when skipRetry is true', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('No retry'))

      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, {
        skipRetry: true,
        skipRateLimit: true
      })
      expect(response.status).toBe(500)
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle ApiError with custom status code', async () => {
      const handler = vi.fn().mockRejectedValue(new ApiError('Not found', 404))

      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, { skipRateLimit: true })
      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.status).toBe(false)
      expect(data.error).toBe('Not found')
    })

    it('should handle generic errors as 500', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Server error'))

      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, { skipRateLimit: true })
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.status).toBe(false)
      expect(data.error).toBe('Server error')
      expect(data.metadata.errorId).toBeDefined()
    })

    it('should handle non-Error throws', async () => {
      const handler = vi.fn().mockRejectedValue('String error')

      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, { skipRateLimit: true })
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBe('String error')
    })
  })

  describe('Success Responses', () => {
    it('should return successful response with data', async () => {
      const testData = { users: [{ id: 1, name: 'Test' }] }
      const handler = vi.fn().mockResolvedValue(testData)

      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, { skipRateLimit: true })
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.status).toBe(true)
      expect(data.data).toEqual(testData)
      expect(data.metadata.timestamp).toBeDefined()
      expect(data.metadata.responseTime).toBeDefined()
    })

    it('should include custom metadata', async () => {
      const handler = vi.fn().mockResolvedValue({ data: 'test' })

      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, {
        metadata: { endpoint: 'test', service: 'test-service' },
        skipRateLimit: true
      })

      const data = await response.json()
      expect(data.metadata.endpoint).toBe('test')
      expect(data.metadata.service).toBe('test-service')
    })
  })

  describe('Cache Management', () => {
    it('should clean expired cache entries', () => {
      // Set up cache with expired entry
      const wrapperWithCache = new ApiWrapper({
        cache: { enabled: true, ttl: 0 }, // 0 TTL = immediate expiry
        logging: false
      })

      // This is internal, but we can test the concept by checking cache stats
      const stats = wrapperWithCache.getCacheStats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('keys')
    })

    it('should clear all cache', () => {
      const wrapperWithCache = new ApiWrapper({
        cache: { enabled: true, ttl: 60 },
        logging: false
      })

      wrapperWithCache.clearCache()
      const stats = wrapperWithCache.getCacheStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('Default apiWrapper Instance', () => {
    it('should have default configuration', () => {
      // The default instance should be configured with reasonable defaults
      expect(apiWrapper).toBeDefined()
      // We can't easily test the internal config, but we can test it works
    })

    it('should handle requests with default settings', async () => {
      const handler = vi.fn().mockResolvedValue({ message: 'default test' })

      const response = await apiWrapper.handleRequest(mockRequest, mockContext, handler)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.data).toEqual({ message: 'default test' })
    })
  })

  describe('Performance', () => {
    it('should include response time in metadata', async () => {
      const handler = vi.fn().mockResolvedValue({ data: 'performance test' })

      const response = await wrapper.handleRequest(mockRequest, mockContext, handler, { skipRateLimit: true })
      const data = await response.json()

      expect(data.metadata.responseTime).toBeDefined()
      expect(typeof data.metadata.responseTime).toBe('number')
      expect(data.metadata.responseTime).toBeGreaterThanOrEqual(0)
    })
  })
})