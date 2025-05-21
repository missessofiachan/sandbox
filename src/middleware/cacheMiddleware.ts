// Middleware for caching API responses
import { Request, Response, NextFunction, RequestHandler } from 'express';
import mcache from 'memory-cache';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

// Cache configuration from environment variables
const CACHE_DEBUG = process.env.CACHE_DEBUG === 'true';
const CACHE_SIZE_LIMIT = parseInt(process.env.CACHE_SIZE_LIMIT || '100', 10) * 1024 * 1024; // MB to bytes
const POPULAR_RESOURCE_MULTIPLIER = parseFloat(process.env.POPULAR_RESOURCE_MULTIPLIER || '2');

// Cache statistics for debugging
interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  entries: number;
  popular: Record<string, number>;
}

const cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  size: 0,
  entries: 0,
  popular: {}
};

/**
 * Track popularity of resources to adjust cache TTL
 * @param key Cache key
 */
const trackPopularity = (key: string): void => {
  if (!cacheStats.popular[key]) {
    cacheStats.popular[key] = 0;
  }
  cacheStats.popular[key]++;
};

/**
 * Get adjusted TTL based on resource popularity
 * @param key Cache key
 * @param baseDuration Base duration in seconds
 * @returns Adjusted duration in seconds
 */
const getAdjustedTTL = (key: string, baseDuration: number): number => {
  const popularity = cacheStats.popular[key] || 0;
  // Very popular resources get extended TTL, up to the multiplier cap
  if (popularity > 10) {
    return Math.min(baseDuration * POPULAR_RESOURCE_MULTIPLIER, 3600); // Cap at 1 hour
  }
  return baseDuration;
};

// Check if we need to evict entries due to size limit
const enforceSizeLimit = (): void => {
  if (cacheStats.size > CACHE_SIZE_LIMIT) {
    // Simple LRU-like eviction: remove oldest entries first
    const keys = mcache.keys();
    // Sort by access count (popularity)
    keys.sort((a, b) => (cacheStats.popular[a] || 0) - (cacheStats.popular[b] || 0));
    // Remove least popular entries until size is acceptable
    let removed = 0;
    for (const key of keys) {
      const entry = mcache.get(key);
      if (entry) {
        const size = Buffer.from(JSON.stringify(entry)).length;
        mcache.del(key);
        cacheStats.size -= size;
        cacheStats.entries--;
        removed++;
      }
      if (cacheStats.size <= CACHE_SIZE_LIMIT * 0.8) { // Clear until we're at 80% capacity
        break;
      }
    }
    if (CACHE_DEBUG) {
      logger.info(`[Cache] Evicted ${removed} entries due to size limit.`);
    }
  }
};

// Logging helper
function logCacheEvent(message: string) {
  if (CACHE_DEBUG) {
    logger.info(message);
  }
}

// Cache key generation helper
function getCacheKey(req: Request, customKey?: (req: Request) => string): string {
  return customKey ? customKey(req) : `__cache__${req.originalUrl || req.url}`;
}

// Cache stats update helpers
function incrementHits() {
  cacheStats.hits++;
}
function incrementMisses() {
  cacheStats.misses++;
}
function incrementEntries(size: number) {
  cacheStats.entries++;
  cacheStats.size += size;
}
function decrementEntries(size: number) {
  cacheStats.entries--;
  cacheStats.size -= size;
}

/**
 * Creates a middleware function that caches API responses
 * @param duration Cache duration in seconds
 * @param customKey Function to generate a custom cache key
 * @returns Express middleware function
 */
export const cacheResponse = (duration: number, customKey?: (req: Request) => string): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip caching for non-GET methods
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const key = getCacheKey(req, customKey);
    
    // Track popularity for this resource
    trackPopularity(key);
    
    // Check if response is already cached
    const cachedBody = mcache.get(key);
    
    if (cachedBody) {
      // Update statistics
      incrementHits();
      logCacheEvent(`[Cache] HIT: ${key}`);
      logCacheEvent(`[Cache] Stats: Hits=${cacheStats.hits}, Misses=${cacheStats.misses}, Entries=${cacheStats.entries}, Size=${Math.round(cacheStats.size / 1024 / 1024)}MB`);
      
      // Send cached response with headers indicating it's from cache
      res.setHeader('X-Cache', 'HIT');
      // Add Cache-Control header to inform clients about caching
      res.setHeader('Cache-Control', `public, max-age=${duration}`);
      res.send(cachedBody);
      return;
    }

    // Update statistics
    incrementMisses();
    logCacheEvent(`[Cache] MISS: ${key}`);
    logCacheEvent(`[Cache] Stats: Hits=${cacheStats.hits}, Misses=${cacheStats.misses}, Entries=${cacheStats.entries}, Size=${Math.round(cacheStats.size / 1024 / 1024)}MB`);

    // Override send function to cache the response
    const originalSend = res.send.bind(res);
    res.send = function(body: any): Response {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Calculate adjusted TTL based on popularity
        const adjustedDuration = getAdjustedTTL(key, duration);
        
        // Estimate the size of the response for cache size tracking
        const responseSize = Buffer.from(JSON.stringify(body)).length;
        
        // Update cache statistics
        incrementEntries(responseSize);
        
        if (adjustedDuration !== duration) {
          logCacheEvent(`[Cache] Adjusted TTL for popular resource: ${key} (${duration}s → ${adjustedDuration}s)`);
        }
        
        // Add to cache with adjusted TTL
        mcache.put(key, body, adjustedDuration * 1000);
        
        // Check size limits
        enforceSizeLimit();
      }
      
      res.setHeader('X-Cache', 'MISS');
      // Add Cache-Control header to inform clients about caching
      if (res.statusCode >= 200 && res.statusCode < 300) {
        res.setHeader('Cache-Control', `public, max-age=${duration}`);
      } else {
        res.setHeader('Cache-Control', 'no-store');
      }
      return originalSend(body);
    };

    next();
  };
};

/**
 * Clear a specific cache entry or all cached entries
 * @param key The cache key to clear, or undefined to clear all cache
 */
export const clearCache = (key?: string): void => {
  if (key) {
    const entry = mcache.get(key);
    if (entry) {
      // Update statistics when removing a specific entry
      const size = Buffer.from(JSON.stringify(entry)).length;
      decrementEntries(size);
      delete cacheStats.popular[key];
      
      mcache.del(key);
      logCacheEvent(`[Cache] Cleared: ${key}`);
    }
  } else {
    // Reset statistics when clearing all cache
    cacheStats.size = 0;
    cacheStats.entries = 0;
    cacheStats.popular = {};
    
    mcache.clear();
    logCacheEvent('[Cache] All entries cleared');
  }
};

/**
 * Helper function to invalidate API route caches
 * @param route The API route to invalidate (e.g. 'products')
 * @param id Optional ID for specific resource
 */
export const invalidateCache = (route: string, id?: string): void => {
  // Invalidate the list cache
  clearCache(`__cache__/api/${route}`);
  
  // If ID is provided, also invalidate the specific resource cache
  if (id) {
    clearCache(`__cache__/api/${route}/${id}`);
  }
  
  logCacheEvent(`[Cache] Invalidated route: ${route}${id ? ` with ID: ${id}` : ''}`);
};

/**
 * Get current cache statistics for monitoring and debugging
 * @returns Cache statistics object
 */
export const getCacheStats = (): CacheStats => {
  return {
    ...cacheStats,
    // Return a copy of the popular object to avoid external modifications
    popular: { ...cacheStats.popular }
  };
};

export default cacheResponse;
