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
function generarTokenMembresia() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `MEM-${timestamp}-${random}`;
}

// Guardar compra de membresía
const guardarCompraMembresia = async (req, res) => {
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
      tipo_membresia, // basica, premium, vip
      nivel_membresia = "principiante", // principiante, intermedio, avanzado
      precio_membresia,
      duracion_meses = 1,
      descuento_aplicado = 0.0,
      codigo_promocional = "",
    } = req.body;

    // Validaciones básicas
    if (!email || !nombre || !apellido || !telefono || !tipo_membresia) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios para la membresía",
      });
    }

    const token_membresia = generarTokenMembresia();
    const fecha_inicio = new Date();
    const fecha_fin = new Date();
    fecha_fin.setMonth(fecha_fin.getMonth() + duracion_meses);

    // 🎯 DETERMINAR ESTADO SEGÚN MÉTODO DE PAGO
    let estadoMembresia = "activa"; // Por defecto
    if (metodo_pago === "PayPal" || metodo_pago === "paypal") {
      estadoMembresia = "activa"; // PayPal es pago instantáneo → membresía activa
    } else if (metodo_pago === "bank-deposit" || metodo_pago === "bank") {
      estadoMembresia = "pendiente"; // Depósito bancario → membresía pendiente hasta confirmación
    }

    // Insertar en tabla compras_membresias
    const query = `
      INSERT INTO compras_membresias (
        email, nombre, apellido, telefono, direccion, ciudad, 
        departamento, codigo_postal, token_membresia, metodo_pago,
        banco_seleccionado, tipo_membresia, nivel_membresia, 
        precio_membresia, duracion_meses, fecha_inicio, fecha_fin,
        descuento_aplicado, codigo_promocional, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
      token_membresia,
      metodo_pago,
      banco_seleccionado,
      tipo_membresia,
      nivel_membresia,
      precio_membresia,
      duracion_meses,
      fecha_inicio,
      fecha_fin,
      descuento_aplicado,
      codigo_promocional,
      estadoMembresia,
    ];

    const result = await client.query(query, values);

    console.log("✅ Membresía guardada exitosamente:", result.rows[0]);

    res.status(201).json({
      success: true,
      message: "Membresía registrada exitosamente",
      data: {
        id: result.rows[0].id,
        token_membresia: token_membresia,
        tipo_membresia: tipo_membresia,
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        estado: estadoMembresia,
      },
    });
  } catch (error) {
    console.error("❌ Error al guardar membresía:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al procesar membresía",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Obtener membresías de un usuario
const obtenerMembresiasUsuario = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email } = req.params;

    const query = `
      SELECT id, tipo_membresia, nivel_membresia, precio_membresia,
             fecha_inicio, fecha_fin, estado, fecha_compra
      FROM compras_membresias 
      WHERE email = $1 
      ORDER BY fecha_compra DESC
    `;

    const result = await client.query(query, [email]);

    res.status(200).json({
      success: true,
      membresias: result.rows,
    });
  } catch (error) {
    console.error("❌ Error al obtener membresías:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener membresías del usuario",
    });
  } finally {
    client.release();
  }
};

// Pausar/cancelar membresía
const cambiarEstadoMembresia = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { nuevo_estado } = req.body; // 'pausada', 'cancelada', 'activa'

    const estados_validos = ["activa", "pausada", "cancelada"];
    if (!estados_validos.includes(nuevo_estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado no válido. Use: activa, pausada, o cancelada",
      });
    }

    const query = `
      UPDATE compras_membresias 
      SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await client.query(query, [nuevo_estado, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Membresía no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: `Membresía ${nuevo_estado} exitosamente`,
      membresia: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado de membresía:", error);

    res.status(500).json({
      success: false,
      message: "Error al actualizar estado de membresía",
    });
  } finally {
    client.release();
  }
};

// Test de conexión
const testConexionMembresias = async (req, res) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT COUNT(*) FROM compras_membresias"
    );

    res.status(200).json({
      success: true,
      message: "Conexión exitosa a tabla compras_membresias",
      total_membresias: parseInt(result.rows[0].count),
    });
  } catch (error) {
    console.error("❌ Error de conexión membresías:", error);

    res.status(500).json({
      success: false,
      message: "Error de conexión a base de datos",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  guardarCompraMembresia,
  obtenerMembresiasUsuario,
  cambiarEstadoMembresia,
  testConexionMembresias,
};
