const mongoose = require("mongoose");

const pizzaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ingredientes: [String],
  precio: { type: Number, required: true },
  disponible: { type: Boolean, default: true },
});

module.exports = mongoose.model("Pizza", pizzaSchema);
