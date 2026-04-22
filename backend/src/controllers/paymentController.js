const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout
const createCheckoutSession = async (req, res, next) => {
  try {
    const { amount } = req.body; // amount in USD

    if (!amount || amount < 1 || amount > 500) {
      return res.status(400).json({ success: false, message: 'Amount must be between $1 and $500' });
    }

    const amountCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Add Balance',
              description: `Add $${amount} to your SMM Panel account`
            },
            unit_amount: amountCents
          },
          quantity: 1
        }
      ],
      metadata: {
        userId: req.user._id.toString(),
        amount: amount.toString()
      },
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/billing?payment=canceled`
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error('Stripe checkout error:', error);
    next(error);
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Stripe webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.payment_status === 'paid') {
      try {
        const userId = session.metadata.userId;
        const amount = parseFloat(session.metadata.amount);

        const user = await User.findById(userId);
        if (!user) {
          logger.error(`Webhook: User ${userId} not found`);
          return res.json({ received: true });
        }

        const balanceBefore = user.balance;
        user.balance = parseFloat((user.balance + amount).toFixed(4));
        await user.save();

        await Transaction.create({
          user: userId,
          type: 'deposit',
          amount,
          balanceBefore,
          balanceAfter: user.balance,
          description: `Stripe deposit - Session ${session.id}`,
          stripePaymentIntentId: session.payment_intent,
          status: 'completed'
        });

        logger.info(`Balance added: $${amount} to user ${user.email}`);
      } catch (err) {
        logger.error('Webhook processing error:', err);
      }
    }
  }

  res.json({ received: true });
};

// @desc    Get user transactions
// @route   GET /api/payments/transactions
const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCheckoutSession, handleWebhook, getTransactions };
