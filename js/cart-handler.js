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

  const cartBtn = document.getElementById("cart-btn");
  const cartPanel = document.getElementById("cartPanel");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeBtn = document.querySelector(".close-btn");
  const addToCartBtn = document.querySelector(".add-to-cart-btn");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  // Event listeners principales
  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
  if (nextBtn) nextBtn.addEventListener("click", handleNextStep);
  if (backBtn) backBtn.addEventListener("click", handlePreviousStep);

  // Event listener para agregar al carrito
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = document.getElementById("productModal");
      const priceText =
        document.getElementById("modalProductPrice").textContent;
      const productData = {
        id: modal.getAttribute("data-current-product"),
        name: document.getElementById("modalProductName").textContent,
        price: parseFloat(priceText.replace("L.", "").replace("$", "").trim()),
        size: document.querySelector(".size-btn.active").textContent,
        quantity: parseInt(document.querySelector(".quantity").textContent),
        image: document.getElementById("mainProductImage").src,
      };

      addToCart(productData);
      showToast("¡Producto agregado al carrito!");
      setTimeout(() => {
        modal.style.display = "none";
      }, 1500);
    });
  });

  // Event listener para el botón de checkout
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      // Aquí puedes agregar la lógica para proceder al pago
      alert("Redirigiendo al proceso de pago...");
    });
  }

  // Escuchar eventos de sesión
  window.addEventListener("storage", function (e) {
    if (e.key === "userSession") {
      if (!e.newValue) {
        // Usuario cerró sesión
        clearCart();
      }
    }
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
    document.body.style.overflow = "hidden";
  }
}

function closeCart() {
  const cartPanel = document.getElementById("cartPanel");
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartPanel && cartOverlay) {
    cartPanel.classList.remove("active");
    cartOverlay.style.display = "none";
    document.body.style.overflow = "";
  }
}

// Inicialización del carrito
function initializeCart() {
  loadCartData();

  // Asegurarse de que los event listeners estén configurados
  const cartBtn = document.getElementById("cart-btn");
  const closeBtn = document.querySelector(".close-btn");
  const cartOverlay = document.getElementById("cartOverlay");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
  if (nextBtn) nextBtn.addEventListener("click", handleNextStep);
  if (backBtn) backBtn.addEventListener("click", handlePreviousStep);

  // Actualizar el contador del carrito
  updateCartCount();
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
  const form = document.getElementById("shippingForm");
  if (!form) return false;

  const isValid = form.checkValidity();
  if (!isValid) {
    form.reportValidity();
    return false;
  }

  // Guardar información de envío
  cartData.shippingInfo = {
    name: document.getElementById("shipping-name").value,
    lastname: document.getElementById("shipping-lastname").value,
    address: document.getElementById("shipping-address").value,
    city: document.getElementById("shipping-city").value,
    zip: document.getElementById("shipping-zip").value,
    phone: document.getElementById("shipping-phone").value,
    email: document.getElementById("shipping-email").value,
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

  // Limpiar carrito después de la orden
  setTimeout(() => {
    cartData = {
      items: [],
      shippingInfo: {},
      paymentInfo: {},
      total: 0,
      currentStep: 1,
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

  updateProgressBar(step);
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
  const shipping = cartData.items.length > 0 ? 100.0 : 0;
  const total = subtotal + shipping;

  const subtotalElement = document.getElementById("subtotal");
  const totalElement = document.getElementById("total");
  const shippingElement = document.getElementById("shipping");

  if (subtotalElement) subtotalElement.textContent = `L.${subtotal.toFixed(2)}`;
  if (shippingElement) shippingElement.textContent = `L.${shipping.toFixed(2)}`;
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
