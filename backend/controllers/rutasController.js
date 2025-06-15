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

    // Insertar el registro
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
        1, // Siempre 1 participante
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
