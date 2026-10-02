const express = require('express');
const router = express.Router();
const verifyAdminToken = require("../middlewares/authMiddleware");

const deliveryController = require('../controllers/deliveryController');

//rota publica pra consultar bairo no checkout (usar o req.query apenasAtivo=true para listar ativos)
router.get('/bairros', deliveryController.getNeighborhood);

//rotas para admin aq
router.post('/bairros', verifyAdminToken, deliveryController.createNeighborhood);
router.put('/bairros/:id', verifyAdminToken, deliveryController.updateNeighborhood);

module.exports = router;