const express = require("express");
const Order = require("../models/Order");

const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

// Crear un nuevo pedido (protegido)
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

    if (
      !customerName ||
      !address ||
      !phone ||
      !paymentMethod ||
      !total ||
      !cartItems ||
      cartItems.length === 0
    ) {
      return res.status(400).json({
        message:
          "Todos los campos son obligatorios, y el carrito no puede estar vacío",
      });
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
      userId: req.userId, // Relación con el usuario autenticado
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: "Pedido creado exitosamente",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error al crear el pedido:", error.message);
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear el pedido" });
  }
});

// Obtener todos los pedidos del usuario autenticado (protegido)
router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }); // Filtrar por usuario
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error al obtener pedidos:", error.message);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
});

// Verificar si el usuario tiene un pedido activo
router.get("/active-order", verifyToken, async (req, res) => {
  try {
    const activeOrder = await Order.findOne({
      userId: req.userId,
      status: { $ne: "Entregado" }, // Consideramos activo si no está entregado
    });

    if (activeOrder) {
      return res.status(200).json({ hasActiveOrder: true, order: activeOrder });
    } else {
      return res.status(200).json({ hasActiveOrder: false });
    }
  } catch (error) {
    console.error("Error al verificar pedido activo:", error.message);
    res.status(500).json({ message: "Error al verificar pedido activo" });
  }
});

// Actualizar el estado de un pedido (protegido)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "El estado es obligatorio" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    res.json({
      message: "Estado del pedido actualizado correctamente",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error al actualizar el pedido:", error.message);
    res.status(500).json({ message: "Error al actualizar el pedido" });
  }
});

// Eliminar un pedido (protegido)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId, // Verificar usuario
    });
    if (!order) {
      return res
        .status(404)
        .json({ message: "Pedido no encontrado o no autorizado" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el pedido:", error.message);
    res.status(500).json({ message: "Error al eliminar el pedido" });
  }
});

module.exports = router;
