const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Ruta de inicio de sesión
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Crear token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Enviar respuesta con `name` incluido
    res.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id,
        name: user.name,  // 🔹 Asegurar que `name` se envía
        email: user.email,
        role: user.role,
      },
      token,
    });

  } catch (error) {
    console.error("🔥 Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});



// Ruta de registro
router.post("/register", async (req, res) => {
  try {
    console.log("📥 Datos recibidos en /register:", req.body);

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "El nombre, email y contraseña son obligatorios" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name, // <-- Asegurar que name se guarda en la base de datos
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    // **Devolver el usuario con el nombre en la respuesta**
    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: {
        id: newUser._id,
        name: newUser.name,  // <-- Asegurar que el frontend recibe el nombre
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error("🔥 Error al registrar usuario:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});



module.exports = router;
