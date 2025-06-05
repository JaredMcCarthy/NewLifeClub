document.addEventListener("DOMContentLoaded", () => {
  // Referencia al correo del usuario actualmente loggeado
  const currentUserEmail = localStorage.getItem("userEmail");
  // Si no hay un correo de usuario loggeado, se puede redirigir o mostrar un mensaje
  if (!currentUserEmail) {
    console.warn("⚠️ No hay usuario loggeado. Redirigiendo a inicio...");
    alert("Debes iniciar sesión para acceder a tu perfil");
    window.location.href = "sesion.html";
    return;
  }

  console.log("✅ Usuario loggeado:", currentUserEmail);

  // --- Manejo de la navegación entre secciones ---
  const navButtons = document.querySelectorAll(
    ".nav-button:not(.logout-button)"
  );
  const contentSections = document.querySelectorAll(".content-section");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      console.log("📱 Navegando a sección:", button.dataset.target);
      navButtons.forEach((btn) => btn.classList.remove("active"));
      contentSections.forEach((section) => section.classList.remove("active"));
      button.classList.add("active");
      const targetId = button.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });

  // --- Cargar la foto de perfil al seleccionar un archivo ---
  const profilePicUpload = document.getElementById("profile-pic-upload");
  const profilePic = document.getElementById("profile-pic");

  // Usar una clave única para la foto de perfil del usuario actual
  const savedProfilePic = localStorage.getItem(
    `profilePic_${currentUserEmail}`
  );
  if (savedProfilePic) {
    profilePic.src = savedProfilePic;
  } else {
    profilePic.src = "https://via.placeholder.com/150/ff00ff/FFFFFF?text=Foto"; // Imagen por defecto
  }

  if (profilePicUpload) {
    profilePicUpload.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          profilePic.src = e.target.result;
          // Guardar la foto de perfil con la clave del usuario actual
          localStorage.setItem(
            `profilePic_${currentUserEmail}`,
            e.target.result
          );
          console.log("📸 Foto de perfil actualizada");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- Manejo de guardar y cargar información del perfil ---
  const saveButtons = document.querySelectorAll(".save-button");
  const nicknameInput = document.getElementById("nickname");
  const sportInput = document.getElementById("sport");
  const biographyTextarea = document.getElementById("biography");
  const emailInput = document.getElementById("email");

  const displayNickname = document.getElementById("display-nickname");
  const displaySport = document.getElementById("display-sport");

  // Asignar el correo del usuario loggeado al campo de email (solo lectura)
  if (emailInput) {
    emailInput.value = currentUserEmail;
    emailInput.readOnly = true; // Asegurarse de que no sea editable
  }

  // Cargar datos guardados específicos para el usuario actual
  const savedNickname = localStorage.getItem(
    `userNickname_${currentUserEmail}`
  );
  const savedSport = localStorage.getItem(`userSport_${currentUserEmail}`);
  const savedBiography = localStorage.getItem(
    `userBiography_${currentUserEmail}`
  );

  if (nicknameInput && displayNickname) {
    if (savedNickname) {
      nicknameInput.value = savedNickname;
      displayNickname.textContent = `¡Hola, ${savedNickname}!`;
    } else {
      nicknameInput.value = "";
      displayNickname.textContent = "¡Hola, Corredor!";
    }
  }

  if (sportInput && displaySport) {
    if (savedSport) {
      sportInput.value = savedSport;
      displaySport.textContent = `Deporte: ${savedSport}`;
    } else {
      sportInput.value = "";
      displaySport.textContent = "Deporte: Corredor de larga distancia";
    }
  }

  if (biographyTextarea) {
    if (savedBiography) {
      biographyTextarea.value = savedBiography;
    } else {
      biographyTextarea.value = "";
    }
  }

  saveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;
      console.log("💾 Guardando sección:", section);

      if (section === "personal-info") {
        const newNickname = nicknameInput?.value.trim() || "";
        const newSport = sportInput?.value.trim() || "";

        if (displayNickname) {
          if (newNickname) {
            displayNickname.textContent = `¡Hola, ${newNickname}!`;
            localStorage.setItem(
              `userNickname_${currentUserEmail}`,
              newNickname
            );
          } else {
            displayNickname.textContent = "¡Hola, Corredor!";
            localStorage.removeItem(`userNickname_${currentUserEmail}`);
          }
        }

        if (displaySport) {
          if (newSport) {
            displaySport.textContent = `Deporte: ${newSport}`;
            localStorage.setItem(`userSport_${currentUserEmail}`, newSport);
          } else {
            displaySport.textContent = "Deporte: Corredor de larga distancia";
            localStorage.removeItem(`userSport_${currentUserEmail}`);
          }
        }

        alert("¡Información personal guardada!");
      } else if (section === "my-bio") {
        const newBiography = biographyTextarea?.value.trim() || "";
        localStorage.setItem(`userBiography_${currentUserEmail}`, newBiography);
        alert("¡Biografía guardada!");
      }
    });
  });

  // ========== BOTONES DEL PERFIL - MEJORADOS ==========

  // Botón de "Mi Información"
  const infoBtn = document.querySelector('[data-target="personal-info"]');
  if (infoBtn) {
    console.log("✅ Botón 'Mi Información' configurado");
  }

  // Botón de "Mi Biografía"
  const bioBtn = document.querySelector('[data-target="my-bio"]');
  if (bioBtn) {
    console.log("✅ Botón 'Mi Biografía' configurado");
  }

  // Botón de "Mis Compras"
  const comprasBtn = document.querySelector('[data-target="my-purchases"]');
  if (comprasBtn) {
    console.log("✅ Botón 'Mis Compras' configurado");
  }

  // ========== BOTÓN CERRAR SESIÓN - MEJORADO ==========
  const logoutBtn = document.getElementById("logout-btn");
  const logoutButton = document.querySelector(".logout-button");

  // Función para cerrar sesión
  function cerrarSesion() {
    console.log("🚪 Intentando cerrar sesión...");
    if (confirm("¿Estás seguro que quieres cerrar sesión?")) {
      console.log("✅ Usuario confirmó cierre de sesión");

      // Limpiar datos de sesión
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("token");

      // Mostrar mensaje de confirmación
      alert("Sesión cerrada exitosamente");

      // Redireccionar al inicio
      console.log("🏠 Redirigiendo a inicio...");
      window.location.href = "index.html";
    } else {
      console.log("❌ Usuario canceló cierre de sesión");
    }
  }

  // Agregar event listeners para botón de cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", cerrarSesion);
    console.log("✅ Event listener agregado a #logout-btn");
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", cerrarSesion);
    console.log("✅ Event listener agregado a .logout-button");
  }

  // También buscar por texto del botón
  const allButtons = document.querySelectorAll("button, .nav-button");
  allButtons.forEach((button) => {
    const buttonText = button.textContent.trim().toLowerCase();
    if (
      buttonText.includes("cerrar sesión") ||
      buttonText.includes("cerrar sesion") ||
      buttonText.includes("logout")
    ) {
      button.addEventListener("click", cerrarSesion);
      console.log("✅ Event listener agregado a botón con texto:", buttonText);
    }
  });

  console.log("🎯 Perfil de usuario completamente configurado");
});
