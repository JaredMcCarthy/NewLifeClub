document.addEventListener("DOMContentLoaded", () => {
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
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    clearTimeout(sessionTimer);
    updateNavigation();
    window.location.href = "sesion.html";
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

  // Actualizar al cargar la página
  updateNavigation();

  // Actualizar cuando cambie el localStorage
  window.addEventListener("storage", function (e) {
    if (e.key === "isLoggedIn") {
      updateNavigation();
    }
  });
});
