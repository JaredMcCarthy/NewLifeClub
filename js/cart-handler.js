// ======================================
// 🛒 CART HANDLER SIMPLIFICADO - SOLO REDIRECCIÓN
// ======================================

// Variables globales para el carrito
let cart = {
  items: [],
  count: 0,
  total: 0,
};

// Cargar datos del carrito desde localStorage
function loadCart() {
  const savedCart = localStorage.getItem("newlife_cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartCount();
    } catch (e) {
      console.error("Error loading cart:", e);
      resetCart();
    }
  }
}

// Guardar carrito en localStorage
function saveCart() {
  localStorage.setItem("newlife_cart", JSON.stringify(cart));
  updateCartCount();
}

// Resetear carrito
function resetCart() {
  cart = { items: [], count: 0, total: 0 };
  saveCart();
}

// Actualizar contador del carrito
function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = cart.count || 0;
  }
}

// Agregar producto al carrito
function addToCart(productData) {
  console.log("🛒 Agregando al carrito:", productData);

  // Verificar restricciones de membresías y planes
  const productType = detectProductType(productData);

  if (productType === "membership" || productType === "plan") {
    handleMembershipOrPlan(productData, productType);
    return;
  }

  // Para productos regulares (ropa, accesorios)
  const existingItemIndex = cart.items.findIndex(
    (item) => item.name === productData.name && item.size === productData.size
  );

  if (existingItemIndex !== -1) {
    // Si ya existe, aumentar cantidad
    cart.items[existingItemIndex].quantity += 1;
  } else {
    // Si no existe, agregarlo como nuevo
    const newItem = {
      id: Date.now(),
      name: productData.name,
      price: productData.price,
      size: productData.size || "Talla única",
      quantity: 1,
      image: productData.image || "",
      source: productData.source || "unknown",
    };
    cart.items.push(newItem);
  }

  // Actualizar contadores
  cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  saveCart();
  showAddToCartNotification();
}

// Calcular totales del carrito
function calculateCartTotals() {
  cart.count = cart.items.reduce((total, item) => total + item.quantity, 0);
  cart.total = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

// Remover producto del carrito
function removeFromCart(productId, size) {
  cart.items = cart.items.filter(
    (item) => !(item.id === productId && item.size === size)
  );
  calculateCartTotals();
  saveCart();
}

// Vaciar carrito completamente
function clearCart() {
  resetCart();
}

// Función para mostrar notificación de producto agregado
function showAddToCartNotification() {
  // Crear notificación temporal
  const notification = document.createElement("div");
  notification.innerHTML = "✅ ¡Producto agregado al carrito!";
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  `;

  document.body.appendChild(notification);

  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-in";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ======================================
// 🔄 NUEVA FUNCIONALIDAD: REDIRECCIÓN A CHECKOUT
// ======================================

// Función principal del botón carrito - REDIRIGE A CHECKOUT
function openCart() {
  // Si no hay productos en el carrito, mostrar mensaje
  if (cart.count === 0) {
    showEmptyCartMessage();
    return;
  }

  // Guardar carrito actual
  saveCart();

  // Redirigir a checkout.html
  window.location.href = "checkout.html";
}

// Mensaje cuando el carrito está vacío
function showEmptyCartMessage() {
  const notification = document.createElement("div");
  notification.innerHTML =
    "🛒 Tu carrito está vacío<br><small>Agrega algunos productos primero</small>";
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #ff9800;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    text-align: center;
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

// ======================================
// 🎯 INICIALIZACIÓN Y EVENT LISTENERS
// ======================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🛒 Cart Handler - Modo Checkout iniciado");

  // Cargar carrito existente
  loadCart();

  // Event listener para el botón del carrito
  const cartBtn = document.getElementById("cart-btn");
  if (cartBtn) {
    // Remover cualquier event listener previo
    cartBtn.replaceWith(cartBtn.cloneNode(true));
    const newCartBtn = document.getElementById("cart-btn");

    newCartBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🛒 Botón carrito presionado - Redirigiendo a checkout");
      openCart();
    });

    console.log("✅ Event listener del carrito configurado");
  }

  // Event listeners para agregar al carrito (solo en páginas con modales)
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      // Obtener datos del producto desde el modal o elemento padre
      const modal = document.getElementById("productModal");
      if (!modal || modal.style.display === "none") {
        console.log("Modal no encontrado o cerrado");
        return;
      }

      const productData = extractProductDataFromModal(modal);
      if (productData) {
        addToCart(productData);

        // Cerrar modal después de agregar
        setTimeout(() => {
          modal.style.display = "none";
        }, 1500);
      }
    });
  });

  // Sincronización entre pestañas
  window.addEventListener("storage", function (e) {
    if (e.key === "newlife_cart") {
      loadCart();
    }
  });

  console.log("🛒 Cart Handler inicializado completamente");
});

// Función para extraer datos del producto desde el modal
function extractProductDataFromModal(modal) {
  try {
    const productId = modal.getAttribute("data-current-product");
    const nameElement = document.getElementById("modalProductName");
    const priceElement = document.getElementById("modalProductPrice");
    const imageElement = document.getElementById("mainProductImage");
    const sizeElement = document.querySelector(".size-btn.active");
    const quantityElement = document.querySelector(".quantity");

    if (!productId || !nameElement || !priceElement) {
      console.error("Datos de producto incompletos");
      return null;
    }

    const priceText = priceElement.textContent;
    const price = parseFloat(priceText.replace(/[L.$,]/g, "").trim());

    return {
      id: productId,
      name: nameElement.textContent.trim(),
      price: price,
      size: sizeElement ? sizeElement.textContent.trim() : "Única",
      quantity: quantityElement ? parseInt(quantityElement.textContent) : 1,
      image: imageElement ? imageElement.src : "",
    };
  } catch (error) {
    console.error("Error extrayendo datos del producto:", error);
    return null;
  }
}

// ======================================
// 🎨 ANIMACIONES CSS
// ======================================

// Agregar estilos de animación al head
const animationStyle = document.createElement("style");
animationStyle.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(animationStyle);

// ======================================
// 🔧 FUNCIONES AUXILIARES GLOBALES
// ======================================

// Función global para obtener información del carrito
window.getCartInfo = function () {
  return {
    items: cart.items,
    count: cart.count,
    total: cart.total,
  };
};

// Función global para debugging
window.debugCart = function () {
  console.log("🛒 DEBUG CART:");
  console.log("Items:", cart.items);
  console.log("Count:", cart.count);
  console.log("Total:", cart.total);
  console.log("LocalStorage:", localStorage.getItem("newlife_cart"));
};

// Función para limpiar carrito (para testing)
window.clearCartForTesting = function () {
  clearCart();
  console.log("🧹 Carrito limpiado para testing");
};

console.log("🛒 Cart Handler - Versión Checkout cargado exitosamente");

// ======================================
// 🎯 FUNCIONES DE DETECCIÓN Y RESTRICCIÓN
// ======================================

// Detectar tipo de producto
function detectProductType(product) {
  const name = product.name.toLowerCase();

  // Membresías
  const membershipKeywords = [
    "membresía",
    "membership",
    "básica",
    "premium",
    "elite",
  ];
  if (membershipKeywords.some((keyword) => name.includes(keyword))) {
    return "membership";
  }

  // Planes (NewLife Pro, entrenamientos, etc.)
  const planKeywords = ["plan", "pro", "entrenamiento", "coaching", "programa"];
  if (planKeywords.some((keyword) => name.includes(keyword))) {
    return "plan";
  }

  // Productos físicos
  return "physical";
}

// Manejar membresías y planes con restricciones
function handleMembershipOrPlan(productData, type) {
  const typeLabel = type === "membership" ? "membresía" : "plan";

  // Buscar si ya existe una membresía o plan del mismo tipo
  const existingIndex = cart.items.findIndex(
    (item) => detectProductType(item) === type
  );

  if (existingIndex !== -1) {
    const existingItem = cart.items[existingIndex];

    // Si es exactamente el mismo producto, aumentar cantidad
    if (existingItem.name === productData.name) {
      existingItem.quantity += 1;
      showNotification(`Cantidad actualizada: ${productData.name}`, "success");
    } else {
      // Si es diferente, mostrar opción de reemplazar
      const confirmReplace = confirm(
        `Ya tienes "${existingItem.name}" en tu carrito. ¿Quieres reemplazarla con "${productData.name}"?`
      );

      if (confirmReplace) {
        // Reemplazar la membresía/plan existente
        cart.items[existingIndex] = {
          id: Date.now(),
          name: productData.name,
          price: productData.price,
          size: productData.size || "Digital",
          quantity: 1,
          image: productData.image || "",
          source: productData.source || "unknown",
        };
        showNotification(
          `${typeLabel} reemplazada: ${productData.name}`,
          "success"
        );
      } else {
        showNotification(`Mantuviste tu ${typeLabel} actual`, "info");
        return; // No agregar nada
      }
    }
  } else {
    // No existe ninguna membresía/plan del tipo, agregar normalmente
    const newItem = {
      id: Date.now(),
      name: productData.name,
      price: productData.price,
      size: productData.size || "Digital",
      quantity: 1,
      image: productData.image || "",
      source: productData.source || "unknown",
    };
    cart.items.push(newItem);
    showNotification(`${typeLabel} agregada: ${productData.name}`, "success");
  }

  // Actualizar contadores
  cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  saveCart();
}

// ======================================
// 🔔 FUNCIÓN DE NOTIFICACIONES
// ======================================

// Función para mostrar notificaciones
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `cart-notification notification-${type}`;
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
    max-width: 300px;
    font-size: 14px;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-in";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);

  // Agregar estilos de animación si no existen
  if (!document.querySelector("#cart-notification-styles")) {
    const style = document.createElement("style");
    style.id = "cart-notification-styles";
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
