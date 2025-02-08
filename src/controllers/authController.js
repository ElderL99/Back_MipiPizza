const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Registro de usuarios
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ message: "El email y la contraseña son obligatorios" });
    }

    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || "user", // Rol por defecto: "user"
    });

    await newUser.save();

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error en el registro:", error.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Inicio de sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ message: "El email y la contraseña son obligatorios" });
    }

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Generar un token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d", // Expira en 1 día
    });

    res.json({ 
      message: "Inicio de sesión exitoso", 
      token, 
      user: { id: user._id, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Verificar token y obtener información del usuario
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error al verificar el token:", error.message);
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};
