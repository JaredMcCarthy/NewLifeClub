document.addEventListener("DOMContentLoaded", () => {
  // Variables para elementos DOM
  const slides = document.querySelectorAll(".slide");
  const eventCards = document.querySelectorAll(".event-card");
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const modalOverlay = document.querySelector(".event-modal-overlay");
  const closeModalButtons = document.querySelectorAll(".close-modal");
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");

  console.log("Número de tarjetas encontradas:", eventCards.length);

  eventCards.forEach((card) => {
    console.log("ID del evento:", card.getAttribute("data-event"));
  });

  // ---------- FUNCIONES PRINCIPALES ----------

  // Iniciar slider automático
  initSlider();

  // Inicializar animaciones en scroll
  initScrollAnimations();

  // Agregar transición de página
  addPageTransition();

  // ---------- SISTEMA DE PESTAÑAS ----------
  // Cambiar entre pestañas de eventos
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");

      // Desactivar todas las pestañas
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Activar la pestaña seleccionada
      button.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Configuración del menú burger
  if (menuToggle && navCenter && overlay) {
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
  }

  // ---------- SISTEMA DE MODALES ----------
  // Abrir modal al hacer clic en tarjeta de evento

  if (eventCards.length > 0 && modalOverlay) {
    eventCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        // No abrir modal si se hace clic en un enlace de galería
        if (
          e.target.classList.contains("gallery-button") ||
          e.target.closest(".gallery-button")
        ) {
          return;
        }

        const eventId = card.getAttribute("data-event");
        const modal = document.getElementById(`modal-${eventId}`);

        if (modal) {
          modalOverlay.classList.add("active");
          modal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      });
    });
  }

  // Cerrar modal al hacer clic en botón o en el fondo
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", closeAllModals);
  });

  modalOverlay.addEventListener("click", closeAllModals);

  // Cerrar modal con tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });

  // Asegurar que los botones de galería funcionen correctamente
  const galleryButtons = document.querySelectorAll(".gallery-button");
  galleryButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Evitar que el evento se propague al modal
      // El comportamiento normal del enlace se ejecutará automáticamente
    });
  });

  // ---------- FUNCIONES DE UTILIDAD ----------

  // Función para iniciar el slider
  function initSlider() {
    let currentSlide = 0;
    const totalSlides = slides.length;

    // Función para cambiar de slide
    function nextSlide() {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % totalSlides;
      slides[currentSlide].classList.add("active");
    }

    // Cambiar slide cada 5 segundos
    setInterval(nextSlide, 5000);
  }

  // Función para animaciones en scroll
  function initScrollAnimations() {
    const fadeElements = document.querySelectorAll(
      ".event-card, .modal-content, .patrocinadores h2"
    );

    fadeElements.forEach((element) => {
      element.classList.add("fade-in");
    });

    // Función para verificar si el elemento está en el viewport
    function checkVisibility() {
      fadeElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const windowHeight =
          window.innerHeight || document.documentElement.clientHeight;

        if (rect.top <= windowHeight * 0.8) {
          element.classList.add("visible");
        }
      });
    }

    // Comprobar visibilidad al cargar y al hacer scroll
    checkVisibility();
    window.addEventListener("scroll", checkVisibility);
  }

  // Función para abrir un modal
  function openModal(modal) {
    modalOverlay.classList.add("active");
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevenir scroll
  }

  // Función para cerrar todos los modales
  function closeAllModals() {
    const activeModals = document.querySelectorAll(".event-modal.active");
    activeModals.forEach((modal) => {
      modal.classList.remove("active");
    });
    modalOverlay.classList.remove("active");
    document.body.style.overflow = ""; // Restaurar scroll
  }

  // Función para agregar transición de página
  function addPageTransition() {
    // Crear elemento de transición
    const transitionElement = document.createElement("div");
    transitionElement.className = "page-transition";

    // Crear loader
    const loader = document.createElement("div");
    loader.className = "loader";
    transitionElement.appendChild(loader);

    // Agregar a la página
    document.body.appendChild(transitionElement);

    // Disparar transición después de que todo cargue
    window.addEventListener("load", () => {
      setTimeout(() => {
        transitionElement.classList.add("loaded");
        setTimeout(() => {
          transitionElement.remove();
        }, 1000);
      }, 500);
    });
  }

  // Agregar indicador de desplazamiento en la página de inicio
  const heroBanner = document.querySelector(".hero-banner");
  if (heroBanner) {
    const scrollIndicator = document.createElement("div");
    scrollIndicator.className = "scroll-indicator";

    const scrollText = document.createElement("span");
    scrollText.textContent = "Desliza hacia abajo";

    const scrollArrow = document.createElement("div");
    scrollArrow.className = "arrow";

    scrollIndicator.appendChild(scrollText);
    scrollIndicator.appendChild(scrollArrow);
    heroBanner.appendChild(scrollIndicator);

    // Ocultar indicador al hacer scroll
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = "0";
      } else {
        scrollIndicator.style.opacity = "0.8";
      }
    });
  }

  // Efecto parallax en la sección de video
  const videoSection = document.querySelector(".video-fondo");
  if (videoSection) {
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY;
      const sectionPosition = videoSection.offsetTop;
      const windowHeight = window.innerHeight;

      if (
        scrollPosition > sectionPosition - windowHeight &&
        scrollPosition < sectionPosition + videoSection.offsetHeight
      ) {
        const parallaxValue =
          (scrollPosition - sectionPosition + windowHeight) * 0.1;
        videoSection.querySelector(
          ".video-text"
        ).style.transform = `translate(-50%, calc(-50% + ${parallaxValue}px))`;
      }
    });
  }

  // Agregar animación pulsante a botones CTA
  const ctaButtons = document.querySelectorAll(".cta-button, .register-button");
  ctaButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      button.style.animation = "pulse 1.5s infinite";
    });

    button.addEventListener("mouseleave", () => {
      button.style.animation = "none";
    });
  });

  // Funcion para los iconos de patrocinadores
  const icons = document.querySelectorAll(".marquee-content i");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          icons.forEach((icon, index) => {
            setTimeout(() => {
              icon.classList.add("visible");
            }, index * 150);
          });
          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  if (icons.length > 0) {
    observer.observe(icons[0].parentElement);
  }
});

// SECCION UNICAMENTE PARA RUTAS DENTRO DE EVENTOS
// todavia ando viendo si esta funcion de abajo me vaya a ser util pues

// Efecto hover en las imágenes
// const imagenes = document.querySelectorAll(".info-imagen img");
// imagenes.forEach((imagen) => {
//   imagen.addEventListener("mouseover", function () {
//     this.style.transform = "scale(1.03)";
//   });

//   imagen.addEventListener("mouseout", function () {
//     this.style.transform = "";
//   });
// });

const rutasIntData = [
  {
    id: 1,
    titulo: "Ruta Montaña Azul",
    fecha: "Todos los sábados",
    duracion: "4 horas",
    dificultad: "Moderado",
    ubicacion: "Parque Nacional Monte Verde",
    descripcion:
      "Esta hermosa ruta te llevará a través de senderos rodeados de naturaleza exuberante hasta llegar a la cima de la Montaña Azul. Disfrutarás de vistas panorámicas impresionantes y el aire fresco de la montaña. Ideal para excursionistas con experiencia moderada.",
    imagenes: ["FotosEvento/strava1.jpeg"],
  },
  {
    id: 2,
    titulo: "Ruta Valle Verde",
    fecha: "Todos los domingos",
    duracion: "3 horas",
    dificultad: "Fácil",
    ubicacion: "Reserva Natural El Bosque",
    descripcion:
      "Un recorrido tranquilo y accesible a través del Valle Verde, perfecto para principiantes y familias. Caminarás entre árboles centenarios, cruzarás pequeños arroyos y podrás observar diversas especies de aves. Esta ruta es ideal para quienes buscan una experiencia relajante en contacto con la naturaleza.",
    imagenes: ["FotosEvento/strava2.jpeg"],
  },
  {
    id: 3,
    titulo: "Ruta Cascada Plateada",
    fecha: "Todos los viernes",
    duracion: "5 horas",
    dificultad: "Avanzado",
    ubicacion: "Sierra Alta",
    descripcion:
      "Una ruta desafiante para excursionistas experimentados que te llevará hasta la impresionante Cascada Plateada. El camino incluye terreno rocoso, pendientes pronunciadas y travesías por río. La recompensa al final del camino es una majestuosa cascada de 50 metros de altura y la posibilidad de nadar en sus aguas cristalinas.",
    imagenes: ["FotosEvento/strava3.jpeg"],
  },
  {
    id: 4,
    titulo: "Ruta Lago Cristal",
    fecha: "Todos los miércoles",
    duracion: "2 horas",
    dificultad: "Fácil",
    ubicacion: "Parque Regional Los Pinos",
    descripcion:
      "Un recorrido corto y accesible alrededor del hermoso Lago Cristal. Esta ruta es perfecta para una escapada entre semana, ofreciendo hermosos paisajes junto al lago y la posibilidad de observar fauna local. El terreno es mayormente plano y bien mantenido, ideal para todos los niveles de condición física.",
    imagenes: ["FotosEvento/strava4.jpeg"],
  },
];

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Asegurarse de que esta función no interfiera con otros scripts
  initRutasInteractivas();
});

// Función de inicialización separada para evitar conflictos con otros scripts
function initRutasInteractivas() {
  // Referencias a elementos del DOM
  const rutasCards = document.querySelectorAll(".ruta-int-card");
  const modal = document.getElementById("rutaModal");

  // Si no encontramos los elementos, probablemente no estamos en la página correcta
  if (!rutasCards.length || !modal) return;

  const closeModal = document.querySelector(".close-int-modal");
  const inscripcionForm = document.getElementById("inscripcionForm");

  // Inicializar eventos para las tarjetas
  rutasCards.forEach((card) => {
    card.addEventListener("click", function () {
      const rutaId = this.getAttribute("data-ruta-id");
      abrirModalRuta(rutaId);
    });
  });

  // Cerrar modal con el botón X
  if (closeModal) {
    closeModal.addEventListener("click", function () {
      cerrarModalRuta();
    });
  }

  // Cerrar modal al hacer clic fuera del contenido
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      cerrarModalRuta();
    }
  });

  // Manejar envío del formulario
  if (inscripcionForm) {
    inscripcionForm.addEventListener("submit", function (e) {
      e.preventDefault();
      procesarInscripcionRuta();
    });
  } else {
    console.log(
      "⚠️ Formulario de inscripción no encontrado - probablemente no estamos en la página de eventos"
    );
  }

  // Inicializar eventos para las miniaturas de imágenes
  inicializarGaleriaImagenesRuta();
}

// Función para abrir el modal con los detalles de la ruta
function abrirModalRuta(rutaId) {
  // Buscar la ruta en los datos
  const ruta = rutasIntData.find((r) => r.id == rutaId);

  if (!ruta) return;

  // Rellenar el contenido del modal
  document.getElementById("modalTitle").textContent = ruta.titulo;
  document.getElementById("modalFecha").textContent = ruta.fecha;
  document.getElementById("modalDuracion").textContent = ruta.duracion;
  document.getElementById("modalDificultad").textContent = ruta.dificultad;
  document.getElementById("modalUbicacion").textContent = ruta.ubicacion;
  document.getElementById("modalDescripcion").textContent = ruta.descripcion;
  document.getElementById("rutaId").value = ruta.id;

  // Actualizar imágenes
  const mainImage = document.getElementById("modalMainImage");
  mainImage.src = ruta.imagenes[0];
  mainImage.alt = ruta.titulo;

  // Actualizar miniaturas
  const thumbnails = document.querySelectorAll(".thumbnail");
  thumbnails.forEach((thumb, index) => {
    if (index < ruta.imagenes.length) {
      thumb.src = ruta.imagenes[index];
      thumb.alt = `${ruta.titulo} - Imagen ${index + 1}`;
      thumb.style.display = "block";
    } else {
      thumb.style.display = "none";
    }
  });

  // Activar la primera miniatura
  if (thumbnails.length > 0) {
    thumbnails.forEach((t) => t.classList.remove("active"));
    thumbnails[0].classList.add("active");
  }

  // Mostrar el modal
  const modal = document.getElementById("rutaModal");
  modal.style.display = "flex";

  // Aplicar fade-in al modal
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);

  // Prevenir scroll del body
  document.body.style.overflow = "hidden";
}

// Función para cerrar el modal
function cerrarModalRuta() {
  const modal = document.getElementById("rutaModal");
  if (!modal) return;

  modal.classList.remove("active");

  // Esperar a que termine la animación antes de ocultar
  setTimeout(() => {
    modal.style.display = "none";

    // Restaurar contenido de inscripción si se mostró confirmación
    const inscripcionForm = document.getElementById("inscripcionForm");
    const confirmacion = document.querySelector(".inscripcion-confirmada");

    if (confirmacion && inscripcionForm) {
      confirmacion.remove();
      inscripcionForm.style.display = "block";
    }
  }, 300);

  // Permitir scroll del body nuevamente
  document.body.style.overflow = "";
}

// Función para inicializar la galería de imágenes
function inicializarGaleriaImagenesRuta() {
  const mainImage = document.getElementById("modalMainImage");
  const thumbnails = document.querySelectorAll(".thumbnail");

  if (!mainImage || !thumbnails.length) return;

  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", function () {
      // Actualizar imagen principal
      mainImage.src = this.src;
      mainImage.alt = this.alt;

      // Actualizar estado activo
      thumbnails.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

// Función para procesar la inscripción a una ruta
async function procesarInscripcionRuta() {
  const form = document.getElementById("inscripcionForm");
  const submitButton = form.querySelector("#btnInscribirse");
  const originalButtonText = submitButton.textContent;

  const rutaId = form.querySelector("#rutaId").value;
  const ruta = rutasIntData.find((r) => r.id == rutaId);

  // Validar que se encontró la ruta
  if (!ruta) {
    console.error("No se encontró la ruta con ID:", rutaId);
    alert("Error: No se encontró la información de la ruta");
    return;
  }

  const formData = {
    rutaId: rutaId,
    rutaNombre: ruta.titulo,
    nombre: form.querySelector("#nombre").value,
    email: form.querySelector("#email").value,
    telefono: form.querySelector("#telefono").value,
    participantes: parseInt(form.querySelector("#participantes").value, 10),
    fecha: ruta.fecha,
    duracion: ruta.duracion,
    ubicacion: ruta.ubicacion,
    dificultad: ruta.dificultad,
  };

  // Validar número de participantes
  if (isNaN(formData.participantes) || formData.participantes < 1) {
    alert("Por favor selecciona un número válido de participantes");
    return;
  }

  // Mostrar estado de carga
  submitButton.disabled = true;
  submitButton.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Procesando...';

  try {
    // URLs a intentar
    const urlsToTry = [
      "https://newlifeclub.onrender.com/backend/routes/rutasRoutes",
      "https://newlifeclub.onrender.com/rutasRoutes",
      "https://newlifeclub.onrender.com/api/rutasRoutes",
    ];

    let success = false;
    let lastError = null;

    // Intentar cada URL hasta que una funcione
    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          success = true;

          // Ocultar el formulario
          form.style.display = "none";

          // Crear y mostrar el banner de éxito
          const banner = document.createElement("div");
          banner.className =
            "success-banner animate__animated animate__fadeInDown";
          banner.innerHTML = `
            <div class="success-content">
              <i class="fas fa-check-circle"></i>
              <h3>¡Inscripción Exitosa!</h3>
              <p>Te has registrado exitosamente en la ruta <strong>${ruta.titulo}</strong>.</p>
              <p>Participantes: ${formData.participantes} persona(s)</p>
              <p>Fecha: ${ruta.fecha} | Duración: ${ruta.duracion}</p>
              <button class="close-banner">Cerrar</button>
            </div>
          `;

          document.body.appendChild(banner);

          // Agregar evento para cerrar el banner
          banner
            .querySelector(".close-banner")
            .addEventListener("click", () => {
              banner.classList.remove("animate__fadeInDown");
              banner.classList.add("animate__fadeOutUp");
              setTimeout(() => {
                banner.remove();
                cerrarModalRuta();
                // Restaurar y limpiar el formulario para permitir nuevo registro
                form.style.display = "block";
                form.reset();
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
              }, 500);
            });

          // Auto-cerrar después de 5 segundos
          setTimeout(() => {
            if (banner.parentNode) {
              banner.classList.remove("animate__fadeInDown");
              banner.classList.add("animate__fadeOutUp");
              setTimeout(() => {
                banner.remove();
                cerrarModalRuta();
                // Restaurar y limpiar el formulario para permitir nuevo registro
                form.style.display = "block";
                form.reset();
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
              }, 500);
            }
          }, 5000);

          break; // Salir del bucle si tuvimos éxito
        }
      } catch (error) {
        lastError = error;
        console.error(`Error con URL ${url}:`, error);
      }
    }

    if (!success) {
      throw new Error(lastError?.message || "Error al procesar la inscripción");
    }
  } catch (error) {
    console.error("Error al procesar inscripción:", error);
    alert("Error al procesar la inscripción: " + error.message);
  } finally {
    // Restaurar el botón si hubo un error
    if (submitButton.disabled) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  }
}

// Agregar el event listener al formulario de inscripción
const inscripcionForm = document.getElementById("inscripcionForm");
if (inscripcionForm) {
  inscripcionForm.addEventListener("submit", function (e) {
    e.preventDefault();
    procesarInscripcionRuta();
  });
} else {
  console.log(
    "⚠️ Formulario de inscripción no encontrado - probablemente no estamos en la página de eventos"
  );
}

// Agregar estilos CSS para los banners
const addBannerStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    .success-banner, .error-banner {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      padding: 25px 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
      min-width: 400px;
      max-width: 90vw;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .success-banner {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
    }

    .error-banner {
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color: white;
    }

    .success-content, .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .success-banner i, .error-banner i {
      font-size: 3rem;
      color: white;
      margin-bottom: 10px;
    }

    .success-banner h3 {
      font-size: 1.5rem;
      margin: 0;
      font-weight: 700;
    }

    .success-banner p, .error-banner p {
      margin: 5px 0;
      font-size: 1rem;
      opacity: 0.95;
      line-height: 1.4;
    }

    .success-banner strong {
      color: #FFE082;
    }

    .close-banner {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .close-banner:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    /* Animaciones para los banners */
    .animate__fadeInDown {
      animation: fadeInDown 0.5s ease-out;
    }

    .animate__fadeOutUp {
      animation: fadeOutUp 0.5s ease-in;
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    @keyframes fadeOutUp {
      from {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(-30px);
      }
    }

    /* Responsive para móviles */
    @media (max-width: 768px) {
      .success-banner, .error-banner {
        min-width: 300px;
        padding: 20px;
        margin: 0 10px;
      }

      .success-banner h3 {
        font-size: 1.3rem;
      }

      .success-banner p, .error-banner p {
        font-size: 0.9rem;
      }
    }
  `;
  document.head.appendChild(style);
};

// Agregar los estilos cuando se carga el documento
document.addEventListener("DOMContentLoaded", function () {
  addBannerStyles();
  // ... resto del código existente ...
});

//Menu responsivo para dispositivos mobiles
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");

  if (menuToggle && navCenter && overlay) {
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
  } else {
    console.log(
      "⚠️ Elementos del menú no encontrados - no se configurará el menú móvil"
    );
  }
});
