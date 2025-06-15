require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const authRoutes = require("./backend/routes/authRoutes");
const eventRoutes = require("./backend/routes/eventRegistration");
const newsletterRoutes = require("./backend/routes/newsletter");
const tiendaNewsletterRoutes = require("./backend/routes/tiendaNewsletter");
const contactRoutes = require("./backend/routes/contacts");
const rutasRoutes = require("./backend/routes/rutasRoutes");
const comprasRoutes = require("./backend/routes/compras");

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
    methods: ["GET", "POST", "PUT", "OPTIONS"],
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

// Rutas principales
app.use("/api", authRoutes);
app.use("/backend/routes", rutasRoutes);

// 🛒 NUEVA RUTA PARA COMPRAS - COMPLETAMENTE INDEPENDIENTE
app.use("/api/compras", comprasRoutes);

// Rutas adicionales para rutas (fallback)
app.use("/rutasRoutes", rutasRoutes);

// Rutas adicionales para eventos (fallback)
app.use("/event-registration", eventRoutes);

// Newsletter completamente separado
app.use("/newsletter-api", newsletterRoutes);

// Newsletter de la tienda
app.use("/tienda-newsletter", tiendaNewsletterRoutes);

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
