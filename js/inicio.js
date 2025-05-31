// Variables globales
let currentIndex = 4;

document.addEventListener("DOMContentLoaded", function () {
  // Animaciones de scroll
  const animateOnScroll = () => {
    // Selecciona todos los elementos con clases de animación
    const elements = document.querySelectorAll(
      ".slide-in-left, .slide-in-right, .fade-in"
    );

    elements.forEach((element) => {
      // Calcula la posición del elemento
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150; // Distancia desde la parte inferior de la ventana

      // Si el elemento es visible en la ventana
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("visible");
      } else {
        // Opcional: quitar la clase si el elemento no es visible
        // element.classList.remove('visible');
      }
    });
  };

  //Menu responsivo para dispositivos mobiles

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

  // Ejecuta la animación cuando se carga la página
  animateOnScroll();

  // Añade un listener para el evento de scroll
  window.addEventListener("scroll", animateOnScroll);

  // Efecto parallax para el video de fondo
  const videoContainer = document.querySelector(".video-container");
  const heroContent = document.querySelector(".hero-content");

  if (videoContainer && heroContent) {
    window.addEventListener("scroll", () => {
      const scrollPos = window.scrollY;
      const opacity = 1 - Math.min(scrollPos / 700, 1);

      // Aplica un efecto de parallax al contenido del hero
      heroContent.style.transform = `translate(-50%, calc(-50% + ${
        scrollPos * 0.2
      }px))`;
      heroContent.style.opacity = opacity;
    });
  }

  // Animación para el botón CTA
  const ctaButton = document.querySelector(".cta-button");
  if (ctaButton) {
    // Smooth scroll al hacer clic en el botón CTA
    ctaButton.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80, // Ajustar el offset según la altura del navbar
          behavior: "smooth",
        });
      }
    });
  }

  // Animación para la sección de tarjetas de impacto
  const impactCards = document.querySelectorAll(".impact-card");
  if (impactCards.length > 0) {
    impactCards.forEach((card, index) => {
      // Añade un delay a cada tarjeta para un efecto escalonado
      card.style.transitionDelay = `${index * 0.2}s`;
    });
  }

  // Envío del formulario de contacto
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const btn = this.querySelector("button");
      const originalText = btn.textContent;
      const formContainer = contactForm.parentElement;

      // Obtener los datos del formulario
      const formData = {
        nombre: this.querySelector('[name="nombre"]').value,
        correo: this.querySelector('[name="correo"]').value,
        asunto: this.querySelector('[name="asunto"]').value,
        mensaje: this.querySelector('[name="mensaje"]').value,
      };

      // Validar que todos los campos estén llenos
      if (
        !formData.nombre ||
        !formData.correo ||
        !formData.asunto ||
        !formData.mensaje
      ) {
        alert("Por favor, completa todos los campos");
        return;
      }

      // Cambiar el estado del botón
      btn.textContent = "Enviando...";
      btn.disabled = true;

      try {
        const response = await fetch("http://localhost:3000/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al enviar el mensaje");
        }

        // Ocultar el formulario con una animación
        contactForm.style.opacity = "0";
        contactForm.style.transform = "translateY(20px)";

        // Mostrar mensaje de éxito
        setTimeout(() => {
          contactForm.style.display = "none";

          const successMessage = document.createElement("div");
          successMessage.className = "success-message fade-in";
          successMessage.innerHTML = `
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FF69B4" stroke-width="2"/>
              <path d="M8 12L11 15L16 9" stroke="#FF69B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>¡Mensaje enviado con éxito!</h3>
            <p>Nos pondremos en contacto contigo pronto.</p>
            <button class="reset-form">Enviar otro mensaje</button>
          `;

          formContainer.appendChild(successMessage);

          // Añadir animación para mostrar el mensaje
          setTimeout(() => {
            successMessage.classList.add("visible");
          }, 10);

          // Evento para reiniciar el formulario
          const resetBtn = successMessage.querySelector(".reset-form");
          if (resetBtn) {
            resetBtn.addEventListener("click", () => {
              // Restaurar el formulario
              contactForm.reset();
              btn.textContent = originalText;
              btn.disabled = false;

              // Eliminar el mensaje de éxito
              successMessage.classList.remove("visible");

              setTimeout(() => {
                successMessage.remove();
                contactForm.style.display = "flex";

                // Mostrar el formulario de nuevo con animación
                setTimeout(() => {
                  contactForm.style.opacity = "1";
                  contactForm.style.transform = "translateY(0)";
                }, 10);
              }, 300);
            });
          }
        }, 300);
      } catch (error) {
        console.error("Error:", error);
        alert(
          error.message ||
            "Error al enviar el mensaje. Por favor, intenta de nuevo."
        );
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  // Opcional: Animación de texto typing para el hero
  const animateHeroText = () => {
    const heroText = document.querySelector(".hero-content p");
    if (heroText) {
      const text = heroText.textContent;
      heroText.textContent = "";

      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          heroText.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 50); // velocidad de escritura
        }
      };

      // Comienza la animación después de un breve retraso
      setTimeout(typeWriter, 500);
    }
  };

  // Descomenta la siguiente línea para activar la animación de texto
  animateHeroText();

  // Marquee infinito para patrocinadores
  const setupMarquee = () => {
    const marquee = document.querySelector(".marquee");
    if (!marquee) return;

    const content = marquee.querySelector(".marquee-content");
    const clone = content.cloneNode(true);
    marquee.appendChild(clone);
  };

  setupMarquee();
});

// seccion unica para la seccion de galeria y las slides de las fotos
// js almacena todas las slides dentro de las tabs y tambien hace las
//animasciones

// Array con las imágenes (puedes agregar más fotos aquí)
const images = [
  {
    src: "FotosInicio/FotosGaleria/Fotonum1.png",
    alt: "Corredor 1",
    likes: 20,
    comments: 5,
  },
  {
    src: "FotosInicio/FotosGaleria/Fotonum2.png",
    alt: "Corredor 2",
    likes: 30,
    comments: 10,
  },
  {
    src: "FotosInicio/FotosGaleria/Fotonum3.png",
    alt: "Corredor 3",
    likes: 25,
    comments: 8,
  },
  {
    src: "FotosInicio/FotosGaleria/Fotonum4.png",
    alt: "Corredor 4",
    likes: 18,
    comments: 6,
  },
  {
    src: "FotosInicio/FotosGaleria/Fotonum6.png",
    alt: "Corredor 5",
    likes: 22,
    comments: 7,
  },
  {
    src: "FotosInicio/FotosGaleria/Fotonum7.png",
    alt: "Corredor 6",
    likes: 35,
    comments: 12,
  },
  {
    src: "FotosInicio/FotosGaleria/Fotonum8.png",
    alt: "Corredor 7",
    likes: 28,
    comments: 9,
  },
  {
    src: "FotosInicio/FotosGaleria/Fotonum9.png",
    alt: "Corredor 8",
    likes: 15,
    comments: 4,
  },
  {
    src: "FotosInicio/FotosGaleria/Fotonum10.png",
    alt: "Corredor 9",
    likes: 40,
    comments: 15,
  },
  {
    src: "FotosInicio/FotosGaleria/Fotonum11.png",
    alt: "Corredor 10",
    likes: 33,
    comments: 11,
  },
  // Puedes agregar más imágenes aquí...
];

// Función para generar las fotos dinámicamente
function generatePhotos() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = ""; // Limpiar galería antes de regenerar

  images.forEach((image, index) => {
    const card = document.createElement("div");
    card.classList.add("photo-card");
    if (index === currentIndex) {
      card.classList.add("active");
    }

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    img.loading = "lazy"; // Carga perezosa para mejorar el rendimiento

    const info = document.createElement("div");
    info.classList.add("photo-info");

    const likes = document.createElement("span");
    likes.classList.add("likes");
    likes.textContent = `${image.likes} Likes`;

    const comments = document.createElement("span");
    comments.classList.add("comments");
    comments.textContent = `${image.comments} Comments`;

    info.appendChild(likes);
    info.appendChild(comments);

    card.appendChild(img);
    card.appendChild(info);

    gallery.appendChild(card);
  });

  updateGalleryPosition();
  updatePhotoCounter();
}

// Función para actualizar la posición de la galería
function updateGalleryPosition() {
  const gallery = document.getElementById("gallery");
  const cardWidth = 300 + 32; // ancho de la tarjeta + márgenes (16px a cada lado)
  const offset = -currentIndex * cardWidth;

  // Calcular el punto central para alinear la carta activa en el centro
  const galleryContainer = document.querySelector(".gallery-container");
  const containerWidth = galleryContainer.offsetWidth;
  const centerOffset = (containerWidth - cardWidth) / 2;

  gallery.style.transform = `translateX(${offset + centerOffset}px)`;
}

// Función para actualizar el contador de fotos
function updatePhotoCounter() {
  const photoCounter = document.getElementById("photo-counter");
  photoCounter.textContent = `Foto ${currentIndex + 1} de ${images.length}`;
}

// Función para mover la galería
function moveSlide(direction) {
  const totalCards = images.length;

  // Cambiar el índice de la imagen actual con el direccionamiento
  currentIndex += direction;

  // Asegurar que el índice sea circular (infinito)
  if (currentIndex < 0) currentIndex = totalCards - 1;
  if (currentIndex >= totalCards) currentIndex = 0;

  // Regenerar la galería con la nueva imagen activa
  generatePhotos();
}

// Función para detectar scroll y animar elementos
function handleScroll() {
  const gallerySection = document.querySelector(".gallery-section");
  const sectionPosition = gallerySection.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Si la sección está visible en el viewport
  if (sectionPosition.top < windowHeight * 0.75) {
    gallerySection.classList.add("animate-in");
  }
}

// Inicializar la galería al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  generatePhotos();

  // Verificar si la sección es visible al cargar
  handleScroll();

  // Agregar listener para el scroll
  window.addEventListener("scroll", handleScroll);

  // Ajustar posición en cambio de tamaño de ventana
  window.addEventListener("resize", function () {
    updateGalleryPosition();
  });
});

// Precargar imágenes para mejor rendimiento
function preloadImages() {
  images.forEach((image) => {
    const img = new Image();
    img.src = image.src;
  });
}

// Precargar imágenes al inicio
preloadImages();

//seccion exclusiva para patrocinadores y sus animaciones medio fansys

document.addEventListener("DOMContentLoaded", function () {
  // Función para verificar si un elemento está en el viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Obtener la sección de patrocinadores
  const patrocinadores = document.querySelector(".patrocinadores");
  // Obtener todos los iconos
  const icons = document.querySelectorAll(".marquee-content i");

  // Función para animar los iconos cuando la sección es visible
  function animateIcons() {
    if (isInViewport(patrocinadores)) {
      // Calculamos un retraso máximo para evitar esperas muy largas con muchos iconos
      const maxDelay = 2000; // 2 segundos máximo para toda la animación
      const timePerIcon = Math.min(150, maxDelay / icons.length);

      icons.forEach((icon, index) => {
        // Aplicar un retraso a cada icono para que aparezcan secuencialmente
        setTimeout(() => {
          icon.classList.add("visible");
        }, timePerIcon * index);
      });
      // Quitar el listener una vez que se han animado los iconos
      window.removeEventListener("scroll", animateIcons);
    }
  }

  // Verificar si los patrocinadores están en el viewport al cargar la página
  animateIcons();

  // Agregar listener para el evento de scroll
  window.addEventListener("scroll", animateIcons);
});

// Codigo de las botones despues de iniciar/registrarse hecho por GPT
document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const userActions = document.querySelector(".user-actions");

  const token = localStorage.getItem("token");

  if (token) {
    // Usuario logueado
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (userActions) userActions.style.display = "flex"; // o "block", según tu estilo
  } else {
    // Usuario no logueado
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (registerBtn) registerBtn.style.display = "inline-block";
    if (userActions) userActions.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ inicio.js cargado");

  const token = localStorage.getItem("token");

  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const userActions = document.querySelector(".user-actions");

  if (token) {
    // Usuario logueado
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (userActions) userActions.style.display = "flex"; // o "block", depende de tu estilo
  } else {
    // Usuario NO logueado
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (registerBtn) registerBtn.style.display = "inline-block";
    if (userActions) userActions.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("token"); // elimina el token
      window.location.href = "index.html"; // redirige a inicio o login
    });
  }
});

document.getElementById("profile-btn").addEventListener("click", function () {
  window.location.href = "Userprofile.html";
});

// Codigo exclusivo para guardar la info de CONTACTANOS basicamente

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const asunto = document.getElementById("asunto").value;
    const mensaje = document.getElementById("mensaje").value;

    try {
      const response = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, correo, asunto, mensaje }),
      });

      if (response.ok) {
        const data = await response.json();
        document.getElementById("mensajeConfirmacion").textContent =
          "✅ Mensaje enviado con éxito.";
        form.reset();
      } else {
        const errorText = await response.text(); // Captura el HTML de error si ocurre
        console.error("Respuesta con error del servidor:", errorText);
        document.getElementById("mensajeConfirmacion").textContent =
          "❌ Ocurrió un error al enviar el mensaje.";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("mensajeConfirmacion").textContent =
        "❌ Error de red o del servidor.";
    }
  });
});
