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

    // Insertar en la base de datos
    const [result] = await db.execute(
      `INSERT INTO rutas_registros 
       (ruta_id, ruta_nombre, nombre_participante, email, telefono, num_participantes, fecha, duracion, ubicacion, dificultad, fecha_registro) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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
      data: result,
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
