const express = require('express');
const { createCheckoutSession, handleWebhook, getTransactions } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Webhook must use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.use(protect);
router.post('/create-checkout', createCheckoutSession);
router.get('/transactions', getTransactions);

module.exports = router;
