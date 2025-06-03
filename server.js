require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
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

// Configuración de la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456789",
  database: process.env.DB_NAME || "newlifewsers",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar conexión a la base de datos
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error conectando a la base de datos:", err);
    return;
  }
  console.log("✅ Conexión a la base de datos establecida");
  connection.release();
});

// Compartir la conexión con las rutas
app.locals.pool = pool;

// Rutas
app.use("/", authRoutes);
app.use("/backend/routes/eventRegistration", eventRoutes);
app.use("/backend/routes/newsletter", newsletterRoutes);
app.use("/backend/routes/contacts", contactRoutes);
app.use("/backend/routes/rutasRoutes", rutasRoutes);

// Agregar middleware para debugging de rutas
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.url}`);
  next();
});

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
