const express = require("express");
const router = express.Router();
const { suscribirCorreo } = require("../controllers/newsletterController");

// Ruta principal
router.post("/newsletter", suscribirCorreo);

// Ruta alternativa para compatibilidad
router.post("/", suscribirCorreo);

module.exports = router;
