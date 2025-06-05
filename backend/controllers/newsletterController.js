const suscribirCorreo = async (req, res) => {
  console.log("📧 Solicitud de newsletter recibida");
  console.log("📥 Body:", req.body);

  try {
    const { correo } = req.body;
    const pool = req.app.locals.pool;

    if (!correo) {
      console.log("❌ Correo no proporcionado");
      return res.status(400).json({ mensaje: "El correo es requerido" });
    }

    if (!pool) {
      console.log("❌ Pool de base de datos no disponible");
      return res
        .status(500)
        .json({ mensaje: "Error de conexión a la base de datos" });
    }

    console.log("🔧 Creando tabla newsletter si no existe...");
    // Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter (
        id SERIAL PRIMARY KEY,
        correo VARCHAR(255) UNIQUE NOT NULL,
        fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabla newsletter verificada");

    console.log("🔍 Verificando si el correo ya existe...");
    // Verificar si el correo ya existe
    const existingEmail = await pool.query(
      "SELECT id FROM newsletter WHERE correo = $1",
      [correo]
    );

    if (existingEmail.rows.length > 0) {
      console.log("⚠️ Correo ya existente:", correo);
      return res.status(409).json({ mensaje: "Este correo ya está suscrito" });
    }

    console.log("💾 Insertando nuevo suscriptor...");
    // Insertar en la base de datos
    const result = await pool.query(
      "INSERT INTO newsletter (correo) VALUES ($1) RETURNING id, correo, fecha_suscripcion",
      [correo]
    );

    console.log("✅ Suscriptor agregado exitosamente:", result.rows[0]);

    res.status(200).json({
      success: true,
      mensaje: "¡Suscripción exitosa! Gracias por unirte al newsletter.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error en suscripción al newsletter:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};

module.exports = {
  suscribirCorreo,
};
