// Variables globales
let cartData = {
  items: [],
  shippingInfo: {},
  paymentInfo: {},
  total: 0,
  currentStep: 1,
};

// Cargar datos del carrito desde localStorage
function loadCartData() {
  const savedCart = localStorage.getItem("cartData");
  if (savedCart) {
    try {
      cartData = JSON.parse(savedCart);
      updateCartDisplay();
      updateTotal();
      showStep(cartData.currentStep || 1);
      updateProgressBar(cartData.currentStep || 1);
    } catch (e) {
      console.error("Error loading cart data:", e);
      cartData = {
        items: [],
        shippingInfo: {},
        paymentInfo: {},
        total: 0,
        currentStep: 1,
      };
      saveCartData();
    }
  }
}

// Guardar datos del carrito en localStorage
function saveCartData() {
  localStorage.setItem("cartData", JSON.stringify(cartData));
  // Disparar evento personalizado para sincronizar todas las pestañas
  window.dispatchEvent(new CustomEvent("cartUpdate", { detail: cartData }));
}

// Escuchar cambios en otras pestañas
window.addEventListener("storage", function (e) {
  if (e.key === "cartData") {
    cartData = JSON.parse(e.newValue);
    updateCartDisplay();
    updateTotal();
  }
});

// Escuchar actualizaciones del carrito en la misma pestaña
window.addEventListener("cartUpdate", function (e) {
  cartData = e.detail;
  updateCartDisplay();
  updateTotal();
});

// Funciones para manejar el carrito
document.addEventListener("DOMContentLoaded", function () {
  loadCartData();

  // 🧹 INICIALIZACIÓN LIMPIA - Solo event listeners esenciales
  const cartBtn = document.getElementById("cart-btn");
  const closeBtn = document.querySelector(".close-btn");
  const cartOverlay = document.getElementById("cartOverlay");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  // Event listeners principales (solo una vez)
  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
  if (nextBtn) nextBtn.addEventListener("click", handleNextStep);
  if (backBtn) backBtn.addEventListener("click", handlePreviousStep);

  // Event listener para agregar al carrito (solo en páginas con modal)
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = document.getElementById("productModal");
      if (!modal) return; // Salir si no hay modal en esta página

      const priceText =
        document.getElementById("modalProductPrice")?.textContent;
      if (!priceText) return;

      const productData = {
        id: modal.getAttribute("data-current-product"),
        name: document.getElementById("modalProductName").textContent,
        price: parseFloat(priceText.replace("L.", "").replace("$", "").trim()),
        size:
          document.querySelector(".size-btn.active")?.textContent || "Única",
        quantity: parseInt(
          document.querySelector(".quantity")?.textContent || "1"
        ),
        image: document.getElementById("mainProductImage")?.src || "",
      };

      addToCart(productData);
      showToast("¡Producto agregado al carrito!");
      setTimeout(() => {
        modal.style.display = "none";
      }, 1500);
    });
  });

  // Event listeners para métodos de pago
  document.querySelectorAll(".payment-option").forEach((option) => {
    option.addEventListener("click", function () {
      selectPaymentMethod(this.dataset.payment);
    });
  });

  // Cerrar con ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeCart();
    }
  });

  // Inicializar carrito
  initializeCart();
});

// Funciones de apertura/cierre del carrito
function openCart() {
  const cartPanel = document.getElementById("cartPanel");
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartPanel && cartOverlay) {
    cartPanel.classList.add("active");
    cartOverlay.style.display = "block";
    cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // En móviles, agregar clase al body para mejor control
    if (window.innerWidth <= 768) {
      document.body.classList.add("cart-open");
      addMobileCloseButton();
    }

    // Focus en el carrito para accesibilidad
    setTimeout(() => {
      const closeBtn = cartPanel.querySelector(".close-btn");
      if (closeBtn) closeBtn.focus();
    }, 300);
  }
}

function closeCart() {
  const cartPanel = document.getElementById("cartPanel");
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartPanel && cartOverlay) {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
    cartOverlay.style.display = "none";
    document.body.style.overflow = "";
    document.body.classList.remove("cart-open");

    // Remover botón móvil adicional si existe
    const mobileCloseBtn = cartPanel.querySelector(".mobile-close-btn-extra");
    if (mobileCloseBtn) {
      mobileCloseBtn.remove();
    }
  }
}

// Función auxiliar para manejar toques en móvil
function handleCartTouch(event) {
  // Prevenir scroll en el fondo cuando se está en el carrito
  if (document.body.classList.contains("cart-open")) {
    const cartPanel = document.getElementById("cartPanel");
    if (cartPanel && !cartPanel.contains(event.target)) {
      event.preventDefault();
    }
  }
}

// Inicialización del carrito (optimizada)
function initializeCart() {
  // Solo cargar datos y configurar event listeners móviles
  updateCartCount();

  // Agregar soporte táctil solo en móviles
  if (window.innerWidth <= 768) {
    document.addEventListener("touchmove", handleCartTouch, { passive: false });
  }

  // Re-inicializar cuando cambie el tamaño de pantalla
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      document.body.classList.remove("cart-open");
    }
  });
}

function handleNextStep() {
  if (validateCurrentStep()) {
    const nextStep = cartData.currentStep + 1;
    if (nextStep <= 4) {
      cartData.currentStep = nextStep;
      showStep(nextStep);
      saveCartData();
    } else if (nextStep === 5) {
      completeOrder();
    }
  }
}

function handlePreviousStep() {
  if (cartData.currentStep > 1) {
    cartData.currentStep--;
    showStep(cartData.currentStep);
    saveCartData();
  }
}

function validateCurrentStep() {
  switch (cartData.currentStep) {
    case 1:
      // Si hay items en el carrito o estamos en la tienda, permitir avanzar
      return (
        cartData.items.length > 0 ||
        window.location.pathname.includes("tienda.html")
      );
    case 2:
      return validateShippingInfo();
    case 3:
      return validatePaymentInfo();
    default:
      return true;
  }
}

function validateShippingInfo() {
  // Si solo hay membresías (productos digitales), el envío es opcional
  if (!cartData.requiresShipping) {
    // Guardar información básica opcional para membresías
    cartData.shippingInfo = {
      name: document.getElementById("shipping-name")?.value || "Usuario",
      lastname:
        document.getElementById("shipping-lastname")?.value || "Digital",
      address: "Entrega Digital",
      city: "N/A",
      zip: "00000",
      phone: document.getElementById("shipping-phone")?.value || "000-0000",
      email:
        document.getElementById("shipping-email")?.value || "usuario@email.com",
      isDigital: true,
    };
    return true;
  }

  // Para productos físicos, validar todos los campos
  const form = document.getElementById("shippingForm");
  if (!form) return false;

  const isValid = form.checkValidity();
  if (!isValid) {
    form.reportValidity();
    return false;
  }

  // Guardar información de envío completa
  cartData.shippingInfo = {
    name: document.getElementById("shipping-name").value,
    lastname: document.getElementById("shipping-lastname").value,
    address: document.getElementById("shipping-address").value,
    city: document.getElementById("shipping-city").value,
    zip: document.getElementById("shipping-zip").value,
    phone: document.getElementById("shipping-phone").value,
    email: document.getElementById("shipping-email").value,
    isDigital: false,
  };

  return true;
}

function validatePaymentInfo() {
  const selectedPayment = document.querySelector(".payment-option.selected");
  if (!selectedPayment) {
    alert("Por favor, selecciona un método de pago");
    return false;
  }

  if (selectedPayment.dataset.payment === "card") {
    const cardNumber = document.getElementById("card-number").value;
    const cardExpiry = document.getElementById("card-expiry").value;
    const cardCvv = document.getElementById("card-cvv").value;

    // Validación básica
    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert("Por favor, completa todos los campos de la tarjeta");
      return false;
    }

    cartData.paymentInfo = {
      type: "card",
      number: cardNumber,
      expiry: cardExpiry,
      cvv: cardCvv,
    };
  }

  return true;
}

function selectPaymentMethod(method) {
  // Remover selección previa
  document.querySelectorAll(".payment-option").forEach((option) => {
    option.classList.remove("selected");
  });

  // Seleccionar nuevo método
  const selectedOption = document.querySelector(`[data-payment="${method}"]`);
  if (selectedOption) {
    selectedOption.classList.add("selected");
  }

  // Mostrar/ocultar formulario de tarjeta
  const cardForm = document.getElementById("cardForm");
  if (cardForm) {
    cardForm.style.display = method === "card" ? "block" : "none";
  }
}

function completeOrder() {
  const orderNumber = "ORD-" + Date.now();
  document.getElementById("orderNumber").textContent = orderNumber;
  document.getElementById("confirmationEmail").textContent =
    cartData.shippingInfo.email;
  document.getElementById(
    "finalAmount"
  ).textContent = `L.${cartData.total.toFixed(2)}`;

  const summary = document.getElementById("orderSummary");
  if (summary) {
    summary.innerHTML = generateOrderSummaryHTML();
  }

  // 🎯 AGREGAR INFORMACIÓN ESPECÍFICA SEGÚN TIPO DE PRODUCTOS
  const step4 = document.getElementById("step4");
  if (step4) {
    // Buscar o crear contenedor de información adicional
    let additionalInfo = step4.querySelector(".order-additional-info");
    if (!additionalInfo) {
      additionalInfo = document.createElement("div");
      additionalInfo.className = "order-additional-info";
      additionalInfo.style.cssText = `
        background: #f8f9fa;
        padding: 15px;
        border-radius: 10px;
        margin: 20px 0;
        border-left: 4px solid #28a745;
      `;

      // Insertar después del resumen
      const orderSummary = step4.querySelector("#orderSummary");
      if (orderSummary) {
        orderSummary.parentNode.insertBefore(
          additionalInfo,
          orderSummary.nextSibling
        );
      }
    }

    // Contenido específico según tipo de productos
    if (!cartData.requiresShipping) {
      additionalInfo.innerHTML = `
        <div style="text-align: center; color: #28a745;">
          <h4 style="margin: 0 0 10px 0;">📧 Acceso Digital</h4>
          <p style="margin: 0; font-size: 0.9rem; color: #666;">
            Recibirás el acceso a tus membresías por correo electrónico en los próximos minutos.
          </p>
        </div>
      `;
    } else {
      additionalInfo.innerHTML = `
        <div style="text-align: center; color: #ff1493;">
          <h4 style="margin: 0 0 10px 0;">📦 Envío a Domicilio</h4>
          <p style="margin: 0; font-size: 0.9rem; color: #666;">
            Tus productos serán enviados a: ${cartData.shippingInfo.address}, ${cartData.shippingInfo.city}
          </p>
          <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #666;">
            Tiempo estimado de entrega: 3-5 días hábiles
          </p>
        </div>
      `;
    }
  }

  // Limpiar carrito después de la orden
  setTimeout(() => {
    cartData = {
      items: [],
      shippingInfo: {},
      paymentInfo: {},
      total: 0,
      currentStep: 1,
      requiresShipping: false,
      shippingCost: 0,
    };
    saveCartData();
    closeCart();
  }, 5000);
}

function generateOrderSummaryHTML() {
  let html = '<div class="order-items">';
  document.querySelectorAll(".cart-item").forEach((item) => {
    const name = item.querySelector(".item-name").textContent;
    const price = item.querySelector(".item-price").textContent;
    const quantity = item.querySelector('[id^="qty"]').textContent;
    html += `
            <div class="order-item">
                <span>${name} x ${quantity}</span>
                <span>${price}</span>
            </div>
        `;
  });
  html += "</div>";
  return html;
}

function updateProgressBar(step) {
  const progress = ((step - 1) / 3) * 100;
  const progressFill = document.getElementById("progressFill");
  if (progressFill) progressFill.style.width = `${progress}%`;

  document.querySelectorAll(".step").forEach((s, index) => {
    if (index + 1 < step) {
      s.classList.add("completed");
      s.classList.remove("active");
    } else if (index + 1 === step) {
      s.classList.add("active");
      s.classList.remove("completed");
    } else {
      s.classList.remove("active", "completed");
    }
  });
}

function showStep(step) {
  document
    .querySelectorAll(".cart-step")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(`step${step}`).classList.add("active");

  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const cartActions = document.querySelector(".cart-actions");

  // Mostrar botones si hay productos en el carrito
  if (cartActions) {
    cartActions.style.display = cartData.items.length > 0 ? "flex" : "none";
  }

  if (backBtn) {
    backBtn.style.display = step === 1 ? "none" : "block";
  }

  if (nextBtn) {
    nextBtn.style.display = "block";
    nextBtn.textContent = step === 4 ? "Finalizar Compra" : "Continuar";
  }

  // 🎯 INFORMACIÓN CONTEXTUAL PARA PASO DE ENVÍO
  if (step === 2) {
    showShippingInfo();
  }

  updateProgressBar(step);
}

// Nueva función para mostrar información contextual sobre envío
function showShippingInfo() {
  const shippingStep = document.getElementById("step2");
  if (!shippingStep) return;

  // Buscar o crear el contenedor de información
  let infoDiv = shippingStep.querySelector(".shipping-info");
  if (!infoDiv) {
    infoDiv = document.createElement("div");
    infoDiv.className = "shipping-info";
    infoDiv.style.cssText = `
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 20px;
      border-left: 4px solid #ff1493;
    `;

    // Insertar antes del formulario
    const form = shippingStep.querySelector("#shippingForm");
    if (form) {
      shippingStep.insertBefore(infoDiv, form);
    }
  }

  // Actualizar contenido según tipo de productos
  if (!cartData.requiresShipping) {
    infoDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; color: #28a745;">
        <span style="font-size: 1.2rem;">📧</span>
        <div>
          <h4 style="margin: 0; color: #28a745;">Entrega Digital</h4>
          <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #666;">
            Solo tienes membresías digitales. El acceso se enviará por correo electrónico.
          </p>
        </div>
      </div>
    `;
  } else {
    infoDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; color: #ff1493;">
        <span style="font-size: 1.2rem;">📦</span>
        <div>
          <h4 style="margin: 0; color: #ff1493;">Envío Físico</h4>
          <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #666;">
            Tienes productos físicos que requieren envío a domicilio (L.100.00).
          </p>
        </div>
      </div>
    `;
  }
}

function updateQuantity(index, change) {
  const item = cartData.items[index];
  const newQuantity = item.quantity + change;

  if (newQuantity >= 1 && newQuantity <= 10) {
    item.quantity = newQuantity;
    saveCartData();
    updateCartDisplay();
    updateTotal();
  }
}

function calculateTotal() {
  return cartData.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

function updateTotal() {
  const subtotal = calculateTotal();

  // 🎯 LÓGICA INTELIGENTE DE ENVÍOS
  // Solo productos de tienda requieren envío, membresías NO
  const requiresShipping = cartData.items.some((item) => {
    const itemName = item.name.toLowerCase();

    // Detectar si es merchandise (requiere envío)
    const isMerchandise =
      itemName.includes("top") ||
      itemName.includes("hoodie") ||
      itemName.includes("camiseta") ||
      itemName.includes("camisa") ||
      itemName.includes("playera") ||
      itemName.includes("sudadera") ||
      itemName.includes("jersey") ||
      itemName.includes("polo") ||
      itemName.includes("shorts") ||
      itemName.includes("pantalón") ||
      itemName.includes("gorra") ||
      itemName.includes("cap") ||
      itemName.includes("accesorio") ||
      // Agregar más productos físicos según necesites
      (item.size && item.size !== "Mensual" && item.size !== "Anual"); // Tallas físicas vs suscripciones

    // Detectar si es membresía (NO requiere envío)
    const isMembership =
      itemName.includes("membresía") ||
      itemName.includes("membership") ||
      itemName.includes("suscripción") ||
      itemName.includes("plan") ||
      itemName.includes("básica") ||
      itemName.includes("premium") ||
      itemName.includes("elite") ||
      itemName.includes("pro") ||
      (item.size && (item.size === "Mensual" || item.size === "Anual"));

    // Si es merchandise, requiere envío
    return isMerchandise && !isMembership;
  });

  // Calcular envío: L.100 solo si hay productos físicos
  const shipping = cartData.items.length > 0 && requiresShipping ? 100.0 : 0;
  const total = subtotal + shipping;

  // Actualizar elementos del DOM
  const subtotalElement = document.getElementById("subtotal");
  const totalElement = document.getElementById("total");
  const shippingElement = document.getElementById("shipping");

  if (subtotalElement) subtotalElement.textContent = `L.${subtotal.toFixed(2)}`;
  if (shippingElement) {
    shippingElement.textContent = requiresShipping
      ? `L.${shipping.toFixed(2)}`
      : "Gratis";
    // Agregar indicador visual para envío gratis
    if (!requiresShipping && cartData.items.length > 0) {
      shippingElement.style.color = "#28a745";
      shippingElement.style.fontWeight = "600";
    } else {
      shippingElement.style.color = "#333";
      shippingElement.style.fontWeight = "normal";
    }
  }
  if (totalElement) totalElement.textContent = `L.${total.toFixed(2)}`;

  // Actualizar el contador del carrito
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const itemCount = cartData.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    cartCount.textContent = itemCount;
    cartCount.style.display = itemCount > 0 ? "block" : "none";
  }

  // Guardar información de envío en cartData para usar en otros pasos
  cartData.requiresShipping = requiresShipping;
  cartData.shippingCost = shipping;
  cartData.total = total;
}

// Función para agregar al carrito
function addToCart(productData) {
  const existingItemIndex = cartData.items.findIndex(
    (item) => item.id === productData.id && item.size === productData.size
  );

  if (existingItemIndex !== -1) {
    const newQuantity =
      cartData.items[existingItemIndex].quantity + productData.quantity;
    if (newQuantity <= 10) {
      cartData.items[existingItemIndex].quantity = newQuantity;
    }
  } else {
    if (productData.quantity <= 10) {
      cartData.items.push(productData);
    }
  }

  saveCartData();
  updateCartDisplay();
  updateTotal();
  // Asegurar que se muestre el paso actual con los botones
  showStep(cartData.currentStep);
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
  const cartItemsContainer = document.getElementById("cartItems");
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";

  cartData.items.forEach((item, index) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <div class="item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="item-details">
        <h4 class="item-name">${item.name}</h4>
        <p class="item-size">Talla: ${item.size}</p>
        <div class="item-quantity">
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <span id="qty${index}">${item.quantity}</span>
          <button onclick="updateQuantity(${index}, 1)">+</button>
        </div>
      </div>
      <div class="item-price">L.${(item.price * item.quantity).toFixed(2)}</div>
      <button class="remove-item" onclick="removeItem(${index})">×</button>
    `;
    cartItemsContainer.appendChild(itemElement);
  });

  // Asegurar que los botones se muestren correctamente
  showStep(cartData.currentStep);
}

// Función para remover item del carrito
function removeItem(index) {
  cartData.items.splice(index, 1);
  saveCartData();
  updateCartDisplay();
  updateTotal();
}

// Función para actualizar el contador del carrito
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const itemCount = cartData.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    cartCount.textContent = itemCount;
    cartCount.style.display = itemCount > 0 ? "block" : "none";
  }
}

// 🛠️ FUNCIÓN DE UTILIDAD PARA DEBUGGING
function showCartDebugInfo() {
  console.log("🛒 INFORMACIÓN DEL CARRITO:");
  console.log("📦 Items:", cartData.items.length);
  console.log("💰 Subtotal:", calculateTotal().toFixed(2));
  console.log("🚚 Requiere envío:", cartData.requiresShipping);
  console.log("💸 Costo envío:", cartData.shippingCost);
  console.log("💯 Total:", cartData.total);
  console.log(
    "📋 Productos:",
    cartData.items.map(
      (item) => `${item.name} (${item.size}) x${item.quantity}`
    )
  );

  return {
    items: cartData.items.length,
    subtotal: calculateTotal(),
    requiresShipping: cartData.requiresShipping,
    shippingCost: cartData.shippingCost,
    total: cartData.total,
    products: cartData.items,
  };
}

// Hacer función disponible globalmente para testing
window.showCartDebugInfo = showCartDebugInfo;

// Función para agregar botón de cerrar adicional en móviles
function addMobileCloseButton() {
  const cartPanel = document.getElementById("cartPanel");
  if (!cartPanel || window.innerWidth > 768) return;

  // Verificar si ya existe el botón móvil
  let mobileCloseBtn = cartPanel.querySelector(".mobile-close-btn-extra");

  if (!mobileCloseBtn) {
    mobileCloseBtn = document.createElement("button");
    mobileCloseBtn.className = "mobile-close-btn-extra";
    mobileCloseBtn.innerHTML = "✕";
    mobileCloseBtn.setAttribute("aria-label", "Cerrar carrito");

    // Estilos optimizados para el nuevo diseño
    mobileCloseBtn.style.cssText = `
      position: absolute !important;
      top: 15px !important;
      right: 15px !important;
      background: white !important;
      color: #ff1493 !important;
      border: 2px solid #ff1493 !important;
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      font-size: 20px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      z-index: 1002 !important;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.3s ease !important;
      outline: none !important;
    `;

    // Event listeners mejorados
    mobileCloseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeCart();
    });

    mobileCloseBtn.addEventListener("touchend", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeCart();
    });

    // Efecto hover/focus
    mobileCloseBtn.addEventListener("mouseenter", function () {
      this.style.background = "#ff1493 !important";
      this.style.color = "white !important";
      this.style.transform = "scale(1.1)";
    });

    mobileCloseBtn.addEventListener("mouseleave", function () {
      this.style.background = "white !important";
      this.style.color = "#ff1493 !important";
      this.style.transform = "scale(1)";
    });

    cartPanel.appendChild(mobileCloseBtn);

    console.log("🔘 Botón móvil adicional agregado");
  }
}
