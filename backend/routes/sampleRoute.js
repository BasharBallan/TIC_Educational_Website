const express = require('express');
const { getPlatformStatus } = require('../controllers/sampleController');
const { cache } = require('../middlewares/cache');

const router = express.Router();

router.get('/status', cache(() => 'platform:status', 30), getPlatformStatus);

module.exports = router;
