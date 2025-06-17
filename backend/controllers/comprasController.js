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

      // 📧 ENVIAR EMAIL DE CONFIRMACIÓN
      try {
        await this.enviarEmailConfirmacion({
          email,
          nombre,
          apellido,
          token_compra: result.rows[0].token_compra,
          productos,
          total: parseFloat(total),
          metodo_pago,
        });
      } catch (emailError) {
        console.warn(
          "⚠️ Error enviando email (compra guardada exitosamente):",
          emailError.message
        );
      }

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

  // 📧 NUEVA FUNCIÓN: Enviar email de confirmación
  static async enviarEmailConfirmacion(datosCompra) {
    const nodemailer = require("nodemailer");

    try {
      // Configurar transporter
      const transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER || "newliferunclubhonduras@gmail.com",
          pass: process.env.EMAIL_PASS,
        },
      });

      // Crear HTML del email
      const productosHTML = JSON.parse(datosCompra.productos)
        .map(
          (producto) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; font-family: Arial, sans-serif;">${
            producto.nombre
          }</td>
          <td style="padding: 10px; text-align: center; font-family: Arial, sans-serif;">${
            producto.cantidad
          }</td>
          <td style="padding: 10px; text-align: right; font-family: Arial, sans-serif;">L.${producto.precio.toFixed(
            2
          )}</td>
          <td style="padding: 10px; text-align: right; font-family: Arial, sans-serif; font-weight: bold;">L.${(
            producto.precio * producto.cantidad
          ).toFixed(2)}</td>
        </tr>
      `
        )
        .join("");

      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Compra - NewLifeRun Club</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #000, #333); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">NewLifeRun Club</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">¡Gracias por tu compra!</p>
            </div>

            <!-- Contenido -->
            <div style="padding: 30px;">
              <div style="background: #e8f5e8; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                <h2 style="margin: 0; color: #4CAF50; font-size: 24px;">✅ ¡Compra Confirmada!</h2>
                <p style="margin: 10px 0 0 0; color: #333;">Tu pedido ha sido procesado exitosamente</p>
              </div>

              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hola <strong>${datosCompra.nombre} ${
        datosCompra.apellido
      }</strong>,
              </p>

              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Hemos recibido tu ${
                  datosCompra.metodo_pago === "PayPal" ? "pago" : "pedido"
                } correctamente. 
                ${
                  datosCompra.metodo_pago === "deposito_bancario"
                    ? "Para completar tu pedido, realiza el depósito y envía el comprobante a nuestro email."
                    : "Tu compra será procesada en las próximas 24 horas."
                }
              </p>

              <!-- Token de Compra -->
              <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border: 2px dashed #000; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Token de Compra</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; font-family: 'Courier New', monospace; color: #000; letter-spacing: 3px;">${
                  datosCompra.token_compra
                }</p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Guarda este token para seguimiento</p>
              </div>

              <!-- Detalles de Productos -->
              <h3 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px; margin: 30px 0 20px 0;">📦 Detalles de tu Pedido</h3>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; font-family: Arial, sans-serif; border-bottom: 2px solid #000;">Producto</th>
                    <th style="padding: 12px; text-align: center; font-family: Arial, sans-serif; border-bottom: 2px solid #000;">Cant.</th>
                    <th style="padding: 12px; text-align: right; font-family: Arial, sans-serif; border-bottom: 2px solid #000;">Precio</th>
                    <th style="padding: 12px; text-align: right; font-family: Arial, sans-serif; border-bottom: 2px solid #000;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${productosHTML}
                </tbody>
                <tfoot>
                  <tr style="border-top: 2px solid #000; background-color: #f8f9fa;">
                    <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-family: Arial, sans-serif;">TOTAL:</td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; font-family: Arial, sans-serif; color: #000;">L.${datosCompra.total.toFixed(
                      2
                    )}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Método de Pago -->
              <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">💳 Método de Pago</h4>
                <p style="margin: 0; color: #666; font-size: 16px;">
                  ${
                    datosCompra.metodo_pago === "PayPal"
                      ? "🅿️ PayPal"
                      : datosCompra.metodo_pago === "tarjeta_credito"
                      ? "💳 Tarjeta de Crédito"
                      : datosCompra.metodo_pago === "tarjeta_debito"
                      ? "💳 Tarjeta de Débito"
                      : "🏦 Depósito Bancario"
                  }
                </p>
              </div>

              <!-- Próximos pasos -->
              <div style="background: linear-gradient(135deg, #fff3cd, #ffeaa7); border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="margin: 0 0 15px 0; color: #856404;">📋 ¿Qué sigue?</h4>
                <ul style="margin: 0; padding-left: 20px; color: #856404; line-height: 1.8;">
                  ${
                    datosCompra.metodo_pago === "deposito_bancario"
                      ? `
                    <li><strong>Realiza el depósito</strong> por L.${datosCompra.total.toFixed(
                      2
                    )}</li>
                    <li><strong>Envía el comprobante</strong> a: newliferunclubhonduras@gmail.com</li>
                    <li><strong>Procesaremos tu pedido</strong> en 24-48 horas</li>
                  `
                      : `
                    <li><strong>Procesaremos tu pedido</strong> en las próximas 24 horas</li>
                    <li><strong>Te enviaremos actualizaciones</strong> por email y SMS</li>
                    <li><strong>Envío en 2-5 días</strong> hábiles</li>
                  `
                  }
                  <li><strong>Seguimiento disponible</strong> con tu token de compra</li>
                </ul>
              </div>

              <!-- Contacto -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; margin-bottom: 10px;">¿Necesitas ayuda?</p>
                <p style="color: #333; margin: 5px 0;">
                  📧 <a href="mailto:newliferunclubhonduras@gmail.com" style="color: #000; text-decoration: none;">newliferunclubhonduras@gmail.com</a>
                </p>
                <p style="color: #333; margin: 5px 0;">📱 WhatsApp: +504 0000-0000</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                © 2025 NewLifeRun Club - Tu comunidad de running en Honduras
              </p>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                Este email fue enviado porque realizaste una compra en nuestra tienda
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Configurar opciones del email
      const mailOptions = {
        from: {
          name: "NewLifeRun Club",
          address: process.env.EMAIL_USER || "newliferunclubhonduras@gmail.com",
        },
        to: datosCompra.email,
        subject: `✅ Confirmación de Compra #${datosCompra.token_compra} - NewLifeRun Club`,
        html: emailHTML,
        text: `¡Hola ${datosCompra.nombre}! Tu compra #${
          datosCompra.token_compra
        } por L.${datosCompra.total.toFixed(
          2
        )} ha sido confirmada. Total de productos: ${
          JSON.parse(datosCompra.productos).length
        }. Token: ${datosCompra.token_compra}`,
      };

      // Enviar email
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `📧 Email de confirmación enviado a ${datosCompra.email}: ${info.messageId}`
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("❌ Error enviando email de confirmación:", error);
      throw error;
    }
  }

  // 📊 ESTADÍSTICAS DE COMPRAS (ADMIN)
  static async obtenerEstadisticas(req, res) {
    try {
      // 🔍 VALIDAR QUE LA TABLA COMPRAS EXISTE
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'compras'
        )
      `);

      if (!tableCheck.rows[0].exists) {
        return res.status(503).json({
          success: false,
          message: "Sistema de compras en configuración. Inténtalo más tarde.",
          error: "TABLE_NOT_READY",
        });
      }

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
