const jwt = require("jsonwebtoken");

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. No hay token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Asignar el ID del usuario a la solicitud
    req.role = decoded.role; // Asignar el rol del usuario a la solicitud
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido." });
  }
};

// Middleware para verificar el rol de administrador
const verifyAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
