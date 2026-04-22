const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  // Snapshot data at time of order
  serviceSnapshot: {
    name: { type: String, default: '' },
    category: { type: String, default: '' },
    type: { type: String, default: '' },
    providerServiceId: { type: String, default: '' }
  },
  link: {
    type: String,
    required: [true, 'Link is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  charge: {
    type: Number,
    required: true,
    min: 0
  },
  // Order status from provider
  status: {
    type: String,
    enum: ['Pending', 'In progress', 'Completed', 'Partial', 'Canceled', 'Failed'],
    default: 'Pending'
  },
  providerOrderId: {
    type: String,
    default: null
  },
  startCount: {
    type: Number,
    default: 0
  },
  remains: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ providerOrderId: 1 });

module.exports = mongoose.model('Order', orderSchema);
