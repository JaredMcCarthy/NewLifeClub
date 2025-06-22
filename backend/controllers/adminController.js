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

    // Consulta simplificada para obtener usuarios reales
    const query = `
      SELECT 
        u.id,
        u.nombre,
        u.correo,
        u.fecha_registro,
        u.status as estado,
        CASE 
          WHEN c.email IS NOT NULL THEN 'Cliente Tienda'
          ELSE 'Usuario Registrado'
        END as tipo_usuario
      FROM usuarios u
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
    console.log("📊 Consultando suscripciones al newsletter...");

    const query = `
      SELECT 
        n.id,
        n.correo,
        n.fecha_suscripcion,
        u.nombre,
        'Newsletter' as tipo,
        'Activa' as estado
      FROM newsletter n
      LEFT JOIN usuarios u ON n.correo = u.correo
      ORDER BY n.fecha_suscripcion DESC
    `;

    const result = await pool.query(query);

    const memberships = result.rows.map((membership) => ({
      id: membership.id,
      user: membership.nombre || "Usuario Newsletter",
      email: membership.correo,
      plan: membership.tipo,
      status: membership.estado,
      expiresAt: "Permanente",
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
