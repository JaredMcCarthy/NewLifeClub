// ======================================
// 🛒 CARRITO SIMPLE - NEWLIFE RUN CLUB
// Sistema Funcional Garantizado ✅
// ======================================

// Variables globales
let cart = {
  items: [],
  count: 0,
  total: 0,
};

// ======================================
// 🔧 FUNCIONES BÁSICAS
// ======================================

// Cargar carrito desde localStorage
function loadCart() {
  try {
    const savedCart = localStorage.getItem("newlife_cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);

      // Asegurar estructura correcta
      if (!cart.items) cart.items = [];
      if (!cart.count) cart.count = 0;
      if (!cart.total) cart.total = 0;

      console.log("✅ Carrito cargado:", cart.items.length, "productos");
    } else {
      resetCart();
    }
  } catch (error) {
    console.error("Error cargando carrito:", error);
    resetCart();
  }

  updateCartCount();
}

// Guardar carrito en localStorage
function saveCart() {
  try {
    localStorage.setItem("newlife_cart", JSON.stringify(cart));
    updateCartCount();
    console.log("💾 Carrito guardado:", cart.items.length, "productos");
  } catch (error) {
    console.error("Error guardando carrito:", error);
  }
}

// Resetear carrito
function resetCart() {
  cart = { items: [], count: 0, total: 0 };
  console.log("🔄 Carrito reseteado");
}

// Calcular totales
function calculateTotals() {
  cart.count = cart.items.reduce((total, item) => total + item.quantity, 0);
  cart.total = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

// Actualizar contador visual
function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = cart.count;
    cartCountElement.style.display = cart.count > 0 ? "flex" : "none";
  }

  // También actualizar otros contadores si existen
  const allCounters = document.querySelectorAll(".cart-count, .cart-counter");
  allCounters.forEach((counter) => {
    counter.textContent = cart.count;
    counter.style.display = cart.count > 0 ? "flex" : "none";
  });
}

// ======================================
// 🛍️ AGREGAR PRODUCTOS
// ======================================

// Función principal para agregar al carrito
function addToCart(productData) {
  console.log("🛒 Agregando producto:", productData);

  // Validación básica
  if (!productData || !productData.name || !productData.price) {
    console.error("❌ Datos de producto inválidos:", productData);
    showNotification("Error: Datos de producto inválidos", "error");
    return false;
  }

  // Asegurar que price es número
  let price = parseFloat(productData.price);
  if (isNaN(price)) {
    // Intentar extraer precio del texto
    const priceText = String(productData.price);
    const priceMatch = priceText.match(/[\d.]+/);
    if (priceMatch) {
      price = parseFloat(priceMatch[0]);
    } else {
      console.error("❌ Precio inválido:", productData.price);
      showNotification("Error: Precio inválido", "error");
      return false;
    }
  }

  // Crear producto limpio
  const newProduct = {
    id: productData.id || Date.now(),
    name: productData.name,
    price: price,
    size: productData.size || "Única",
    quantity: parseInt(productData.quantity) || 1,
    image: productData.image || "",
    source: productData.source || "tienda",
  };

  // Verificar si ya existe (solo para productos físicos)
  const existingIndex = cart.items.findIndex(
    (item) => item.name === newProduct.name && item.size === newProduct.size
  );

  if (existingIndex !== -1) {
    // Producto existe, aumentar cantidad
    cart.items[existingIndex].quantity += newProduct.quantity;
    showNotification(
      `📦 Cantidad actualizada: ${cart.items[existingIndex].name}`,
      "success"
    );
  } else {
    // Producto nuevo
    cart.items.push(newProduct);
    showNotification(`✅ ¡${newProduct.name} agregado al carrito!`, "success");
  }

  // Recalcular y guardar
  calculateTotals();
  saveCart();

  console.log("✅ Producto agregado exitosamente. Total items:", cart.count);
  return true;
}

// ======================================
// 🗑️ ELIMINAR PRODUCTOS
// ======================================

// Eliminar producto del carrito
function removeFromCart(productId) {
  console.log("🗑️ Eliminando producto:", productId);

  const itemIndex = cart.items.findIndex(
    (item) => item.id == productId || item.name == productId
  );

  if (itemIndex !== -1) {
    const removedItem = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);

    calculateTotals();
    saveCart();

    showNotification(`🗑️ ${removedItem.name} eliminado`, "success");

    // Refrescar checkout si estamos ahí
    if (window.location.pathname.includes("checkout.html")) {
      loadCartInCheckout();
    }

    return true;
  }

  return false;
}

// Aumentar cantidad
function increaseQuantity(productId) {
  const itemIndex = cart.items.findIndex(
    (item) => item.id == productId || item.name == productId
  );

  if (itemIndex !== -1) {
    cart.items[itemIndex].quantity += 1;
    calculateTotals();
    saveCart();

    if (window.location.pathname.includes("checkout.html")) {
      loadCartInCheckout();
    }

    return true;
  }

  return false;
}

// Disminuir cantidad
function decreaseQuantity(productId) {
  const itemIndex = cart.items.findIndex(
    (item) => item.id == productId || item.name == productId
  );

  if (itemIndex !== -1) {
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
      calculateTotals();
      saveCart();

      if (window.location.pathname.includes("checkout.html")) {
        loadCartInCheckout();
      }

      return true;
    } else {
      // Si solo queda 1, eliminar
      return removeFromCart(productId);
    }
  }

  return false;
}

// Vaciar carrito completamente
function clearCart() {
  if (cart.items.length === 0) {
    showNotification("El carrito ya está vacío", "info");
    return;
  }

  if (confirm("¿Estás seguro de que quieres vaciar todo el carrito?")) {
    resetCart();
    saveCart();
    showNotification("🧹 ¡Carrito vaciado completamente!", "success");

    if (window.location.pathname.includes("checkout.html")) {
      loadCartInCheckout();
    }
  }
}

// ======================================
// 🛒 ABRIR CARRITO
// ======================================

// Abrir carrito (ir a checkout)
function openCart() {
  console.log("🛒 Abriendo carrito. Items:", cart.count);

  if (cart.count === 0) {
    showNotification(
      "Tu carrito está vacío\nAgrega algunos productos primero",
      "info"
    );
    return;
  }

  // Asegurar que esté guardado
  saveCart();

  // Ir a checkout
  window.location.href = "checkout.html";
}

// ======================================
// 🏪 CHECKOUT
// ======================================

// Cargar carrito en checkout
function loadCartInCheckout() {
  const cartItemsContainer = document.getElementById("cart-items");
  if (!cartItemsContainer) {
    console.log("⚠️ No estamos en checkout.html - container no encontrado");
    return; // No estamos en checkout
  }

  console.log("🛒 === CARGANDO CARRITO EN CHECKOUT ===");

  // Cargar datos del localStorage
  loadCart();

  console.log("📊 Estado del carrito después de cargar:");
  console.log("- Items:", cart.items.length);
  console.log("- Count:", cart.count);
  console.log("- Total:", cart.total);
  console.log("- Productos:", cart.items);

  // Limpiar contenedor
  cartItemsContainer.innerHTML = "";

  if (cart.items.length === 0) {
    console.log("⚠️ Carrito vacío - mostrando mensaje");
    cartItemsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 3rem; margin-bottom: 20px;">🛒</div>
        <h3 style="color: #333; margin-bottom: 15px;">Tu carrito está vacío</h3>
        <p style="margin-bottom: 20px;">Agrega algunos productos para continuar</p>
        <a href="tienda.html" style="background: #ff69b4; color: white; padding: 12px 24px; border-radius: 20px; text-decoration: none; font-weight: 600;">
          🏪 Ir a la Tienda
        </a>
      </div>
    `;
    updateCartSummary();
    return;
  }

  console.log("✅ Renderizando", cart.items.length, "productos en checkout");

  // Mostrar productos
  cart.items.forEach((item, index) => {
    console.log(`📦 Renderizando producto ${index + 1}:`, item.name);

    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    `;

    itemElement.innerHTML = `
      <div style="display: flex; gap: 15px; flex: 1;">
        <img src="${item.image || "https://via.placeholder.com/60x60"}" alt="${
      item.name
    }" 
             style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600; color: #333;">${
            item.name
          }</h4>
          <p style="margin: 2px 0; color: #666; font-size: 14px;">Talla: ${
            item.size
          }</p>
          <p style="margin: 2px 0; color: #333; font-size: 14px; font-weight: 600;">L.${item.price.toFixed(
            2
          )}</p>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="display: flex; align-items: center; gap: 8px; background: #f8f9fa; border-radius: 20px; padding: 4px;">
          <button onclick="decreaseQuantity('${item.id}')" 
                  style="width: 28px; height: 28px; border: none; border-radius: 50%; background: #ff69b4; color: white; font-size: 16px; font-weight: bold; cursor: pointer;">-</button>
          <span style="min-width: 30px; text-align: center; font-weight: 600; color: #333;">${
            item.quantity
          }</span>
          <button onclick="increaseQuantity('${item.id}')" 
                  style="width: 28px; height: 28px; border: none; border-radius: 50%; background: #ff69b4; color: white; font-size: 16px; font-weight: bold; cursor: pointer;">+</button>
        </div>
        <button onclick="removeFromCart('${item.id}')" 
                style="background: #ff4444; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 14px;">🗑️</button>
      </div>
    `;

    cartItemsContainer.appendChild(itemElement);
  });

  // Botón para vaciar carrito
  const clearButton = document.createElement("button");
  clearButton.textContent = "🧹 Vaciar Carrito";
  clearButton.onclick = clearCart;
  clearButton.style.cssText = `
    background: linear-gradient(135deg, #ff4444, #cc0000);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-top: 20px;
    width: 100%;
  `;
  cartItemsContainer.appendChild(clearButton);

  // Actualizar resumen
  updateCartSummary();

  console.log("✅ Carrito renderizado exitosamente en checkout");
}

// Actualizar resumen del carrito
function updateCartSummary() {
  calculateTotals();

  const subtotal = cart.total || 0;
  const shipping = subtotal >= 75 ? 0 : 10;
  const taxes = subtotal * 0.15;
  const finalTotal = subtotal + shipping + taxes;

  // Actualizar elementos
  const subtotalElement = document.querySelector(".subtotal-amount");
  const shippingElement = document.querySelector(".shipping-amount");
  const taxElement = document.querySelector(".tax-amount");
  const totalElement = document.querySelector(".total-amount");
  const payButton =
    document.querySelector("#payment-button") ||
    document.querySelector(".btn-primary");

  if (subtotalElement) subtotalElement.textContent = `L.${subtotal.toFixed(2)}`;
  if (shippingElement)
    shippingElement.textContent =
      shipping === 0 ? "GRATIS" : `L.${shipping.toFixed(2)}`;
  if (taxElement) taxElement.textContent = `L.${taxes.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `L.${finalTotal.toFixed(2)}`;

  if (payButton) {
    if (cart.items.length === 0 || finalTotal === 0) {
      payButton.textContent = "Carrito Vacío";
      payButton.disabled = true;
      payButton.style.background = "#ccc";
    } else {
      payButton.textContent = `Completar Pago - L.${finalTotal.toFixed(2)}`;
      payButton.disabled = false;
      payButton.style.background = "";
    }
  }
}

// ======================================
// 🔔 NOTIFICACIONES
// ======================================

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.innerHTML = message.replace(/\n/g, "<br>");

  const colors = {
    success: "#4CAF50",
    error: "#ff4444",
    info: "#2196F3",
  };

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    font-size: 14px;
    max-width: 300px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);

  // Agregar estilos de animación si no existen
  if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ======================================
// 🚀 INICIALIZACIÓN
// ======================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🛒 Cart Handler - Inicializando...");

  // Cargar carrito
  loadCart();

  // Configurar botón del carrito
  setTimeout(() => {
    const cartBtn =
      document.getElementById("cart-btn") ||
      document.querySelector(".cart-button");
    if (cartBtn) {
      cartBtn.onclick = function (e) {
        e.preventDefault();
        openCart();
      };
      console.log("✅ Botón del carrito configurado");
    }
  }, 100);

  // Si estamos en checkout, cargar productos
  if (window.location.pathname.includes("checkout.html")) {
    setTimeout(() => {
      loadCartInCheckout();
    }, 200);
  }

  console.log("✅ Cart Handler inicializado");
});

// ======================================
// 🌐 FUNCIONES GLOBALES
// ======================================

// Exponer funciones principales
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.clearCart = clearCart;
window.openCart = openCart;
window.loadCartInCheckout = loadCartInCheckout;
window.updateCartSummary = updateCartSummary;

// Información del carrito
window.getCartInfo = function () {
  return { items: cart.items, count: cart.count, total: cart.total };
};

// Debug
window.debugCart = function () {
  console.log("🛒 DEBUG CARRITO:");
  console.log("Items:", cart.items);
  console.log("Count:", cart.count);
  console.log("Total:", cart.total);
  return cart;
};

console.log("🛒 Cart Handler Simple v1.0 - Cargado exitosamente ✅");
