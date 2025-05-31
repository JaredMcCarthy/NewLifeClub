const express = require("express");
const router = express.Router();
const { registrarEnRuta } = require("../controllers/rutasController");

router.post("/rutas/registro", registrarEnRuta);

module.exports = router;
