const express = require("express");
const router = express.Router();
const {
  guardarCompraPlan,
  obtenerPlanesUsuario,
  actualizarProgresoPlan,
  cambiarEstadoPlan,
  obtenerEstadisticasPlanes,
  testConexionPlanes,
} = require("../controllers/planesController");

// Ruta para guardar nueva compra de plan
router.post("/save-plan", guardarCompraPlan);

// Ruta para obtener planes de un usuario
router.get("/usuario/:email", obtenerPlanesUsuario);

// Ruta para actualizar progreso del plan
router.put("/progreso/:id", actualizarProgresoPlan);

// Ruta para cambiar estado del plan
router.put("/estado/:id", cambiarEstadoPlan);

// Ruta para obtener estadísticas de planes
router.get("/estadisticas", obtenerEstadisticasPlanes);

// Ruta de test para verificar conexión
router.get("/test", testConexionPlanes);

module.exports = router;
