const Order = require("../models/Order"); // Modelo de pedido

// Obtener todos los pedidos
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find(); // Buscar todos los pedidos
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los pedidos" });
  }
};

// Actualizar el estado del pedido
const updateOrderStatus = async (req, res) => {
  const { id } = req.params; // ID del pedido
  const { status } = req.body; // Nuevo estado

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    order.status = status; // Actualizar estado
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el estado del pedido" });
  }
};

module.exports = { getAllOrders, updateOrderStatus };
