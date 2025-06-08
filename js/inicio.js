console.log("🚀 INICIO.JS CARGADO - Versión LIMPIA sin menú móvil");

document.addEventListener("DOMContentLoaded", function () {
  // ========== NOTA: NAVEGACIÓN MÓVIL MOVIDA A simple-mobile-nav.js ==========

  // Animaciones de scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(
      ".slide-in-left, .slide-in-right, .fade-in"
    );

    elements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("visible");
      }
    });
  };

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

      heroContent.style.transform = `translate(-50%, calc(-50% + ${
        scrollPos * 0.2
      }px))`;
      heroContent.style.opacity = opacity;
    });
  }

  // Animación para el botón CTA
  const ctaButton = document.querySelector(".cta-button");
  if (ctaButton) {
    ctaButton.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  }

  // Animación para la sección de tarjetas de impacto
  const impactCards = document.querySelectorAll(".impact-card");
  if (impactCards.length > 0) {
    impactCards.forEach((card, index) => {
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

      // Verificar que todos los campos existen antes de acceder
      const nombreField =
        this.querySelector('[name="nombre"]') || this.querySelector("#nombre");
      const correoField =
        this.querySelector('[name="correo"]') || this.querySelector("#correo");
      const asuntoField =
        this.querySelector('[name="asunto"]') || this.querySelector("#asunto");
      const mensajeField =
        this.querySelector('[name="mensaje"]') ||
        this.querySelector("#mensaje");

      if (!nombreField || !correoField || !asuntoField || !mensajeField) {
        await showServerError(
          "No se pudieron encontrar todos los campos del formulario"
        );
        return;
      }

      const formData = {
        nombre: nombreField.value,
        correo: correoField.value,
        asunto: asuntoField.value,
        mensaje: mensajeField.value,
      };

      if (
        !formData.nombre ||
        !formData.correo ||
        !formData.asunto ||
        !formData.mensaje
      ) {
        await showValidationError("Por favor, completa todos los campos");
        return;
      }

      btn.textContent = "Enviando...";
      btn.disabled = true;

      try {
        const response = await fetch(
          "https://newlifeclub.onrender.com/backend/routes/contacts",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al enviar el mensaje");
        }

        contactForm.style.opacity = "0";
        contactForm.style.transform = "translateY(20px)";

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

          setTimeout(() => {
            successMessage.classList.add("visible");
          }, 10);

          const resetBtn = successMessage.querySelector(".reset-form");
          if (resetBtn) {
            resetBtn.addEventListener("click", () => {
              contactForm.reset();
              btn.textContent = originalText;
              btn.disabled = false;

              successMessage.classList.remove("visible");

              setTimeout(() => {
                successMessage.remove();
                contactForm.style.display = "flex";

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
        await showServerError(
          error.message ||
            "Error al enviar el mensaje. Por favor, intenta de nuevo."
        );
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  // Animación de texto typing para el hero
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
          setTimeout(typeWriter, 50);
        }
      };

      setTimeout(typeWriter, 500);
    }
  };

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

  // Animación de patrocinadores
  const patrocinadores = document.querySelector(".patrocinadores");
  const icons = document.querySelectorAll(".marquee-content i");

  if (patrocinadores && icons.length > 0) {
    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    function animateIcons() {
      if (isInViewport(patrocinadores)) {
        const maxDelay = 2000;
        const timePerIcon = Math.min(150, maxDelay / icons.length);

        icons.forEach((icon, index) => {
          setTimeout(() => {
            icon.classList.add("visible");
          }, timePerIcon * index);
        });
        window.removeEventListener("scroll", animateIcons);
      }
    }

    animateIcons();
    window.addEventListener("scroll", animateIcons);
  }

  // Manejo de sesión
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const userActions = document.querySelector(".user-actions");
  const logoutBtn = document.getElementById("logout-btn");
  const profileBtn = document.getElementById("profile-btn");

  const token = localStorage.getItem("token");

  if (token) {
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (userActions) userActions.style.display = "flex";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (registerBtn) registerBtn.style.display = "inline-block";
    if (userActions) userActions.style.display = "none";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener("click", function () {
      window.location.href = "Userprofile.html";
    });
  }

  console.log("✅ inicio.js cargado (SIN menú móvil)");
});
