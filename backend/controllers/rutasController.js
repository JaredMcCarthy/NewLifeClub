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

    const pool = req.app.locals.pool;

    // Crear tabla si no existe
    await pool.query(`
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

    // Insertar en la base de datos
    const result = await pool.query(
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

    console.log("✅ Registro de ruta guardado en BD");

    // Solo devolver éxito - NO enviar correo como pidió el usuario
    return res.status(200).json({
      success: true,
      message: "Inscripción en ruta registrada exitosamente",
      data: {
        id: result.rows[0].id,
        rutaNombre,
        nombre,
        participantes,
      },
    });
  } catch (error) {
    console.error("❌ Error en registro de ruta:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la inscripción en ruta",
      error: error.message,
    });
  }
};

module.exports = { registrarEnRuta };
