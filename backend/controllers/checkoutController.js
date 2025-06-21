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
      // 🛒 INSERTAR SOLO EN TABLA 'compras' - TODO EN UNA SOLA TABLA
      const compraQuery = `
        INSERT INTO compras (
          email, nombre, apellido, telefono, direccion, ciudad, departamento, codigo_postal,
          token_compra, metodo_pago, total, estado, fecha_compra
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING id, token_compra
      `;

      const tokenCompra =
        orderToken ||
        `NRC-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 4)
          .toUpperCase()}`;

      const compraResult = await client.query(compraQuery, [
        email,
        firstName,
        lastName,
        phone,
        address,
        city,
        state || "Honduras",
        zip || "",
        tokenCompra,
        paymentMethod || "bank-deposit",
        total || 0,
        "pendiente",
      ]);

      const compraId = compraResult.rows[0].id;
      const tokenFinal = compraResult.rows[0].token_compra;

      console.log("✅ Compra guardada exitosamente:");
      console.log("- ID:", compraId);
      console.log("- Token:", tokenFinal);

      // 🎉 RESPUESTA EXITOSA SIMPLIFICADA
      res.status(200).json({
        success: true,
        message: "Compra guardada exitosamente en Neon",
        token: tokenFinal,
        compraId: compraId,
        data: {
          email,
          nombre: firstName,
          apellido: lastName,
          telefono: phone,
          direccion: address,
          ciudad: city,
          departamento: state || "Honduras",
          codigo_postal: zip,
          metodoPago: paymentMethod,
          total: total,
          estado: "pendiente",
        },
      });
    } catch (dbError) {
      // ❌ ERROR EN BASE DE DATOS
      throw dbError;
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
