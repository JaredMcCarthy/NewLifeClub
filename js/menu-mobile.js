document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");

  // Función para alternar el menú
  function toggleMenu() {
    if (!menuToggle || !navCenter || !overlay) return;

    menuToggle.classList.toggle("active");
    navCenter.classList.toggle("open");
    overlay.classList.toggle("open");

    // Prevenir scroll cuando el menú está abierto
    document.body.style.overflow = navCenter.classList.contains("open")
      ? "hidden"
      : "";
  }

  // Event listeners
  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  // Cerrar menú al hacer clic en el overlay
  if (overlay) {
    overlay.addEventListener("click", toggleMenu);
  }

  // Cerrar menú al hacer clic en un enlace
  const navLinks = document.querySelectorAll(".nav-center .nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navCenter.classList.contains("open")) {
        toggleMenu();
      }
    });
  });

  // Cerrar menú al cambiar el tamaño de la ventana
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && navCenter.classList.contains("open")) {
      toggleMenu();
    }
  });
});
