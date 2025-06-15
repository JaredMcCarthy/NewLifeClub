-- 🗂️ SCRIPT COMPLETO PARA NEON DATABASE - NEWLIFERUN CLUB
-- ⚠️  ESTE SCRIPT BORRA TODAS LAS TABLAS EXISTENTES Y LAS RECREA
-- 🔧 Ejecutar todo de una vez en Neon para limpiar y recrear la BD completa

-- ========================================
-- 🗑️ PASO 1: LIMPIAR BASE DE DATOS COMPLETA
-- ========================================

-- Borrar todas las tablas existentes (en orden correcto por dependencias)
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS newsletter CASCADE;
DROP TABLE IF EXISTS contacto CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS informacion_envio CASCADE;

-- ========================================
-- 🏗️ PASO 2: CREAR TODAS LAS TABLAS NUEVAS
-- ========================================

-- 👤 TABLA DE USUARIOS (para autenticación)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_login TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'active'
);

-- 📞 TABLA DE CONTACTO (mensajes del formulario de contacto)
CREATE TABLE contacto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    asunto VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📧 TABLA DE NEWSLETTER (suscripciones al boletín)
CREATE TABLE newsletter (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(100) UNIQUE NOT NULL,
    fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🏃‍♂️ TABLA DE INSCRIPCIONES A EVENTOS
CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
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
);

-- 🛒 TABLA DE COMPRAS (carrito de compras - LA MÁS IMPORTANTE)
CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    
    -- 👤 Información del cliente
    email VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    
    -- 💳 Información de la compra
    token_compra VARCHAR(255) UNIQUE NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    impuestos DECIMAL(10,2) DEFAULT 0,
    descuentos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- 📦 Productos comprados (JSON)
    productos TEXT NOT NULL,
    
    -- 🔒 Información segura de tarjeta
    ultimos_4_digitos VARCHAR(4),
    tipo_tarjeta VARCHAR(20),
    
    -- 📊 Control y seguimiento
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'completada',
    
    -- Restricciones
    CONSTRAINT unique_token UNIQUE(token_compra)
);

-- 📦 TABLA DE INFORMACIÓN DE ENVÍO (opcional para futuro)
CREATE TABLE informacion_envio (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER REFERENCES compras(id) ON DELETE CASCADE,
    empresa_envio VARCHAR(100),
    numero_guia VARCHAR(100),
    estado_envio VARCHAR(50) DEFAULT 'preparando',
    fecha_envio TIMESTAMP NULL,
    fecha_entrega_estimada DATE NULL,
    fecha_entrega_real TIMESTAMP NULL,
    direccion_envio TEXT NOT NULL,
    notas_envio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 🚀 PASO 3: CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ========================================

-- Índices para tabla usuarios
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_status ON usuarios(status);

-- Índices para tabla contacto
CREATE INDEX idx_contacto_fecha ON contacto(fecha);
CREATE INDEX idx_contacto_correo ON contacto(correo);

-- Índices para tabla newsletter
CREATE INDEX idx_newsletter_fecha ON newsletter(fecha_suscripcion);

-- Índices para tabla event_registrations
CREATE INDEX idx_events_email ON event_registrations(user_email);
CREATE INDEX idx_events_date ON event_registrations(event_date);
CREATE INDEX idx_events_status ON event_registrations(status);

-- Índices para tabla compras (MUY IMPORTANTES)
CREATE INDEX idx_compras_email ON compras(email);
CREATE INDEX idx_compras_fecha ON compras(fecha_compra);
CREATE INDEX idx_compras_token ON compras(token_compra);
CREATE INDEX idx_compras_estado ON compras(estado);

-- Índices para tabla informacion_envio
CREATE INDEX idx_envio_compra ON informacion_envio(compra_id);
CREATE INDEX idx_envio_estado ON informacion_envio(estado_envio);

-- ========================================
-- ✅ VERIFICACIÓN FINAL
-- ========================================

-- Mostrar todas las tablas creadas
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ========================================
-- 📊 RESULTADO ESPERADO: 6 TABLAS CREADAS
-- ========================================
-- ✅ usuarios
-- ✅ contacto  
-- ✅ newsletter
-- ✅ event_registrations
-- ✅ compras
-- ✅ informacion_envio 