const db = require("../config/db");

const suscribirCorreo = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ mensaje: "El correo es requerido" });
    }

    // Insertar en la base de datos
    await db.query("INSERT INTO newsletter (correo) VALUES (?)", [correo]);

    res.status(201).json({ mensaje: "Correo suscrito correctamente" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "Este correo ya está suscrito" });
    }
    console.error(error);
    res.status(500).json({ mensaje: "Error al suscribir el correo" });
  }
};

module.exports = {
  suscribirCorreo,
};
