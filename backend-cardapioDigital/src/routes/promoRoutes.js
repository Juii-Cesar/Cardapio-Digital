const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');
const multer = require('multer');
const verifyAdminToken = require("../middlewares/authMiddleware");

const upload = multer({storage: multer.memoryStorage()});

router.get('/promo', promoController.getPromos);
router.post('/promo', verifyAdminToken, upload.single('imagem'), promoController.createPromo);
router.put('/promo/:id',verifyAdminToken, promoController.updatePromo);
router.delete('/promo/:id',verifyAdminToken, promoController.deletePromo);

module.exports = router;