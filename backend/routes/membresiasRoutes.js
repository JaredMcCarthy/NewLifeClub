const express = require("express");
const router = express.Router();
const {
  guardarCompraMembresia,
  obtenerMembresiasUsuario,
  cambiarEstadoMembresia,
  testConexionMembresias,
} = require("../controllers/membresiasController");

// Ruta para guardar nueva compra de membresía
router.post("/save-membresia", guardarCompraMembresia);

// Ruta para obtener membresías de un usuario
router.get("/usuario/:email", obtenerMembresiasUsuario);

// Ruta para cambiar estado de membresía (pausar/cancelar/activar)
router.put("/estado/:id", cambiarEstadoMembresia);

// Ruta de test para verificar conexión
router.get("/test", testConexionMembresias);

module.exports = router;
