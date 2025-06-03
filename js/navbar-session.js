document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const justLoggedOut = localStorage.getItem("justLoggedOut") === "true";
  const isIndex =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/";

  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const userActions = document.querySelector(".user-actions");
  const cartBtn = document.querySelector(".cart-button");
  const profileBtn = document.getElementById("profile-btn");
  const logoutBtn = document.getElementById("logout-btn");

  function updateNavigation() {
    if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "inline-block";
    if (registerBtn)
      registerBtn.style.display = isLoggedIn ? "none" : "inline-block";
    if (userActions) userActions.style.display = isLoggedIn ? "flex" : "none";

    // En móvil, asegurarse que los botones de cuenta estén visibles
    if (window.innerWidth <= 768) {
      if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "block";
      if (registerBtn)
        registerBtn.style.display = isLoggedIn ? "none" : "block";
    }
  }

  // Actualizar navegación al cargar
  updateNavigation();

  // Actualizar cuando cambie el tamaño de la ventana
  window.addEventListener("resize", updateNavigation);

  // Si justo se cerró sesión (desde otra pestaña), redirigir con mensaje suave
  if (!isLoggedIn && justLoggedOut) {
    localStorage.removeItem("justLoggedOut");
    alert("👋 ¡Vuelve pronto!");
    window.location.href = "index.html";
    return;
  }

  // Si no ha iniciado sesión y no está en index, mostrar alerta de bloqueo
  if (!isLoggedIn && !isIndex) {
    alert("🚫 No puedes pasar. Por favor inicia sesión o regístrate primero.");
    window.location.href = "index.html";
    return;
  }

  // Cerrar sesión manual
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("token");
      localStorage.setItem("justLoggedOut", "true"); // Bandera temporal para identificar cierre
      updateNavigation();
      window.location.href = "index.html";
    });
  }

  // Cierre de sesión detectado desde otra pestaña
  window.addEventListener("storage", () => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      localStorage.setItem("justLoggedOut", "true"); // Marca que fue desde otra tab
      window.location.href = "index.html";
    }
  });
});
