const nodemailer = require("nodemailer");

// Transportador básico con Gmail (requiere cuenta de Gmail y contraseña o App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "newliferunclubhonduras@gmail.com", // Email directo mientras debuggeamos
    pass: "dbdk bykw xlgg fcrq", // App Password directo mientras debuggeamos
  },
});

// Verificar la conexión del transportador
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Error en la configuración del correo:", error);
  } else {
    console.log("✅ Servidor listo para enviar correos!");
  }
});

const sendWelcomeEmail = async (to, name) => {
  console.log("📧 Intentando enviar correo a:", to);
  try {
    const mailOptions = {
      from: '"NewLifeRun Club" <newliferunclubhonduras@gmail.com>',
      to: to,
      subject: "¡Bienvenido a la familia NewLifeRun Club!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">¡Hola ${name}!</h2>
          
          <p>¡Te damos la más cordial bienvenida a la familia NewLifeRun Club! Nos llena de alegría que hayas decidido unirte a nuestra comunidad de corredores.</p>
          
          <p>En NewLifeRun Club encontrarás todo lo que necesitas para alcanzar tus metas deportivas:</p>
          
          <ul style="list-style-type: none; padding-left: 0;">
            <li>🏃‍♂️ Membresías exclusivas</li>
            <li>📋 Planes de entrenamiento personalizados</li>
            <li>🎉 Eventos especiales durante todo el año</li>
            <li>🗺️ Rutas semanales para todos los niveles</li>
            <li>👕 Ropa deportiva para hombre, mujer y unisex</li>
          </ul>
          
          <p>Nuestro equipo de servicio al cliente está siempre disponible para atender tus consultas y ayudarte en lo que necesites.</p>
          
          <p>Síguenos en nuestras redes sociales para mantenerte al día con todas nuestras actividades y novedades:</p>
          
          <div style="margin: 20px 0;">
            <a href="https://www.instagram.com/newliferunclub" style="text-decoration: none; color: #333;">📸 Instagram: @newliferunclub</a><br>
          </div>
          
          <p>¡Gracias nuevamente por unirte a nuestra familia! Estamos emocionados de ser parte de tu journey deportivo.</p>
          
          <hr style="margin: 20px 0; border: 1px solid #eee;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">Con aprecio,<br>NewLifeRun Club | Tech & Innovation Team</p>
        </div>
      `,
    };

    console.log("📨 Configuración del correo:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado exitosamente");
    console.log("📬 Detalles del envío:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error) {
    console.error("❌ Error detallado al enviar correo:", {
      message: error.message,
      code: error.code,
      command: error.command,
    });
    throw error;
  }
};

const sendEventConfirmationEmail = async (eventData) => {
  const {
    userEmail,
    userName,
    eventName,
    eventDate,
    eventTime,
    eventLocation,
  } = eventData;

  try {
    const mailOptions = {
      from: '"NewLifeRun Club" <newliferunclubhonduras@gmail.com>',
      to: userEmail,
      subject: `¡Inscripción Confirmada - ${eventName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff5ab9; text-align: center;">¡Gracias por inscribirte!</h1>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333;">Detalles del Evento</h2>
            <p><strong>Evento:</strong> ${eventName}</p>
            <p><strong>Fecha:</strong> ${eventDate}</p>
            <p><strong>Hora:</strong> ${eventTime}</p>
            <p><strong>Ubicación:</strong> ${eventLocation}</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333;">Información del Participante</h2>
            <p><strong>Nombre:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p>¡Te esperamos en el evento!</p>
            <p style="color: #666; font-size: 14px;">
              Si tienes alguna pregunta, no dudes en contactarnos:
              <br>
              Email: info@newliferun.com
              <br>
              Teléfono: +504 3364-7133
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo de confirmación de evento enviado exitosamente");
    return info;
  } catch (error) {
    console.error(
      "❌ Error al enviar correo de confirmación de evento:",
      error
    );
    throw error;
  }
};

module.exports = { transporter, sendWelcomeEmail, sendEventConfirmationEmail };
