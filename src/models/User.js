const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "El correo electrónico es obligatorio"],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Por favor, introduce un correo electrónico válido",
    ], // Validación de formato de correo electrónico
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"], // Longitud mínima de la contraseña
  },
  role: {
    type: String,
    enum: ["user", "admin"], // Restringe los valores posibles para el rol
    default: "user", // Por defecto, será "user"
  },
  cart: {
    type: Map, // Cambiado de Object a Map para un manejo más flexible
    of: Number, // Cada clave será un ID de producto y el valor será la cantidad
    default: {}, // El carrito comienza vacío
  },
  createdAt: {
    type: Date,
    default: Date.now, // Fecha de creación del usuario
  },
});

module.exports = mongoose.model("User", userSchema);
