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

    // Consulta para obtener usuarios con información de membresías
    const query = `
      SELECT 
        u.id,
        u.nombre,
        u.correo,
        u.fecha_registro,
        'Activo' as estado,
        CASE 
          WHEN cm.tipo_membresia IS NOT NULL AND cm.estado = 'activa' THEN 
            CASE 
              WHEN cm.tipo_membresia = 'basica' THEN 'Membresía Básica'
              WHEN cm.tipo_membresia = 'premium' THEN 'Membresía Premium'
              WHEN cm.tipo_membresia = 'vip' THEN 'Membresía VIP'
              ELSE 'Membresía ' || INITCAP(cm.tipo_membresia)
            END
          WHEN cp.tipo_plan IS NOT NULL AND cp.estado = 'activo' THEN 
            CASE 
              WHEN cp.tipo_plan = 'plan10k' THEN 'Plan 10K'
              WHEN cp.tipo_plan = 'plan21k' THEN 'Plan 21K'
              WHEN cp.tipo_plan = 'plan42k' THEN 'Plan 42K'
              ELSE 'Plan ' || UPPER(cp.tipo_plan)
            END
          WHEN c.email IS NOT NULL THEN 'Cliente Tienda'
          ELSE 'Normal'
        END as tipo_usuario
      FROM usuarios u
      LEFT JOIN compras_membresias cm ON u.correo = cm.email AND cm.estado = 'activa'
      LEFT JOIN compras_planes cp ON u.correo = cp.email AND cp.estado = 'activo'
      LEFT JOIN compras c ON u.correo = c.email
      ORDER BY u.fecha_registro DESC
    `;

    const result = await pool.query(query);

    console.log(`✅ Encontrados ${result.rows.length} usuarios registrados`);

    // Formatear datos para el frontend
    const users = result.rows.map((user) => ({
      id: user.id,
      name: user.nombre,
      email: user.correo,
      type: user.tipo_usuario,
      joinDate: new Date(user.fecha_registro).toLocaleDateString("es-ES"),
      status: user.estado,
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

    // Consultas paralelas para obtener todas las estadísticas
    const [
      usersResult,
      membershipsResult,
      salesResult,
      plansResult,
      eventsResult,
      routesResult,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM usuarios"),
      pool.query(
        "SELECT COUNT(*) as count FROM compras_membresias WHERE estado = 'activa'"
      ),
      pool.query(
        "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM compras"
      ),
      pool.query(
        "SELECT COUNT(*) as count FROM compras_planes WHERE estado = 'activo'"
      ),
      pool.query(
        "SELECT COUNT(*) as count FROM event_registrations WHERE status = 'active'"
      ),
      pool.query("SELECT COUNT(*) as count FROM rutas_registros"),
    ]);

    const stats = {
      totalUsers: parseInt(usersResult.rows[0].count),
      activeMemberships: parseInt(membershipsResult.rows[0].count),
      totalSales: parseInt(salesResult.rows[0].count),
      totalRevenue: parseFloat(salesResult.rows[0].total || 0),
      activeTrainingPlans: parseInt(plansResult.rows[0].count),
      pendingEvents: parseInt(eventsResult.rows[0].count),
      weeklyRoutes: parseInt(routesResult.rows[0].count),
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
    console.log("📊 Consultando membresías activas...");

    const query = `
      SELECT 
        cm.id,
        cm.nombre,
        cm.email,
        cm.tipo_membresia,
        cm.estado,
        cm.fecha_inicio,
        cm.fecha_expiracion,
        cm.metodo_pago
      FROM compras_membresias cm
      ORDER BY cm.fecha_inicio DESC
    `;

    const result = await pool.query(query);

    const memberships = result.rows.map((membership) => ({
      id: membership.id,
      user: membership.nombre,
      email: membership.email,
      plan:
        membership.tipo_membresia === "basica"
          ? "Básica"
          : membership.tipo_membresia === "premium"
          ? "Premium"
          : membership.tipo_membresia === "vip"
          ? "VIP"
          : membership.tipo_membresia,
      status:
        membership.estado === "activa"
          ? "Activa"
          : membership.estado === "pendiente"
          ? "Pendiente"
          : "Vencida",
      expiresAt: new Date(membership.fecha_expiracion).toLocaleDateString(
        "es-ES"
      ),
    }));

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

module.exports = {
  getUsers,
  getDashboardStats,
  getMemberships,
};
