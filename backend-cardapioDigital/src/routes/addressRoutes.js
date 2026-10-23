const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

router.get("/cliente/enderecos", addressController.getClientAddress);
router.post("/cliente/enderecos", addressController.createAddress);
router.put("/cliente/enderecos/:id", addressController.updateAddress);
router.delete("/cliente/enderecos/:id", addressController.deleteAddress);

module.exports = router;
