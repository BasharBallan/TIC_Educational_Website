// services/cacheService.js
const redis = require("../config/redis");

class CacheService {
  async get(key) {
    return await redis.get(key);
  }

  async set(key, value, ttl = 60) {
    return await redis.set(key, JSON.stringify(value), { EX: ttl });
  }

  async del(key) {
    return await redis.del(key);
  }

  async delMany(keys = []) {
    if (!Array.isArray(keys)) return;
    for (const key of keys) {
      await redis.del(key);
    }
  }
}

module.exports = new CacheService();
