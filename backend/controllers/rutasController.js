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
        dificultad VARCHAR(50) NOT NULL
      );
    `);

    // Verificar si ya existe un registro con el mismo email y ruta_id
    const existingRegistration = await pool.query(
      "SELECT * FROM rutas_registros WHERE email = $1 AND ruta_id = $2",
      [email, rutaId]
    );

    if (existingRegistration.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya estás registrado en esta ruta",
      });
    }

    // Si no existe, proceder con la inserción
    const result = await pool.query(
      `INSERT INTO rutas_registros (
        ruta_id,
        ruta_nombre,
        nombre_participante,
        email,
        telefono,
        num_participantes,
        fecha,
        duracion,
        ubicacion,
        dificultad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
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

    res.json({
      success: true,
      message: "Registro exitoso en la ruta",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar en ruta:", error);
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
