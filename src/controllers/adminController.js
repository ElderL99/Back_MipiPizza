const Order = require("../models/Order"); // Modelo de pedidos activos
const CompletedOrder = require("../models/CompletedOrder"); // Modelo de pedidos completados
const CanceledOrder = require("../models/CanceledOrder"); // Modelo de pedidos cancelados

// Obtener todos los pedidos activos
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find(); // Recupera todos los pedidos
    console.log("Pedidos obtenidos del backend:", JSON.stringify(orders, null, 2)); // Imprime los pedidos en formato legible
    res.json({ orders });
  } catch (error) {
    console.error("Error al obtener los pedidos:", error.message);
    res.status(500).json({ message: "Error al obtener los pedidos." });
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

// 📌 Mover pedido a la colección de completados
const markAsPaid = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Crear una nueva entrada en `completedOrders`
    await CompletedOrder.create({
      customerName: order.customerName,
      address: order.address,
      phone: order.phone,
      paymentMethod: order.paymentMethod,
      total: order.total,
      cartItems: order.cartItems,
      userId: order.userId,
    });

    // Eliminar la orden de la colección `orders`
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: "Pedido marcado como pagado y movido a completados" });
  } catch (error) {
    console.error("Error al marcar como pagado:", error);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};

// 📌 Cancelar pedido y moverlo a `canceledOrders`
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log("Cancelando pedido con ID:", orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      console.log("Pedido no encontrado.");
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    console.log("Pedido encontrado:", order);

    await CanceledOrder.create({
      customerName: order.customerName,
      address: order.address,
      phone: order.phone,
      paymentMethod: order.paymentMethod,
      total: order.total,
      cartItems: order.cartItems,
      userId: order.userId,
      canceledAt: new Date(),
    });

    console.log("Pedido movido a canceledOrders.");

    await Order.findByIdAndDelete(orderId);
    console.log("Pedido eliminado de orders.");

    req.io.emit("orderDeleted", { _id: orderId });
    res.status(200).json({ message: "Orden cancelada correctamente" });
  } catch (error) {
    console.error("Error al cancelar el pedido:", error.message);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};




// 📌 Obtener ventas totales desde la colección `CompletedOrder`
// 📌 Obtener ventas totales junto con los pedidos completados
const getTotalSales = async (req, res) => {
  try {
    // Obtener todos los pedidos completados
    const completedOrders = await CompletedOrder.find().sort({ completedAt: -1 });

    // Calcular total de ventas y número de pedidos
    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = completedOrders.length;

    console.log("📢 Pedidos enviados al frontend:", completedOrders); // Debug

    res.json({
      totalSales,
      totalOrders,
      orders: completedOrders, // 🔥 Enviamos los pedidos completos al frontend
    });
  } catch (error) {
    console.error("❌ Error al obtener ventas:", error);
    res.status(500).json({ message: "Error al obtener el reporte de ventas" });
  }
};

// 📌 Obtener todos los pedidos cancelados
const getCanceledOrders = async (req, res) => {
  try {
    const canceledOrders = await CanceledOrder.find().sort({ canceledAt: -1 });

    res.json({ totalCanceled: canceledOrders.length, canceledOrders });
  } catch (error) {
    console.error("Error obteniendo pedidos cancelados:", error);
    res.status(500).json({ message: "Error al obtener pedidos cancelados" });
  }
};

// Crear un nuevo pedido
const createOrder = async (req, res) => {
  try {
    const { customerName, address, phone, paymentMethod, cartItems } = req.body;

    const order = new Order({
      customerName,
      address,
      phone,
      paymentMethod,
      total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
      cartItems: cartItems.map((item) => ({
        ...item,
        isCustom: item.ingredients && item.ingredients.length > 0, // Define si la pizza es personalizada
      })),
      userId: req.user._id,
    });

    await order.save();

    // 📌 EMITIR EVENTO WEBSOCKET PARA QUE EL ADMIN VEA NUEVOS PEDIDOS
    req.io.emit("newOrder", order);

    res.status(201).json(order);
  } catch (error) {
    console.error("Error al crear el pedido:", error.message);
    res.status(500).json({ message: "Error al crear el pedido." });
  }
};


module.exports = {
  getAllOrders,
  updateOrderStatus,
  markAsPaid,
  cancelOrder,
  getTotalSales,
  getCanceledOrders,
  createOrder,
};
