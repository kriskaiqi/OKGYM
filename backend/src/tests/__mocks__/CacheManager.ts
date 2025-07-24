/**
 * Mock implementation of CacheManager
 */

export const cacheManager = {
  get: jest.fn().mockImplementation(() => null),
  set: jest.fn().mockImplementation(() => Promise.resolve(true)),
  delete: jest.fn().mockImplementation(() => Promise.resolve(true)),
  flush: jest.fn().mockImplementation(() => Promise.resolve(true)),
  stats: jest.fn().mockImplementation(() => ({
    hits: 0,
    misses: 0,
    keys: 0,
    ksize: 0,
    vsize: 0
  }))
}; 