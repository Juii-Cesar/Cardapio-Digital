const express = require('express');
const router = express.Router();
const multer = require('multer');

const productController = require('../controllers/productController');

const upload  = multer({storage: multer.memoryStorage()});

router.get('/produtos', productController.getProducts);
router.post('/produtos', upload.single('imagem'), productController.createProduct);

module.exports = router;