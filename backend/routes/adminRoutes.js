const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// ============================================
// 📊 RUTAS DEL PANEL ADMINISTRATIVO
// ============================================

// Obtener todos los usuarios registrados
router.get("/users", adminController.getUsers);

// Obtener estadísticas del dashboard
router.get("/dashboard-stats", adminController.getDashboardStats);

// Obtener membresías activas
router.get("/memberships", adminController.getMemberships);

// Activar/Desactivar membresía
router.put("/memberships/:id/toggle", adminController.toggleMembership);

// Ruta de prueba para verificar conectividad
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ API Admin funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
