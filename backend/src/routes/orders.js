const express = require('express');
const { body } = require('express-validator');
const { createOrder, getOrders, getOrder, getAllOrders } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getOrders);
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/:id', getOrder);

router.post('/', [
  body('serviceId').notEmpty().withMessage('Service ID required'),
  body('link').trim().notEmpty().withMessage('Link is required').isURL().withMessage('Valid URL required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
], createOrder);

module.exports = router;
