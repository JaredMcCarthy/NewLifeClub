# 🚀 INSTRUCCIONES DE DESPLIEGUE - NEWLIFE RUN CLUB

## 📋 CONFIGURACIÓN REQUERIDA DESPUÉS DEL DEPLOY

### 1. 🗄️ CONFIGURAR BASE DE DATOS EN NEON

**⚠️ IMPORTANTE: Ejecuta este SQL en Neon Console después del deploy:**

1. Ve a [Neon Console](https://console.neon.tech)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega todo el contenido del archivo `neon-compras-table.sql`
5. **Ejecuta el script**

### 2. ✅ VERIFICAR TABLAS CREADAS

Después de ejecutar el SQL, verifica que tienes estas tablas:

- ✅ `usuarios`
- ✅ `event_registrations`
- ✅ `contacto`
- ✅ `newsletter`
- ✅ **`compras`** ← **NUEVA TABLA CRÍTICA**

### 3. 🔧 CONFIGURACIÓN EN RENDER

**Variables de entorno requeridas:**

```
DATABASE_URL=tu_neon_connection_string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_password_seguro
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

### 4. 🛒 FUNCIONALIDADES DEL SISTEMA DE COMPRAS

**APIs disponibles:**

- `POST /api/compras/nueva-compra` - Crear nueva compra
- `GET /api/compras/mis-compras/:email` - Historial de usuario
- `GET /api/compras/compra/:token` - Detalles de compra específica
- `GET /api/compras/estadisticas` - Estadísticas generales
- `PUT /api/compras/actualizar-estado/:token` - Actualizar estado

**Métodos de pago soportados:**

- 💳 Tarjeta de crédito/débito
- 🏦 Depósito bancario

**Seguridad:**

- ✅ Solo se guardan últimos 4 dígitos de tarjeta
- ✅ Tokens únicos de compra
- ✅ Validaciones completas
- ✅ Sistema de fallback

### 5. 🧪 PRUEBA DEL SISTEMA

**Para probar después del deploy:**

1. **Agregar productos al carrito** desde la tienda
2. **Ir a checkout** → `https://tu-app.onrender.com/checkout.html`
3. **Llenar formulario completo**
4. **Seleccionar método de pago**
5. **Completar compra**
6. **Verificar token generado**

### 6. 📊 MONITOREO

**Verificar logs en Render:**

- ✅ Conexión exitosa a PostgreSQL
- ✅ APIs de compras funcionando
- ❌ Error "relation compras does not exist" = **EJECUTAR SQL EN NEON**

### 7. 🔄 FLUJO COMPLETO

1. **Usuario agrega productos** → localStorage
2. **Va a checkout** → formulario completo
3. **Selecciona método pago** → tarjeta o depósito
4. **Presiona completar pago** → API POST /api/compras/nueva-compra
5. **Sistema genera token** → NRC-YYMMDD-XXXX
6. **Guarda en Neon** → tabla compras
7. **Muestra confirmación** → página de éxito
8. **Limpia carrito** → localStorage

---

## 🚨 PROBLEMA COMÚN

**Error:** `relation "compras" does not exist`
**Solución:** Ejecutar `neon-compras-table.sql` en Neon Console

---

## 📞 CONTACTO TÉCNICO

Si hay problemas después del deploy, verificar:

1. ✅ SQL ejecutado correctamente en Neon
2. ✅ Variables de entorno configuradas en Render
3. ✅ Logs de conexión a base de datos
4. ✅ APIs respondiendo correctamente
