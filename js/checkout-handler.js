// ======================================
// 🛒 CHECKOUT HANDLER - DINÁMICO CON DESCUENTOS
// ======================================

let checkoutData = {
  cart: { items: [], count: 0, total: 0 },
  subtotal: 0,
  shipping: 0,
  taxes: 0,
  discount: 0,
  discountCode: null,
  finalTotal: 0,
};

// Códigos de descuento hardcodeados (respaldo si no se puede cargar JSON)
const fallbackPromoCodes = {
  WELCOME10: {
    percentage: 10,
    description: "Descuento de bienvenida",
    active: true,
    minAmount: 0,
  },
  NEWLIFE15: {
    percentage: 15,
    description: "Descuento NewLife Club",
    active: true,
    minAmount: 50,
  },
  RUNNER20: {
    percentage: 20,
    description: "Descuento especial runner",
    active: true,
    minAmount: 100,
  },
  VIP25: {
    percentage: 25,
    description: "Descuento VIP",
    active: true,
    minAmount: 150,
  },
  SAVE10: {
    percentage: 10,
    description: "Ahorra 10%",
    active: true,
    minAmount: 30,
  },
  MEGA15: {
    percentage: 15,
    description: "Mega descuento",
    active: true,
    minAmount: 75,
  },
};

let availablePromoCodes = fallbackPromoCodes;

// ======================================
// 🎯 FUNCIONES DE CARGA Y INICIALIZACIÓN
// ======================================

// Cargar carrito desde localStorage
function loadCartFromStorage() {
  const savedCart = localStorage.getItem("newlife_cart");
  if (savedCart) {
    try {
      checkoutData.cart = JSON.parse(savedCart);
      console.log("🛒 Carrito cargado:", checkoutData.cart);
    } catch (e) {
      console.error("Error cargando carrito:", e);
      checkoutData.cart = { items: [], count: 0, total: 0 };
    }
  }
}

// Cargar códigos de descuento
async function loadPromoCodes() {
  try {
    const response = await fetch("promo-codes.json");
    const data = await response.json();
    availablePromoCodes = data.discountCodes;
    console.log(
      "🎟️ Códigos de descuento cargados:",
      Object.keys(availablePromoCodes)
    );
  } catch (error) {
    console.log("📦 Usando códigos de descuento por defecto");
    availablePromoCodes = fallbackPromoCodes;
  }
}

// ======================================
// 🧮 LÓGICA DE CÁLCULOS
// ======================================

// Determinar si un producto requiere envío físico
function requiresPhysicalShipping(product) {
  // Productos físicos: ropa, accesorios de tienda
  const physicalKeywords = [
    "camisa",
    "polo",
    "blusa",
    "top",
    "hoodie",
    "tank",
    "tee",
    "henley",
    "zapatos",
    "tenis",
    "nike",
    "adidas",
    "puma",
    "shorts",
    "pantalón",
  ];

  // Productos digitales: membresías, planes, suscripciones
  const digitalKeywords = [
    "membresía",
    "plan",
    "suscripción",
    "básica",
    "premium",
    "elite",
    "pro",
    "digital",
    "acceso",
    "contenido",
  ];

  const productName = product.name.toLowerCase();

  // Verificar si es digital
  const isDigital = digitalKeywords.some((keyword) =>
    productName.includes(keyword)
  );
  if (isDigital) return false;

  // Verificar si es físico
  const isPhysical = physicalKeywords.some((keyword) =>
    productName.includes(keyword)
  );
  if (isPhysical) return true;

  // Por defecto, si viene de tienda.html, asumir que es físico
  return product.source === "tienda" || product.type === "physical";
}

// Calcular envío inteligente
function calculateShipping() {
  const physicalItems = checkoutData.cart.items.filter((item) =>
    requiresPhysicalShipping(item)
  );

  if (physicalItems.length === 0) {
    return 0; // Sin productos físicos = envío gratis
  }

  // Envío fijo para productos físicos
  return 100; // L.100 en lempiras
}

// Calcular impuestos (15% sobre subtotal + envío)
function calculateTaxes(subtotal, shipping) {
  return Math.round((subtotal + shipping) * 0.15 * 100) / 100;
}

// Aplicar código de descuento
function applyDiscount(subtotal, code) {
  if (!code || !availablePromoCodes[code]) {
    return { discount: 0, valid: false, message: "Código no válido" };
  }

  const promoCode = availablePromoCodes[code];

  if (!promoCode.active) {
    return { discount: 0, valid: false, message: "Código expirado" };
  }

  if (subtotal < promoCode.minAmount) {
    return {
      discount: 0,
      valid: false,
      message: `Monto mínimo requerido: L.${promoCode.minAmount}`,
    };
  }

  const discount =
    Math.round(subtotal * (promoCode.percentage / 100) * 100) / 100;

  return {
    discount: discount,
    valid: true,
    message: `${promoCode.description} (${promoCode.percentage}% descuento)`,
    percentage: promoCode.percentage,
  };
}

// Recalcular todos los totales
function recalculateAll() {
  // Subtotal de productos
  checkoutData.subtotal = checkoutData.cart.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  // Envío
  checkoutData.shipping = calculateShipping();

  // Aplicar descuento si existe
  if (checkoutData.discountCode) {
    const discountResult = applyDiscount(
      checkoutData.subtotal,
      checkoutData.discountCode
    );
    checkoutData.discount = discountResult.valid ? discountResult.discount : 0;
  }

  // Subtotal después del descuento
  const discountedSubtotal = checkoutData.subtotal - checkoutData.discount;

  // Impuestos
  checkoutData.taxes = calculateTaxes(
    discountedSubtotal,
    checkoutData.shipping
  );

  // Total final
  checkoutData.finalTotal =
    discountedSubtotal + checkoutData.shipping + checkoutData.taxes;

  console.log("💰 Totales calculados:", checkoutData);
}

// ======================================
// 🎨 FUNCIONES DE RENDERIZADO
// ======================================

// Renderizar productos en el resumen
function renderCartItems() {
  const container = document.querySelector(".order-summary");
  if (!container) return;

  // Buscar el contenedor de productos o crearlo
  let productsContainer = container.querySelector(".products-container");
  if (!productsContainer) {
    productsContainer = document.createElement("div");
    productsContainer.className = "products-container";

    // Insertar después del título
    const title = container.querySelector(".summary-title");
    title.insertAdjacentElement("afterend", productsContainer);
  }

  // Limpiar contenedor
  productsContainer.innerHTML = "";

  if (checkoutData.cart.items.length === 0) {
    productsContainer.innerHTML = `
      <div class="empty-cart-message">
        <p>🛒 Tu carrito está vacío</p>
        <a href="tienda.html" style="color: #ff69b4; text-decoration: none;">← Ir a la tienda</a>
      </div>
    `;
    return;
  }

  // Renderizar cada producto
  checkoutData.cart.items.forEach((item) => {
    const productElement = document.createElement("div");
    productElement.className = "product-item";

    // Determinar icono del producto
    const isDigital = !requiresPhysicalShipping(item);
    const productIcon = isDigital ? "📱" : "👕";

    productElement.innerHTML = `
      <div class="product-img">${productIcon}</div>
      <div class="product-details">
        <div class="product-name">${item.name}</div>
        <div class="product-specs">
          ${item.size ? `Talla: ${item.size}` : ""}
          ${
            isDigital
              ? '<span style="color: #4CAF50; font-weight: 600;">• Digital</span>'
              : ""
          }
          ${
            !isDigital
              ? '<span style="color: #ff9800; font-weight: 600;">• Físico</span>'
              : ""
          }
        </div>
        <div class="product-price">L.${item.price.toFixed(2)}</div>
      </div>
      <div class="quantity-badge">${item.quantity}</div>
    `;

    productsContainer.appendChild(productElement);
  });
}

// Renderizar totales
function renderTotals() {
  const totalsContainer = document.querySelector(".summary-totals");
  if (!totalsContainer) return;

  let html = `
    <div class="total-row">
      <span>Subtotal:</span>
      <span>L.${checkoutData.subtotal.toFixed(2)}</span>
    </div>
  `;

  // Mostrar descuento si existe
  if (checkoutData.discount > 0) {
    html += `
      <div class="total-row discount-row" style="color: #4CAF50;">
        <span>Descuento (${checkoutData.discountCode}):</span>
        <span>-L.${checkoutData.discount.toFixed(2)}</span>
      </div>
    `;
  }

  // Mostrar envío
  html += `
    <div class="total-row">
      <span>Envío:</span>
      <span style="color: ${
        checkoutData.shipping === 0 ? "#4CAF50" : "inherit"
      }">
        ${
          checkoutData.shipping === 0
            ? "GRATIS"
            : `L.${checkoutData.shipping.toFixed(2)}`
        }
      </span>
    </div>
    <div class="total-row">
      <span>Impuestos (15%):</span>
      <span>L.${checkoutData.taxes.toFixed(2)}</span>
    </div>
    <div class="total-row total-final">
      <span>TOTAL:</span>
      <span>L.${checkoutData.finalTotal.toFixed(2)}</span>
    </div>
  `;

  totalsContainer.innerHTML = html;
}

// ======================================
// 🎟️ MANEJO DE CÓDIGOS DE DESCUENTO
// ======================================

// Manejar aplicación de código de descuento
function handlePromoCode() {
  const input = document.querySelector(".promo-input input");
  const button = document.querySelector(".promo-btn");

  if (!input || !button) return;

  const code = input.value.trim().toUpperCase();

  if (!code) {
    showNotification("Por favor ingresa un código", "error");
    return;
  }

  const discountResult = applyDiscount(checkoutData.subtotal, code);

  if (discountResult.valid) {
    checkoutData.discountCode = code;
    checkoutData.discount = discountResult.discount;

    // Actualizar UI
    input.style.borderColor = "#4CAF50";
    input.style.color = "#4CAF50";
    button.textContent = "✓ Aplicado";
    button.style.background = "#4CAF50";
    button.disabled = true;

    showNotification(`¡Código aplicado! ${discountResult.message}`, "success");

    // Recalcular y actualizar
    recalculateAll();
    renderTotals();
  } else {
    input.style.borderColor = "#ff4444";
    showNotification(discountResult.message, "error");

    // Resetear input después de 3 segundos
    setTimeout(() => {
      input.style.borderColor = "#e0e0e0";
      input.value = "";
    }, 3000);
  }
}

// ======================================
// 🚀 INICIALIZACIÓN
// ======================================

document.addEventListener("DOMContentLoaded", async function () {
  console.log("🛒 Checkout Handler iniciado");

  // Cargar datos
  await loadPromoCodes();
  loadCartFromStorage();

  // Calcular totales
  recalculateAll();

  // Renderizar UI
  renderCartItems();
  renderTotals();

  // Event listeners
  const promoBtn = document.querySelector(".promo-btn");
  const promoInput = document.querySelector(".promo-input input");

  if (promoBtn) {
    promoBtn.addEventListener("click", handlePromoCode);
  }

  if (promoInput) {
    promoInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handlePromoCode();
      }
    });
  }

  // Verificar si el carrito está vacío
  if (checkoutData.cart.items.length === 0) {
    console.log("⚠️ Carrito vacío - mostrando mensaje");
  }

  console.log("✅ Checkout Handler inicializado completamente");
});

// ======================================
// 🔧 FUNCIONES AUXILIARES
// ======================================

// Función para mostrar notificaciones (reutilizada)
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${
      type === "error" ? "#ff4444" : type === "success" ? "#4CAF50" : "#333"
    };
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-in";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Función global para debugging
window.debugCheckout = function () {
  console.log("🛒 DEBUG CHECKOUT:");
  console.log("Cart:", checkoutData.cart);
  console.log("Subtotal:", checkoutData.subtotal);
  console.log("Shipping:", checkoutData.shipping);
  console.log("Discount:", checkoutData.discount);
  console.log("Taxes:", checkoutData.taxes);
  console.log("Final Total:", checkoutData.finalTotal);
  console.log("Promo Codes:", Object.keys(availablePromoCodes));
};

console.log("🛒 Checkout Handler cargado exitosamente");
