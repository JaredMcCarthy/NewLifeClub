const express = require("express");
const router = express.Router();
const { suscribirCorreo } = require("../controllers/newsletterController");

// Ruta principal
router.post("/newsletter", suscribirCorreo);

// Rutas alternativas para compatibilidad
router.post("/", suscribirCorreo);
router.post("/suscribir", suscribirCorreo);

module.exports = router;
