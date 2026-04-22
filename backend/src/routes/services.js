const express = require('express');
const { body } = require('express-validator');
const {
  getServices, getService, createService, updateService, deleteService, getAllServicesAdmin
} = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getServices);
router.get('/admin/all', protect, adminOnly, getAllServicesAdmin);
router.get('/:id', getService);

router.post('/', protect, adminOnly, [
  body('name').trim().notEmpty(),
  body('category').isIn(['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'Telegram', 'Spotify', 'Other']),
  body('type').trim().notEmpty(),
  body('providerServiceId').trim().notEmpty(),
  body('providerRate').isFloat({ min: 0 }),
  body('rate').isFloat({ min: 0 }),
  body('minOrder').isInt({ min: 1 }),
  body('maxOrder').isInt({ min: 1 })
], createService);

router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;
