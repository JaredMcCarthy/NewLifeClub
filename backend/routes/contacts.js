const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST /api/contact
router.post("/contact", async (req, res) => {
  const { nombre, correo, asunto, mensaje } = req.body;

  try {
    const [result] = await db.execute(
      "INSERT INTO contacto (nombre, correo, asunto, mensaje) VALUES (?, ?, ?, ?)",
      [nombre, correo, asunto, mensaje]
    );

    res.status(200).json({ message: "Mensaje guardado con éxito." });
  } catch (error) {
    console.error("Error al guardar mensaje:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

module.exports = router;
