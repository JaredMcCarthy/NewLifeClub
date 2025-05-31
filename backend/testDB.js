const db = require("./config/db");

console.log("🔍 Verificando estructura de la tabla...");

async function testStructure() {
  try {
    // Verifica estructura de la tabla
    const [columns] = await db.query("DESCRIBE usuarios");
    console.log("✅ Campos en la tabla 'usuarios':");
    console.log(columns.map((c) => `${c.Field} (${c.Type})`).join("\n"));

    // Verifica el usuario de prueba
    const [users] = await db.query(
      "SELECT * FROM usuarios WHERE correo = 'test@test.com'"
    );
    console.log(
      users.length > 0
        ? "✅ Usuario test encontrado"
        : "❌ Usuario test NO encontrado"
    );
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    process.exit();
  }
}

testStructure();
