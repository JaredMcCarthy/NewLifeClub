-- 🔍 VERIFICAR TABLAS - Solo comandos SELECT
-- Ejecutar esto DESPUÉS de crear las tablas

-- Ver todas las compras
SELECT * FROM compras;

-- Ver específicamente tu compra por token
SELECT * FROM compras WHERE token_compra = 'NRC-240608-A7X9';

-- Contar registros en todas las tablas
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'contacto' as tabla, COUNT(*) as registros FROM contacto
UNION ALL  
SELECT 'newsletter' as tabla, COUNT(*) as registros FROM newsletter
UNION ALL
SELECT 'event_registrations' as tabla, COUNT(*) as registros FROM event_registrations
UNION ALL
SELECT 'compras' as tabla, COUNT(*) as registros FROM compras;

-- Ver los usuarios registrados
SELECT * FROM usuarios;

-- Ver los contactos
SELECT * FROM contacto; 