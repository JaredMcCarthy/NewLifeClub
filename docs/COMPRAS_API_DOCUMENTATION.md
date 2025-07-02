# 🛒 API de Compras - NewLifeRun Club

## Endpoints Disponibles

### 1. **Procesar Nueva Compra**

```
POST /api/compras/nueva-compra
```

**Body (JSON):**

```json
{
  "email": "cliente@email.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "departamento": "Cundinamarca",
  "codigo_postal": "110111",
  "metodo_pago": "tarjeta_credito", // 'tarjeta_debito', 'tarjeta_credito', 'deposito_bancario'
  "subtotal": 45000,
  "impuestos": 8550,
  "descuentos": 5000,
  "total": 48550,
  "productos": [
    {
      "id": "1",
      "nombre": "Camiseta NewLifeRun",
      "precio": 25000,
      "cantidad": 1
    },
    {
      "id": "2",
      "nombre": "Shorts Premium",
      "precio": 20000,
      "cantidad": 1
    }
  ],
  "ultimos_4_digitos": "1234", // Opcional si paga con tarjeta
  "tipo_tarjeta": "visa" // Opcional si paga con tarjeta
}
```

**Respuesta Exitosa:**

```json
{
  "success": true,
  "message": "Compra procesada exitosamente",
  "data": {
    "id": 1,
    "token_compra": "NLC-1703876234567-ABC123DEF456",
    "fecha_compra": "2023-12-29T15:30:34.567Z",
    "email": "cliente@email.com",
    "total": 48550
  }
}
```

### 2. **Obtener Compras por Email**

```
GET /api/compras/mis-compras/cliente@email.com
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Compras obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "token_compra": "NLC-1703876234567-ABC123DEF456",
      "metodo_pago": "tarjeta_credito",
      "subtotal": 45000,
      "impuestos": 8550,
      "descuentos": 5000,
      "total": 48550,
      "productos": [
        {
          "id": "1",
          "nombre": "Camiseta NewLifeRun",
          "precio": 25000,
          "cantidad": 1
        }
      ],
      "fecha_compra": "2023-12-29T15:30:34.567Z",
      "estado": "completada",
      "ultimos_4_digitos": "1234",
      "tipo_tarjeta": "visa"
    }
  ]
}
```

### 3. **Obtener Compra por Token**

```
GET /api/compras/compra/NLC-1703876234567-ABC123DEF456
```

### 4. **Estadísticas (Admin)**

```
GET /api/compras/estadisticas
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "total_compras": 150,
    "ventas_totales": 7500000,
    "compras_hoy": 5,
    "metodos_pago": [
      {
        "metodo_pago": "tarjeta_credito",
        "cantidad": 85
      },
      {
        "metodo_pago": "tarjeta_debito",
        "cantidad": 45
      },
      {
        "metodo_pago": "deposito_bancario",
        "cantidad": 20
      }
    ]
  }
}
```

### 5. **Actualizar Estado (Admin)**

```
PUT /api/compras/actualizar-estado/NLC-1703876234567-ABC123DEF456
```

**Body:**

```json
{
  "nuevo_estado": "enviada" // 'completada', 'pendiente', 'cancelada', 'enviada'
}
```

## 🔐 Seguridad

- **Token único**: Cada compra genera un token único e irrepetible
- **Información de tarjeta**: Solo se guardan los últimos 4 dígitos
- **Validaciones**: Email, método de pago, productos requeridos
- **Transacciones**: Uso de BEGIN/COMMIT para integridad

## 📊 Base de Datos

La tabla `compras` incluye:

- Información completa del cliente
- Detalles de la compra (subtotal, impuestos, descuentos, total)
- Productos en formato JSON
- Token único de seguridad
- Información mínima y segura de tarjeta
- Timestamps y estado de la compra

## 🚀 Uso desde Frontend

```javascript
// Ejemplo de uso en JavaScript
async function procesarCompra(datosCompra) {
  try {
    const response = await fetch("/api/compras/nueva-compra", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosCompra),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Compra exitosa:", result.data.token_compra);
      // Redirigir a página de confirmación
    } else {
      console.error("❌ Error:", result.message);
    }
  } catch (error) {
    console.error("❌ Error de red:", error);
  }
}
```
