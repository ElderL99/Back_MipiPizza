const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    references: { type: String },
    phone: { type: String, required: true },
    paymentMethod: { type: String, enum: ["cash", "transfer"], required: true },
    total: { type: Number, required: true },

    cartItems: [
      {
        name: { type: String, required: true },
        size: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        ingredients: { type: [String], default: [] }, // Ingredientes personalizados
        sauce: { type: String, default: "Salsa de Tomate" }, // Salsa predeterminada
        isCustom: { type: Boolean, default: false }, // Indica si es una pizza personalizada
      },
    ],

    status: {
      type: String,
      enum: ["En preparación", "En camino", "Entregado", "Cancelado"],
      default: "En preparación",
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 📌 Registrar quién canceló el pedido (admin o cliente)
    canceledBy: { type: String, enum: ["admin", "cliente", null], default: null },
  },
  { timestamps: true } // Agregar automáticamente createdAt y updatedAt
);

module.exports = mongoose.model("Order", orderSchema);
