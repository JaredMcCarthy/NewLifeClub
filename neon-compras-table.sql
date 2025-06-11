-- =========================================
-- 🛒 TABLA COMPRAS - NEWLIFE RUN CLUB
-- Ejecutar en Neon Console
-- =========================================

-- Crear tabla principal de compras
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
    metodo_pago VARCHAR(50) NOT NULL, -- 'tarjeta_credito', 'tarjeta_debito', 'deposito_bancario'
    subtotal DECIMAL(10,2) NOT NULL,
    impuestos DECIMAL(10,2) DEFAULT 0,
    descuentos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Productos comprados (JSON string)
    productos TEXT NOT NULL,
    
    -- Información de tarjeta (SOLO SEGURA - últimos 4 dígitos)
    ultimos_4_digitos VARCHAR(4),
    tipo_tarjeta VARCHAR(20), -- 'visa', 'mastercard', 'amex', 'discover', 'otras'
    
    -- Control y seguimiento
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'completada', -- 'completada', 'pendiente', 'cancelada', 'enviada'
    
    -- Restricciones
    CONSTRAINT unique_token UNIQUE(token_compra),
    CONSTRAINT valid_metodo_pago CHECK (metodo_pago IN ('tarjeta_credito', 'tarjeta_debito', 'deposito_bancario')),
    CONSTRAINT valid_estado CHECK (estado IN ('completada', 'pendiente', 'cancelada', 'enviada'))
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_compras_email ON compras(email);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha_compra DESC);
CREATE INDEX IF NOT EXISTS idx_compras_token ON compras(token_compra);
CREATE INDEX IF NOT EXISTS idx_compras_estado ON compras(estado);
CREATE INDEX IF NOT EXISTS idx_compras_metodo_pago ON compras(metodo_pago);

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla compras creada exitosamente' as mensaje;

-- Mostrar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'compras' 
ORDER BY ordinal_position; 