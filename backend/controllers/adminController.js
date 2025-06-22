const { Pool } = require("pg");

// Configuración de conexión a Neon PostgreSQL
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_Np4d5akmOrBS@ep-solitary-wave-a89tsneb-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

// ============================================
// 📊 OBTENER TODOS LOS USUARIOS REGISTRADOS
// ============================================
const getUsers = async (req, res) => {
  try {
    console.log("📊 Consultando usuarios registrados...");

    // Consulta EXACTA con las columnas que SÍ EXISTEN en Neon
    const query = `
      SELECT 
        id,
        nombre,
        correo,
        fecha_registro
      FROM usuarios
      ORDER BY fecha_registro DESC
    `;

    const result = await pool.query(query);

    console.log(`✅ Encontrados ${result.rows.length} usuarios registrados`);

    // Formatear datos con las columnas REALES de Neon
    const users = result.rows.map((user) => ({
      id: user.id,
      name: user.nombre,
      email: user.correo,
      type: "Usuario Registrado", // Tipo fijo y simple
      joinDate: new Date(user.fecha_registro).toLocaleDateString("es-ES"),
      status: "Activo", // Status fijo porque no existe la columna
    }));

    res.json({
      success: true,
      users: users,
      total: users.length,
    });
  } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

// ============================================
// 📊 OBTENER ESTADÍSTICAS DEL DASHBOARD
// ============================================
const getDashboardStats = async (req, res) => {
  try {
    console.log("📊 Obteniendo estadísticas del dashboard...");

    // Consultas simplificadas para estadísticas reales
    const [
      usersResult,
      salesResult,
      eventsResult,
      newsletterResult,
      contactResult,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM usuarios"),
      pool.query(
        "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM compras"
      ),
      pool.query(
        "SELECT COUNT(*) as count FROM event_registrations WHERE status = 'active'"
      ),
      pool.query("SELECT COUNT(*) as count FROM newsletter"),
      pool.query("SELECT COUNT(*) as count FROM contacto"),
    ]);

    const stats = {
      totalUsers: parseInt(usersResult.rows[0].count),
      activeMemberships: parseInt(newsletterResult.rows[0].count), // Usar newsletter como membresías
      totalSales: parseInt(salesResult.rows[0].count),
      totalRevenue: parseFloat(salesResult.rows[0].total || 0),
      activeTrainingPlans: parseInt(contactResult.rows[0].count), // Usar contactos como planes
      pendingEvents: parseInt(eventsResult.rows[0].count),
      weeklyRoutes: 0, // Por ahora 0 hasta que tengas esa tabla
    };

    console.log("✅ Estadísticas obtenidas:", stats);

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};

// ============================================
// 📊 OBTENER MEMBRESÍAS ACTIVAS
// ============================================
const getMemberships = async (req, res) => {
  try {
    console.log("📊 Consultando membresías desde tabla COMPRAS...");

    const query = `
      SELECT 
        id,
        email,
        nombre,
        apellido,
        productos,
        total,
        fecha_compra,
        estado,
        metodo_pago
      FROM compras
      WHERE productos ILIKE '%membership%' 
         OR productos ILIKE '%membresia%'
         OR productos ILIKE '%premium%'
         OR productos ILIKE '%basic%'
         OR productos ILIKE '%vip%'
      ORDER BY fecha_compra DESC
    `;

    const result = await pool.query(query);

    console.log(`✅ Encontradas ${result.rows.length} compras de membresías`);

    const memberships = result.rows.map((compra) => {
      // Parsear el JSON de productos para extraer info de membresía
      let planType = "Membresía";
      let productInfo = {};

      try {
        const productos = JSON.parse(compra.productos);
        if (Array.isArray(productos) && productos.length > 0) {
          productInfo = productos[0];
          if (productInfo.name) {
            if (productInfo.name.toLowerCase().includes("premium")) {
              planType = "Premium";
            } else if (productInfo.name.toLowerCase().includes("basic")) {
              planType = "Básica";
            } else if (productInfo.name.toLowerCase().includes("vip")) {
              planType = "VIP";
            } else {
              planType = productInfo.name;
            }
          }
        }
      } catch (e) {
        console.log("Info de producto:", compra.productos);
      }

      // Calcular fecha de expiración (ejemplo: 1 año desde la compra)
      const fechaCompra = new Date(compra.fecha_compra);
      const fechaExpiracion = new Date(fechaCompra);
      fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 1);

      return {
        id: compra.id,
        user: `${compra.nombre} ${compra.apellido}`,
        email: compra.email,
        plan: planType,
        status: compra.estado === "completada" ? "activa" : "pendiente",
        expiresAt: fechaExpiracion.toLocaleDateString("es-ES"),
        startDate: fechaCompra.toLocaleDateString("es-ES"),
        total: compra.total,
        paymentMethod: compra.metodo_pago,
      };
    });

    res.json({
      success: true,
      memberships: memberships,
      total: memberships.length,
    });
  } catch (error) {
    console.error("❌ Error obteniendo membresías:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener membresías",
      error: error.message,
    });
  }
};

// ============================================
// 🔄 ACTIVAR/DESACTIVAR MEMBRESÍA
// ============================================
const toggleMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'activate' o 'deactivate'

    console.log(
      `🔄 ${
        action === "activate" ? "Activando" : "Desactivando"
      } membresía ID: ${id}`
    );

    const newStatus = action === "activate" ? "completada" : "cancelada";

    const query = `
      UPDATE compras 
      SET estado = $1
      WHERE id = $2
      RETURNING id, nombre, email, estado
    `;

    const result = await pool.query(query, [newStatus, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Membresía no encontrada",
      });
    }

    const membership = result.rows[0];

    res.json({
      success: true,
      message: `Membresía ${
        action === "activate" ? "activada" : "desactivada"
      } exitosamente`,
      membership: {
        id: membership.id,
        user: membership.nombre,
        email: membership.email,
        status: membership.estado,
      },
    });
  } catch (error) {
    console.error("❌ Error actualizando membresía:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar membresía",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getDashboardStats,
  getMemberships,
  toggleMembership,
};
