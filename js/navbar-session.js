document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const justLoggedOut = localStorage.getItem("justLoggedOut") === "true";
  const isIndex =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/";

  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const userActions = document.querySelector(".user-actions");
  const logoutBtn = document.getElementById("logout-btn");

  // Mostrar u ocultar botones según sesión (funciona en PC, tablet y móvil)
  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (userActions) userActions.style.display = "flex";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (registerBtn) registerBtn.style.display = "inline-block";
    if (userActions) userActions.style.display = "none";
  }

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
      localStorage.setItem("justLoggedOut", "true"); // Bandera temporal para identificar cierre
      location.reload(); // Actualiza la navbar
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
