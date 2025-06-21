const { Pool } = require("pg");

// 🛒 CONEXIÓN INDEPENDIENTE PARA CHECKOUT - NEON DATABASE
const checkoutPool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_Np4d5akmOrBS@ep-solitary-wave-a89tsneb-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Verificar conexión específica para checkout
checkoutPool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error conectando checkout a Neon:", err.stack);
  } else {
    console.log("✅ Checkout conectado exitosamente a Neon PostgreSQL");
    release();
  }
});

// 🛒 CONTROLADOR PRINCIPAL: Guardar datos del checkout
const guardarDatosCheckout = async (req, res) => {
  try {
    console.log("🛒 Recibiendo datos del checkout:", req.body);

    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zip,
      paymentMethod,
      cartItems,
      total,
      orderToken,
    } = req.body;

    // 🔄 VALIDAR DATOS REQUERIDOS
    if (!email || !firstName || !lastName || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos requeridos para el checkout",
      });
    }

    const client = await checkoutPool.connect();

    try {
      // 🚀 INICIAR TRANSACCIÓN
      await client.query("BEGIN");

      // 📋 1. INSERTAR EN TABLA 'compras'
      const compraQuery = `
        INSERT INTO compras (email, nombre, apellido, telefono, direccion, ciudad)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const compraResult = await client.query(compraQuery, [
        email,
        firstName,
        lastName,
        phone,
        address,
        city,
      ]);

      const compraId = compraResult.rows[0].id;
      console.log("✅ Compra guardada con ID:", compraId);

      // 📦 2. INSERTAR EN TABLA 'informacion_envio'
      const envioQuery = `
        INSERT INTO informacion_envio (nombre, apellido, direccion_envio, ciudad, codigo_postal, telefono)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const envioResult = await client.query(envioQuery, [
        firstName,
        lastName,
        address,
        city,
        zip || "",
        phone,
      ]);

      const envioId = envioResult.rows[0].id;
      console.log("✅ Información de envío guardada con ID:", envioId);

      // ✅ CONFIRMAR TRANSACCIÓN
      await client.query("COMMIT");

      // 🎉 RESPUESTA EXITOSA
      res.status(200).json({
        success: true,
        message: "Datos del checkout guardados exitosamente",
        token: orderToken || `NRC-${Date.now()}`,
        compraId: compraId,
        envioId: envioId,
        data: {
          email,
          nombre: firstName,
          apellido: lastName,
          telefono: phone,
          direccion: address,
          ciudad: city,
          metodoPago: paymentMethod,
          total: total,
        },
      });
    } catch (transactionError) {
      // ❌ ROLLBACK EN CASO DE ERROR
      await client.query("ROLLBACK");
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error guardando datos del checkout:", error);

    res.status(500).json({
      success: false,
      error: "Error interno del servidor al guardar checkout",
      details: error.message,
    });
  }
};

// 📊 FUNCIÓN AUXILIAR: Obtener estadísticas de checkout (opcional)
const obtenerEstadisticasCheckout = async (req, res) => {
  try {
    const client = await checkoutPool.connect();

    const statsQuery = `
      SELECT 
        COUNT(*) as total_compras,
        COUNT(DISTINCT email) as usuarios_unicos
      FROM compras
    `;

    const result = await client.query(statsQuery);
    client.release();

    res.status(200).json({
      success: true,
      estadisticas: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    res.status(500).json({
      success: false,
      error: "Error obteniendo estadísticas",
    });
  }
};

module.exports = {
  guardarDatosCheckout,
  obtenerEstadisticasCheckout,
};
