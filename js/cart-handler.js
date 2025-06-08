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

// Función principal para agregar productos al carrito
function addToCart(productData) {
  if (!productData || !productData.id) return;

  // Buscar si el producto ya existe
  const existingIndex = cart.items.findIndex(
    (item) => item.id === productData.id && item.size === productData.size
  );

  if (existingIndex >= 0) {
    // Si existe, aumentar cantidad
    cart.items[existingIndex].quantity += productData.quantity || 1;
  } else {
    // Si no existe, agregar nuevo
    cart.items.push({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      size: productData.size || "Única",
      quantity: productData.quantity || 1,
      image: productData.image || "",
    });
  }

  // Recalcular totales
  calculateCartTotals();
  saveCart();

  // Mostrar notificación
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
