console.log("🚀 Simple Mobile Nav - Cargando...");

document.addEventListener("DOMContentLoaded", function () {
  console.log("📱 Inicializando navegación móvil simple...");

  // ========== ELEMENTOS DOM ==========
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");
  const body = document.body;

  if (!menuToggle || !navCenter || !overlay) {
    console.error("❌ Elementos de navegación no encontrados");
    return;
  }

  console.log("✅ Elementos encontrados:", {
    menuToggle: !!menuToggle,
    navCenter: !!navCenter,
    overlay: !!overlay,
  });

  // ========== FUNCIÓN PARA ABRIR MENÚ ==========
  function openMenu() {
    console.log("🔓 Abriendo menú...");

    menuToggle.classList.add("active");
    navCenter.classList.add("show");
    overlay.classList.add("show");
    body.classList.add("menu-open");

    // Forzar estilos inline por si hay conflictos
    navCenter.style.left = "0";
    overlay.style.display = "block";

    console.log("✅ Menú abierto");
  }

  // ========== FUNCIÓN PARA CERRAR MENÚ ==========
  function closeMenu() {
    console.log("🔒 Cerrando menú...");

    menuToggle.classList.remove("active");
    navCenter.classList.remove("show");
    overlay.classList.remove("show");
    body.classList.remove("menu-open");

    // Resetear estilos inline
    navCenter.style.left = "";
    overlay.style.display = "";

    console.log("✅ Menú cerrado");
  }

  // ========== TOGGLE MENÚ ==========
  function toggleMenu() {
    const isOpen = menuToggle.classList.contains("active");
    console.log(
      "🔄 Toggle menú - Estado actual:",
      isOpen ? "abierto" : "cerrado"
    );

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // ========== EVENT LISTENERS ==========

  // Click en hamburguesa
  menuToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("🍔 Click en hamburguesa");
    toggleMenu();
  });

  // Click en overlay
  overlay.addEventListener("click", function (e) {
    e.preventDefault();
    console.log("🌫️ Click en overlay");
    closeMenu();
  });

  // Click en links del menú
  const navLinks = navCenter.querySelectorAll(".nav-link");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      console.log("🔗 Click en nav link:", this.textContent.trim());
      closeMenu();
    });
  });

  // Cerrar menú con ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuToggle.classList.contains("active")) {
      console.log("⌨️ ESC presionado - cerrando menú");
      closeMenu();
    }
  });

  // ========== MANEJO DE REDIMENSIÓN ==========
  window.addEventListener("resize", function () {
    const width = window.innerWidth;

    // Si cambia a desktop, cerrar menú
    if (width > 768 && menuToggle.classList.contains("active")) {
      console.log("📏 Cambio a desktop - cerrando menú");
      closeMenu();
    }
  });

  console.log("✅ Simple Mobile Nav - Inicializado correctamente");
});

// ========== FUNCIONES GLOBALES PARA DEBUGGING ==========
window.debugMobileNav = function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");

  console.log("🔍 Debug Mobile Nav:", {
    menuToggle: {
      exists: !!menuToggle,
      classes: menuToggle?.className,
      active: menuToggle?.classList.contains("active"),
    },
    navCenter: {
      exists: !!navCenter,
      classes: navCenter?.className,
      show: navCenter?.classList.contains("show"),
      style: navCenter?.style.cssText,
    },
    overlay: {
      exists: !!overlay,
      classes: overlay?.className,
      show: overlay?.classList.contains("show"),
      style: overlay?.style.cssText,
    },
  });
};

window.forceOpenMenu = function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");

  if (menuToggle && navCenter && overlay) {
    menuToggle.classList.add("active");
    navCenter.classList.add("show");
    navCenter.style.left = "0";
    overlay.classList.add("show");
    overlay.style.display = "block";
    document.body.classList.add("menu-open");
    console.log("🔓 Menú forzado a abrir");
  }
};

window.forceCloseMenu = function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");

  if (menuToggle && navCenter && overlay) {
    menuToggle.classList.remove("active");
    navCenter.classList.remove("show");
    navCenter.style.left = "";
    overlay.classList.remove("show");
    overlay.style.display = "";
    document.body.classList.remove("menu-open");
    console.log("🔒 Menú forzado a cerrar");
  }
};
