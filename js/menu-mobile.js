console.log("🍔 Menu-mobile.js cargado");

document.addEventListener("DOMContentLoaded", function () {
  // Verificar si estamos en la página de inicio
  const isIndexPage =
    window.location.pathname === "/" ||
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "";

  if (isIndexPage) {
    console.log("🏠 Estamos en index.html - usando inicio.js para menú móvil");
    return; // Salir temprano para evitar conflictos
  }

  console.log("🍔 Inicializando menú móvil para páginas secundarias...");

  // Elementos del menú
  const menuToggle = document.querySelector(".menu-toggle");
  const navCenter = document.querySelector(".nav-center");
  const overlay = document.querySelector(".overlay");
  const body = document.body;

  // Verificar que existen los elementos
  if (!menuToggle || !navCenter || !overlay) {
    console.error("❌ Elementos del menú móvil no encontrados:", {
      menuToggle: !!menuToggle,
      navCenter: !!navCenter,
      overlay: !!overlay,
    });
    return;
  }

  console.log("✅ Elementos del menú móvil encontrados");

  // Estado del menú
  let menuOpen = false;

  // Función para abrir el menú
  function openMenu() {
    console.log("🔓 Abriendo menú móvil");
    menuOpen = true;

    // Activar clases
    menuToggle.classList.add("active");
    navCenter.classList.add("open");
    overlay.classList.add("open");
    body.classList.add("menu-open");

    // Forzar estilos inline para asegurar visibilidad - MÁS AGRESIVO
    navCenter.style.cssText = `
      position: fixed !important;
      top: 60px !important;
      left: 0 !important;
      width: 80% !important;
      max-width: 300px !important;
      height: calc(100vh - 60px) !important;
      background: rgba(0, 0, 0, 0.98) !important;
      backdrop-filter: blur(10px) !important;
      display: flex !important;
      flex-direction: column !important;
      padding: 20px !important;
      z-index: 99999 !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      border-right: 2px solid #ff0080 !important;
      box-shadow: 2px 0 10px rgba(0,0,0,0.3) !important;
      transform: none !important;
    `;

    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.6) !important;
      z-index: 9998 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    `;

    // Asegurar que los links sean visibles
    const navLinks = navCenter.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.style.cssText = `
        color: white !important;
        padding: 15px 0 !important;
        font-size: 1.2rem !important;
        text-align: left !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        text-decoration: none !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 100000 !important;
        pointer-events: auto !important;
      `;
    });

    console.log("✅ Menú móvil abierto con estilos forzados");

    // Verificar que realmente está visible
    setTimeout(() => {
      const computedStyle = window.getComputedStyle(navCenter);
      console.log("🔍 Verificando visibilidad del menú:", {
        left: computedStyle.left,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex,
        display: computedStyle.display,
      });
    }, 100);
  }

  // Función para cerrar el menú
  function closeMenu() {
    console.log("🔒 Cerrando menú móvil");
    menuOpen = false;

    // Remover clases
    menuToggle.classList.remove("active");
    navCenter.classList.remove("open");
    overlay.classList.remove("open");
    body.classList.remove("menu-open");

    // Restaurar estilos
    navCenter.style.left = "-100%";
    navCenter.style.visibility = "hidden";
    navCenter.style.opacity = "0";
    overlay.style.display = "none";
    overlay.style.visibility = "hidden";
    overlay.style.opacity = "0";

    console.log("✅ Menú móvil cerrado");
  }

  // Función para alternar el menú
  function toggleMenu() {
    console.log("🔄 Alternando menú móvil, estado actual:", menuOpen);
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Event listeners
  menuToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("🍔 Click en menu toggle");
    toggleMenu();
  });

  overlay.addEventListener("click", function (e) {
    e.preventDefault();
    console.log("🌫️ Click en overlay");
    closeMenu();
  });

  // Cerrar menú al hacer click en un link
  const navLinks = navCenter.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      console.log("🔗 Click en nav link:", this.textContent);
      closeMenu();
    });
  });

  // Cerrar menú al cambiar de tamaño de pantalla
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && menuOpen) {
      console.log("📱 Pantalla cambió a desktop, cerrando menú");
      closeMenu();
    }
  });

  // Cerrar menú con tecla Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) {
      console.log("⎋ Tecla Escape presionada, cerrando menú");
      closeMenu();
    }
  });

  console.log(
    "✅ Menu-mobile.js inicializado correctamente para páginas secundarias"
  );

  // Test inmediato para verificar que funciona
  console.log("🧪 Test inicial - elementos disponibles:", {
    menuToggle: menuToggle ? "✅" : "❌",
    navCenter: navCenter ? "✅" : "❌",
    overlay: overlay ? "✅" : "❌",
    windowWidth: window.innerWidth,
    isMobile: window.innerWidth <= 768,
    currentPage: window.location.pathname,
  });
});
