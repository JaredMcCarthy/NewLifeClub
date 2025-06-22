-- ============================================
-- 🏃‍♂️ TABLA PARA PLANES DE ENTRENAMIENTO
-- ============================================
-- Esta tabla guarda información adicional de los planes de entrenamiento
-- incluyendo entrenadores asignados y estados personalizados

CREATE TABLE IF NOT EXISTS training_plans (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER NOT NULL UNIQUE, -- Referencia a la tabla compras
    trainer VARCHAR(100) DEFAULT 'Sin asignar', -- Entrenador asignado
    custom_status VARCHAR(50) DEFAULT 'activo', -- Estado personalizado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Crear índice para búsquedas rápidas
    CONSTRAINT fk_training_plans_compra FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_training_plans_compra_id ON training_plans(compra_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_trainer ON training_plans(trainer);
CREATE INDEX IF NOT EXISTS idx_training_plans_status ON training_plans(custom_status);

-- Comentarios para documentación
COMMENT ON TABLE training_plans IS 'Información adicional de planes de entrenamiento';
COMMENT ON COLUMN training_plans.compra_id IS 'ID de la compra en la tabla compras';
COMMENT ON COLUMN training_plans.trainer IS 'Entrenador asignado al plan';
COMMENT ON COLUMN training_plans.custom_status IS 'Estado personalizado del plan';

-- Insertar datos de ejemplo para planes existentes (opcional)
-- INSERT INTO training_plans (compra_id, trainer, custom_status)
-- SELECT id, 'Sin asignar', 'activo' 
-- FROM compras 
-- WHERE productos ILIKE '%plan%' OR productos ILIKE '%10k%' OR productos ILIKE '%21k%' OR productos ILIKE '%42k%'
-- ON CONFLICT (compra_id) DO NOTHING;

SELECT 'Tabla training_plans creada exitosamente' as resultado; 