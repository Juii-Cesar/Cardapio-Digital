const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/cliente/login',authController.loginCliente);
router.post('/cliente/cadastro',authController.createCliente);

module.exports=router;