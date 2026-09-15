const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');

router.post('/categorias', categoryController.createCategory);
router.get('/categorias', categoryController.getCategories);

module.exports = router;