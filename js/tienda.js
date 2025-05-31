// ========================================
// FUNCIONALIDAD COMPLETA DE LA TIENDA
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  // ========================================
  // ANIMACIÓN DE LA IMAGEN DEL HERO
  // ========================================

  const heroImage = document.getElementById("heroImage");
  const settledImage = document.getElementById("settledImage");
  const infoSection = document.getElementById("infoSection");

  // Función para animar la imagen del hero a la sección de info
  function animateHeroImage() {
    const heroRect = heroImage.getBoundingClientRect();
    const settledRect = settledImage.getBoundingClientRect();

    // Crear un clon de la imagen para la animación
    const clonedImage = heroImage.cloneNode(true);
    clonedImage.style.position = "fixed";
    clonedImage.style.top = heroRect.top + "px";
    clonedImage.style.left = heroRect.left + "px";
    clonedImage.style.width = heroRect.width + "px";
    clonedImage.style.height = heroRect.height + "px";
    clonedImage.style.zIndex = "1000";
    clonedImage.style.transition =
      "all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    clonedImage.style.pointerEvents = "none";

    document.body.appendChild(clonedImage);

    // Ocultar la imagen original del hero
    heroImage.style.opacity = "0.3";

    // Animar al destino
    setTimeout(() => {
      clonedImage.style.top = settledRect.top + "px";
      clonedImage.style.left = settledRect.left + "px";
      clonedImage.style.width = settledRect.width + "px";
      clonedImage.style.height = settledRect.height + "px";
    }, 100);

    // Mostrar la imagen final y limpiar
    setTimeout(() => {
      settledImage.classList.add("visible");
      clonedImage.remove();
    }, 1600);
  }

  // Observador para detectar cuando la sección de info es visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !settledImage.classList.contains("visible")
        ) {
          animateHeroImage();
        }
      });
    },
    {
      threshold: 0.3,
    }
  );

  observer.observe(infoSection);

  // ========================================
  // NAVEGACIÓN SUAVE ENTRE CATEGORÍAS
  // ========================================

  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach((card) => {
    card.addEventListener("click", function () {
      const category = this.getAttribute("data-category");
      const targetSection = document.getElementById(category);

      if (targetSection) {
        // Scroll suave a la sección
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Efecto visual en la card clickeada
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "";
        }, 150);
      }
    });
  });

  // ========================================
  // FUNCIONALIDAD DEL MODAL DE PRODUCTOS
  // ========================================

  const modal = document.getElementById("productModal");
  const closeModal = document.querySelector(".close-modal");
  const productCards = document.querySelectorAll(".product-card");
  const mainProductImage = document.getElementById("mainProductImage");
  const modalProductName = document.getElementById("modalProductName");
  const modalProductPrice = document.getElementById("modalProductPrice");
  const modalProductDescription = document.getElementById(
    "modalProductDescription"
  );
  const thumbnails = document.querySelectorAll(".thumbnail");

  // Base de datos de productos (en tu implementación real, esto vendría de tu API)
  const productsData = {
    "camisa-mujer-1": {
      name: "Blusa Elegante Rosa",
      price: "L.500",
      description:
        "Blusa elegante confeccionada en algodón premium con detalles en rosa suave. Perfecta para ocasiones especiales o uso diario. Corte moderno que realza la figura femenina.",
      images: [
        "Fotostienda/mujer1.png",
        "Fotostienda/mujer1.png",
        "Fotostienda/mujer1.png",
      ],
    },
    "camisa-mujer-2": {
      name: "Top Premium Fucsia",
      price: "L.500",
      description:
        "Top deportivo en vibrante color fucsia, ideal para entrenamientos o looks casuales. Tejido transpirable y elástico que se adapta perfectamente al cuerpo.",
      images: [
        "Fotostienda/mujer2.png",
        "Fotostienda/mujer2.png",
        "Fotostienda/mujer2.png",
      ],
    },
    "camisa-mujer-3": {
      name: "Camisa Clásica Blanca",
      price: "L.500",
      description:
        "Camisa clásica en blanco puro, confeccionada en algodón egipcio. Un básico atemporal que nunca pasa de moda. Corte slim fit que estiliza la silueta.",
      images: [
        "Fotostienda/mujer3.png",
        "Fotostienda/mujer3.png",
        "Fotostienda/mujer3.png",
      ],
    },
    "camisa-hombre-1": {
      name: "Polo Deportivo Negro",
      price: "L.500",
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
      price: "L.500",
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
      price: "L.500",
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
      price: "L.500",
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
      price: "L.500",
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
      price: "L.500",
      description:
        "Tank top en vibrante color fucsia, perfecto para entrenamientos intensos o looks veraniegos. Tejido ligero y transpirable.",
      images: [
        "Fotostienda/unisex3.png",
        "Fotostienda/unisex3.png",
        "Fotostienda/unisex3.png",
      ],
    },
  };

  // Función para abrir el modal
  function openModal(productId) {
    const product = productsData[productId];

    if (product) {
      const modal = document.getElementById("productModal");
      modal.setAttribute("data-current-product", productId);

      // Actualizar contenido del modal
      modalProductName.textContent = product.name;
      modalProductPrice.textContent = product.price;
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
      document.querySelector(".size-btn.active").classList.remove("active");
      document.querySelector('.size-btn[data-size="M"]')
        ? document
            .querySelector('.size-btn[data-size="M"]')
            .classList.add("active")
        : document.querySelector(".size-btn").classList.add("active");

      document.querySelector(".quantity").textContent = "1";

      // Mostrar modal
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }

  // Event listeners para abrir modal
  productCards.forEach((card) => {
    card.addEventListener("click", function () {
      const productId = this.getAttribute("data-product");
      openModal(productId);
    });
  });

  // Cerrar modal
  function closeModalFunction() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  closeModal.addEventListener("click", closeModalFunction);

  // Cerrar modal al hacer clic fuera
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModalFunction();
    }
  });

  // Cerrar modal con tecla ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeModalFunction();
    }
  });

  // ========================================
  // FUNCIONALIDAD DEL MODAL - GALERÍA
  // ========================================

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      // Remover clase active de todos los thumbnails
      thumbnails.forEach((thumb) => thumb.classList.remove("active"));

      // Añadir clase active al thumbnail clickeado
      this.classList.add("active");

      // Cambiar imagen principal
      mainProductImage.src = this.src;
      mainProductImage.alt = this.alt;
    });
  });

  // ========================================
  // SELECTOR DE TALLAS
  // ========================================

  const sizeButtons = document.querySelectorAll(".size-btn");

  sizeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remover clase active de todos los botones
      sizeButtons.forEach((btn) => btn.classList.remove("active"));

      // Añadir clase active al botón clickeado
      this.classList.add("active");
    });
  });

  // ========================================
  // CONTROL DE CANTIDAD
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
      // Límite máximo de 10
      quantity++;
      quantityDisplay.textContent = quantity;
    }
  });

  // ========================================
  // BOTÓN AGREGAR AL CARRITO
  // ========================================

  const addToCartBtn = document.querySelector(".add-to-cart-btn");

  addToCartBtn.addEventListener("click", function () {
    // Obtener datos del producto actual
    const productName = modalProductName.textContent;
    const productPriceText = modalProductPrice.textContent;
    // Extraer el número del precio, funcionando con L. o $
    const productPrice = parseFloat(
      productPriceText.replace("L.", "").replace("$", "").trim()
    );
    const selectedSize = document.querySelector(".size-btn.active").textContent;
    const selectedQuantity = parseInt(quantityDisplay.textContent);
    const productImage = document.getElementById("mainProductImage").src;
    const modal = document.getElementById("productModal");

    // Crear objeto del producto para el carrito
    const productData = {
      id: modal.getAttribute("data-current-product"),
      name: productName,
      price: productPrice,
      size: selectedSize,
      quantity: selectedQuantity,
      image: productImage,
    };

    // Agregar al carrito
    addToCart(productData);

    // Efecto visual del botón
    const originalText = this.textContent;
    this.textContent = "¡Agregado!";
    this.style.background = "linear-gradient(45deg, #00ff00, #32cd32)";

    setTimeout(() => {
      this.textContent = originalText;
      this.style.background = "var(--primary-gradient)";
      closeModalFunction();
      // Abrir el carrito después de agregar el producto
      const cartPanel = document.getElementById("cartPanel");
      const cartOverlay = document.getElementById("cartOverlay");
      if (cartPanel && cartOverlay) {
        cartPanel.classList.add("active");
        cartOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    }, 1500);
  });

  // ========================================
  // NEWSLETTER SUBSCRIPTION
  // ========================================

  const newsletterForm = document.querySelector(".newsletter-form");

  newsletterForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = this.querySelector('input[type="email"]').value;
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Simular envío
    submitBtn.textContent = "Suscribiendo...";
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = "¡Suscrito!";
      submitBtn.style.background = "linear-gradient(45deg, #00ff00, #32cd32)";

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = "var(--primary-gradient)";
        submitBtn.disabled = false;
        this.querySelector('input[type="email"]').value = "";
      }, 3000);
    }, 1500);

    console.log("Newsletter subscription:", email);
  });

  // ========================================
  // SMOOTH SCROLLING PARA CTA BUTTON
  // ========================================

  const ctaButton = document.querySelector(".cta-button");

  ctaButton.addEventListener("click", function () {
    const categoriesSection = document.querySelector(".categories-section");
    categoriesSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  // ========================================
  // ANIMACIONES DE SCROLL
  // ========================================

  // Animación para las cards de productos al hacer scroll
  const animateOnScroll = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  // Aplicar animación a las cards de productos
  productCards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "all 0.6s ease";
    animateOnScroll.observe(card);
  });

  // Aplicar animación a las cards de categorías
  categoryCards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "all 0.6s ease";
    animateOnScroll.observe(card);
  });

  // ========================================
  // EFECTOS ADICIONALES
  // ========================================

  // Parallax effect para el hero
  window.addEventListener("scroll", function () {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector(".hero");
    const speed = scrolled * 0.5;

    if (parallax) {
      parallax.style.transform = `translateY(${speed}px)`;
    }
  });

  // Actualizar cantidad en el reset del modal
  function resetModalQuantity() {
    quantity = 1;
    quantityDisplay.textContent = quantity;
  }

  // Llamar reset cuando se abre el modal
  const originalOpenModal = openModal;
  openModal = function (productId) {
    originalOpenModal(productId);
    resetModalQuantity();
  };
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

//Funcion solamente para burger menu

const menuToggle = document.querySelector(".menu-toggle");
const navCenter = document.querySelector(".nav-center");
const overlay = document.querySelector(".overlay");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  navCenter.classList.toggle("open");
  overlay.classList.toggle("open");
});

overlay.addEventListener("click", () => {
  menuToggle.classList.remove("active");
  navCenter.classList.remove("open");
  overlay.classList.remove("open");
});
