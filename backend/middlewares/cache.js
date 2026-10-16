const cacheService = require('../services/cacheService');

const cache = (keyBuilder, ttl = 60) => async (req, res, next) => {
  try {
    const key = keyBuilder(req);
    const cached = await cacheService.get(key);

    if (cached !== null && cached !== undefined) {
      return res.status(200).json({ status: 'success', source: 'cache', data: cached });
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.data !== undefined) {
        cacheService.set(key, body.data, ttl).catch((error) => {
          req.log?.warn('Cache write failed', { error: error.message, key });
        });
      }
      return originalJson(body);
    };

    return next();
  } catch (error) {
    req.log?.warn('Cache read failed; continuing without cache', { error: error.message });
    return next();
  }
};

module.exports = { cache };
