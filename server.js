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
    origin: ["http://localhost:5173", "https://mipipizza.com", "https://www.mipipizza.com/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// 📌 Middleware global
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://mipipizza.com", "https://www.mipipizza.com/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 📌 Inyectar `io` en todas las rutas
app.set("io", io);

// 📌 WebSockets: Manejo de eventos en tiempo real
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  // 📢 Emitir cuando un pedido se actualiza
  socket.on("updateOrder", (order) => {
    console.log("📢 Pedido actualizado:", order);
    io.emit("orderUpdated", order); // Notificar a todos los clientes
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// 📌 Rutas de la API
app.use("/pizzas", pizzaRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes); // 📢 Esta ruta emitirá `newOrder`
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

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
