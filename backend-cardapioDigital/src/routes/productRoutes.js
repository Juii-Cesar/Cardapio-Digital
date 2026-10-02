const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyAdminToken = require("../middlewares/authMiddleware");

const productController = require('../controllers/productController');

const upload  = multer({storage: multer.memoryStorage()});

router.get('/produtos', productController.getProducts);
router.post('/produtos',verifyAdminToken, upload.single('imagem'), productController.createProduct);
router.put('/produtos/:id',verifyAdminToken, productController.updateProduct);
router.delete('/produtos/:id',verifyAdminToken, productController.deleteProduct);
module.exports = router;