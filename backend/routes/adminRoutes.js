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

// Obtener pedidos de tienda (productos físicos)
router.get("/store-orders", adminController.getStoreOrders);

// Marcar pedido como entregado/pendiente
router.put("/store-orders/:id/toggle", adminController.toggleStoreOrder);

// Obtener planes de entrenamiento
router.get("/training-plans", adminController.getTrainingPlans);

// Activar/Desactivar plan de entrenamiento
router.put("/training-plans/:id/toggle", adminController.toggleTrainingPlan);

// Asignar entrenador a plan
router.put("/training-plans/:id/assign-trainer", adminController.assignTrainer);

// Obtener registros de eventos
router.get("/event-registrations", adminController.getEventRegistrations);

// Marcar participación en evento
router.put(
  "/event-registrations/:id/toggle",
  adminController.toggleEventParticipation
);

// Obtener registros de rutas
router.get("/route-registrations", adminController.getRouteRegistrations);

// Obtener mensajes de contacto
router.get("/contact-messages", adminController.getContactMessages);

// Marcar mensaje como respondido/nuevo
router.put("/contact-messages/:id/toggle", adminController.toggleContactStatus);

// Ruta de prueba para verificar conectividad
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ API Admin funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
