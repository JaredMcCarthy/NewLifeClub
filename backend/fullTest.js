require("dotenv").config();
const db = require("./config/db");
const bcrypt = require("bcrypt");

console.log("🚀 Iniciando prueba completa...");

async function runTests() {
  try {
    // 1. Prueba de conexión básica
    const [res] = await db.query("SELECT 1 + 1 AS result");
    console.log(`✅ 1 + 1 = ${res[0].result}`);

    // 2. Prueba de inserción
    const testPass = await bcrypt.hash("test123", 10);
    const [insert] = await db.query(
      "INSERT INTO `usuarios` (`nombre`, `correo`, `contraseña`) VALUES (?, ?, ?)",
      ["PruebaJS", "prueba@js.com", testPass]
    );
    console.log(`✅ Insertado ID: ${insert.insertId}`);

    // 3. Prueba de lectura
    const [users] = await db.query("SELECT * FROM `usuarios`");
    console.log(`📦 Total usuarios: ${users.length}`);
  } catch (err) {
    console.error("❌ Error en prueba:", err.message);
    console.error("Código de error:", err.code);
  } finally {
    process.exit();
  }
}

runTests();
