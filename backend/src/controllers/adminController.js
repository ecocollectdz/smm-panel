const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Service = require('../models/Service');
const logger = require('../utils/logger');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalOrders, totalServices, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email')
    ]);

    // Revenue calculation
    const revenueAgg = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Order status breakdown
    const orderStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalServices,
        totalRevenue,
        orderStats,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { role: 'user' };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (balance, status, etc.)
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { balance, isActive, role } = req.body;
    const updateData = {};

    if (balance !== undefined) updateData.balance = balance;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role !== undefined) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info(`Admin updated user ${user.email}`);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually add balance to user
// @route   POST /api/admin/users/:id/add-balance
const addBalance = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const balanceBefore = user.balance;
    user.balance = parseFloat((user.balance + amount).toFixed(4));
    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount,
      balanceBefore,
      balanceAfter: user.balance,
      description: description || `Manual deposit by admin`,
      status: 'completed'
    });

    logger.info(`Admin added $${amount} to user ${user.email}`);
    res.json({ success: true, user, message: `$${amount} added to ${user.name}` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, updateUser, addBalance };
