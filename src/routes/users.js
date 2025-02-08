const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// **Actualizar el carrito del usuario**
router.put("/cart", verifyToken, async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || typeof cart !== "object") {
      return res.status(400).json({ message: "El carrito no puede estar vacío y debe ser un objeto válido." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { cart },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    console.log("Carrito actualizado en la base de datos:", updatedUser.cart);
    res.status(200).json({
      message: "Carrito actualizado exitosamente.",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error("Error al actualizar el carrito:", error.message);
    res.status(500).json({ message: "Error interno del servidor al actualizar el carrito." });
  }
});

// **Obtener el carrito del usuario**
router.get("/cart", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    console.log("Carrito del usuario:", user.cart); // Agrega este log
    res.status(200).json({ cart: user.cart || {} });
  } catch (error) {
    console.error("Error al obtener el carrito:", error.message);
    res.status(500).json({ message: "Error interno del servidor al obtener el carrito." });
  }
});


// **Crear un nuevo usuario**
router.post("/", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });

    await newUser.save();

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error al crear el usuario:", error.message);
    res.status(500).json({ message: "Error al crear el usuario." });
  }
});

// **Actualizar un usuario**
router.put("/:id", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email && !role) {
      return res.status(400).json({ message: "No se proporcionaron campos para actualizar." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { email, role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar el usuario:", error.message);
    res.status(500).json({ message: "Error al actualizar el usuario." });
  }
});

// **Eliminar un usuario**
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error.message);
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }
});

module.exports = router;
