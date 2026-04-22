const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'Telegram', 'Spotify', 'Other'],
    default: 'Other'
  },
  type: {
    type: String,
    required: true,
    trim: true // e.g. "Followers", "Views", "Likes", "Comments"
  },
  providerServiceId: {
    type: String,
    required: true // ID from the external SMM API
  },
  // Provider cost per 1000
  providerRate: {
    type: Number,
    required: true,
    min: 0
  },
  // Our selling price per 1000
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  minOrder: {
    type: Number,
    required: true,
    default: 100
  },
  maxOrder: {
    type: Number,
    required: true,
    default: 100000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  dripFeed: {
    type: Boolean,
    default: false
  },
  refill: {
    type: Boolean,
    default: false
  },
  cancel: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
