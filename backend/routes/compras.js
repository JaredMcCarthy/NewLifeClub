const express = require("express");
const router = express.Router();
const ComprasController = require("../controllers/comprasController");

// 🛒 NUEVA COMPRA - Endpoint principal
router.post("/nueva-compra", async (req, res) => {
  try {
    await ComprasController.procesarCompra(req, res);
  } catch (error) {
    console.error("❌ Error en ruta nueva-compra:", error);
    res.status(500).json({
      success: false,
      message: "Error procesando la compra",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 📋 OBTENER COMPRAS POR EMAIL
router.get("/mis-compras/:email", async (req, res) => {
  try {
    await ComprasController.obtenerComprasPorEmail(req, res);
  } catch (error) {
    console.error("❌ Error en ruta mis-compras:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo las compras",
    });
  }
});

// 🔍 OBTENER COMPRA POR TOKEN
router.get("/compra/:token", async (req, res) => {
  try {
    await ComprasController.obtenerCompraPorToken(req, res);
  } catch (error) {
    console.error("❌ Error en ruta compra por token:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo la compra",
    });
  }
});

// 📊 ESTADÍSTICAS (ADMIN)
// TEMPORALMENTE DESHABILITADO - CAUSABA ERRORES EN DESARROLLO
// router.get("/estadisticas", async (req, res) => {
//   console.log("🔐 Auth Route:", { method: req.method, url: req.url, body: req.body });
//   await ComprasController.obtenerEstadisticas(req, res);
// });

// 🔄 ACTUALIZAR ESTADO DE COMPRA (ADMIN)
router.put("/actualizar-estado/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { nuevo_estado } = req.body;

    const estadosValidos = ["completada", "pendiente", "cancelada", "enviada"];

    if (!estadosValidos.includes(nuevo_estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido",
      });
    }

    const pool = require("../config/db");
    const query =
      "UPDATE compras SET estado = $1 WHERE token_compra = $2 RETURNING *";
    const result = await pool.query(query, [nuevo_estado, token]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Compra no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Estado actualizado exitosamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando estado:", error);
    res.status(500).json({
      success: false,
      message: "Error actualizando el estado",
    });
  }
});

// 🗑️ MIDDLEWARE PARA LOGS
router.use((req, res, next) => {
  console.log(
    `🛒 COMPRAS API: ${req.method} ${
      req.originalUrl
    } - ${new Date().toISOString()}`
  );
  next();
});

module.exports = router;
