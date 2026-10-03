const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const verifyAdminToken = require("../middlewares/authMiddleware");

// Qualquer um pode ver se a loja tá aberta/fechada, pegar o whatsapp e o pix
router.get("/loja/config", shopController.getShopConfig);

// Apenas Admin com Token pode alterar as configurações
router.put("/loja/config", verifyAdminToken, shopController.updateShopConfig);

module.exports = router;
