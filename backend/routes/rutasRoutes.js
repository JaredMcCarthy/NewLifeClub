const express = require("express");
const router = express.Router();
const { registrarEnRuta } = require("../controllers/rutasController");

router.post("/rutasRoutes", registrarEnRuta);

module.exports = router;
