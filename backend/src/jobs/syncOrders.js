/**
 * Order status sync job
 * Fetches live status from SMM provider for all pending/in-progress orders
 * Run manually: node src/jobs/syncOrders.js
 * Or call syncOrders() on a cron (e.g. every 5 minutes with node-cron)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose    = require('mongoose');
const Order       = require('../models/Order');
const smmProvider = require('../services/smmProvider');
const logger      = require('../utils/logger');

const BATCH_SIZE = 100; // provider API typically accepts up to 100 IDs at once

async function syncOrders() {
  let connected = false;
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      connected = true;
    }

    // Fetch all orders that have a provider ID and aren't in a final state
    const pendingOrders = await Order.find({
      providerOrderId: { $ne: null },
      status: { $in: ['Pending', 'In progress', 'Partial'] }
    }).limit(BATCH_SIZE).lean();

    if (pendingOrders.length === 0) {
      logger.info('[SyncJob] No orders to sync');
      return;
    }

    logger.info(`[SyncJob] Syncing ${pendingOrders.length} orders...`);

    const providerIds = pendingOrders.map(o => o.providerOrderId);

    let statusMap = {};
    try {
      const response = await smmProvider.getMultipleOrderStatus(providerIds);
      // Response format: { "123": { status, start_count, remains }, ... }
      statusMap = response;
    } catch (err) {
      logger.error('[SyncJob] Provider API error:', err.message);
      return;
    }

    let updated = 0;
    for (const order of pendingOrders) {
      const providerData = statusMap[order.providerOrderId];
      if (!providerData) continue;

      const newStatus = normalizeStatus(providerData.status);
      if (newStatus !== order.status || providerData.remains !== order.remains) {
        await Order.findByIdAndUpdate(order._id, {
          status:     newStatus,
          startCount: providerData.start_count || order.startCount,
          remains:    providerData.remains     || order.remains,
        });
        updated++;
      }
    }

    logger.info(`[SyncJob] Updated ${updated}/${pendingOrders.length} orders`);
  } catch (err) {
    logger.error('[SyncJob] Fatal error:', err);
  } finally {
    if (connected) await mongoose.connection.close();
  }
}

/**
 * Normalize provider status strings to our enum values
 */
function normalizeStatus(raw = '') {
  const s = raw.toLowerCase();
  if (s === 'completed')                        return 'Completed';
  if (s === 'in progress' || s === 'processing') return 'In progress';
  if (s === 'pending')                          return 'Pending';
  if (s === 'partial')                          return 'Partial';
  if (s === 'canceled' || s === 'cancelled')    return 'Canceled';
  if (s === 'failed' || s === 'error')          return 'Failed';
  return 'Pending';
}

// Run directly
if (require.main === module) {
  syncOrders().then(() => process.exit(0));
}

module.exports = syncOrders;
