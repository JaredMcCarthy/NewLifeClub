document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");

  // Función para alternar el menú
  function toggleMenu() {
    menuToggle.classList.toggle("active");
    navCenter.classList.toggle("open");
    overlay.style.display = navCenter.classList.contains("open")
      ? "block"
      : "none";
  }

  // Event listeners
  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  // Cerrar menú al hacer clic en el overlay
  if (overlay) {
    overlay.addEventListener("click", () => {
      if (navCenter.classList.contains("open")) {
        toggleMenu();
      }
    });
  }

  // Cerrar menú al hacer clic en un enlace
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navCenter.classList.contains("open")) {
        toggleMenu();
      }
    });
  });

  // Ajustar menú en cambio de orientación
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      menuToggle.classList.remove("active");
      navCenter.classList.remove("open");
      overlay.style.display = "none";
    }
  });
});
