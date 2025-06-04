const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_Np4d5akmOrBS@ep-dawn-fog-a8mxb44d-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Verificar conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.stack);
  } else {
    console.log("✅ Conectado exitosamente a PostgreSQL en Neon");
    release();
  }
});

module.exports = pool;
