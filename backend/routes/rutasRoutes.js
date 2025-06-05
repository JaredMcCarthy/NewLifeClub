const express = require("express");
const router = express.Router();
const { registrarEnRuta } = require("../controllers/rutasController");

// Ruta principal
router.post("/rutasRoutes", registrarEnRuta);

// Ruta alternativa para compatibilidad
router.post("/", registrarEnRuta);

module.exports = router;
