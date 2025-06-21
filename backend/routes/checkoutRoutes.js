const express = require("express");
const router = express.Router();
const {
  guardarDatosCheckout,
  obtenerEstadisticasCheckout,
} = require("../controllers/checkoutController");

// 🛒 MIDDLEWARE ESPECÍFICO PARA CHECKOUT
router.use((req, res, next) => {
  console.log("🛒 Checkout Route:", {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
  next();
});

// 🛒 RUTA PRINCIPAL: Guardar datos del checkout
// POST /api/checkout/save-order
router.post("/save-order", guardarDatosCheckout);

// 📊 RUTA OPCIONAL: Obtener estadísticas (para admin)
// GET /api/checkout/stats
router.get("/stats", obtenerEstadisticasCheckout);

// 🧪 RUTA DE PRUEBA: Verificar que el checkout funciona
// GET /api/checkout/test
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ Checkout API funcionando correctamente",
    timestamp: new Date().toISOString(),
    routes: {
      saveOrder: "/api/checkout/save-order",
      stats: "/api/checkout/stats",
      test: "/api/checkout/test",
    },
  });
});

module.exports = router;
