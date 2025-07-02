-- 🛒 SCRIPT SEGURO PARA AGREGAR SOLO TABLA COMPRAS - NEWLIFERUN CLUB
-- ✅ ESTE SCRIPT NO BORRA NADA EXISTENTE
-- 🔧 Solo agrega la tabla compras si no existe

-- ========================================
-- 🔍 VERIFICAR TABLAS EXISTENTES
-- ========================================

-- Ver qué tablas ya tienes
SELECT 
    tablename,
    schemaname,
    'EXISTE' as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ========================================
-- 🛒 CREAR SOLO TABLA COMPRAS (SIN TOCAR NADA MÁS)
-- ========================================

-- Solo crear tabla compras si NO existe
CREATE TABLE IF NOT EXISTS compras (
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

-- ========================================
-- 🚀 CREAR ÍNDICES SOLO PARA COMPRAS
-- ========================================

-- Crear índices solo si no existen
CREATE INDEX IF NOT EXISTS idx_compras_email ON compras(email);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha_compra);
CREATE INDEX IF NOT EXISTS idx_compras_token ON compras(token_compra);
CREATE INDEX IF NOT EXISTS idx_compras_estado ON compras(estado);

-- ========================================
-- ✅ VERIFICACIÓN FINAL
-- ========================================

-- Confirmar que tabla compras fue creada
SELECT 
    tablename,
    schemaname,
    CASE 
        WHEN tablename = 'compras' THEN '✅ NUEVA TABLA AGREGADA'
        ELSE '✅ TABLA EXISTENTE PRESERVADA'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar estructura de tabla compras
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'compras' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 📊 MENSAJE FINAL
-- ========================================
SELECT '🎉 TABLA COMPRAS AGREGADA EXITOSAMENTE - TODAS LAS DEMÁS TABLAS Y DATA PRESERVADA' as resultado; 