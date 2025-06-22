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
    console.log("📊 Consultando membresías reales desde Neon...");

    const query = `
      SELECT 
        id,
        email,
        nombre,
        tipo_membresia,
        estado_membresia,
        fecha_inicio,
        fecha_expiracion,
        fecha_compra
      FROM compras_membresias
      ORDER BY fecha_compra DESC
    `;

    const result = await pool.query(query);

    const memberships = result.rows.map((membership) => ({
      id: membership.id,
      user: membership.nombre,
      email: membership.email,
      plan: membership.tipo_membresia || "Básica",
      status: membership.estado_membresia || "activa",
      expiresAt: membership.fecha_expiracion
        ? new Date(membership.fecha_expiracion).toLocaleDateString("es-ES")
        : "Sin fecha",
      startDate: new Date(membership.fecha_inicio).toLocaleDateString("es-ES"),
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

    const newStatus = action === "activate" ? "activa" : "inactiva";

    const query = `
      UPDATE compras_membresias 
      SET estado_membresia = $1
      WHERE id = $2
      RETURNING id, nombre, email, estado_membresia
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
        status: membership.estado_membresia,
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
