require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const pizzaRoutes = require("./src/routes/pizzas");
const userRoutes = require("./src/routes/users");
const orderRoutes = require("./src/routes/orders"); // Cambiado de "orserRoutes" a "orderRoutes"
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/adminroutes");


const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// Uso correcto de la ruta para órdenes
app.use("/pizzas", pizzaRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes); // Cambiado de "orserRoutes" a "orderRoutes"
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);


const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🟢 Conectado a MongoDB"))
  .catch((error) => {
    console.error("🔴 Error al conectar a MongoDB:", error.message);
    process.exit(1); // Salir si falla la conexión
  });

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de la pizzería funcionando 🍕");
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

// Iniciar servidor!
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
