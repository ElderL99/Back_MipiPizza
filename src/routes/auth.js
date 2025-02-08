const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Ruta de inicio de sesión
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que los campos estén presentes
    if (!email || !password) {
      return res.status(400).json({ message: "Por favor, ingresa el email y la contraseña" });
    }

    // Buscar al usuario en la base de datos
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Comparar la contraseña ingresada con la almacenada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d", // El token expira en 1 día
    });

    // Enviar el token y los datos del usuario
    res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


// Ruta de registro
router.post("/register", async (req, res) => {
    try {
      const { email, password, role } = req.body;
  
      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son obligatorios" });
      }
  
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }
  
      // Cifrar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Crear el usuario
      const newUser = new User({
        email,
        password: hashedPassword,
        role: role || "user",
      });
  
      // Guardar en la base de datos
      await newUser.save();
      res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
      console.error("Error al registrar:", error.message);
      res.status(500).json({ message: "Error en el servidor" });
    }
  });

module.exports = router;
