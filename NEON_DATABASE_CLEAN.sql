-- 🗃️ SCRIPT LIMPIO PARA NEON DATABASE - NewLifeRun Club
-- Ejecutar todo de una vez en el SQL Editor de Neon

-- 1️⃣ TABLA DE USUARIOS (ya existe y funciona)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2️⃣ TABLA DE CONTACTO (ARREGLADA - faltaba punto y coma)
CREATE TABLE IF NOT EXISTS contacto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(100),
    asunto VARCHAR(100),
    mensaje TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3️⃣ TABLA DE NEWSLETTER
CREATE TABLE IF NOT EXISTS newsletter (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(100) UNIQUE NOT NULL,
    fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- 4️⃣ TABLA DE REGISTROS DE EVENTOS
CREATE TABLE IF NOT EXISTS event_registrations (
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

-- 5️⃣ TABLA DE COMPRAS (NUEVA Y PROFESIONAL) 🛒
CREATE TABLE IF NOT EXISTS compras (
    id SERIAL PRIMARY KEY,
    -- Información del cliente
    email VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    
    -- Información de la compra
    token_compra VARCHAR(255) UNIQUE NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL, -- 'tarjeta_debito', 'tarjeta_credito', 'deposito_bancario'
    subtotal DECIMAL(10,2) NOT NULL,
    impuestos DECIMAL(10,2) DEFAULT 0,
    descuentos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Productos comprados (JSON array)
    productos TEXT NOT NULL, -- JSON string con productos
    
    -- Información de tarjeta (SOLO SEGURA)
    ultimos_4_digitos VARCHAR(4), -- Solo si pagó con tarjeta
    tipo_tarjeta VARCHAR(20), -- 'visa', 'mastercard', 'amex', etc.
    
    -- Control y seguimiento
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'completada', -- 'completada', 'pendiente', 'cancelada', 'enviada'
    
    -- Constraint único para token
    CONSTRAINT unique_token UNIQUE(token_compra)
);

-- 📊 ÍNDICES PARA OPTIMIZAR CONSULTAS
CREATE INDEX IF NOT EXISTS idx_compras_email ON compras(email);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha_compra);
CREATE INDEX IF NOT EXISTS idx_compras_token ON compras(token_compra);

-- ✅ VERIFICAR QUE TODAS LAS TABLAS SE CREARON CORRECTAMENTE
-- Estas consultas las puedes ejecutar después para verificar:

-- SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
-- UNION ALL
-- SELECT 'contacto' as tabla, COUNT(*) as registros FROM contacto
-- UNION ALL  
-- SELECT 'newsletter' as tabla, COUNT(*) as registros FROM newsletter
-- UNION ALL
-- SELECT 'event_registrations' as tabla, COUNT(*) as registros FROM event_registrations
-- UNION ALL
-- SELECT 'compras' as tabla, COUNT(*) as registros FROM compras; 