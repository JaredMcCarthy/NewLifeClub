const mysql = require("mysql2/promise"); // Usa mysql2/promise

// Usar async function para conectar
const connection = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "123456789",
  database: "newlifewsers",
  waitForConnections: true, // Esperar conexiones si hay muchas
  connectionLimit: 10, // Límite de conexiones
  queueLimit: 0, // Sin límite de espera en cola
});

module.exports = connection; // Exportamos el pool de conexiones
