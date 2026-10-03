const express = require('express');
const router = express.Router();
const verifyAdminToken = require('../middlewares/authMiddleware');

const categoryController = require('../controllers/categoryController');

router.post("/categorias", verifyAdminToken, categoryController.createCategory);
router.get('/categorias', categoryController.getCategories);
router.put("/categorias/:id", verifyAdminToken, categoryController.updateCategory);
router.delete("/categorias/:id", verifyAdminToken, categoryController.deleteCategory);
module.exports = router;