const express = require("express");
const router = express.Router();
const { suscribirCorreo } = require("../controllers/newsletterController");

// Cambio la ruta para que coincida con la URL del frontend
router.post("/newsletter", suscribirCorreo);

module.exports = router;
