const express = require('express');
const { getStats, getUsers, updateUser, addBalance } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.post('/users/:id/add-balance', addBalance);

module.exports = router;
