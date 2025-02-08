const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const { getAllOrders, updateOrderStatus } = require("../controllers/adminController");

// Obtener todos los pedidos (Solo administradores)
router.get("/orders", verifyAdmin, getAllOrders);

// Actualizar el estado de un pedido (Solo administradores)
router.put("/orders/:id", verifyAdmin, updateOrderStatus);

module.exports = router;
