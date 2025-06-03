document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const userActions = document.querySelector(".user-actions");
  const cartBtn = document.querySelector(".cart-button");
  const profileBtn = document.getElementById("profile-btn");
  const logoutBtn = document.getElementById("logout-btn");

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
  }

  // Actualizar al cargar la página
  updateNavigation();

  // Actualizar cuando cambie el localStorage
  window.addEventListener("storage", function (e) {
    if (e.key === "isLoggedIn") {
      updateNavigation();
    }
  });

  // Manejar cierre de sesión
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
});
