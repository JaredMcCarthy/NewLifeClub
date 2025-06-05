const express = require("express");
const router = express.Router();
const { sendEventConfirmationEmail } = require("../config/mailer");

// Endpoint para registrar en evento
router.post("/event-registration", async (req, res) => {
  console.log("📥 Datos de registro recibidos:", req.body);

  try {
    const {
      eventId,
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      eventType,
      userName,
      userEmail,
      userPhone,
    } = req.body;

    // Validar campos requeridos
    if (
      !eventId ||
      !eventName ||
      !eventDate ||
      !eventTime ||
      !eventLocation ||
      !eventType ||
      !userName ||
      !userEmail ||
      !userPhone
    ) {
      console.log("❌ Faltan campos requeridos");
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
      });
    }

    // Obtener la conexión del pool compartido (PostgreSQL)
    const pool = req.app.locals.pool;

    // Crear tabla si no existe (PostgreSQL sintaxis)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(50) NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        user_phone VARCHAR(50) NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        event_date VARCHAR(100) NOT NULL,
        event_time VARCHAR(50) NOT NULL,
        event_location VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active'
      )
    `);

    // Insertar en la base de datos (PostgreSQL sintaxis con $1, $2, etc.)
    const result = await pool.query(
      `INSERT INTO event_registrations 
      (event_id, event_name, user_name, user_email, user_phone, event_date, event_time, event_location, event_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        eventId,
        eventName,
        userName,
        userEmail,
        userPhone,
        eventDate,
        eventTime,
        eventLocation,
        eventType,
      ]
    );

    console.log("✅ Registro guardado en la base de datos");

    try {
      // Enviar correo de confirmación
      await sendEventConfirmationEmail({
        userEmail,
        userName,
        eventName,
        eventDate,
        eventTime,
        eventLocation,
      });
      console.log("📧 Correo de confirmación enviado");

      return res.status(200).json({
        success: true,
        message: "Inscripción registrada exitosamente",
        data: result.rows[0],
      });
    } catch (emailError) {
      console.error("❌ Error al enviar el correo:", emailError);
      return res.status(200).json({
        success: true,
        message:
          "Inscripción registrada exitosamente, pero hubo un problema al enviar el correo",
        data: result.rows[0],
      });
    }
  } catch (error) {
    console.error("❌ Error en el registro:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la inscripción",
      error: error.message,
    });
  }
});

module.exports = router;
