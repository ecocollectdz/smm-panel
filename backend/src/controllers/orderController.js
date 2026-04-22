const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const smmProvider = require('../services/smmProvider');
const logger = require('../utils/logger');

// @desc    Create new order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { serviceId, link, quantity } = req.body;

    // Get service
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found or inactive' });
    }

    // Validate quantity
    if (quantity < service.minOrder || quantity > service.maxOrder) {
      return res.status(400).json({
        success: false,
        message: `Quantity must be between ${service.minOrder} and ${service.maxOrder}`
      });
    }

    // Calculate charge
    const charge = parseFloat(((service.rate * quantity) / 1000).toFixed(4));

    // Check user balance
    const user = await User.findById(req.user._id);
    if (user.balance < charge) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: $${charge.toFixed(2)}, Available: $${user.balance.toFixed(2)}`
      });
    }

    // Send order to SMM provider
    let providerOrderId = null;
    let orderStatus = 'Pending';

    try {
      const providerResponse = await smmProvider.createOrder({
        serviceId: service.providerServiceId,
        link,
        quantity
      });

      if (providerResponse.order) {
        providerOrderId = String(providerResponse.order);
        orderStatus = 'In progress';
        logger.info(`Order sent to provider. Provider ID: ${providerOrderId}`);
      } else if (providerResponse.error) {
        throw new Error(providerResponse.error);
      }
    } catch (providerError) {
      logger.error('Provider order error (order saved as Pending):', providerError);
      // We still create the order but mark it for retry
    }

    // Deduct balance
    const balanceBefore = user.balance;
    user.balance = parseFloat((user.balance - charge).toFixed(4));
    user.totalSpent = parseFloat((user.totalSpent + charge).toFixed(4));
    await user.save();

    // Create order
    const order = await Order.create({
      user: user._id,
      service: service._id,
      serviceSnapshot: {
        name: String(service.name),
        category: String(service.category),
        type: String(service.type),
         providerServiceId: String(service.providerServiceId)
      },
      link,
      quantity,
      charge,
      status: orderStatus,
      providerOrderId
    });

    // Record transaction
    await Transaction.create({
      user: user._id,
      type: 'order_charge',
      amount: -charge,
      balanceBefore,
      balanceAfter: user.balance,
      description: `Order #${order._id} - ${service.name}`,
      orderId: order._id
    });

    logger.info(`Order created: ${order._id} by user ${user.email}`);

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Fetch live status from provider if has providerOrderId
    if (order.providerOrderId) {
      try {
        const providerStatus = await smmProvider.getOrderStatus(order.providerOrderId);
        if (providerStatus.status) {
          order.status = providerStatus.status;
          order.startCount = providerStatus.start_count || order.startCount;
          order.remains = providerStatus.remains || order.remains;
          await order.save();
        }
      } catch (e) {
        logger.warn('Could not fetch live order status:', e.message);
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all orders
// @route   GET /api/orders/admin/all
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) filter.user = req.query.userId;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrder, getAllOrders };
