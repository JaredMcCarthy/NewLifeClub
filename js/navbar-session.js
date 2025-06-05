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

    if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "block";
    if (registerBtn) registerBtn.style.display = isLoggedIn ? "none" : "block";
    if (userActions) userActions.style.display = isLoggedIn ? "flex" : "none";

    // En móvil, asegurarse que los botones de cuenta estén visibles
    if (window.innerWidth <= 768) {
      if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "block";
      if (registerBtn)
        registerBtn.style.display = isLoggedIn ? "none" : "block";
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

  // Actualizar al cargar la página
  updateNavigation();

  // Actualizar cuando cambie el localStorage
  window.addEventListener("storage", function (e) {
    if (e.key === "isLoggedIn") {
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
});
