const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "newliferunclubhonduras@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

// Verificar configuración de email
const isEmailConfigured = () => {
  return process.env.EMAIL_PASS && process.env.EMAIL_PASS.length > 0;
};

// Función para enviar correo con código promocional
const sendPromoEmail = async (email) => {
  const mailOptions = {
    from: '"NewLifeRun Club Tienda" <newliferunclubhonduras@gmail.com>',
    to: email,
    subject: "¡Bienvenido a NewLife! 🎉 Tu código de descuento te espera",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff69b4, #ff00ff); padding: 20px; border-radius: 15px;">
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #ff69b4; font-size: 2.5rem; margin-bottom: 20px;">¡Gracias por suscribirte! 🛍️</h1>
          
          <p style="font-size: 1.2rem; color: #333; margin-bottom: 30px;">
            ¡Bienvenido a la familia NewLifeRun Club! Como agradecimiento, aquí tienes tu código de descuento exclusivo:
          </p>
          
          <div style="background: linear-gradient(45deg, #ff69b4, #ff00ff); padding: 20px; border-radius: 10px; margin: 30px 0;">
            <h2 style="color: white; font-size: 2rem; margin: 0; letter-spacing: 3px;">WELCOME10</h2>
            <p style="color: white; margin: 10px 0 0 0; font-size: 1.1rem;">10% de descuento en tu primera compra</p>
          </div>
          
          <p style="color: #666; font-size: 1rem; margin-bottom: 30px;">
            Usa este código en el checkout y obtén un 10% de descuento en toda nuestra colección exclusiva.
          </p>
          
          <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">¿Qué puedes esperar?</h3>
            <ul style="text-align: left; color: #666; line-height: 1.6;">
              <li>🎽 Ofertas exclusivas en ropa deportiva</li>
              <li>🏃‍♀️ Descuentos especiales para miembros</li>
              <li>📧 Noticias sobre nuevas colecciones</li>
              <li>🎁 Códigos promocionales únicos</li>
            </ul>
          </div>
          
          <a href="https://newlifeclub.onrender.com/tienda.html" 
             style="display: inline-block; background: linear-gradient(45deg, #ff69b4, #ff00ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 1.1rem; margin-top: 20px;">
            ¡Comprar Ahora! 🛒
          </a>
          
          <p style="color: #999; font-size: 0.9rem; margin-top: 30px;">
            Si tienes alguna pregunta, contáctanos:<br>
            📧 info@newliferun.com | 📱 +504 3364-7133
          </p>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// Ruta para suscripción al newsletter de la tienda
router.post("/subscribe", async (req, res) => {
  try {
    console.log("📧 Solicitud de newsletter de tienda recibida");
    console.log("📥 Body:", req.body);

    const { email } = req.body;

    if (!email) {
      console.log("❌ Email no proporcionado");
      return res.status(400).json({
        success: false,
        message: "El email es requerido",
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Formato de email inválido:", email);
      return res.status(400).json({
        success: false,
        message: "Formato de email inválido",
      });
    }

    const pool = req.app.locals.pool;
    console.log(
      "🔧 Pool de base de datos:",
      pool ? "✅ Disponible" : "❌ No disponible"
    );

    // Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        promo_code VARCHAR(50) DEFAULT 'WELCOME10',
        status VARCHAR(20) DEFAULT 'active'
      )
    `);
    console.log("✅ Tabla newsletter_subscriptions verificada");

    // Verificar si el email ya existe
    const existingSubscription = await pool.query(
      "SELECT * FROM newsletter_subscriptions WHERE email = $1",
      [email]
    );

    if (existingSubscription.rows.length > 0) {
      console.log("⚠️ Email ya existente:", email);
      return res.status(400).json({
        success: false,
        message: "Este email ya está suscrito a nuestro newsletter",
      });
    }

    // Insertar nueva suscripción
    console.log("💾 Insertando nueva suscripción para:", email);
    const result = await pool.query(
      "INSERT INTO newsletter_subscriptions (email, promo_code) VALUES ($1, $2) RETURNING *",
      [email, "WELCOME10"]
    );
    console.log("✅ Suscripción guardada en BD:", result.rows[0]);

    // Enviar correo con código promocional
    let emailSent = false;
    let emailError = null;

    if (isEmailConfigured()) {
      try {
        console.log("📧 Intentando enviar correo promocional a:", email);
        await sendPromoEmail(email);
        console.log("✅ Correo promocional enviado exitosamente a:", email);
        emailSent = true;
      } catch (error) {
        console.error("❌ Error al enviar correo:", error.message);
        emailError = error.message;
      }
    } else {
      console.log(
        "⚠️ Credenciales de email no configuradas, saltando envío de correo"
      );
      emailError = "Credenciales de email no configuradas";
    }

    // Respuesta exitosa (independiente del envío de correo)
    res.json({
      success: true,
      message: emailSent
        ? "Suscripción exitosa. Revisa tu correo para obtener tu código de descuento."
        : "Suscripción exitosa. Tu código de descuento es WELCOME10 (10% off).",
      data: {
        email: email,
        promoCode: "WELCOME10",
        discount: "10%",
        emailSent: emailSent,
        emailError: emailError,
      },
    });
  } catch (error) {
    console.error("❌ Error en suscripción al newsletter de tienda:", error);

    if (error.code === "23505") {
      // Código de error de PostgreSQL para violación de unicidad
      return res.status(400).json({
        success: false,
        message: "Este email ya está suscrito a nuestro newsletter",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al procesar la suscripción",
      error: error.message,
    });
  }
});

module.exports = router;
