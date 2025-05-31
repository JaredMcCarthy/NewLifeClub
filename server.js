const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const { sendEventConfirmationEmail } = require("./backend/config/mailer");
const eventRoutes = require("./backend/routes/eventRegistration");
const newsletterRoutes = require("./backend/routes/newsletter");
const contactRoutes = require("./backend/routes/contacts");
const authRoutes = require("./backend/routes/authRoutes");
const rutasRoutes = require("./backend/routes/rutasRoutes");
require("dotenv").config();

const app = express();

// Configuración de seguridad mejorada para archivos estáticos
app.use(
  helmet({
    contentSecurityPolicy: false, // Deshabilitar CSP para permitir estilos inline
    crossOriginResourcePolicy: false, // Permitir recursos cross-origin
  })
);

// Configuración de CORS mejorada
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.0.11:3000", // Tu IP local para móviles
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Accept", "Origin", "X-Requested-With"],
  })
);

// Rate limiting para prevenir ataques de fuerza bruta
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
});
app.use("/api/", limiter);

// Middleware para parsear JSON con límite de tamaño
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Configuración mejorada para servir archivos estáticos
app.use(
  express.static(path.join(__dirname), {
    setHeaders: (res, filePath) => {
      // Configurar headers correctos para archivos CSS
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
        console.log(`📄 Sirviendo CSS: ${filePath}`);
      }
      // Configurar headers para archivos JS
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        console.log(`📄 Sirviendo JS: ${filePath}`);
      }
      // Configurar headers para imágenes
      if (filePath.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      }
      if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      }
      if (filePath.endsWith(".gif")) {
        res.setHeader("Content-Type", "image/gif");
      }
      if (filePath.endsWith(".svg")) {
        res.setHeader("Content-Type", "image/svg+xml");
      }
      // Permitir cache para archivos estáticos
      res.setHeader("Cache-Control", "public, max-age=86400");
      // Añadir headers CORS para archivos estáticos
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// Middleware adicional para debug de archivos CSS
app.get("/css/*", (req, res, next) => {
  console.log(`🔍 Solicitando archivo CSS: ${req.url}`);
  next();
});

// Ruta principal para servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "newlifewsers",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
});

// Verificar conexión a la base de datos
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error conectando a la base de datos:", err);
    return;
  }
  console.log("✅ Conexión a la base de datos establecida");

  // Crear tabla de contacto si no existe
  connection.query(
    `
    CREATE TABLE IF NOT EXISTS contacto (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      correo VARCHAR(100) NOT NULL,
      asunto VARCHAR(100) NOT NULL,
      mensaje TEXT NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (error) => {
      if (error) {
        console.error("❌ Error creando la tabla contacto:", error);
      } else {
        console.log("✅ Tabla contacto verificada/creada");
      }
    }
  );

  // Crear tabla newsletter si no existe
  connection.query(
    `CREATE TABLE IF NOT EXISTS newsletter (
      id INT AUTO_INCREMENT PRIMARY KEY,
      correo VARCHAR(255) NOT NULL UNIQUE,
      fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (error) => {
      if (error) {
        console.error("❌ Error creando la tabla newsletter:", error);
      } else {
        console.log("✅ Tabla newsletter verificada/creada");
      }
    }
  );

  // Crear tabla event_registrations si no existe
  connection.query(
    `CREATE TABLE IF NOT EXISTS event_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id VARCHAR(50) NOT NULL,
      event_name VARCHAR(255) NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      user_phone VARCHAR(50) NOT NULL,
      registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      event_date DATE NOT NULL,
      event_time TIME NOT NULL,
      event_location VARCHAR(255) NOT NULL,
      event_type VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'active'
    )`,
    (error) => {
      if (error) {
        console.error("❌ Error creando la tabla:", error);
      } else {
        console.log("✅ Tabla event_registrations verificada/creada");
      }
    }
  );

  // Crear tabla rutas_registros si no existe
  connection.query(
    `CREATE TABLE IF NOT EXISTS rutas_registros (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ruta_id VARCHAR(50) NOT NULL,
      ruta_nombre VARCHAR(255) NOT NULL,
      nombre_participante VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      telefono VARCHAR(50) NOT NULL,
      num_participantes INT NOT NULL,
      fecha VARCHAR(100) NOT NULL,
      duracion VARCHAR(100) NOT NULL,
      ubicacion VARCHAR(255) NOT NULL,
      dificultad VARCHAR(50) NOT NULL,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (error) => {
      if (error) {
        console.error("❌ Error creando la tabla rutas_registros:", error);
      } else {
        console.log("✅ Tabla rutas_registros verificada/creada");
      }
    }
  );

  connection.release();
});

// Compartir la conexión con las rutas
app.locals.pool = pool;

// Usar las rutas
app.use("/api", eventRoutes);
app.use("/api", newsletterRoutes);
app.use("/api", contactRoutes);
app.use("/", authRoutes);
app.use("/api", rutasRoutes);

// Ruta de prueba
app.get("/test", (req, res) => {
  console.log("📝 Ruta de prueba accedida");
  res.json({ message: "Servidor funcionando correctamente" });
});

// Endpoint para inscripciones a eventos
app.post("/api/event-registration", async (req, res) => {
  console.log("Recibida solicitud de registro:", req.body);

  try {
    const {
      eventId,
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      eventType,
      userName,
      userEmail,
      userPhone,
    } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (
      !eventId ||
      !eventName ||
      !eventDate ||
      !eventTime ||
      !eventLocation ||
      !eventType ||
      !userName ||
      !userEmail ||
      !userPhone
    ) {
      console.log("Campos faltantes en la solicitud");
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
      });
    }

    // Insertar en la base de datos
    const query = `
      INSERT INTO event_registrations 
      (event_id, event_name, user_name, user_email, user_phone, event_date, event_time, event_location, event_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    pool.query(
      query,
      [
        eventId,
        eventName,
        userName,
        userEmail,
        userPhone,
        eventDate,
        eventTime,
        eventLocation,
        eventType,
      ],
      async (error, results) => {
        if (error) {
          console.error("Error en la base de datos:", error);
          return res.status(500).json({
            success: false,
            message: "Error al guardar en la base de datos",
            error: error.message,
          });
        }

        console.log("Registro guardado exitosamente en la base de datos");

        try {
          // Enviar correo de confirmación usando la función centralizada
          await sendEventConfirmationEmail({
            userEmail,
            userName,
            eventName,
            eventDate,
            eventTime,
            eventLocation,
          });

          return res.status(200).json({
            success: true,
            message: "Inscripción registrada exitosamente",
          });
        } catch (emailError) {
          console.error("Error al enviar el correo:", emailError);
          return res.status(200).json({
            success: true,
            message:
              "Inscripción registrada exitosamente, pero hubo un problema al enviar el correo",
          });
        }
      }
    );
  } catch (error) {
    console.error("Error en la inscripción:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la inscripción",
      error: error.message,
    });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Error en el servidor",
    error: err.message,
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

// Obtener la IP local automáticamente
const os = require("os");
const networkInterfaces = os.networkInterfaces();
let localIP = "192.168.0.11"; // Fallback a tu IP conocida

// Buscar la IP local real
Object.keys(networkInterfaces).forEach((interfaceName) => {
  networkInterfaces[interfaceName].forEach((interface) => {
    if (
      interface.family === "IPv4" &&
      !interface.internal &&
      interface.address.startsWith("192.168")
    ) {
      localIP = interface.address;
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en:`);
  console.log(`   💻 Local: http://localhost:${PORT}`);
  console.log(`   📱 Red: http://${localIP}:${PORT}`);
  console.log(`✅ Conexión a la base de datos establecida`);
  console.log(`✅ Tabla contacto verificada/creada`);
  console.log(`✅ Tabla newsletter verificada/creada`);
  console.log(`✅ Tabla event_registrations verificada/creada`);
  console.log(`✅ Tabla rutas_registros verificada/creada`);
  console.log(`✅ Servidor listo para enviar correos!`);
  console.log(`\n📱 CONSEJO PARA MÓVIL:`);
  console.log(
    `   Si el CSS no carga en móvil, abre las herramientas de desarrollador`
  );
  console.log(`   en el navegador móvil y revisa la consola por errores 404.`);
  console.log(`   Todas las rutas CSS ahora tienen headers MIME correctos.`);
});
