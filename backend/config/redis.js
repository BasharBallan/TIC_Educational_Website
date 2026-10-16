const { Redis } = require('@upstash/redis');
const logger = require('../utils/logger');

const redisAvailable = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = redisAvailable
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

if (!redisAvailable) {
  logger.warn('Upstash Redis is not configured; cache operations will be skipped.');
}

module.exports = { redis, redisAvailable };
