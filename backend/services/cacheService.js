const { redis, redisAvailable } = require('../config/redis');

class CacheService {
  async get(key) {
    if (!redisAvailable) return null;
    return redis.get(key);
  }

  async set(key, value, ttl = 60) {
    if (!redisAvailable) return null;
    return redis.set(key, value, { ex: ttl });
  }

  async del(key) {
    if (!redisAvailable) return null;
    return redis.del(key);
  }

  async delMany(keys = []) {
    if (!redisAvailable || keys.length === 0) return null;
    return redis.del(...keys);
  }
}

module.exports = new CacheService();
