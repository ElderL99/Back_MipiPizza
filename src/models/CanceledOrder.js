const mongoose = require("mongoose");

const canceledOrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  total: { type: Number, required: true },
  cartItems: { type: Array, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  canceledAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CanceledOrder", canceledOrderSchema);
