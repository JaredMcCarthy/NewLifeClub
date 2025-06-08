document.addEventListener("DOMContentLoaded", () => {
  // ========== LIMPIEZA DE SESIÓN SOLO SI ES NECESARIO ==========
  // NO limpiar automáticamente - solo si realmente no hay sesión válida
  console.log("🔍 Verificando estado de sesión...");

  // Solo limpiar si es la primera visita o datos corruptos
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userEmail = localStorage.getItem("userEmail");

  if (isLoggedIn === "true" && userEmail) {
    console.log("✅ Sesión válida encontrada para:", userEmail);
  } else {
    console.log("🧹 Limpiando datos de sesión inválidos...");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
  }

  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const userActions = document.querySelector(".user-actions");
  const cartBtn = document.querySelector(".cart-button");
  const profileBtn = document.getElementById("profile-btn");
  const mobileAccountBtn = document.getElementById("mobile-account-btn");

  console.log("🔍 Elementos encontrados:", {
    loginBtn: !!loginBtn,
    registerBtn: !!registerBtn,
    userActions: !!userActions,
    cartBtn: !!cartBtn,
    profileBtn: !!profileBtn,
    mobileAccountBtn: !!mobileAccountBtn,
  });

  // Sistema de expiración de sesión
  const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milliseconds
  let sessionTimer;

  function resetSessionTimer() {
    clearTimeout(sessionTimer);
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      sessionTimer = setTimeout(() => {
        alert(
          "Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente."
        );
        logout();
      }, SESSION_TIMEOUT);
    }
  }

  function logout() {
    console.log("🚪 Cerrando sesión...");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    clearTimeout(sessionTimer);
    updateNavigation();
    console.log("✅ Sesión cerrada exitosamente");
    window.location.href = "index.html"; // Cambié a index.html en lugar de sesion.html
  }

  // Reiniciar timer en actividad del usuario
  [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ].forEach((event) => {
    document.addEventListener(event, resetSessionTimer, true);
  });

  function updateNavigation() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isMobile = window.innerWidth <= 768;

    console.log("🔄 Actualizando navegación:", { isLoggedIn, isMobile });

    // Actualizar estado del body para CSS
    if (isLoggedIn) {
      document.body.classList.add("logged-in");
      console.log("✅ Clase 'logged-in' agregada al body");
    } else {
      document.body.classList.remove("logged-in");
      console.log("❌ Clase 'logged-in' removida del body");
    }

    // DESKTOP: Comportamiento original
    if (!isMobile) {
      console.log("🖥️ Modo DESKTOP detectado");
      if (loginBtn) {
        loginBtn.style.display = isLoggedIn ? "none" : "block";
        console.log(`🔲 Login btn: ${isLoggedIn ? "OCULTO" : "VISIBLE"}`);
      }
      if (registerBtn) {
        registerBtn.style.display = isLoggedIn ? "none" : "block";
        console.log(`🔲 Register btn: ${isLoggedIn ? "OCULTO" : "VISIBLE"}`);
      }
      if (userActions) {
        userActions.style.display = isLoggedIn ? "flex" : "none";
        console.log(`🔲 User actions: ${isLoggedIn ? "VISIBLE" : "OCULTO"}`);
      }
      // Asegurar que el botón móvil esté oculto en desktop
      if (mobileAccountBtn) {
        mobileAccountBtn.style.display = "none";
        console.log("🔲 Botón móvil FORZADO A OCULTO en desktop");
      }
    }
    // MÓVIL: Nueva lógica
    else {
      console.log("📱 Modo MÓVIL detectado");
      // Ocultar botones de login/register siempre en móvil
      if (loginBtn) {
        loginBtn.style.display = "none";
        console.log("🔲 Login btn: OCULTO en móvil");
      }
      if (registerBtn) {
        registerBtn.style.display = "none";
        console.log("🔲 Register btn: OCULTO en móvil");
      }

      if (isLoggedIn) {
        // Usuario logueado en móvil: mostrar carrito/perfil, ocultar "Cuenta"
        console.log("📱✅ Móvil LOGUEADO: mostrando carrito/perfil");
        if (mobileAccountBtn) {
          mobileAccountBtn.style.display = "none";
          console.log("🔲 Botón Cuenta: OCULTO");
        }
        if (userActions) {
          userActions.style.display = "flex";
          console.log("🔲 User actions: VISIBLE");
        }
      } else {
        // Usuario NO logueado en móvil: mostrar "Cuenta", ocultar carrito/perfil
        console.log("📱❌ Móvil NO LOGUEADO: mostrando botón Cuenta");
        if (mobileAccountBtn) {
          mobileAccountBtn.style.display = "flex";
          console.log("🔲 Botón Cuenta: VISIBLE");
        }
        if (userActions) {
          userActions.style.display = "none";
          console.log("🔲 User actions: OCULTO");
        }
      }
    }

    // Inicializar timer de sesión si está logueado
    if (isLoggedIn) {
      resetSessionTimer();
    }
  }

  // ========== PROTECCIÓN PARA BOTONES EN MÓVIL ==========
  // Solo afectar móvil, no PC/tablets
  function isMobile() {
    return window.innerWidth <= 768;
  }

  function requireLogin(callback) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      // Si está loggeado, ejecutar la acción normalmente
      callback();
    } else {
      // Si NO está loggeado, mostrar popup SOLO en móvil
      if (isMobile()) {
        alert("Debes iniciar sesión para acceder a esta función");
        window.location.href = "sesion.html";
      } else {
        // En desktop, permitir acceso normal
        callback();
      }
    }
  }

  // Proteger botón del carrito SOLO en móvil
  if (cartBtn) {
    cartBtn.addEventListener("click", function (e) {
      if (isMobile()) {
        e.preventDefault();
        requireLogin(() => {
          // Abrir carrito normalmente
          const cartPanel = document.getElementById("cartPanel");
          const cartOverlay = document.getElementById("cartOverlay");
          if (cartPanel && cartOverlay) {
            cartPanel.classList.add("active");
            cartOverlay.style.display = "block";
            document.body.style.overflow = "hidden";
          }
        });
      }
      // En desktop, funciona normal sin restricción
    });
  }

  // Proteger botón del perfil SOLO en móvil
  if (profileBtn) {
    profileBtn.addEventListener("click", function (e) {
      if (isMobile()) {
        e.preventDefault();
        requireLogin(() => {
          // Ir al perfil normalmente
          window.location.href = "Userprofile.html";
        });
      }
      // En desktop, funciona normal sin restricción
    });
  }

  // DEBUGGING: Forzar actualización inicial después de 100ms
  setTimeout(() => {
    console.log("🔄 Forzando actualización inicial...");
    updateNavigation();
  }, 100);

  // Actualizar al cargar la página
  updateNavigation();

  // Actualizar cuando cambie el tamaño de pantalla
  window.addEventListener("resize", () => {
    console.log("📏 Resize detectado - actualizando navegación");
    updateNavigation();
  });

  // Actualizar cuando cambie el localStorage
  window.addEventListener("storage", function (e) {
    if (e.key === "isLoggedIn") {
      console.log("💾 Cambio en localStorage detectado");
      updateNavigation();
    }
  });

  // ========== FUNCIÓN GLOBAL PARA CERRAR SESIÓN ==========
  // Para que funcione desde cualquier página
  window.cerrarSesion = function () {
    if (confirm("¿Estás seguro que quieres cerrar sesión?")) {
      logout();
    }
  };

  // DEBUGGING: Función global para testing manual
  window.testMobileButton = function () {
    console.log("🧪 TEST: Estado actual");
    console.log("Window width:", window.innerWidth);
    console.log("Is mobile:", window.innerWidth <= 768);
    console.log("Is logged in:", localStorage.getItem("isLoggedIn"));
    console.log("Mobile account btn display:", mobileAccountBtn?.style.display);
    console.log("User actions display:", userActions?.style.display);
  };
});
