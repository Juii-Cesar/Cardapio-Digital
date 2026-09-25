const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/pedidos', orderController.createOrder);
router.get('/pedidos', orderController.getOrders);
router.put('/pedidos/:id/status', orderController.updateOrderStatus);

module.exports = router;