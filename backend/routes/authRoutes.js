const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { sendWelcomeEmail } = require("../config/mailer");

// Middleware para debugging
router.use((req, res, next) => {
  console.log("🔐 Auth Route:", {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers,
  });
  next();
});

// Ruta de registro
router.post("/register", async (req, res) => {
  const pool = req.app.locals.pool;
  console.log("📝 Datos recibidos:", req.body);

  try {
    const { nombre, correo, contraseña } = req.body;

    // Validaciones
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
    }

    // Verificar si el correo ya existe
    const [existingUsers] = await pool
      .promise()
      .query("SELECT id FROM usuarios WHERE correo = ?", [correo]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este correo ya está registrado",
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar nuevo usuario
    const [result] = await pool
      .promise()
      .query(
        "INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)",
        [nombre, correo, hashedPassword]
      );

    // Enviar correo de bienvenida
    try {
      await sendWelcomeEmail(correo, nombre);
    } catch (emailError) {
      console.error("Error al enviar correo de bienvenida:", emailError);
      // Continuamos aunque falle el envío del correo
    }

    res.status(200).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: { nombre, correo },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
    });
  }
});

// Ruta de login
router.post("/login", async (req, res) => {
  const pool = req.app.locals.pool;
  console.log("🔑 Intento de login para:", req.body.correo);

  try {
    const { correo, contraseña } = req.body;

    // Validaciones
    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: "Correo y contraseña son requeridos",
      });
    }

    // Buscar usuario
    const [users] = await pool
      .promise()
      .query(
        "SELECT id, nombre, correo, contraseña FROM usuarios WHERE correo = ?",
        [correo]
      );

    console.log("🔍 Usuario encontrado:", users.length > 0);

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const user = users[0];
    console.log("👤 Verificando contraseña para usuario:", user.correo);

    // Verificar contraseña
    const isValid = await bcrypt.compare(contraseña, user.contraseña);
    console.log("🔐 Contraseña válida:", isValid);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    // Login exitoso
    console.log("✅ Login exitoso para:", user.correo);

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
