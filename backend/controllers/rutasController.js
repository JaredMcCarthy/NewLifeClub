const db = require("../config/db");
const { transporter } = require("../config/mailer");

const registrarEnRuta = async (req, res) => {
  try {
    const {
      rutaId,
      rutaNombre,
      nombre,
      email,
      telefono,
      participantes,
      fecha,
      duracion,
      ubicacion,
      dificultad,
    } = req.body;

    // Crear tabla si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS rutas_registros (
        id SERIAL PRIMARY KEY,
        ruta_id VARCHAR(50) NOT NULL,
        ruta_nombre VARCHAR(255) NOT NULL,
        nombre_participante VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefono VARCHAR(50) NOT NULL,
        num_participantes INTEGER NOT NULL,
        fecha VARCHAR(100) NOT NULL,
        duracion VARCHAR(50) NOT NULL,
        ubicacion VARCHAR(255) NOT NULL,
        dificultad VARCHAR(50) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar en la base de datos usando PostgreSQL sintaxis
    const result = await db.query(
      `INSERT INTO rutas_registros 
       (ruta_id, ruta_nombre, nombre_participante, email, telefono, num_participantes, fecha, duracion, ubicacion, dificultad) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        rutaId,
        rutaNombre,
        nombre,
        email,
        telefono,
        participantes,
        fecha,
        duracion,
        ubicacion,
        dificultad,
      ]
    );

    // Enviar correo de confirmación
    await transporter.sendMail({
      from: '"NewLifeRun Club" <newliferunclubhonduras@gmail.com>',
      to: email,
      subject: `¡Bienvenido a la ${rutaNombre}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">¡Gracias por unirte a nuestra ruta semanal!</h2>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333;">Detalles de la Ruta</h3>
            <p><strong>Ruta:</strong> ${rutaNombre}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Duración:</strong> ${duracion}</p>
            <p><strong>Ubicación:</strong> ${ubicacion}</p>
            <p><strong>Dificultad:</strong> ${dificultad}</p>
            <p><strong>Participantes registrados:</strong> ${participantes}</p>
          </div>
          
          <p>Te esperamos para vivir esta increíble aventura. No olvides:</p>
          <ul>
            <li>Llevar ropa adecuada</li>
            <li>Hidratación suficiente</li>
            <li>Llegar 15 minutos antes</li>
          </ul>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
          <p>Email: info@newliferun.com</p>
          <p>Teléfono: +504 3364-7133</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Registro exitoso en la ruta",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en registro de ruta:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar el registro",
      error: error.message,
    });
  }
};

module.exports = {
  registrarEnRuta,
};
