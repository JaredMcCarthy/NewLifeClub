// ======================================
// 🛒 NEW LIFE RUN CLUB - CART HANDLER
// Sistema de Carrito Completo para Producción
// ======================================

// Variables globales para el carrito
let cart = {
  items: [],
  count: 0,
  total: 0,
};

// ======================================
// 🔧 FUNCIONES CORE DEL CARRITO
// ======================================

// Cargar datos del carrito desde localStorage
function loadCart() {
  try {
    const savedCart = localStorage.getItem("newlife_cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);

      // Validar estructura del carrito
      if (parsedCart && Array.isArray(parsedCart.items)) {
        cart = parsedCart;

        // Limpiar productos inválidos o corruptos
        cart.items = cart.items.filter((item) => {
          return (
            item.name && item.price && !isNaN(item.price) && item.quantity > 0
          );
        });

        console.log(
          "✅ Carrito cargado exitosamente:",
          cart.items.length,
          "productos"
        );
      } else {
        resetCart();
      }
    } else {
      resetCart();
    }
  } catch (error) {
    console.error("Error cargando carrito:", error);
    resetCart();
  }

  calculateCartTotals();
  updateCartCount();
}

// Guardar carrito en localStorage
function saveCart() {
  try {
    localStorage.setItem("newlife_cart", JSON.stringify(cart));
    updateCartCount();
    console.log("💾 Carrito guardado exitosamente");
  } catch (error) {
    console.error("Error guardando carrito:", error);
  }
}

// Resetear carrito
function resetCart() {
  cart = { items: [], count: 0, total: 0 };
  console.log("🔄 Carrito reseteado");
  saveCart();
}

// Calcular totales del carrito
function calculateCartTotals() {
  cart.count = cart.items.reduce((total, item) => total + item.quantity, 0);
  cart.total = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

// Actualizar contador del carrito en la UI
function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = cart.count;
    cartCountElement.style.display = cart.count > 0 ? "flex" : "none";
  }

  // Buscar otros posibles contadores
  const cartCounters = document.querySelectorAll(".cart-count, .cart-counter");
  cartCounters.forEach((counter) => {
    counter.textContent = cart.count;
    counter.style.display = cart.count > 0 ? "flex" : "none";
  });
}

// ======================================
// 🛍️ FUNCIONES DE GESTIÓN DE PRODUCTOS
// ======================================

// Agregar producto al carrito
function addToCart(productData) {
  console.log("🛒 Agregando producto al carrito:", productData);

  // Validar datos del producto
  if (!productData.name || !productData.price || isNaN(productData.price)) {
    showNotification("Error: Datos de producto inválidos", "error");
    return false;
  }

  // Auto-detectar source si no está definido
  if (!productData.source) {
    const currentPage = window.location.pathname;
    if (currentPage.includes("tienda.html")) {
      productData.source = "tienda";
    } else if (currentPage.includes("membresias.html")) {
      productData.source = "membresias";
    } else if (currentPage.includes("newlifepro.html")) {
      productData.source = "newlifepro";
    } else {
      productData.source = "unknown";
    }
  }

  // Detectar tipo de producto
  const productType = detectProductType(productData);

  // Manejar membresías y planes con restricciones especiales
  if (productType === "membership" || productType === "plan") {
    return handleMembershipOrPlan(productData, productType);
  }

  // Para productos físicos regulares
  const existingItemIndex = cart.items.findIndex(
    (item) => item.name === productData.name && item.size === productData.size
  );

  if (existingItemIndex !== -1) {
    // Si ya existe, aumentar cantidad
    cart.items[existingItemIndex].quantity += productData.quantity || 1;
    showNotification("📦 Cantidad actualizada en el carrito", "success");
  } else {
    // Si no existe, agregarlo como nuevo
    const newItem = {
      id: Date.now() + Math.random(), // ID único
      name: productData.name,
      price: parseFloat(productData.price),
      size: productData.size || "Talla única",
      quantity: productData.quantity || 1,
      image: productData.image || "",
      source: productData.source,
      category: productData.category || "General",
    };

    cart.items.push(newItem);
    showNotification("✅ ¡Producto agregado al carrito!", "success");
  }

  calculateCartTotals();
  saveCart();
  return true;
}

// Remover producto del carrito
function removeFromCart(productId, size) {
  console.log("🗑️ Eliminando producto:", productId, size);

  const itemIndex = cart.items.findIndex((item) => {
    return (
      item.id == productId ||
      item.name === productId ||
      (item.name === productId && item.size === size)
    );
  });

  if (itemIndex !== -1) {
    const removedItem = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);

    calculateCartTotals();
    saveCart();

    showNotification(`🗑️ ${removedItem.name} eliminado del carrito`, "success");

    // Refrescar checkout si estamos ahí
    if (window.location.pathname.includes("checkout.html")) {
      loadCartInCheckout();
    }

    return true;
  } else {
    showNotification("Producto no encontrado", "error");
    return false;
  }
}

// Aumentar cantidad de un producto
function increaseItemQuantity(productId, size) {
  const itemIndex = cart.items.findIndex((item) => {
    return (
      item.id == productId ||
      item.name === productId ||
      (item.name === productId && item.size === size)
    );
  });

  if (itemIndex !== -1) {
    const item = cart.items[itemIndex];
    const productType = detectProductType(item);

    // Membresías y planes solo pueden tener cantidad 1
    if (productType === "membership" || productType === "plan") {
      showNotification(
        "Las membresías y planes solo pueden tener cantidad 1",
        "info"
      );
      return false;
    }

    item.quantity += 1;
    calculateCartTotals();
    saveCart();

    showNotification("➕ Cantidad aumentada", "info");

    if (window.location.pathname.includes("checkout.html")) {
      loadCartInCheckout();
    }

    return true;
  }

  return false;
}

// Disminuir cantidad de un producto
function decreaseItemQuantity(productId, size) {
  const itemIndex = cart.items.findIndex((item) => {
    return (
      item.id == productId ||
      item.name === productId ||
      (item.name === productId && item.size === size)
    );
  });

  if (itemIndex !== -1) {
    const item = cart.items[itemIndex];
    const productType = detectProductType(item);

    // Para membresías y planes, eliminar directamente
    if (productType === "membership" || productType === "plan") {
      return removeFromCart(productId, size);
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
      calculateCartTotals();
      saveCart();

      showNotification("➖ Cantidad disminuida", "info");

      if (window.location.pathname.includes("checkout.html")) {
        loadCartInCheckout();
      }

      return true;
    } else {
      // Si solo queda 1, eliminar completamente
      return removeFromCart(productId, size);
    }
  }

  return false;
}

// Vaciar carrito completamente - USANDO POPUP PERSONALIZADO
function clearCart() {
  if (cart.items.length === 0) {
    showNotification("El carrito ya está vacío", "info");
    return;
  }

  // Usar popup personalizado si está disponible
  if (typeof confirmClearCart === "function") {
    confirmClearCart().then((confirmed) => {
      if (confirmed) {
        resetCart();
        showNotification("🧹 ¡Carrito vaciado completamente!", "success");

        if (window.location.pathname.includes("checkout.html")) {
          loadCartInCheckout();
        }
      }
    });
  } else {
    // Fallback a confirm nativo
    if (confirm("¿Estás seguro de que quieres vaciar todo el carrito?")) {
      resetCart();
      showNotification("🧹 ¡Carrito vaciado completamente!", "success");

      if (window.location.pathname.includes("checkout.html")) {
        loadCartInCheckout();
      }

      return true;
    }
  }

  return false;
}

// ======================================
// 🎯 FUNCIONES DE TIPOS DE PRODUCTO
// ======================================

// Detectar tipo de producto
function detectProductType(product) {
  const name = product.name.toLowerCase();
  const source = product.source || "";

  // Productos físicos de la tienda
  if (source === "tienda" || source === "store") {
    return "physical";
  }

  // Membresías
  if (source === "membresias" || source === "membership") {
    return "membership";
  }

  // Planes Pro
  if (source === "newlifepro" || source === "pro") {
    return "plan";
  }

  // Fallback por keywords
  const membershipKeywords = ["membresía", "membership"];
  const planKeywords = ["newlife pro", "plan de entrenamiento", "coaching"];

  if (membershipKeywords.some((keyword) => name.includes(keyword))) {
    return "membership";
  }

  if (planKeywords.some((keyword) => name.includes(keyword))) {
    return "plan";
  }

  return "physical";
}

// Manejar membresías y planes con restricciones - USANDO POPUP PERSONALIZADO
function handleMembershipOrPlan(productData, type) {
  const typeLabel = type === "membership" ? "membresía" : "plan";

  // Buscar si ya existe una membresía o plan del mismo tipo
  const existingIndex = cart.items.findIndex(
    (item) => detectProductType(item) === type
  );

  if (existingIndex !== -1) {
    const existingItem = cart.items[existingIndex];

    if (existingItem.name === productData.name) {
      // Es el mismo producto, no hacer nada
      showNotification(`Ya tienes esta ${typeLabel} en tu carrito`, "info");
      return false;
    } else {
      // Es diferente, preguntar si reemplazar usando popup personalizado
      if (typeof confirmReplaceMembership === "function") {
        confirmReplaceMembership(existingItem.name, productData.name).then(
          (confirmed) => {
            if (confirmed) {
              // Reemplazar
              cart.items[existingIndex] = {
                id: Date.now() + Math.random(),
                name: productData.name,
                price: parseFloat(productData.price),
                size: "Digital",
                quantity: 1,
                image: productData.image || "",
                source: productData.source,
                category: typeLabel,
              };

              calculateCartTotals();
              saveCart();
              showNotification(
                `${typeLabel} reemplazada: ${productData.name}`,
                "success"
              );
            } else {
              showNotification(`Mantuviste tu ${typeLabel} actual`, "info");
            }
          }
        );
      } else {
        // Fallback a confirm nativo
        if (
          confirm(
            `Ya tienes "${existingItem.name}" en tu carrito. ¿Quieres reemplazarla con "${productData.name}"?`
          )
        ) {
          // Reemplazar
          cart.items[existingIndex] = {
            id: Date.now() + Math.random(),
            name: productData.name,
            price: parseFloat(productData.price),
            size: "Digital",
            quantity: 1,
            image: productData.image || "",
            source: productData.source,
            category: typeLabel,
          };

          showNotification(
            `${typeLabel} reemplazada: ${productData.name}`,
            "success"
          );
        } else {
          showNotification(`Mantuviste tu ${typeLabel} actual`, "info");
          return false;
        }
      }
    }
  } else {
    // No existe, agregar normalmente
    const newItem = {
      id: Date.now() + Math.random(),
      name: productData.name,
      price: parseFloat(productData.price),
      size: "Digital",
      quantity: 1,
      image: productData.image || "",
      source: productData.source,
      category: typeLabel,
    };

    cart.items.push(newItem);
    showNotification(`${typeLabel} agregada: ${productData.name}`, "success");
  }

  calculateCartTotals();
  saveCart();
  return true;
}

// ======================================
// 🛒 FUNCIONES DE INTERFAZ
// ======================================

// Abrir carrito (redirigir a checkout)
function openCart() {
  if (cart.count === 0) {
    showEmptyCartMessage();
    return;
  }

  console.log("🛒 Redirigiendo a checkout con", cart.count, "productos");
  saveCart(); // Asegurar que esté guardado
  window.location.href = "checkout.html";
}

// Mensaje cuando el carrito está vacío
function showEmptyCartMessage() {
  showNotification(
    "🛒 Tu carrito está vacío\nAgrega algunos productos primero",
    "info"
  );
}

// ======================================
// 🏪 FUNCIONES DE CHECKOUT
// ======================================

// Cargar carrito en la página de checkout
function loadCartInCheckout() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSummaryContainer = document.getElementById("cart-summary");

  if (!cartItemsContainer) return; // No estamos en checkout

  console.log("🛒 Cargando carrito en checkout");

  // Cargar datos del carrito
  loadCart();

  // Limpiar contenedor
  cartItemsContainer.innerHTML = "";

  if (cart.items.length === 0) {
    showEmptyCartInCheckout(cartItemsContainer);
    return;
  }

  // Mostrar productos
  cart.items.forEach((item, index) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";

    const itemId = item.id || item.name || index;
    const itemSize = item.size || "Talla única";
    const productType = detectProductType(item);
    const isDigital = productType === "membership" || productType === "plan";

    // Controles de cantidad (diferentes para productos digitales)
    const quantityControls = isDigital
      ? `<span class="quantity">1</span>`
      : `<div class="quantity-controls">
        <button onclick="decreaseItemQuantity('${itemId}', '${itemSize}')" class="qty-btn">-</button>
        <span class="quantity">${item.quantity}</span>
        <button onclick="increaseItemQuantity('${itemId}', '${itemSize}')" class="qty-btn">+</button>
      </div>`;

    // Etiqueta de tipo
    const productLabel = isDigital
      ? '<span style="color: #ff69b4; font-size: 12px; font-weight: 600;">• Digital</span>'
      : '<span style="color: #28a745; font-size: 12px; font-weight: 600;">• Físico</span>';

    itemElement.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.image || "https://via.placeholder.com/80x80"}" alt="${
      item.name
    }" class="cart-item-image">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>Talla: ${itemSize}</p>
          <p>L.${item.price.toFixed(2)}</p>
          ${productLabel}
        </div>
      </div>
      <div class="cart-item-controls">
        ${quantityControls}
        <button onclick="removeFromCart('${itemId}', '${itemSize}')" class="remove-btn">🗑️</button>
      </div>
    `;

    cartItemsContainer.appendChild(itemElement);
  });

  // Botón para vaciar carrito
  const clearButton = document.createElement("div");
  clearButton.innerHTML = `<button onclick="clearCart()" class="clear-cart-btn">🧹 Vaciar Carrito</button>`;
  cartItemsContainer.appendChild(clearButton);

  // Actualizar resumen
  updateCartSummary();
}

// Mostrar carrito vacío en checkout
function showEmptyCartInCheckout(container) {
  container.innerHTML = `
    <div class="empty-cart-message" style="text-align: center; padding: 60px 20px; color: #666;">
      <div style="font-size: 4rem; margin-bottom: 20px;">🛒</div>
      <h3 style="color: #333; margin-bottom: 15px; font-size: 1.5rem;">Tu carrito está vacío</h3>
      <p style="margin-bottom: 30px; font-size: 1.1rem;">Agrega algunos productos para proceder con tu compra</p>
      <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
        <a href="tienda.html" style="background: linear-gradient(45deg, #ff69b4, #ff0080); color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          🏪 Ir a la Tienda
        </a>
        <a href="membresias.html" style="background: linear-gradient(45deg, #333, #555); color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          🎫 Ver Membresías
        </a>
      </div>
    </div>
  `;

  // Resetear totales
  updateCartSummary();
}

// Actualizar resumen del carrito
function updateCartSummary() {
  calculateCartTotals();

  const subtotal = cart.total || 0;
  const shipping = subtotal >= 75 ? 0 : 10; // Envío gratis en compras mayores a L.75
  const taxRate = 0.15; // 15% de impuestos
  const taxes = subtotal * taxRate;
  const finalTotal = subtotal + shipping + taxes;

  // Actualizar elementos del resumen
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

  // Actualizar botón de pago
  if (payButton) {
    if (cart.items.length === 0 || finalTotal === 0) {
      payButton.textContent = "Carrito Vacío";
      payButton.disabled = true;
      payButton.style.background = "#ccc";
      payButton.style.cursor = "not-allowed";
    } else {
      payButton.textContent = `Completar Pago - L.${finalTotal.toFixed(2)}`;
      payButton.disabled = false;
      payButton.style.background = "";
      payButton.style.cursor = "";
    }
  }
}

// ======================================
// 🔔 SISTEMA DE NOTIFICACIONES
// ======================================

// Mostrar notificaciones
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `cart-notification notification-${type}`;
  notification.innerHTML = message.replace(/\n/g, "<br>");

  const colors = {
    success: "#4CAF50",
    error: "#ff4444",
    info: "#2196F3",
    warning: "#ff9800",
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
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    max-width: 300px;
    font-size: 14px;
    line-height: 1.4;
  `;

  document.body.appendChild(notification);

  // Remover después de 4 segundos
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-in";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);

  // Agregar estilos CSS de animación
  addAnimationStyles();
}

// Agregar estilos de animación
function addAnimationStyles() {
  if (!document.querySelector("#cart-animation-styles")) {
    const style = document.createElement("style");
    style.id = "cart-animation-styles";
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

// ======================================
// 🚀 INICIALIZACIÓN
// ======================================

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  console.log("🛒 NewLife Cart Handler - Inicializando...");

  // Cargar carrito existente
  loadCart();

  // Configurar botón del carrito
  setTimeout(() => {
    const cartBtn =
      document.getElementById("cart-btn") ||
      document.querySelector(".cart-button");
    if (cartBtn) {
      // Remover listeners anteriores y agregar nuevo
      const newButton = cartBtn.cloneNode(true);
      cartBtn.parentNode.replaceChild(newButton, cartBtn);

      newButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openCart();
      });

      console.log("✅ Botón del carrito configurado");
    }
  }, 200);

  // Si estamos en checkout, cargar productos
  if (window.location.pathname.includes("checkout.html")) {
    setTimeout(() => {
      loadCartInCheckout();
    }, 100);
  }

  // Configurar botones de agregar al carrito
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      // Extraer datos del modal
      const productData = extractProductDataFromModal();
      if (productData) {
        addToCart(productData);

        // Efecto visual del botón
        const originalText = this.textContent;
        this.textContent = "¡Agregado!";
        this.style.background = "linear-gradient(45deg, #00ff00, #32cd32)";

        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = "";
        }, 2000);

        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
          const modal = document.getElementById("productModal");
          if (modal) modal.style.display = "none";
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

  console.log("✅ Cart Handler inicializado exitosamente");
});

// ======================================
// 🔧 FUNCIONES AUXILIARES
// ======================================

// Extraer datos del producto desde el modal
function extractProductDataFromModal() {
  try {
    const modal = document.getElementById("productModal");
    if (!modal || modal.style.display === "none") return null;

    const productId = modal.getAttribute("data-current-product");
    const nameElement = document.getElementById("modalProductName");
    const priceElement = document.getElementById("modalProductPrice");
    const imageElement = document.getElementById("mainProductImage");
    const sizeElement = document.querySelector(".size-btn.active");
    const quantityElement = document.querySelector(".quantity");

    if (!nameElement || !priceElement) return null;

    const priceText = priceElement.textContent;
    const price = parseFloat(priceText.replace(/[L.$,]/g, "").trim());

    return {
      id: productId,
      name: nameElement.textContent.trim(),
      price: price,
      size: sizeElement ? sizeElement.textContent.trim() : "Única",
      quantity: quantityElement ? parseInt(quantityElement.textContent) : 1,
      image: imageElement ? imageElement.src : "",
      source: "tienda", // Por defecto desde modal de tienda
    };
  } catch (error) {
    console.error("Error extrayendo datos del producto:", error);
    return null;
  }
}

// ======================================
// 🌐 FUNCIONES GLOBALES PARA API
// ======================================

// Exponer funciones principales para uso global
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseItemQuantity = increaseItemQuantity;
window.decreaseItemQuantity = decreaseItemQuantity;
window.clearCart = clearCart;
window.openCart = openCart;
window.loadCartInCheckout = loadCartInCheckout;
window.updateCartSummary = updateCartSummary;

// Funciones de información
window.getCartInfo = function () {
  return {
    items: cart.items,
    count: cart.count,
    total: cart.total,
  };
};

window.getCartItems = function () {
  return cart.items;
};

// Función de debug
window.debugCart = function () {
  console.log("🛒 DEBUG CARRITO:");
  console.log("Items:", cart.items);
  console.log("Count:", cart.count);
  console.log("Total:", cart.total);
  console.log("localStorage:", localStorage.getItem("newlife_cart"));
  return cart;
};

console.log(
  "🛒 NewLife Cart Handler - Versión Producción v1.0 - Cargado exitosamente"
);
