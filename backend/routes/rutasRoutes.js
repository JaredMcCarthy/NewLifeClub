const express = require("express");
const router = express.Router();
const { registrarEnRuta } = require("../controllers/rutasController");

// Endpoint de prueba
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Rutas funcionando correctamente" });
});

// Ruta principal para el registro de rutas
router.post("/", registrarEnRuta);

module.exports = router;
