// Codigo solamente para animaciones preincipales de la pagina de pro

// ========================================
// MENÚ MÓVIL SIMPLE - FUNCIÓN DIRECTA
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🍔 Inicializando menú móvil en newlifepro.js");

  // Función simple del menú móvil
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");

  if (menuToggle && navCenter && overlay) {
    console.log("✅ Elementos del menú encontrados en newlifepro");

    menuToggle.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🍔 Click en menú - newlifepro.js");

      menuToggle.classList.toggle("active");
      navCenter.classList.toggle("show");
      overlay.classList.toggle("show");
      document.body.classList.toggle("menu-open");
    });

    overlay.addEventListener("click", function () {
      console.log("🎭 Cerrando menú por overlay - newlifepro.js");

      menuToggle.classList.remove("active");
      navCenter.classList.remove("show");
      overlay.classList.remove("show");
      document.body.classList.remove("menu-open");
    });

    // Cerrar menú cuando se hace click en links
    const navLinks = navCenter.querySelectorAll(".nav-link");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        menuToggle.classList.remove("active");
        navCenter.classList.remove("show");
        overlay.classList.remove("show");
        document.body.classList.remove("menu-open");
      });
    });

    console.log("✅ Menú móvil configurado en newlifepro.js");
  } else {
    console.log("❌ No se encontraron elementos del menú en newlifepro.js");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // ========== HERO SECTION ANIMATION ==========
  const heroContent = document.querySelector(".hero-content");
  const hero = document.querySelector(".hero");

  // Expand hero content when scrolling down
  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;
    const heroHeight = hero.offsetHeight;
    const scrollPercentage = (scrollPosition / heroHeight) * 100;

    // If scrolled within the hero section, expand the content
    if (scrollPosition < heroHeight) {
      // Scale hero content based on scroll percentage
      const scale = 1 + scrollPercentage / 500; // Adjust the divisor for more/less effect
      heroContent.style.transform = `scale(${scale})`;
    }
  });

  // ========== SMOOTH SCROLLING FOR NAVIGATION ==========

  // Función de scroll personalizada más rápida
  function fastSmoothScroll(target, duration = 800) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    const targetPosition = targetElement.offsetTop - 70; // Compensar navbar
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Función de easing para suavidad
    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");

      // Usar scroll personalizado más rápido
      fastSmoothScroll(targetId, 600); // 600ms = más rápido que antes
    });
  });

  // ========== SCROLL INDICATOR ==========
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        window.scrollTo({
          top: aboutSection.offsetTop,
          behavior: "smooth",
        });
      }
    });
  }

  // ========== TESTIMONIAL SLIDER ==========
  const testimonials = document.querySelectorAll(".testimonial");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-testimonial");
  const nextBtn = document.querySelector(".next-testimonial");
  let currentTestimonial = 0;

  // Function to show a specific testimonial
  function showTestimonial(index) {
    // Hide all testimonials
    testimonials.forEach((testimonial) => {
      testimonial.classList.remove("active");
    });

    // Remove active class from all dots
    dots.forEach((dot) => {
      dot.classList.remove("active");
    });

    // Show the selected testimonial and activate the corresponding dot
    testimonials[index].classList.add("active");
    dots[index].classList.add("active");

    // Update current testimonial index
    currentTestimonial = index;
  }

  // Next testimonial button
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      showTestimonial(currentTestimonial);
    });
  }

  // Previous testimonial button
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentTestimonial =
        (currentTestimonial - 1 + testimonials.length) % testimonials.length;
      showTestimonial(currentTestimonial);
    });
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showTestimonial(index);
    });
  });

  // Auto slide testimonials every 5 seconds
  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
  }, 5000);

  // ========== ANIMATE ON SCROLL ==========
  const animatedElements = document.querySelectorAll("[data-aos]");

  // Simple animation on scroll functionality
  function checkScroll() {
    const triggerBottom = window.innerHeight * 0.8;

    animatedElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < triggerBottom) {
        const delay = element.getAttribute("data-aos-delay") || 0;

        setTimeout(() => {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }, delay);
      }
    });
  }

  // Set initial styles for animated elements
  animatedElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  });

  // Check for elements in view on page load and scroll
  window.addEventListener("load", checkScroll);
  window.addEventListener("scroll", checkScroll);

  // ========== PLAN CARDS ANIMATION ==========
  const planCards = document.querySelectorAll(".plan-card");

  planCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.backgroundColor = "#f9f9f9";
    });

    card.addEventListener("mouseleave", () => {
      card.style.backgroundColor = "#ffffff";
    });
  });

  // ========== EDITORIAL CARDS HOVER EFFECT ==========
  const editorialCards = document.querySelectorAll(".editorial-card");

  editorialCards.forEach((card) => {
    const readMoreLink = card.querySelector(".read-more");

    card.addEventListener("mouseenter", () => {
      if (readMoreLink) {
        readMoreLink.style.color = "#ff00ff";
      }
    });

    card.addEventListener("mouseleave", () => {
      if (readMoreLink) {
        readMoreLink.style.color = "#ff69b4";
      }
    });
  });

  // ========== MEMBERSHIP SELECTION ==========
  const membershipButtons = document.querySelectorAll(".membership-button");

  membershipButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Excluir el botón específico del plan 10K
      if (this.id === "plan-10k-button") {
        return; // No hacer nada para este botón específico
      }

      // Excluir el botón específico del plan 21K (ELITE)
      if (this.id === "plan-21k-button") {
        return; // No hacer nada para este botón específico
      }

      // Excluir el botón específico del plan 42K (PRO)
      if (this.id === "plan-42k-button") {
        return; // No hacer nada para este botón específico
      }

      // Get the plan name from the closest membership card
      const card = this.closest(".membership-card");
      const planName = card.querySelector("h3").textContent;

      // You could add functionality here to handle plan selection
      // Usar popup personalizado para confirmación de plan seleccionado
      if (typeof CustomPopups !== "undefined") {
        CustomPopups.showAlert(
          `Has seleccionado el plan ${planName}. ¡Bienvenido a NewLifePro Club!`,
          "success",
          "🎯 Plan Seleccionado"
        );
      } else {
        alert(
          `Has seleccionado el plan ${planName}. ¡Gracias por unirte a NewLifePro Club!`
        );
      }

      // Redirect to registration or checkout page
      // window.location.href = '/registro?plan=' + encodeURIComponent(planName);
    });
  });

  // ========== CTA BUTTONS ==========
  const ctaButtons = document.querySelectorAll(".cta-button");

  ctaButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Smooth scroll to membership section
      const membershipSection = document.getElementById("membership");
      if (membershipSection) {
        window.scrollTo({
          top: membershipSection.offsetTop,
          behavior: "smooth",
        });
      }
    });
  });

  // ========== EDITORIAL BUTTON ==========
  const editorialButton = document.querySelector(".editorial-button");

  if (editorialButton) {
    editorialButton.addEventListener("click", function () {
      // This would typically link to a blog or articles page
      // Usar popup personalizado para funcionalidad editorial
      if (typeof CustomPopups !== "undefined") {
        CustomPopups.showAlert(
          "Esta funcionalidad te llevaría a la página completa de artículos motivacionales.",
          "info",
          "📚 Editoriales"
        );
      } else {
        alert(
          "Esta funcionalidad te llevaría a la página completa de artículos."
        );
      }
      // window.location.href = '/articulos';
    });
  }

  // ========== MOBILE RESPONSIVENESS ==========
  function handleResize() {
    const width = window.innerWidth;

    // Adjust hero text size for mobile
    if (width < 576) {
      heroContent.querySelector("h1").style.fontSize = "2.2rem";
      heroContent.querySelector("p").style.fontSize = "1rem";
    } else if (width < 768) {
      heroContent.querySelector("h1").style.fontSize = "2.8rem";
      heroContent.querySelector("p").style.fontSize = "1.2rem";
    } else {
      heroContent.querySelector("h1").style.fontSize = "";
      heroContent.querySelector("p").style.fontSize = "";
    }
  }

  // Initial check and listen for window resize
  handleResize();
  window.addEventListener("resize", handleResize);
});

// De aqui para abajo ya es otra cosa asi que no las confundas

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
