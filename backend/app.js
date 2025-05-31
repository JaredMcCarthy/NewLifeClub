const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const eventRoutes = require("./routes/eventRegistration");
const newsletterRoutes = require("./routes/newsletter");
const contactRoutes = require("./routes/contacts");

// Usar rutas
app.use("/api/events", eventRoutes);
app.use("/api", newsletterRoutes);
app.use("/api", contactRoutes);

// Ruta de prueba
app.get("/test", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente" });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Error en el servidor",
    error: err.message,
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
