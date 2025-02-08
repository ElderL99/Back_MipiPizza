const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    references: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "transfer"],
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    cartItems: [
      {
        name: { type: String, required: true },
        size: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    status: {
      type: String,
      enum: ["En preparación", "En camino", "Entregado"],
      default: "En preparación",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Relación con el usuario
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
