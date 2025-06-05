require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const authRoutes = require("./backend/routes/authRoutes");
const eventRoutes = require("./backend/routes/eventRegistration");
const newsletterRoutes = require("./backend/routes/newsletter");
const contactRoutes = require("./backend/routes/contacts");
const rutasRoutes = require("./backend/routes/rutasRoutes");

const app = express();

// Configuración de seguridad
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Configuración de CORS
app.use(
  cors({
    origin: "*", // Permitir todas las origenes durante desarrollo
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Accept", "Origin", "X-Requested-With"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Compartir la conexión de PostgreSQL (Neon) con las rutas
const pool = require("./backend/config/db");
app.locals.pool = pool;

// Agregar middleware para debugging de rutas
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.url}`);
  next();
});

// Rutas específicas PRIMERO (antes que auth)
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/event-registration", eventRoutes);
app.use("/api/rutasRoutes", rutasRoutes);
app.use("/backend/routes", newsletterRoutes);
app.use("/backend/routes", contactRoutes);
app.use("/backend/routes", rutasRoutes);

// AUTH con rutas específicas (NO capturar todo /api)
app.use("/api/login", authRoutes);
app.use("/api/register", authRoutes);

// Rutas adicionales para newsletter (fallback)
app.use("/newsletter", newsletterRoutes);

// Rutas adicionales para rutas (fallback)
app.use("/rutasRoutes", rutasRoutes);

// Rutas adicionales para eventos (fallback)
app.use("/event-registration", eventRoutes);

// Servir archivos estáticos
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/sesion", (req, res) => {
  res.sendFile(path.join(__dirname, "sesion.html"));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Error en el servidor",
    error: err.message,
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
