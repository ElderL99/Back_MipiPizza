require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// 📌 Configuración de la aplicación
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// 📌 Dominios permitidos para CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://mipipizza.com",
  "https://www.mipipizza.com",
];

// 📌 Configuración de CORS
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

// 📌 Configurar WebSockets con CORS
const io = new Server(server, { cors: corsOptions });

// 📌 Middleware global
app.use(express.json({ limit: "10mb" })); // Evita payloads grandes en requests
app.use(cors(corsOptions));

// 📌 Inyectar `io` en todas las rutas
app.set("io", io);

// 📌 WebSockets: Manejo de eventos en tiempo real
io.on("connection", (socket) => {
  console.log(`🟢 Cliente conectado: ${socket.id}`);

  // 📢 Emitir cuando un pedido se actualiza
  socket.on("updateOrder", (order) => {
    if (order) {
      console.log(`📢 Pedido actualizado: ${order._id}`);
      io.emit("orderUpdated", order); // Notificar a todos los clientes
    }
  });

  // 📢 Emitir cuando se crea un nuevo pedido
  socket.on("newOrder", (order) => {
    if (order) {
      console.log(`🆕 Nuevo pedido recibido: ${order._id}`);
      io.emit("newOrder", order);
    }
  });

  // 📌 Manejo de desconexión del socket
  socket.on("disconnect", (reason) => {
    console.log(`🔴 Cliente desconectado: ${socket.id}, razón: ${reason}`);
  });
});

// 📌 Conectar a MongoDB con reintento automático
const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🟢 Conectado a MongoDB");
  } catch (error) {
    console.error(`🔴 Error al conectar a MongoDB: ${error.message}`);
    setTimeout(connectToDB, 5000); // Reintento tras 5 segundos
  }
};
connectToDB();

// 📌 Importar y usar rutas de la API
const pizzaRoutes = require("./src/routes/pizzas");
const userRoutes = require("./src/routes/users");
const orderRoutes = require("./src/routes/orders");
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/adminroutes");

app.use("/pizzas", pizzaRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

// 📌 Ruta de prueba
app.get("/", (req, res) => {
  res.send("🍕 API de la pizzería funcionando correctamente.");
});

// 📌 Manejo de errores global
app.use((err, req, res, next) => {
  console.error("❌ Error interno del servidor:", err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

// 📌 Iniciar servidor con WebSockets activados
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
