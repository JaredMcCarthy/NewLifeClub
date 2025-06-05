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
  });
  next();
});

// Función para crear tabla de usuarios si no existe
const createUsersTable = async (pool) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        correo VARCHAR(255) UNIQUE NOT NULL,
        contraseña VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabla usuarios verificada/creada");
  } catch (error) {
    console.error("❌ Error creando tabla usuarios:", error);
  }
};

// Ruta de registro
router.post("/register", async (req, res) => {
  const pool = req.app.locals.pool;
  console.log("📝 Datos recibidos:", req.body);

  try {
    // Crear tabla si no existe
    await createUsersTable(pool);

    const { nombre, correo, contraseña } = req.body;

    // Validaciones
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
    }

    // Verificar si el correo ya existe
    const existingUser = await pool.query(
      "SELECT id FROM usuarios WHERE correo = $1",
      [correo]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este correo ya está registrado",
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar nuevo usuario
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, correo, contraseña) VALUES ($1, $2, $3) RETURNING id, nombre, correo",
      [nombre, correo, hashedPassword]
    );

    // Enviar correo de bienvenida
    try {
      await sendWelcomeEmail(correo, nombre);
      console.log("✅ Correo de bienvenida enviado");
    } catch (emailError) {
      console.error("❌ Error al enviar correo de bienvenida:", emailError);
      // Continuamos aunque falle el envío del correo
    }

    res.status(200).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: result.rows[0],
      redirect: "/index.html", // Agregar redirección
    });
  } catch (error) {
    console.error("❌ Error en registro:", error);
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
    // Crear tabla si no existe
    await createUsersTable(pool);

    const { correo, contraseña } = req.body;

    // Validaciones
    if (!correo || !contraseña) {
      console.log("❌ Faltan campos: correo o contraseña");
      return res.status(400).json({
        success: false,
        message: "Correo y contraseña son requeridos",
      });
    }

    console.log("🔍 Buscando usuario en BD...");

    // Buscar usuario
    const result = await pool.query(
      "SELECT id, nombre, correo, contraseña FROM usuarios WHERE correo = $1",
      [correo]
    );

    console.log("🔍 Resultado de búsqueda:", {
      found: result.rows.length > 0,
      email: correo,
    });

    if (result.rows.length === 0) {
      console.log("❌ Usuario no encontrado para:", correo);
      return res.status(400).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const user = result.rows[0];
    console.log("👤 Usuario encontrado:", {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
    });

    // Verificar contraseña
    const isValid = await bcrypt.compare(contraseña, user.contraseña);
    console.log("🔐 Verificación de contraseña:", {
      isValid,
      providedLength: contraseña.length,
      hashedLength: user.contraseña.length,
    });

    if (!isValid) {
      console.log("❌ Contraseña incorrecta para:", correo);
      return res.status(400).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    // Actualizar último acceso
    await pool.query(
      "UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    );

    // Login exitoso - crear token simple
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    console.log("✅ Login exitoso para:", user.correo);

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
      },
      token: token,
      expiresIn: 5 * 60 * 1000, // 5 minutos en milliseconds
      redirect: "/index.html",
    });
  } catch (error) {
    console.error("❌ Error detallado en login:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Error interno del servidor",
    });
  }
});

module.exports = router;
