const pool = require("../config/db");
const crypto = require("crypto");

class ComprasController {
  // 🛒 PROCESAR NUEVA COMPRA
  static async procesarCompra(req, res) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const {
        // Información del cliente
        email,
        nombre,
        apellido,
        telefono,
        direccion,
        ciudad,
        departamento,
        codigo_postal,

        // Información de la compra
        metodo_pago,
        subtotal,
        impuestos = 0,
        descuentos = 0,
        total,
        productos, // Array de productos

        // Información de tarjeta (opcional y segura)
        ultimos_4_digitos,
        tipo_tarjeta,
      } = req.body;

      // 🔐 VALIDACIONES PROFESIONALES
      if (
        !email ||
        !nombre ||
        !apellido ||
        !telefono ||
        !direccion ||
        !ciudad ||
        !departamento ||
        !codigo_postal ||
        !metodo_pago ||
        !subtotal ||
        !total ||
        !productos
      ) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Todos los campos obligatorios deben estar completos",
        });
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Email inválido",
        });
      }

      // Validar método de pago
      const metodosValidos = [
        "tarjeta_debito",
        "tarjeta_credito",
        "deposito_bancario",
      ];
      if (!metodosValidos.includes(metodo_pago)) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Método de pago inválido",
        });
      }

      // Validar productos
      if (!Array.isArray(productos) || productos.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Debe incluir al menos un producto",
        });
      }

      // 🎯 GENERAR TOKEN ÚNICO SEGURO
      const token_compra = `NLC-${Date.now()}-${crypto
        .randomBytes(8)
        .toString("hex")
        .toUpperCase()}`;

      // 📝 INSERTAR COMPRA EN BASE DE DATOS
      const query = `
        INSERT INTO compras (
          email, nombre, apellido, telefono, direccion, ciudad, 
          departamento, codigo_postal, token_compra, metodo_pago,
          subtotal, impuestos, descuentos, total, productos,
          ultimos_4_digitos, tipo_tarjeta, estado
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
          $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING id, token_compra, fecha_compra
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
        token_compra,
        metodo_pago,
        parseFloat(subtotal),
        parseFloat(impuestos),
        parseFloat(descuentos),
        parseFloat(total),
        JSON.stringify(productos),
        ultimos_4_digitos || null,
        tipo_tarjeta || null,
        "completada",
      ];

      const result = await client.query(query, values);
      await client.query("COMMIT");

      // 🎉 RESPUESTA EXITOSA
      res.status(201).json({
        success: true,
        message: "Compra procesada exitosamente",
        data: {
          id: result.rows[0].id,
          token_compra: result.rows[0].token_compra,
          fecha_compra: result.rows[0].fecha_compra,
          email: email,
          total: parseFloat(total),
        },
      });

      console.log(
        `✅ Nueva compra procesada: ${token_compra} - $${total} - ${email}`
      );
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error procesando compra:", error);

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    } finally {
      client.release();
    }
  }

  // 📋 OBTENER COMPRAS POR EMAIL
  static async obtenerComprasPorEmail(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email requerido",
        });
      }

      const query = `
        SELECT 
          id, token_compra, metodo_pago, subtotal, impuestos, 
          descuentos, total, productos, fecha_compra, estado,
          ultimos_4_digitos, tipo_tarjeta
        FROM compras 
        WHERE email = $1 
        ORDER BY fecha_compra DESC
      `;

      const result = await pool.query(query, [email]);

      res.json({
        success: true,
        message: "Compras obtenidas exitosamente",
        data: result.rows.map((row) => ({
          ...row,
          productos: JSON.parse(row.productos),
        })),
      });
    } catch (error) {
      console.error("❌ Error obteniendo compras:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  // 🔍 OBTENER COMPRA POR TOKEN
  static async obtenerCompraPorToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token requerido",
        });
      }

      const query = `
        SELECT * FROM compras WHERE token_compra = $1
      `;

      const result = await pool.query(query, [token]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Compra no encontrada",
        });
      }

      const compra = result.rows[0];
      compra.productos = JSON.parse(compra.productos);

      res.json({
        success: true,
        message: "Compra encontrada",
        data: compra,
      });
    } catch (error) {
      console.error("❌ Error obteniendo compra:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  // 📊 ESTADÍSTICAS DE COMPRAS (ADMIN)
  static async obtenerEstadisticas(req, res) {
    try {
      const queries = {
        total_compras: "SELECT COUNT(*) as total FROM compras",
        ventas_totales:
          "SELECT SUM(total) as ventas FROM compras WHERE estado = $1",
        compras_hoy: `SELECT COUNT(*) as hoy FROM compras WHERE DATE(fecha_compra) = CURRENT_DATE`,
        metodos_pago: `SELECT metodo_pago, COUNT(*) as cantidad FROM compras GROUP BY metodo_pago`,
      };

      const [totalCompras, ventasTotales, comprasHoy, metodosPago] =
        await Promise.all([
          pool.query(queries.total_compras),
          pool.query(queries.ventas_totales, ["completada"]),
          pool.query(queries.compras_hoy),
          pool.query(queries.metodos_pago),
        ]);

      res.json({
        success: true,
        data: {
          total_compras: parseInt(totalCompras.rows[0].total),
          ventas_totales: parseFloat(ventasTotales.rows[0].ventas || 0),
          compras_hoy: parseInt(comprasHoy.rows[0].hoy),
          metodos_pago: metodosPago.rows,
        },
      });
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}

module.exports = ComprasController;
