require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Rutas importadas
const pizzaRoutes = require("./src/routes/pizzas");
const userRoutes = require("./src/routes/users");
const orderRoutes = require("./src/routes/orders");
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/adminroutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://mipipizza.com"], // Permitir conexiones desde el frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// 📌 Middleware global
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173","https://mipipizza.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 📌 Inyectar `io` en las rutas
app.use((req, res, next) => {
  req.io = io; // Hacer disponible `io` para todos los controladores
  next();
});

// 📌 WebSockets: Manejo de eventos
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  // 📌 Escuchar eventos de actualización de pedidos
  socket.on("updateOrder", (order) => {
    console.log("📢 Pedido actualizado:", order);
    io.emit("orderUpdated", order); // Notificar a todos los clientes conectados
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// 📌 Rutas de la API
app.use("/pizzas", pizzaRoutes); // Rutas para gestionar pizzas
app.use("/users", userRoutes); // Rutas para gestionar usuarios
app.use("/orders", orderRoutes); // Rutas para gestionar pedidos
app.use("/auth", authRoutes); // Rutas para autenticación
app.use("/admin", adminRoutes); // Rutas para funcionalidades administrativas

const PORT = process.env.PORT || 5000;

// 📌 Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🟢 Conectado a MongoDB"))
  .catch((error) => {
    console.error("🔴 Error al conectar a MongoDB:", error.message);
    process.exit(1);
  });

// 📌 Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de la pizzería funcionando 🍕");
});

// 📌 Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

// 📌 Iniciar servidor con WebSockets activados
server.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
