const express = require("express");
const router = express.Router();

// POST /backend/routes/contacts
router.post("/contacts", async (req, res) => {
  const { nombre, correo, asunto, mensaje } = req.body;
  const pool = req.app.locals.pool;

  try {
    // Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacto (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        correo VARCHAR(255) NOT NULL,
        asunto VARCHAR(255) NOT NULL,
        mensaje TEXT NOT NULL,
        fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar el mensaje de contacto
    const result = await pool.query(
      "INSERT INTO contacto (nombre, correo, asunto, mensaje) VALUES ($1, $2, $3, $4) RETURNING id",
      [nombre, correo, asunto, mensaje]
    );

    res.status(200).json({
      success: true,
      message: "Mensaje guardado con éxito.",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error al guardar mensaje:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor.",
    });
  }
});

module.exports = router;
