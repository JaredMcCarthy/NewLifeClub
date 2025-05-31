const express = require("express");
const router = express.Router();
const { suscribirCorreo } = require("../controllers/newsletterController");

router.post("/newsletter", suscribirCorreo);

module.exports = router;
