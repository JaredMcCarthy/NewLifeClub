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
      membershipsResult,
      trainingPlansResult,
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
      pool.query(`
        SELECT COUNT(*) as count FROM compras
        WHERE estado = 'completada' 
        AND (productos ILIKE '%membership%' 
             OR productos ILIKE '%membresia%'
             OR productos ILIKE '%"membership"%'
             OR productos ILIKE '%"membresia"%')
      `),
      pool.query(`
        SELECT COUNT(*) as count FROM compras
        WHERE estado = 'completada' 
        AND (productos ILIKE '%10k%' 
             OR productos ILIKE '%21k%'
             OR productos ILIKE '%42k%'
             OR productos ILIKE '%plan%'
             OR productos ILIKE '%entrenamiento%')
      `),
    ]);

    const stats = {
      totalUsers: parseInt(usersResult.rows[0].count),
      activeMemberships: parseInt(membershipsResult.rows[0].count), // CONTEO REAL de membresías activas
      totalSales: parseInt(salesResult.rows[0].count),
      totalRevenue: parseFloat(salesResult.rows[0].total || 0),
      activeTrainingPlans: parseInt(trainingPlansResult.rows[0].count), // CONTEO REAL de planes activos
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
         OR productos ILIKE '%"membership"%'
         OR productos ILIKE '%"membresia"%'
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

      // Calcular fecha de expiración (1 MES desde la compra)
      const fechaCompra = new Date(compra.fecha_compra);
      const fechaExpiracion = new Date(fechaCompra);
      fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 1);

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

// ============================================
// 🛒 OBTENER PEDIDOS DE TIENDA (PRODUCTOS FÍSICOS)
// ============================================
const getStoreOrders = async (req, res) => {
  try {
    console.log("🛒 Consultando pedidos de tienda desde tabla COMPRAS...");

    const query = `
      SELECT 
        id,
        email,
        nombre,
        apellido,
        telefono,
        direccion,
        ciudad,
        departamento,
        productos,
        total,
        fecha_compra,
        estado,
        metodo_pago
      FROM compras
      WHERE NOT (productos ILIKE '%membership%' 
                 OR productos ILIKE '%membresia%'
                 OR productos ILIKE '%"membership"%'
                 OR productos ILIKE '%"membresia"%')
      ORDER BY fecha_compra DESC
    `;

    const result = await pool.query(query);

    console.log(`✅ Encontrados ${result.rows.length} pedidos de tienda`);

    const storeOrders = result.rows.map((compra) => {
      // Parsear el JSON de productos para extraer info de productos físicos
      let productsList = "Productos";
      let calculatedTotal = 0;

      try {
        const productos = JSON.parse(compra.productos);
        if (Array.isArray(productos) && productos.length > 0) {
          // Crear lista de productos con formato mejorado y calcular total
          productsList = productos
            .map((p) => {
              const name = p.name || p.nombre || "Producto";
              const qty = p.quantity || p.cantidad || 1;
              const price = parseFloat(p.price || p.precio || 0);

              // Sumar al total calculado
              calculatedTotal += price * qty;

              return `• ${name} (${qty}x) - L.${price}`;
            })
            .join("<br>");
        }
      } catch (e) {
        console.log("Info de producto:", compra.productos);
        productsList = "Ver detalles";
      }

      // Usar el total de la BD, pero si es 0 o null, usar el calculado
      const finalTotal = parseFloat(compra.total) || calculatedTotal;

      return {
        id: compra.id,
        user: `${compra.nombre} ${compra.apellido}`,
        email: compra.email,
        productos: productsList,
        total: finalTotal,
        direccion: compra.direccion,
        ciudad: compra.ciudad,
        departamento: compra.departamento,
        telefono: compra.telefono,
        metodo_pago: compra.metodo_pago,
        fecha_compra: new Date(compra.fecha_compra).toLocaleDateString("es-ES"),
        status: compra.estado === "completada" ? "entregado" : "pendiente",
        rawStatus: compra.estado,
      };
    });

    res.json({
      success: true,
      orders: storeOrders,
      total: storeOrders.length,
    });
  } catch (error) {
    console.error("❌ Error obteniendo pedidos de tienda:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener pedidos de tienda",
      error: error.message,
    });
  }
};

// ============================================
// 🔄 ACTIVAR/DESACTIVAR PEDIDO DE TIENDA
// ============================================
const toggleStoreOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'deliver' o 'pending'

    console.log(
      `🔄 ${
        action === "deliver"
          ? "Marcando como entregado"
          : "Marcando como pendiente"
      } pedido ID: ${id}`
    );

    const newStatus = action === "deliver" ? "completada" : "pendiente";

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
        message: "Pedido no encontrado",
      });
    }

    const order = result.rows[0];

    res.json({
      success: true,
      message: `Pedido marcado como ${
        action === "deliver" ? "entregado" : "pendiente"
      } exitosamente`,
      order: {
        id: order.id,
        user: order.nombre,
        email: order.email,
        status: order.estado,
      },
    });
  } catch (error) {
    console.error("❌ Error actualizando pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar pedido",
      error: error.message,
    });
  }
};

// ============================================
// 🏃‍♂️ OBTENER PLANES DE ENTRENAMIENTO
// ============================================
const getTrainingPlans = async (req, res) => {
  try {
    console.log(
      "🏃‍♂️ Consultando planes de entrenamiento desde tabla COMPRAS..."
    );

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
      WHERE productos ILIKE '%10k%' 
         OR productos ILIKE '%21k%'
         OR productos ILIKE '%42k%'
         OR productos ILIKE '%plan%'
         OR productos ILIKE '%entrenamiento%'
      ORDER BY fecha_compra DESC
    `;

    const result = await pool.query(query);

    console.log(`✅ Encontrados ${result.rows.length} planes de entrenamiento`);

    const trainingPlans = result.rows.map((compra) => {
      // Parsear el JSON de productos para extraer info del plan
      let planType = "Plan de Entrenamiento";
      let planPrice = 0;

      try {
        const productos = JSON.parse(compra.productos);
        if (Array.isArray(productos) && productos.length > 0) {
          const product = productos[0];
          if (product.name || product.nombre) {
            const name = product.name || product.nombre;
            if (name.toLowerCase().includes("10k")) {
              planType = "Plan 10K";
            } else if (name.toLowerCase().includes("21k")) {
              planType = "Plan 21K";
            } else if (name.toLowerCase().includes("42k")) {
              planType = "Plan 42K";
            } else {
              planType = name;
            }
          }
          planPrice = parseFloat(product.price || product.precio || 0);
        }
      } catch (e) {
        console.log("Info de producto:", compra.productos);
      }

      // Calcular fecha de finalización (2 MESES desde la compra)
      const fechaCompra = new Date(compra.fecha_compra);
      const fechaFinalizacion = new Date(fechaCompra);
      fechaFinalizacion.setMonth(fechaFinalizacion.getMonth() + 2);

      return {
        id: compra.id,
        user: `${compra.nombre} ${compra.apellido}`,
        email: compra.email,
        plan: planType,
        price: planPrice,
        endDate: fechaFinalizacion.toLocaleDateString("es-ES"),
        trainer: "Sin asignar", // Por defecto, admin puede cambiar
        status: compra.estado === "completada" ? "activo" : "inactivo",
        rawStatus: compra.estado,
      };
    });

    res.json({
      success: true,
      plans: trainingPlans,
      total: trainingPlans.length,
    });
  } catch (error) {
    console.error("❌ Error obteniendo planes de entrenamiento:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener planes de entrenamiento",
      error: error.message,
    });
  }
};

// ============================================
// 🔄 ACTIVAR/DESACTIVAR PLAN DE ENTRENAMIENTO
// ============================================
const toggleTrainingPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'activate' o 'deactivate'

    console.log(
      `🔄 ${
        action === "activate" ? "Activando" : "Desactivando"
      } plan de entrenamiento ID: ${id}`
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
        message: "Plan de entrenamiento no encontrado",
      });
    }

    const plan = result.rows[0];

    res.json({
      success: true,
      message: `Plan de entrenamiento ${
        action === "activate" ? "activado" : "desactivado"
      } exitosamente`,
      plan: {
        id: plan.id,
        user: plan.nombre,
        email: plan.email,
        status: plan.estado,
      },
    });
  } catch (error) {
    console.error("❌ Error actualizando plan de entrenamiento:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar plan de entrenamiento",
      error: error.message,
    });
  }
};

// ============================================
// 🎪 OBTENER REGISTROS DE EVENTOS
// ============================================
const getEventRegistrations = async (req, res) => {
  try {
    console.log(
      "🎪 Consultando registros de eventos desde tabla EVENT_REGISTRATIONS..."
    );

    const query = `
      SELECT 
        id,
        event_id,
        event_name,
        user_name,
        user_email,
        user_phone,
        registration_date,
        status
      FROM event_registrations
      ORDER BY registration_date DESC
    `;

    const result = await pool.query(query);

    console.log(`✅ Encontrados ${result.rows.length} registros de eventos`);

    const eventRegistrations = result.rows.map((registro) => {
      // Calcular fecha del evento basada en el nombre del evento
      let fechaEvento = "Por definir";

      if (registro.event_name) {
        const eventName = registro.event_name.toLowerCase();
        if (eventName.includes("maratón urbano")) {
          fechaEvento = "15 Mayo, 2025";
        } else if (eventName.includes("trail running")) {
          fechaEvento = "22 Mayo, 2025";
        } else if (eventName.includes("carrera nocturna")) {
          fechaEvento = "29 Mayo, 2025";
        } else if (eventName.includes("entrenamiento grupal")) {
          fechaEvento = "5 Junio, 2025";
        }
      }

      return {
        id: registro.id,
        participant: registro.user_name || "Sin nombre",
        email: registro.user_email,
        event: registro.event_name || registro.event_id,
        phone: registro.user_phone || "Sin teléfono",
        eventDate: fechaEvento,
        status: registro.status === "active" ? "registrado" : "participó",
        rawStatus: registro.status,
        registrationDate: new Date(
          registro.registration_date
        ).toLocaleDateString("es-ES"),
      };
    });

    res.json({
      success: true,
      registrations: eventRegistrations,
      total: eventRegistrations.length,
    });
  } catch (error) {
    console.error("❌ Error obteniendo registros de eventos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener registros de eventos",
      error: error.message,
    });
  }
};

// ============================================
// 🔄 MARCAR PARTICIPACIÓN EN EVENTO
// ============================================
const toggleEventParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'participate' o 'register'

    console.log(
      `🔄 ${
        action === "participate"
          ? "Marcando participación"
          : "Marcando como registrado"
      } en evento ID: ${id}`
    );

    const newStatus = action === "participate" ? "participated" : "active";

    const query = `
      UPDATE event_registrations 
      SET status = $1
      WHERE id = $2
      RETURNING id, user_name, user_email, event_name, status
    `;

    const result = await pool.query(query, [newStatus, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro de evento no encontrado",
      });
    }

    const registration = result.rows[0];

    res.json({
      success: true,
      message: `Participación ${
        action === "participate" ? "confirmada" : "registrada"
      } exitosamente`,
      registration: {
        id: registration.id,
        participant: registration.user_name,
        email: registration.user_email,
        event: registration.event_name,
        status: registration.status,
      },
    });
  } catch (error) {
    console.error("❌ Error actualizando participación en evento:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar participación en evento",
      error: error.message,
    });
  }
};

// ============================================
// 🗺️ OBTENER REGISTROS DE RUTAS
// ============================================
const getRouteRegistrations = async (req, res) => {
  try {
    console.log(
      "🗺️ Consultando registros de rutas desde tabla RUTAS_REGISTROS..."
    );

    const query = `
      SELECT 
        id,
        ruta_id,
        ruta_nombre,
        nombre_participante,
        email,
        telefono,
        num_participantes,
        fecha,
        duracion,
        ubicacion,
        dificultad,
        fecha_registro
      FROM rutas_registros
      ORDER BY fecha_registro DESC
    `;

    const result = await pool.query(query);

    console.log(`✅ Encontrados ${result.rows.length} registros de rutas`);

    const routeRegistrations = result.rows.map((registro) => {
      // Formatear el día y hora basado en la fecha
      let dayTime = "Por definir";

      if (registro.fecha) {
        const fecha = registro.fecha.toLowerCase();
        if (fecha.includes("sábado")) {
          dayTime = "Sábados";
        } else if (fecha.includes("domingo")) {
          dayTime = "Domingos";
        } else if (fecha.includes("viernes")) {
          dayTime = "Viernes";
        } else if (fecha.includes("miércoles")) {
          dayTime = "Miércoles";
        } else {
          dayTime = registro.fecha;
        }

        // Agregar duración si existe
        if (registro.duracion) {
          dayTime += ` (${registro.duracion})`;
        }
      }

      return {
        id: registro.id,
        participant: registro.nombre_participante || "Sin nombre",
        email: registro.email,
        route: registro.ruta_nombre || `Ruta ${registro.ruta_id}`,
        phone: registro.telefono || "Sin teléfono",
        dayTime: dayTime,
        location: registro.ubicacion || "Sin ubicación",
        difficulty: registro.dificultad || "Sin especificar",
        participants: registro.num_participantes || 1,
        registrationDate: new Date(registro.fecha_registro).toLocaleDateString(
          "es-ES"
        ),
      };
    });

    res.json({
      success: true,
      registrations: routeRegistrations,
      total: routeRegistrations.length,
    });
  } catch (error) {
    console.error("❌ Error obteniendo registros de rutas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener registros de rutas",
      error: error.message,
    });
  }
};

// ============================================
// 📧 OBTENER MENSAJES DE CONTACTO
// ============================================
const getContactMessages = async (req, res) => {
  try {
    console.log("📧 Consultando mensajes de contacto desde tabla CONTACTO...");

    const query = `
      SELECT 
        id,
        nombre,
        correo,
        asunto,
        mensaje,
        fecha
      FROM contacto
      ORDER BY fecha DESC
    `;

    const result = await pool.query(query);

    console.log(`✅ Encontrados ${result.rows.length} mensajes de contacto`);

    const contactMessages = result.rows.map((contacto) => {
      return {
        id: contacto.id,
        name: contacto.nombre || "Sin nombre",
        email: contacto.correo,
        subject: contacto.asunto || "Sin asunto",
        message: contacto.mensaje || "Sin mensaje",
        date: new Date(contacto.fecha).toLocaleDateString("es-ES"),
        status: "nuevo", // Por defecto todos son nuevos
        rawDate: contacto.fecha,
      };
    });

    res.json({
      success: true,
      messages: contactMessages,
      total: contactMessages.length,
    });
  } catch (error) {
    console.error("❌ Error obteniendo mensajes de contacto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener mensajes de contacto",
      error: error.message,
    });
  }
};

// ============================================
// 🔄 MARCAR MENSAJE COMO RESPONDIDO
// ============================================
const toggleContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'respond' o 'new'

    console.log(
      `🔄 ${
        action === "respond"
          ? "Marcando como respondido"
          : "Marcando como nuevo"
      } mensaje ID: ${id}`
    );

    // Por ahora solo simulamos el cambio (no hay campo status en la BD)
    // En el futuro se puede agregar un campo 'status' a la tabla contacto

    res.json({
      success: true,
      message: `Mensaje ${
        action === "respond" ? "marcado como respondido" : "marcado como nuevo"
      } exitosamente`,
      contact: {
        id: id,
        status: action === "respond" ? "respondido" : "nuevo",
      },
    });
  } catch (error) {
    console.error("❌ Error actualizando estado del mensaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar estado del mensaje",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getDashboardStats,
  getMemberships,
  toggleMembership,
  getStoreOrders,
  toggleStoreOrder,
  getTrainingPlans,
  toggleTrainingPlan,
  getEventRegistrations,
  toggleEventParticipation,
  getRouteRegistrations,
  getContactMessages,
  toggleContactStatus,
};
