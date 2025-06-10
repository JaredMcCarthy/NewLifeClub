// ========================================
// 🛍️ TIENDA NEWLIFE RUN CLUB
// Sistema Simplificado que Funciona ✅
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
  const productCards = document.querySelectorAll(".product-card");
  const modal = document.getElementById("productModal");
  const closeModal = document.querySelector(".close-modal");
  const modalProductName = document.getElementById("modalProductName");
  const modalProductPrice = document.getElementById("modalProductPrice");
  const modalProductDescription = document.getElementById(
    "modalProductDescription"
  );
  const mainProductImage = document.getElementById("mainProductImage");
  const thumbnails = document.querySelectorAll(".thumbnail");

  // ========================================
  // 📦 DATOS DE PRODUCTOS
  // ========================================
  const productsData = {
    "camisa-mujer-1": {
      name: "Blusa Elegante Rosa",
      price: "500",
      description:
        "Blusa femenina en color rosa suave, ideal para el día a día. Confeccionada con materiales de primera calidad que garantizan comodidad y estilo.",
      images: [
        "Fotostienda/mujer1.png",
        "Fotostienda/mujer1.png",
        "Fotostienda/mujer1.png",
      ],
    },
    "camisa-mujer-2": {
      name: "Top Premium Fucsia",
      price: "500",
      description:
        "Top deportivo en vibrante color fucsia, perfecto para entrenamientos y actividades físicas. Tecnología de secado rápido y máxima transpirabilidad.",
      images: [
        "Fotostienda/mujer2.png",
        "Fotostienda/mujer2.png",
        "Fotostienda/mujer2.png",
      ],
    },
    "camisa-mujer-3": {
      name: "Camisa Clásica Blanca",
      price: "500",
      description:
        "Camisa clásica en blanco puro, versátil y elegante. Perfecta para ocasiones formales e informales. Corte favorecedor y tela de alta calidad.",
      images: [
        "Fotostienda/mujer3.png",
        "Fotostienda/mujer3.png",
        "Fotostienda/mujer3.png",
      ],
    },
    "camisa-hombre-1": {
      name: "Polo Deportivo Negro",
      price: "500",
      description:
        "Polo deportivo en negro intenso, perfecto para el gimnasio o actividades al aire libre. Tecnología de secado rápido y protección UV.",
      images: [
        "Fotostienda/hombre1.png",
        "Fotostienda/hombre1.png",
        "Fotostienda/hombre1.png",
      ],
    },
    "camisa-hombre-2": {
      name: "Camisa Casual Blanca",
      price: "500",
      description:
        "Camisa casual de manga larga en blanco clásico. Perfecta para el día a día o eventos informales. Tejido suave y cómodo.",
      images: [
        "Fotostienda/Hombre2.png",
        "Fotostienda/Hombre2.png",
        "Fotostienda/Hombre2.png",
      ],
    },
    "camisa-hombre-3": {
      name: "Henley Premium",
      price: "500",
      description:
        "Henley de manga larga en algodón orgánico premium. Estilo relajado pero sofisticado, ideal para cualquier ocasión casual.",
      images: [
        "Fotostienda/Hombre3.png",
        "Fotostienda/Hombre3.png",
        "Fotostienda/Hombre3.png",
      ],
    },
    "camisa-unisex-1": {
      name: "Oversized Tee",
      price: "500",
      description:
        "Camiseta oversized unisex con corte relajado. Perfecta para un look urbano y cómodo. Disponible en varios colores.",
      images: [
        "Fotostienda/unisex1.png",
        "Fotostienda/unisex1.png",
        "Fotostienda/unisex1.png",
      ],
    },
    "camisa-unisex-2": {
      name: "Hoodie Minimalista",
      price: "500",
      description:
        "Sudadera con capucha de diseño minimalista. Confeccionada en algodón orgánico con forro polar interior. Unisex y muy cómoda.",
      images: [
        "Fotostienda/unisex2.png",
        "Fotostienda/unisex2.png",
        "Fotostienda/unisex2.png",
      ],
    },
    "camisa-unisex-3": {
      name: "Tank Top Fucsia",
      price: "500",
      description:
        "Tank top en vibrante color fucsia, perfecto para entrenamientos intensos o looks veraniegos. Tejido ligero y transpirable.",
      images: [
        "Fotostienda/unisex3.png",
        "Fotostienda/unisex3.png",
        "Fotostienda/unisex3.png",
      ],
    },
  };

  // ========================================
  // 🔧 FUNCIONES DEL MODAL
  // ========================================

  // Abrir modal con datos del producto
  function openModal(productId) {
    const product = productsData[productId];

    if (product) {
      const modal = document.getElementById("productModal");
      modal.setAttribute("data-current-product", productId);

      // Actualizar contenido
      modalProductName.textContent = product.name;
      modalProductPrice.textContent = `L.${product.price}`;
      modalProductDescription.textContent = product.description;

      // Actualizar imágenes
      mainProductImage.src = product.images[0];
      mainProductImage.alt = product.name;

      thumbnails.forEach((thumb, index) => {
        if (product.images[index]) {
          thumb.src = product.images[index];
          thumb.alt = `${product.name} - Vista ${index + 1}`;
          thumb.style.display = "block";
        } else {
          thumb.style.display = "none";
        }
      });

      // Resetear selecciones
      document.querySelector(".size-btn.active")?.classList.remove("active");
      const defaultSize =
        document.querySelector('.size-btn[data-size="M"]') ||
        document.querySelector(".size-btn");
      if (defaultSize) defaultSize.classList.add("active");

      document.querySelector(".quantity").textContent = "1";

      // Mostrar modal
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }

  // Cerrar modal
  function closeModalFunction() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // ========================================
  // 📱 EVENT LISTENERS PRINCIPALES
  // ========================================

  // Abrir modal al hacer clic en producto
  productCards.forEach((card) => {
    card.addEventListener("click", function () {
      const productId = this.getAttribute("data-product");
      openModal(productId);
    });
  });

  // Cerrar modal
  closeModal.addEventListener("click", closeModalFunction);

  // Cerrar modal al hacer clic fuera
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModalFunction();
    }
  });

  // Cerrar modal con ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeModalFunction();
    }
  });

  // ========================================
  // 🖼️ GALERÍA DE IMÁGENES
  // ========================================

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      thumbnails.forEach((thumb) => thumb.classList.remove("active"));
      this.classList.add("active");
      mainProductImage.src = this.src;
      mainProductImage.alt = this.alt;
    });
  });

  // ========================================
  // 👕 SELECTOR DE TALLAS
  // ========================================

  const sizeButtons = document.querySelectorAll(".size-btn");
  sizeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      sizeButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // ========================================
  // 🔢 CONTROL DE CANTIDAD
  // ========================================

  const quantityDisplay = document.querySelector(".quantity");
  const minusBtn = document.querySelector(".qty-btn.minus");
  const plusBtn = document.querySelector(".qty-btn.plus");

  let quantity = 1;

  minusBtn.addEventListener("click", function () {
    if (quantity > 1) {
      quantity--;
      quantityDisplay.textContent = quantity;
    }
  });

  plusBtn.addEventListener("click", function () {
    if (quantity < 10) {
      quantity++;
      quantityDisplay.textContent = quantity;
    }
  });

  // ========================================
  // 🛒 AGREGAR AL CARRITO - FUNCIONAL ✅
  // ========================================

  const addToCartBtn = document.querySelector(".add-to-cart-btn");

  addToCartBtn.addEventListener("click", function () {
    console.log("🛒 Botón agregar al carrito clickeado");

    // Extraer datos del modal
    const modal = document.getElementById("productModal");
    const productId = modal.getAttribute("data-current-product");
    const product = productsData[productId];

    if (!product) {
      console.error("❌ Producto no encontrado:", productId);
      alert("Error: Producto no encontrado");
      return;
    }

    // Obtener datos seleccionados
    const selectedSize =
      document.querySelector(".size-btn.active")?.textContent || "M";
    const selectedQuantity = parseInt(quantityDisplay.textContent) || 1;

    // Crear objeto del producto
    const productData = {
      id: productId,
      name: product.name,
      price: parseFloat(product.price),
      size: selectedSize,
      quantity: selectedQuantity,
      image: product.images[0],
      source: "tienda",
    };

    console.log("📦 Datos del producto:", productData);

    // Verificar que addToCart existe
    if (typeof addToCart === "function") {
      const success = addToCart(productData);

      if (success) {
        // Efecto visual del botón
        const originalText = this.textContent;
        const originalBackground = this.style.background;

        this.textContent = "¡Agregado! ✅";
        this.style.background = "linear-gradient(45deg, #00ff00, #32cd32)";
        this.disabled = true;

        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = originalBackground;
          this.disabled = false;
        }, 2000);

        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
          closeModalFunction();
        }, 1500);
      }
    } else {
      console.error("❌ Función addToCart no disponible");
      alert("Error: Sistema de carrito no disponible. Recarga la página.");
    }
  });

  console.log("✅ Tienda.js inicializado correctamente");
});

// ========================================
// FUNCIONES UTILITARIAS
// ========================================

// Función para formatear precio
function formatPrice(price) {
  return price.toLocaleString("es-ES", {
    style: "currency",
    currency: "USD",
  });
}

// Función para validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Función para crear notificación toast (opcional)
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success" ? "var(--primary-gradient)" : "#ff4444"
        };
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
