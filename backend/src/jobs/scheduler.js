/**
 * Optional cron scheduler – import this in server.js if you want
 * automatic order status sync without an external cron job.
 *
 * Usage in server.js:
 *   require('./jobs/scheduler');
 *
 * Requires: npm install node-cron
 */
const cron       = require('node-cron');
const syncOrders = require('./syncOrders');
const logger     = require('../utils/logger');

// Sync order statuses every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  logger.info('[Scheduler] Running order sync...');
  await syncOrders();
});

logger.info('[Scheduler] Order sync cron registered (every 5 min)');
