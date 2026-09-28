const express = require('express');
const router = express.Router;
const promoController = require('../controllers/promoController');
const multer = require('multer');

const upload = multer({storage: multer.memoryStorage()});

router.get('/promo',promoController.getPromos);
router.post('/promo', upload.single('imagem'), promoController.createPromo);

module.exports = router;