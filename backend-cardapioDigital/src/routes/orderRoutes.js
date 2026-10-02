const express = require('express');
const router = express.Router();
const verifyAdminToken = require("../middlewares/authMiddleware");

const orderController = require('../controllers/orderController');

router.post('/pedidos', orderController.createOrder);
router.get('/pedidos',verifyAdminToken, orderController.getOrders);
router.put('/pedidos/:id/status',verifyAdminToken, orderController.updateOrderStatus);

module.exports = router;