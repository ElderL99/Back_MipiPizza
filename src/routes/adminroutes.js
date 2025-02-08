const express = require("express");
const router = express.Router();

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware"); // Asegúrate de usar la ruta correcta al middleware
const { getAllOrders, updateOrderStatus } = require("../controllers/adminController");

// Obtener todos los pedidos (Solo administradores)
router.get("/orders", verifyToken, verifyAdmin, getAllOrders);

// Actualizar el estado de un pedido (Solo administradores)
router.put("/orders/:id", verifyToken, verifyAdmin, updateOrderStatus);

module.exports = router;
