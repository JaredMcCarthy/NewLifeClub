const { Pool } = require("pg");

// Configuración de conexión a Neon
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_Np4d5akmOrBS@ep-solitary-wave-a89tsneb-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Función para generar token único
function generarTokenPlan() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `PLAN-${timestamp}-${random}`;
}

// Guardar compra de plan de entrenamiento
const guardarCompraPlan = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      email,
      nombre,
      apellido,
      telefono,
      direccion,
      ciudad,
      departamento = "Honduras",
      codigo_postal = "",
      metodo_pago = "bank-deposit",
      banco_seleccionado = "",
      tipo_plan, // plan10k, plan21k, plan42k
      nivel_plan = "principiante", // principiante, intermedio, avanzado
      precio_plan,
      duracion_meses = 2,
      descuento_aplicado = 0.0,
      codigo_promocional = "",
      objetivo_plan = "", // Objetivo específico del usuario
    } = req.body;

    // Validaciones básicas
    if (!email || !nombre || !apellido || !telefono || !tipo_plan) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios para el plan",
      });
    }

    // Validar tipos de plan
    const planes_validos = ["plan10k", "plan21k", "plan42k"];
    if (!planes_validos.includes(tipo_plan)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de plan no válido. Use: plan10k, plan21k, o plan42k",
      });
    }

    const token_plan = generarTokenPlan();
    const fecha_inicio = new Date();
    const fecha_fin = new Date();
    fecha_fin.setMonth(fecha_fin.getMonth() + duracion_meses);

    // 🎯 DETERMINAR ESTADO SEGÚN MÉTODO DE PAGO
    let estadoPlan = "activo"; // Por defecto
    if (metodo_pago === "PayPal" || metodo_pago === "paypal") {
      estadoPlan = "activo"; // PayPal es pago instantáneo → plan activo
    } else if (metodo_pago === "bank-deposit" || metodo_pago === "bank") {
      estadoPlan = "pendiente"; // Depósito bancario → plan pendiente hasta confirmación
    }

    // Insertar en tabla compras_planes
    const query = `
      INSERT INTO compras_planes (
        email, nombre, apellido, telefono, direccion, ciudad, 
        departamento, codigo_postal, token_plan, metodo_pago,
        banco_seleccionado, tipo_plan, nivel_plan, precio_plan,
        duracion_meses, fecha_inicio, fecha_fin, objetivo_plan,
        descuento_aplicado, codigo_promocional, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const values = [
      email,
      nombre,
      apellido,
      telefono,
      direccion,
      ciudad,
      departamento,
      codigo_postal,
      token_plan,
      metodo_pago,
      banco_seleccionado,
      tipo_plan,
      nivel_plan,
      precio_plan,
      duracion_meses,
      fecha_inicio,
      fecha_fin,
      objetivo_plan,
      descuento_aplicado,
      codigo_promocional,
      estadoPlan,
    ];

    const result = await client.query(query, values);

    console.log(
      "✅ Plan de entrenamiento guardado exitosamente:",
      result.rows[0]
    );

    res.status(201).json({
      success: true,
      message: "Plan de entrenamiento registrado exitosamente",
      data: {
        id: result.rows[0].id,
        token_plan: token_plan,
        tipo_plan: tipo_plan,
        nivel_plan: nivel_plan,
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        estado: estadoPlan,
      },
    });
  } catch (error) {
    console.error("❌ Error al guardar plan:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al procesar plan",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Obtener planes de un usuario
const obtenerPlanesUsuario = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email } = req.params;

    const query = `
      SELECT id, tipo_plan, nivel_plan, precio_plan, objetivo_plan,
             fecha_inicio, fecha_fin, estado, progreso_actual, fecha_compra
      FROM compras_planes 
      WHERE email = $1 
      ORDER BY fecha_compra DESC
    `;

    const result = await client.query(query, [email]);

    res.status(200).json({
      success: true,
      planes: result.rows,
    });
  } catch (error) {
    console.error("❌ Error al obtener planes:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener planes del usuario",
    });
  } finally {
    client.release();
  }
};

// Actualizar progreso del plan
const actualizarProgresoPlan = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { progreso_actual, semana_actual, notas_progreso } = req.body;

    // Validar progreso (0-100)
    if (progreso_actual < 0 || progreso_actual > 100) {
      return res.status(400).json({
        success: false,
        message: "El progreso debe estar entre 0 y 100",
      });
    }

    // Si el progreso es 100%, marcar como completado
    const nuevo_estado = progreso_actual >= 100 ? "completado" : "activo";

    const query = `
      UPDATE compras_planes 
      SET progreso_actual = $1, 
          semana_actual = $2,
          notas_progreso = $3,
          estado = $4,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await client.query(query, [
      progreso_actual,
      semana_actual,
      notas_progreso,
      nuevo_estado,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plan no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Progreso actualizado exitosamente",
      plan: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al actualizar progreso:", error);

    res.status(500).json({
      success: false,
      message: "Error al actualizar progreso del plan",
    });
  } finally {
    client.release();
  }
};

// Cambiar estado del plan
const cambiarEstadoPlan = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { nuevo_estado } = req.body; // 'activo', 'pausado', 'cancelado', 'completado'

    const estados_validos = ["activo", "pausado", "cancelado", "completado"];
    if (!estados_validos.includes(nuevo_estado)) {
      return res.status(400).json({
        success: false,
        message:
          "Estado no válido. Use: activo, pausado, cancelado, o completado",
      });
    }

    const query = `
      UPDATE compras_planes 
      SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await client.query(query, [nuevo_estado, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plan no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: `Plan ${nuevo_estado} exitosamente`,
      plan: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado del plan:", error);

    res.status(500).json({
      success: false,
      message: "Error al actualizar estado del plan",
    });
  } finally {
    client.release();
  }
};

// Obtener estadísticas de planes
const obtenerEstadisticasPlanes = async (req, res) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        tipo_plan,
        COUNT(*) as total_compras,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
        COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
        AVG(progreso_actual) as progreso_promedio
      FROM compras_planes 
      GROUP BY tipo_plan
      ORDER BY total_compras DESC
    `;

    const result = await client.query(query);

    res.status(200).json({
      success: true,
      estadisticas: result.rows,
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas de planes",
    });
  } finally {
    client.release();
  }
};

// Test de conexión
const testConexionPlanes = async (req, res) => {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT COUNT(*) FROM compras_planes");

    res.status(200).json({
      success: true,
      message: "Conexión exitosa a tabla compras_planes",
      total_planes: parseInt(result.rows[0].count),
    });
  } catch (error) {
    console.error("❌ Error de conexión planes:", error);

    res.status(500).json({
      success: false,
      message: "Error de conexión a base de datos",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  guardarCompraPlan,
  obtenerPlanesUsuario,
  actualizarProgresoPlan,
  cambiarEstadoPlan,
  obtenerEstadisticasPlanes,
  testConexionPlanes,
};
