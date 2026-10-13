const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/cliente/login', authController.loginCliente);
router.post('/cliente/cadastro', authController.createCliente);
router.post("/cliente/recuperar-pergunta", authController.getPerguntaSecreta);
router.post("/cliente/redefinir-senha",authController.resetPasswordWithPergunta);

module.exports=router;