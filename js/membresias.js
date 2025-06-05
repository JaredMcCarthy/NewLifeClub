// Animaciones al hacer scroll
const animateOnScroll = () => {
  const elements = document.querySelectorAll(
    ".beneficio-card, .plan-card, .timeline-item, .accordion-item"
  );

  elements.forEach((element) => {
    const elementPosition = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (elementPosition < windowHeight - 100) {
      element.classList.add("animated");
    }
  });
};

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

//Funcion para que el boton vaya abajo a la primera sections
document.getElementById("open-modal").addEventListener("click", function () {
  window.scrollTo({
    top: window.innerHeight,
    behavior: "smooth",
  });
});

// Inicializar animaciones
window.addEventListener("load", () => {
  animateOnScroll();
  window.addEventListener("scroll", animateOnScroll);
});

// Accordion
const accordionItems = document.querySelectorAll(".accordion-item");

accordionItems.forEach((item) => {
  const header = item.querySelector(".accordion-header");
  const content = item.querySelector(".accordion-content");

  header.addEventListener("click", () => {
    // Cerrar todos los acordeones
    accordionItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.classList.remove("active");
        otherItem.querySelector(".accordion-content").style.maxHeight = 0;
      }
    });

    // Alternar el estado del acordeón actual
    item.classList.toggle("active");

    if (item.classList.contains("active")) {
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      content.style.maxHeight = 0;
    }
  });
});

// Testimonios Slider
const dots = document.querySelectorAll(".dot");
const testimonios = document.querySelectorAll(".testimonio");

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    // Desactivar todos los dots y testimonios
    dots.forEach((d) => d.classList.remove("active"));
    testimonios.forEach((t) => t.classList.remove("active"));

    // Activar el dot y testimonio actual
    dot.classList.add("active");
    testimonios[index].classList.add("active");
  });
});

// Eventos Slider
const sliderTrack = document.querySelector(".eventos-track");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const eventCards = document.querySelectorAll(".evento-card");

// Solo inicializar el slider si existen todos los elementos necesarios
if (sliderTrack && prevButton && nextButton && eventCards.length > 0) {
  let currentPosition = 0;
  const cardWidth = eventCards[0].offsetWidth + 20; // Ancho de la tarjeta + margen
  const maxPosition =
    (eventCards.length - Math.floor(sliderTrack.offsetWidth / cardWidth)) *
    cardWidth;

  prevButton.addEventListener("click", () => {
    currentPosition = Math.max(currentPosition - cardWidth, 0);
    sliderTrack.style.transform = `translateX(-${currentPosition}px)`;
  });

  nextButton.addEventListener("click", () => {
    currentPosition = Math.min(currentPosition + cardWidth, maxPosition);
    sliderTrack.style.transform = `translateX(-${currentPosition}px)`;
  });
}

// Modal
const openModalButton = document.getElementById("open-modal");
const closeModalButton = document.getElementById("close-modal");
const modal = document.getElementById("membership-modal");

openModalButton.addEventListener("click", () => {
  modal.classList.add("active");
});

closeModalButton.addEventListener("click", () => {
  modal.classList.remove("active");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
  }
});

// Código exclusivo para el newsletter
document.addEventListener("DOMContentLoaded", function () {
  const newsletterForm = document.querySelector(".newsletter-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const emailInput = newsletterForm.querySelector(".newsletter-input");
      const submitButton = newsletterForm.querySelector(
        "button[type='submit']"
      );
      const correo = emailInput.value.trim();

      if (!correo) {
        alert("Por favor, ingresa un correo válido.");
        return;
      }

      // Deshabilitar el botón y mostrar estado de carga
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      }

      try {
        console.log("📤 Intentando enviar newsletter a:", correo);
        console.log(
          "🌐 URL completa:",
          "https://newlifeclub.onrender.com/backend/routes/newsletter"
        );

        // Probar múltiples URLs por si una no funciona
        const urlsToTry = [
          "https://newlifeclub.onrender.com/backend/routes/newsletter",
          "https://newlifeclub.onrender.com/newsletter",
          "https://newlifeclub.onrender.com/api/newsletter",
        ];

        let response = null;
        let lastError = null;

        for (const url of urlsToTry) {
          try {
            console.log("🔄 Probando URL:", url);
            response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ correo }),
            });

            console.log("📡 Respuesta de", url, "- Status:", response.status);

            if (response.ok) {
              console.log("✅ URL funcionando:", url);
              break;
            } else {
              console.log("❌ URL falló:", url, "Status:", response.status);
            }
          } catch (error) {
            console.log("❌ Error con URL:", url, error.message);
            lastError = error;
            continue;
          }
        }

        if (!response || !response.ok) {
          throw lastError || new Error("Todas las URLs fallaron");
        }

        console.log("📡 Respuesta recibida - Status:", response.status);
        console.log("📡 Respuesta recibida - Headers:", response.headers);

        const data = await response.json();
        console.log("📄 Respuesta del newsletter:", data);

        if (!response.ok) {
          throw new Error(data.mensaje || "Error al procesar la suscripción");
        }

        if (data.success) {
          // Mostrar mensaje de éxito
          alert(
            "¡Gracias por suscribirte! Te mantendremos informado de todas nuestras novedades."
          );
          emailInput.value = "";
        } else {
          throw new Error(data.mensaje || "Error al procesar la suscripción");
        }
      } catch (error) {
        console.error("Error al suscribirse:", error);
        alert(
          error.message ||
            "Error al procesar la suscripción. Por favor, intenta de nuevo."
        );
      } finally {
        // Restaurar el botón
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = "Suscribirse";
        }
      }
    });
  }
});
