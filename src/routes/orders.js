const express = require("express");
const Order = require("../models/Order");
const CanceledOrder = require("../models/CanceledOrder"); // Modelo de pedidos cancelados
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Crear un nuevo pedido y emitir evento en tiempo real
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      customerName,
      address,
      references,
      phone,
      paymentMethod,
      total,
      cartItems,
      status,
    } = req.body;

    if (!customerName || !address || !phone || !paymentMethod || !total || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Todos los campos son obligatorios, y el carrito no puede estar vacío." });
    }

    const newOrder = new Order({
      customerName,
      address,
      references: references || "",
      phone,
      paymentMethod,
      total,
      cartItems,
      status: status || "En preparación",
      userId: req.userId,
    });

    const savedOrder = await newOrder.save();

    // 📢 Emitir evento de nuevo pedido
    const io = req.app.get("io");
    io.emit("newOrder", savedOrder);

    res.status(201).json({ message: "Pedido creado exitosamente", order: savedOrder });
  } catch (error) {
    console.error("❌ Error al crear el pedido:", error.message);
    res.status(500).json({ message: "Error interno del servidor al crear el pedido." });
  }
});

// 📌 Obtener todos los pedidos del usuario autenticado
router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error.message);
    res.status(500).json({ message: "Error al obtener pedidos." });
  }
});

// 📌 Verificar si el usuario tiene un pedido activo
router.get("/active-order", verifyToken, async (req, res) => {
  try {
    const activeOrder = await Order.findOne({ userId: req.userId, status: { $ne: "Entregado" } });

    res.status(200).json({
      hasActiveOrder: !!activeOrder,
      order: activeOrder || null,
    });
  } catch (error) {
    console.error("❌ Error al verificar pedido activo:", error.message);
    res.status(500).json({ message: "Error al verificar pedido activo." });
  }
});

// 📌 Actualizar el estado de un pedido y emitir evento en tiempo real
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "El estado es obligatorio." });

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!updatedOrder) return res.status(404).json({ message: "Pedido no encontrado." });

    // 📢 Emitir el evento de actualización de pedido
    const io = req.app.get("io");
    io.emit("orderUpdated", updatedOrder);

    res.json({ message: "Estado del pedido actualizado correctamente.", order: updatedOrder });
  } catch (error) {
    console.error("❌ Error al actualizar el pedido:", error.message);
    res.status(500).json({ message: "Error al actualizar el pedido." });
  }
});

// 📌 Eliminar un pedido y moverlo a `canceledOrders`
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });

    if (!order) return res.status(404).json({ message: "Pedido no encontrado o no autorizado." });

    // Mover el pedido a la colección de cancelados
    await CanceledOrder.create({
      ...order.toObject(),
      status: "Cancelado",
      canceledAt: new Date(),
    });

    // Eliminar el pedido de la colección principal
    await Order.findByIdAndDelete(req.params.id);

    // 📢 Emitir evento de pedido eliminado
    const io = req.app.get("io");
    io.emit("orderDeleted", order);

    res.status(200).json({ message: "Pedido cancelado y movido a cancelados." });
  } catch (error) {
    console.error("❌ Error al cancelar el pedido:", error.message);
    res.status(500).json({ message: "Error al cancelar el pedido." });
  }
});

// 📌 Cancelar un pedido y actualizar su estado
router.put("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, userId: req.userId });

    if (!order) return res.status(404).json({ message: "Pedido no encontrado o no autorizado." });

    // Cambiar estado a "Cancelado"
    order.status = "Cancelado";
    await order.save();

    // 📢 Emitir evento de cancelación de pedido
    const io = req.app.get("io");
    io.emit("orderUpdated", order);

    res.status(200).json({ message: "Pedido cancelado correctamente.", order });
  } catch (error) {
    console.error("❌ Error al cancelar el pedido:", error.message);
    res.status(500).json({ message: "Error al cancelar el pedido." });
  }
});

module.exports = router;
