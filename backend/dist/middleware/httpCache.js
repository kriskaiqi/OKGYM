"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStrategy = void 0;
exports.httpCache = httpCache;
const express = require('express');
const crypto_1 = require("crypto");
const logger_1 = __importDefault(require("../utils/logger"));
const defaultOptions = {
    maxAge: 0,
    public: false,
    etagEnabled: true,
    mustRevalidate: true
};
function httpCache(options = {}) {
    const cacheOptions = Object.assign(Object.assign({}, defaultOptions), options);
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }
        const originalSend = res.send;
        const originalJson = res.json;
        const originalEnd = res.end;
        res.noCache = function () {
            this.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            this.setHeader('Pragma', 'no-cache');
            this.setHeader('Expires', '0');
            return this;
        };
        res.cacheFor = function (seconds) {
            const directives = [`max-age=${seconds}`];
            if (cacheOptions.public) {
                directives.unshift('public');
            }
            else {
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
        res.send = function (body) {
            if (this.headersSent || !cacheOptions.etagEnabled) {
                return originalSend.apply(this, [body]);
            }
            if (body) {
                const etag = generateETag(body);
                this.setHeader('ETag', etag);
                const ifNoneMatch = req.headers['if-none-match'];
                if (ifNoneMatch === etag) {
                    logger_1.default.debug('ETag match, returning 304 Not Modified', {
                        path: req.path,
                        etag
                    });
                    this.status(304).end();
                    return this;
                }
            }
            if (!this.getHeader('Cache-Control') && cacheOptions.maxAge !== undefined) {
                res.cacheFor(cacheOptions.maxAge);
            }
            return originalSend.apply(this, [body]);
        };
        res.json = function (body) {
            if (this.headersSent || !cacheOptions.etagEnabled) {
                return originalJson.apply(this, [body]);
            }
            if (body) {
                const etag = generateETag(JSON.stringify(body));
                this.setHeader('ETag', etag);
                const ifNoneMatch = req.headers['if-none-match'];
                if (ifNoneMatch === etag) {
                    logger_1.default.debug('ETag match, returning 304 Not Modified', {
                        path: req.path,
                        etag
                    });
                    this.status(304).end();
                    return this;
                }
            }
            if (!this.getHeader('Cache-Control') && cacheOptions.maxAge !== undefined) {
                res.cacheFor(cacheOptions.maxAge);
            }
            return originalJson.apply(this, [body]);
        };
        next();
    };
}
function generateETag(content) {
    return (0, crypto_1.createHash)('md5')
        .update(typeof content === 'string' ? content : content.toString())
        .digest('hex');
}
exports.CacheStrategy = {
    NoCache: httpCache({
        maxAge: 0,
        public: false,
        etagEnabled: false
    }),
    ShortLived: httpCache({
        maxAge: 300,
        public: true,
        etagEnabled: true
    }),
    MediumLived: httpCache({
        maxAge: 3600,
        public: true,
        etagEnabled: true,
        staleWhileRevalidate: 600
    }),
    LongLived: httpCache({
        maxAge: 86400,
        public: true,
        etagEnabled: true,
        staleWhileRevalidate: 3600
    }),
    ApiCache: httpCache({
        maxAge: 60,
        public: false,
        etagEnabled: true,
        mustRevalidate: true
    }),
    Custom: (options) => httpCache(options)
};
//# sourceMappingURL=httpCache.js.map