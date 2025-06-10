# 🛒 NewLife Run Club - Sistema de Carrito de Compras

## 📋 Documentación Completa del Sistema

### ✅ **ESTADO ACTUAL: LISTO PARA PRODUCCIÓN**

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Archivos Principales:**

1. **`js/cart-handler.js`** - Controlador principal del carrito
2. **`js/checkout-handler.js`** - Sistema de descuentos y promociones
3. **`checkout.html`** - Página de checkout completa
4. **`promo-codes.json`** - Códigos de descuento configurables

---

## 🚀 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ Gestión de Carrito:**

- ✅ Agregar productos al carrito
- ✅ Eliminar productos del carrito
- ✅ Modificar cantidades (+/-)
- ✅ Vaciar carrito completo
- ✅ Persistencia en localStorage
- ✅ Contador en tiempo real
- ✅ Redirección automática a checkout

### **✅ Tipos de Productos:**

- ✅ **Productos Físicos** (tienda.html)
- ✅ **Membresías** (membresias.html)
- ✅ **Planes Pro** (newlifepro.html)
- ✅ Restricciones automáticas para membresías/planes

### **✅ Sistema de Checkout:**

- ✅ Proceso paso a paso (4 pasos)
- ✅ Validación de formularios
- ✅ Cálculo automático de totales
- ✅ Impuestos (15%)
- ✅ Envío inteligente (gratis >L.75)
- ✅ Códigos de descuento
- ✅ Historial de compras

### **✅ Métodos de Pago:**

- ✅ Tarjeta de crédito/débito
- ✅ Depósito bancario
- ✅ Simulación de procesamiento
- ✅ Tokens de compra únicos

---

## 💳 **CÓDIGOS DE DESCUENTO ACTIVOS**

| Código          | Descuento | Mínimo | Estado      |
| --------------- | --------- | ------ | ----------- |
| `WELCOME10`     | 10%       | L.0    | ✅ Activo   |
| `NEWLIFE15`     | 15%       | L.50   | ✅ Activo   |
| `RUNNER20`      | 20%       | L.100  | ✅ Activo   |
| `VIP25`         | 25%       | L.150  | ✅ Activo   |
| `SAVE10`        | 10%       | L.30   | ✅ Activo   |
| `MEGA15`        | 15%       | L.75   | ✅ Activo   |
| `FIRST20`       | 20%       | L.60   | ✅ Activo   |
| `STUDENT15`     | 15%       | L.40   | ✅ Activo   |
| `FITNESS25`     | 25%       | L.120  | ✅ Activo   |
| `BLACKFRIDAY30` | 30%       | L.100  | ❌ Inactivo |

---

## 🔧 **CÓMO USAR EL SISTEMA**

### **1. Agregar Producto al Carrito:**

```javascript
// Desde cualquier página
addToCart({
  name: "Producto Name",
  price: 25.99,
  size: "M",
  image: "url_imagen",
  source: "tienda", // o "membresias" o "newlifepro"
});
```

### **2. Abrir Carrito:**

```javascript
// Redirige automáticamente a checkout
openCart();
```

### **3. Obtener Info del Carrito:**

```javascript
const cartInfo = getCartInfo();
console.log(cartInfo); // { items: [], count: 0, total: 0 }
```

### **4. Debug del Sistema:**

```javascript
// Ver estado completo del carrito
debugCart();

// Ver códigos de descuento
debugDiscount();
```

---

## 🛠️ **CONFIGURACIÓN PARA PRODUCCIÓN**

### **Variables Importantes:**

```javascript
// En cart-handler.js
const TAX_RATE = 0.15; // 15% impuestos
const FREE_SHIPPING_THRESHOLD = 75; // Envío gratis >L.75

// En checkout-handler.js
const SHIPPING_COST = 10; // L.10 por envío
```

### **Agregar Nuevos Códigos de Descuento:**

Editar `promo-codes.json`:

```json
{
  "NUEVO_CODIGO": {
    "percentage": 15,
    "description": "Descripción del descuento",
    "active": true,
    "minAmount": 50,
    "maxUses": 100,
    "currentUses": 0
  }
}
```

---

## 🔄 **FLUJO COMPLETO DEL USUARIO**

1. **Usuario navega** → `tienda.html` / `membresias.html` / `newlifepro.html`
2. **Selecciona producto** → Modal se abre con detalles
3. **Configura opciones** → Talla, cantidad, etc.
4. **Hace clic "Agregar"** → `addToCart()` se ejecuta
5. **Producto en carrito** → Contador se actualiza
6. **Hace clic en carrito** → `openCart()` → Redirect a `checkout.html`
7. **Checkout carga** → `loadCartInCheckout()` muestra productos
8. **Completa información** → Datos personales, envío, pago
9. **Aplica código** → `applyPromoCode()` calcula descuento
10. **Procesa pago** → Simulación de pago exitoso
11. **Genera token** → Token único de compra
12. **Guarda historial** → LocalStorage del usuario
13. **Limpia carrito** → Reset completo

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Carrito Vacío en Checkout:**

```javascript
// Verificar si hay datos
const cartInfo = getCartInfo();
console.log("Items:", cartInfo.items.length);

// Forzar recarga del carrito
loadCart();
```

### **Códigos de Descuento No Funcionan:**

```javascript
// Verificar códigos disponibles
getAvailablePromoCodes();

// Ver descuento aplicado
getAppliedDiscount();
```

### **Totales Incorrectos:**

```javascript
// Recalcular manualmente
updateCartSummaryWithDiscount();
```

### **Limpiar Carrito Manualmente:**

```javascript
// En consola del navegador
clearCart(); // Con confirmación
// o
window.localStorage.removeItem("newlife_cart"); // Directo
```

---

## 📱 **COMPATIBILIDAD**

- ✅ **Navegadores**: Chrome, Firefox, Safari, Edge
- ✅ **Dispositivos**: Desktop, Tablet, Mobile
- ✅ **localStorage**: Persistencia entre sesiones
- ✅ **Cross-tab**: Sincronización entre pestañas

---

## 🔒 **SEGURIDAD**

- ✅ Validación de datos de entrada
- ✅ Sanitización de precios
- ✅ Prevención de inyección XSS
- ✅ Tokens únicos de compra
- ✅ Validación de códigos promocionales

---

## 📊 **MÉTRICAS Y ANALYTICS**

El sistema incluye logs detallados para monitorear:

- Productos agregados al carrito
- Códigos promocionales utilizados
- Abandonos de carrito
- Compras completadas
- Errores del sistema

---

## 🚀 **DEPLOYMENT PARA RENDER**

### **Archivos Necesarios:**

- `js/cart-handler.js`
- `js/checkout-handler.js`
- `checkout.html`
- `promo-codes.json`
- `CART_SYSTEM_README.md` (este archivo)

### **Variables de Entorno (Opcional):**

```bash
TAX_RATE=0.15
FREE_SHIPPING_THRESHOLD=75
CURRENCY=HNL
```

---

## 👨‍💻 **MANTENIMIENTO**

### **Actualizaciones Regulares:**

1. Revisar códigos promocionales vencidos
2. Actualizar límites de uso
3. Monitorear logs de errores
4. Optimizar rendimiento

### **Nuevas Funcionalidades:**

- Integración con pasarela de pagos real
- Sistema de inventario
- Notificaciones push
- Analytics avanzados

---

## 📞 **SOPORTE**

Para dudas o problemas:

1. Revisar esta documentación
2. Usar funciones de debug
3. Verificar logs del navegador
4. Contactar al desarrollador

---

**🎉 ¡Sistema listo para producción! 🎉**

_Última actualización: Diciembre 20, 2024_
