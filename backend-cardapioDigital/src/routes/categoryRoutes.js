const express = require('express');
const router = express.Router();
const verifyAdminToken = require('../middlewares/authMiddleware');

const categoryController = require('../controllers/categoryController');

router.post("/categorias", verifyAdminToken, categoryController.createCategory);
router.get('/categorias', categoryController.getCategories);

module.exports = router;