const asyncHandler = require('express-async-handler');

const getPlatformStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      service: 'TIC Educational Platform API',
      message: 'The platform API is running.',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = { getPlatformStatus };
