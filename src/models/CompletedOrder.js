const mongoose = require("mongoose");

const completedOrderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, enum: ["cash", "transfer"], required: true },
    total: { type: Number, required: true },
    cartItems: [
      {
        name: { type: String, required: true },
        size: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        ingredients: { type: [String], default: [] },
        sauce: { type: String, default: "Salsa de Tomate" },
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: { type: Date, default: Date.now }, // Fecha de pago
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompletedOrder", completedOrderSchema);
