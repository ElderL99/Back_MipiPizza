const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const {
  getAllOrders,
  updateOrderStatus,
  markAsPaid, // 📌 Nueva función para marcar pedidos como pagados
  cancelOrder, // 📌 Nueva función para cancelar pedidos
  getTotalSales, // 📌 Nueva función para obtener ventas totales
  getCanceledOrders, // 📌 Nueva función para obtener pedidos cancelados
} = require("../controllers/adminController");

// 📌 Obtener todos los pedidos activos (Solo administradores)
router.get("/orders", verifyToken, verifyAdmin, getAllOrders);

// 📌 Actualizar el estado de un pedido (Solo administradores)
router.put("/orders/:id", verifyToken, verifyAdmin, updateOrderStatus);

// 📌 Marcar pedido como pagado y mover a completados (Solo administradores)
router.put("/orders/:id/markAsPaid", verifyToken, verifyAdmin, markAsPaid);

// 📌 Cancelar pedido y mover a cancelados (Solo administradores)
router.put("/orders/:id/cancel", verifyToken, verifyAdmin, cancelOrder);

// 📌 Obtener el total de ventas desde pedidos completados (Solo administradores)
router.get("/sales", verifyToken, verifyAdmin, getTotalSales);

// 📌 Obtener todos los pedidos cancelados (Solo administradores)
router.get("/canceled-orders", verifyToken, verifyAdmin, getCanceledOrders);

module.exports = router;
