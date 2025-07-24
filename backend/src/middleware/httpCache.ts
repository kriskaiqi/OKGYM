// @ts-ignore to avoid TypeScript issues
const express = require('express');
import { createHash } from 'crypto';
import logger from '../utils/logger';
import { Request, Response, NextFunction } from '../types/express';

/**
 * Options for HTTP cache control
 */
export interface HttpCacheOptions {
    /** Max age in seconds */
    maxAge?: number;
    /** Whether the response is publicly cacheable */
    public?: boolean;
    /** Shared max age for CDNs in seconds */
    sMaxAge?: number;
    /** Time in seconds that stale responses can be served while revalidating */
    staleWhileRevalidate?: number;
    /** Whether to enable ETag generation */
    etagEnabled?: boolean;
    /** Whether the client must revalidate the cache on each use */
    mustRevalidate?: boolean;
}

/**
 * Default cache options
 */
const defaultOptions: HttpCacheOptions = {
    maxAge: 0,
    public: false,
    etagEnabled: true,
    mustRevalidate: true
};

/**
 * HTTP Cache middleware for Express
 * Adds cache-control headers and handles ETag for API response caching
 * 
 * @param options Cache control options
 */
export function httpCache(options: HttpCacheOptions = {}) {
    // Merge with default options
    const cacheOptions: HttpCacheOptions = { ...defaultOptions, ...options };
    
    return (req: Request, res: Response & { 
        noCache: () => void;
        cacheFor: (seconds: number) => void;
    }, next: NextFunction) => {
        // Only apply to GET requests
        if (req.method !== 'GET') {
            return next();
        }
        
        // Store original methods
        const originalSend = res.send;
        const originalJson = res.json;
        const originalEnd = res.end;
        
        // Add method to skip caching for this response
        res.noCache = function() {
            this.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            this.setHeader('Pragma', 'no-cache');
            this.setHeader('Expires', '0');
            return this;
        };
        
        // Add method to set cache duration for this response
        res.cacheFor = function(seconds: number) {
            const directives = [`max-age=${seconds}`];
            
            if (cacheOptions.public) {
                directives.unshift('public');
            } else {
                directives.unshift('private');
            }
            
            if (cacheOptions.sMaxAge) {
                directives.push(`s-maxage=${cacheOptions.sMaxAge}`);
            }
            
            if (cacheOptions.staleWhileRevalidate) {
                directives.push(`stale-while-revalidate=${cacheOptions.staleWhileRevalidate}`);
            }
            
            if (cacheOptions.mustRevalidate) {
                directives.push('must-revalidate');
            }
            
            this.setHeader('Cache-Control', directives.join(', '));
            return this;
        };
        
        // Override send method to add ETag
        res.send = function(body: any) {
            // Skip if already sent or if ETag is disabled
            if (this.headersSent || !cacheOptions.etagEnabled) {
                return originalSend.apply(this, [body]);
            }
            
            // Generate ETag from response body
            if (body) {
                const etag = generateETag(body);
                this.setHeader('ETag', etag);
                
                // Check if client sent matching ETag
                const ifNoneMatch = req.headers['if-none-match'];
                if (ifNoneMatch === etag) {
                    logger.debug('ETag match, returning 304 Not Modified', { 
                        path: req.path, 
                        etag 
                    });
                    
                    // Return 304 Not Modified if ETag matches
                    this.status(304).end();
                    return this;
                }
            }
            
            // Set default cache headers if not already set
            if (!this.getHeader('Cache-Control') && cacheOptions.maxAge !== undefined) {
                res.cacheFor(cacheOptions.maxAge);
            }
            
            return originalSend.apply(this, [body]);
        };
        
        // Override json method to add ETag
        res.json = function(body: any) {
            // Skip if already sent or if ETag is disabled
            if (this.headersSent || !cacheOptions.etagEnabled) {
                return originalJson.apply(this, [body]);
            }
            
            // Generate ETag from JSON body
            if (body) {
                const etag = generateETag(JSON.stringify(body));
                this.setHeader('ETag', etag);
                
                // Check if client sent matching ETag
                const ifNoneMatch = req.headers['if-none-match'];
                if (ifNoneMatch === etag) {
                    logger.debug('ETag match, returning 304 Not Modified', { 
                        path: req.path, 
                        etag 
                    });
                    
                    // Return 304 Not Modified if ETag matches
                    this.status(304).end();
                    return this;
                }
            }
            
            // Set default cache headers if not already set
            if (!this.getHeader('Cache-Control') && cacheOptions.maxAge !== undefined) {
                res.cacheFor(cacheOptions.maxAge);
            }
            
            return originalJson.apply(this, [body]);
        };
        
        next();
    };
}

/**
 * Generate ETag from content
 */
function generateETag(content: string | Buffer): string {
    return createHash('md5')
        .update(typeof content === 'string' ? content : content.toString())
        .digest('hex');
}

/**
 * Predefined caching strategies for different types of content
 */
export const CacheStrategy = {
    /**
     * No caching - use for dynamic or personalized content
     */
    NoCache: httpCache({
        maxAge: 0,
        public: false,
        etagEnabled: false
    }),
    
    /**
     * Short-lived cache (5 minutes) - use for frequently changing data
     */
    ShortLived: httpCache({
        maxAge: 300, // 5 minutes
        public: true,
        etagEnabled: true
    }),
    
    /**
     * Medium-lived cache (1 hour) - use for semi-static data
     */
    MediumLived: httpCache({
        maxAge: 3600, // 1 hour
        public: true,
        etagEnabled: true,
        staleWhileRevalidate: 600 // 10 minutes
    }),
    
    /**
     * Long-lived cache (1 day) - use for static data that rarely changes
     */
    LongLived: httpCache({
        maxAge: 86400, // 1 day
        public: true,
        etagEnabled: true,
        staleWhileRevalidate: 3600 // 1 hour
    }),
    
    /**
     * API cache - use for API responses with ETag validation
     */
    ApiCache: httpCache({
        maxAge: 60, // 1 minute
        public: false,
        etagEnabled: true,
        mustRevalidate: true
    }),
    
    /**
     * Custom cache strategy factory
     */
    Custom: (options: HttpCacheOptions) => httpCache(options)
}; 