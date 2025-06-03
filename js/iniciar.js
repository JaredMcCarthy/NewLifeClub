document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ iniciar.js cargado correctamente");

  // 1. Configuración del Modal
  const formContainer = document.getElementById("container");
  const overlay = document.getElementById("overlay");
  const closeBtn = document.querySelector(".close-btn");
  const loginBtnNav = document.getElementById("login-btn"); // Botón "Iniciar Sesión" en la navbar
  const registerBtnNav = document.getElementById("register-btn"); // Botón "Registrarse" en la navbar

  // Función para abrir el modal
  const showLoginForm = (initialView = "login") => {
    if (formContainer && overlay) {
      formContainer.style.display = "block";
      overlay.style.display = "block";
      formContainer.classList.toggle("active", initialView === "register");
    }
  };

  // Función para cerrar el modal
  const closeLoginForm = () => {
    if (formContainer && overlay) {
      formContainer.style.display = "none";
      overlay.style.display = "none";
    }
  };

  // Event Listeners para abrir/cerrar el modal
  if (loginBtnNav)
    loginBtnNav.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginForm("login");
    });
  if (registerBtnNav)
    registerBtnNav.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginForm("register");
    });
  if (closeBtn) closeBtn.addEventListener("click", closeLoginForm);
  if (overlay) overlay.addEventListener("click", closeLoginForm);

  //este verifica si hay un ususario registrado nadda mas para otras tabs
  document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      window.location.href = "index.html";
      return;
    }
  });

  // 1. Lógica de REGISTRO
  const registerBtn = document.getElementById("modal-register-btn");
  if (registerBtn) {
    registerBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("register-name").value.trim();
      const correo = document.getElementById("register-email").value.trim();
      const contraseña = document.getElementById("register-password").value;

      // Validación mejorada en frontend
      if (!nombre || !correo || !contraseña) {
        return alert("⚠️ Por favor completa todos los campos");
      }

      // Validación de email en frontend (adicional al backend)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        return alert("❌ Ingresa un correo válido (ej: usuario@dominio.com)");
      }

      // Validación de contraseña en frontend
      if (contraseña.length < 8) {
        return alert("❌ La contraseña debe tener al menos 8 caracteres");
      }

      try {
        // 1. Registro
        const response = await fetch(
          "https://newlife-club.vercel.app/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ nombre, correo, contraseña }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error en el servidor");
        }

        // 2. Auto-login después de registro exitoso
        const loginResponse = await fetch(
          "https://newlife-club.vercel.app/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ correo, contraseña }),
          }
        );

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          throw new Error(
            loginData.error || "Error al iniciar sesión automáticamente"
          );
        }

        // 3. Procesar respuesta
        localStorage.setItem("token", loginData.token);
        localStorage.setItem("userEmail", correo);
        localStorage.setItem("isLoggedIn", "true");
        alert("🎉 ¡Registro exitoso! Iniciando sesión...");
        closeLoginForm();
        window.location.href = "index.html";
      } catch (error) {
        console.error("Error:", error);
        alert(`❌ ${error.message}`);
      }
    });
  }

  // 2. Lógica de LOGIN
  const loginBtn = document.getElementById("modal-login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (!email || !password) {
        return alert("⚠️ Completa ambos campos");
      }

      try {
        const response = await fetch("https://newlife-club.vercel.app/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            correo: email,
            contraseña: password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Credenciales incorrectas");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        alert("🔑 ¡Bienvenido! Iniciando sesión...");
        closeLoginForm();
        window.location.href = "index.html";
      } catch (error) {
        console.error("Error:", error);
        alert(`❌ ${error.message}`);
      }
    });
  }
});
