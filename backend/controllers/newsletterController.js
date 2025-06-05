const db = require("../config/db");

const suscribirCorreo = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ mensaje: "El correo es requerido" });
    }

    // Crear tabla si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS newsletter (
        id SERIAL PRIMARY KEY,
        correo VARCHAR(255) UNIQUE NOT NULL,
        fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verificar si el correo ya existe
    const existingEmail = await db.query(
      "SELECT id FROM newsletter WHERE correo = $1",
      [correo]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ mensaje: "Este correo ya está suscrito" });
    }

    // Insertar en la base de datos usando PostgreSQL sintaxis
    await db.query("INSERT INTO newsletter (correo) VALUES ($1)", [correo]);

    res.status(201).json({ mensaje: "Correo suscrito correctamente" });
  } catch (error) {
    console.error("Error en newsletter:", error);
    res.status(500).json({ mensaje: "Error al suscribir el correo" });
  }
};

module.exports = {
  suscribirCorreo,
};
