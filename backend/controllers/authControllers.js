const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../config/mailer");
require("dotenv").config();

// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;
  console.log("📥 Datos recibidos en login:", { correo });

  console.log(
    "🔐 JWT_SECRET cargando:",
    process.env.JWT_SECRET ? "✅ Cargado" : "❌ No encontrado"
  );

  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [
      correo,
    ]);
    if (rows.length === 0) {
      console.log("❌ Usuario no encontrado");
      return res.status(401).json({ error: "Correo no registrado" });
    }

    const user = rows[0];
    console.log("🔍 Comparando contraseña con hash:", user.contraseña);
    const match = await bcrypt.compare(contraseña, user.contraseña);

    if (!match) {
      console.log("❌ Contraseña incorrecta");
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("✅ Token generado para usuario:", user.id);
    res.json({ token });
  } catch (err) {
    console.error("❌ Error en login controller:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// ==============================
// REGISTRO
// ==============================
exports.register = async (req, res) => {
  console.log("📨 Datos recibidos:", req.body);

  const { nombre, correo, contraseña } = req.body;

  // Validación de correo
  if (!correo.includes("@") || !correo.includes(".")) {
    return res.status(400).json({ error: "Correo inválido" });
  }

  // Validación de contraseña
  if (contraseña.length < 8) {
    return res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }

  try {
    const [exists] = await db.query(
      "SELECT * FROM `usuarios` WHERE `correo` = ?",
      [correo]
    );
    console.log("🔍 Resultado de búsqueda:", exists);

    if (exists.length > 0) {
      console.warn("⚠️ Correo ya registrado:", correo);
      return res.status(400).json({ error: "Correo ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    console.log("🔐 Contraseña hasheada:", hashedPassword);

    const [result] = await db.query(
      "INSERT INTO `usuarios` (`nombre`, `correo`, `contraseña`) VALUES (?, ?, ?)",
      [nombre, correo, hashedPassword]
    );

    console.log("✅ Registro exitoso, ID:", result.insertId);

    try {
      await sendWelcomeEmail(correo, nombre);
      console.log("📧 Correo de bienvenida enviado a:", correo);
    } catch (emailError) {
      console.error("❌ Error al enviar correo de bienvenida:", emailError);
      // Aún retornamos éxito en el registro pero notificamos del error en el correo
      return res.json({
        success: true,
        message:
          "Usuario registrado exitosamente, pero hubo un problema al enviar el correo de bienvenida",
        id: result.insertId,
        emailError: true,
      });
    }

    res.json({
      success: true,
      message: "Usuario registrado exitosamente",
      id: result.insertId,
    });
  } catch (err) {
    console.error("❌ Error en registro:", err);
    res
      .status(500)
      .json({ error: "Error al registrar usuario", details: err.message });
  }
};
