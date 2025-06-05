console.log("🚀 Simple Mobile Nav - Cargando...");

document.addEventListener("DOMContentLoaded", function () {
  console.log("📱 Inicializando navegación móvil simple...");

  // ========== ESPERAR UN POCO PARA ASEGURAR QUE TODO ESTÉ CARGADO ==========
  setTimeout(function () {
    console.log("⏰ Inicializando después de timeout...");

    // ========== ELEMENTOS DOM ==========
    const menuToggle = document.querySelector(".menu-toggle");
    const navCenter = document.querySelector(".nav-center");
    const overlay = document.querySelector(".overlay");
    const body = document.body;

    console.log("🔍 Buscando elementos:", {
      menuToggle: !!menuToggle,
      navCenter: !!navCenter,
      overlay: !!overlay,
    });

    if (!menuToggle || !navCenter || !overlay) {
      console.error("❌ Elementos de navegación no encontrados");
      console.log("📋 Elementos disponibles en la página:");
      console.log(
        "🍔 Menu toggles:",
        document.querySelectorAll(
          ".menu-toggle, [class*='menu'], [class*='toggle']"
        )
      );
      console.log(
        "🧭 Nav centers:",
        document.querySelectorAll(
          ".nav-center, [class*='nav-center'], [class*='center']"
        )
      );
      console.log(
        "🎭 Overlays:",
        document.querySelectorAll(".overlay, [class*='overlay']")
      );
      return;
    }

    console.log("✅ Elementos encontrados correctamente");

    // ========== FUNCIÓN PARA ABRIR MENÚ ==========
    function openMenu() {
      console.log("🔓 Abriendo menú...");

      // Agregar clases
      menuToggle.classList.add("active");
      navCenter.classList.add("show");
      overlay.classList.add("show");
      body.classList.add("menu-open");

      console.log("✅ Menú abierto");
    }

    // ========== FUNCIÓN PARA CERRAR MENÚ ==========
    function closeMenu() {
      console.log("🔒 Cerrando menú...");

      // Remover clases
      menuToggle.classList.remove("active");
      navCenter.classList.remove("show");
      overlay.classList.remove("show");
      body.classList.remove("menu-open");

      console.log("✅ Menú cerrado");
    }

    // ========== TOGGLE MENÚ ==========
    function toggleMenu() {
      console.log("🔄 Toggle menú...");

      if (menuToggle.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // ========== EVENT LISTENERS ==========
    console.log("🎧 Agregando event listeners...");

    // Click en hamburguesa
    menuToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("🍔 Click en menu toggle");
      toggleMenu();
    });

    // Click en overlay
    overlay.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("🎭 Click en overlay");
      closeMenu();
    });

    // Click en links del menú (para cerrar automáticamente)
    const navLinks = navCenter.querySelectorAll(".nav-link");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        console.log("🔗 Click en nav link");
        closeMenu();
      });
    });

    // Cerrar con ESC
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        console.log("⌨️ ESC presionado");
        closeMenu();
      }
    });

    // ========== TESTING ==========
    console.log("🧪 Menú móvil listo para testing");

    // Test manual para debugging
    window.testMobileMenu = function () {
      console.log("🧪 Test manual del menú");
      toggleMenu();
    };

    console.log("✅ Simple Mobile Nav cargado exitosamente");
    console.log("💡 Para probar manualmente: window.testMobileMenu()");
  }, 100); // Esperar 100ms para asegurar que todo esté cargado
});

// ========== BACKUP HANDLER ==========
// Si por alguna razón no funciona el DOMContentLoaded, intentar después
setTimeout(function () {
  if (!window.mobileNavLoaded) {
    console.log("🔄 Reintentando cargar navegación móvil...");
    const event = new Event("DOMContentLoaded");
    document.dispatchEvent(event);
  }
}, 500);

// Marcar como cargado
window.mobileNavLoaded = true;

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
