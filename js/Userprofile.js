document.addEventListener("DOMContentLoaded", () => {
  // Referencia al correo del usuario actualmente loggeado
  const currentUserEmail = localStorage.getItem("userEmail");
  // Si no hay un correo de usuario loggeado, se puede redirigir o mostrar un mensaje
  if (!currentUserEmail) {
    // Redirigir a la página de inicio de sesión o mostrar un error
    console.warn("No hay usuario loggeado. Redirigiendo a inicio...");
    // window.location.href = "login.html"; // Descomenta si tienes una página de login dedicada
    // Si la pestaña de perfil es parte de index.html, podrías solo ocultarla o mostrar un mensaje
    return; // Detiene la ejecución del script si no hay usuario
  }

  // --- Manejo de la navegación entre secciones (sin cambios) ---
  const navButtons = document.querySelectorAll(
    ".nav-button:not(.logout-button)"
  );
  const contentSections = document.querySelectorAll(".content-section");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      navButtons.forEach((btn) => btn.classList.remove("active"));
      contentSections.forEach((section) => section.classList.remove("active"));
      button.classList.add("active");
      const targetId = button.dataset.target;
      document.getElementById(targetId).classList.add("active");
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

  profilePicUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePic.src = e.target.result;
        // Guardar la foto de perfil con la clave del usuario actual
        localStorage.setItem(`profilePic_${currentUserEmail}`, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // --- Manejo de guardar y cargar información del perfil ---
  const saveButtons = document.querySelectorAll(".save-button");
  const nicknameInput = document.getElementById("nickname");
  const sportInput = document.getElementById("sport");
  const biographyTextarea = document.getElementById("biography");
  const emailInput = document.getElementById("email");

  const displayNickname = document.getElementById("display-nickname");
  const displaySport = document.getElementById("display-sport");

  // Asignar el correo del usuario loggeado al campo de email (solo lectura)
  emailInput.value = currentUserEmail;
  emailInput.readOnly = true; // Asegurarse de que no sea editable

  // Cargar datos guardados específicos para el usuario actual
  const savedNickname = localStorage.getItem(
    `userNickname_${currentUserEmail}`
  );
  const savedSport = localStorage.getItem(`userSport_${currentUserEmail}`);
  const savedBiography = localStorage.getItem(
    `userBiography_${currentUserEmail}`
  );

  if (savedNickname) {
    nicknameInput.value = savedNickname;
    displayNickname.textContent = `¡Hola, ${savedNickname}!`;
  } else {
    // Si no hay apodo guardado, mostrar un valor por defecto
    nicknameInput.value = ""; // O algún valor inicial para el nuevo usuario
    displayNickname.textContent = "¡Hola, Corredor!";
  }

  if (savedSport) {
    sportInput.value = savedSport;
    displaySport.textContent = `Deporte: ${savedSport}`;
  } else {
    // Si no hay deporte guardado, mostrar un valor por defecto
    sportInput.value = ""; // O algún valor inicial para el nuevo usuario
    displaySport.textContent = "Deporte: Corredor de larga distancia";
  }

  if (savedBiography) {
    biographyTextarea.value = savedBiography;
  } else {
    // Si no hay biografía guardada, dejarla vacía o con un placeholder
    biographyTextarea.value = "";
  }

  saveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;

      if (section === "personal-info") {
        const newNickname = nicknameInput.value.trim();
        const newSport = sportInput.value.trim();

        if (newNickname) {
          displayNickname.textContent = `¡Hola, ${newNickname}!`;
          // Guardar con la clave del usuario actual
          localStorage.setItem(`userNickname_${currentUserEmail}`, newNickname);
        } else {
          displayNickname.textContent = "¡Hola, Corredor!";
          // Eliminar si está vacío
          localStorage.removeItem(`userNickname_${currentUserEmail}`);
        }

        if (newSport) {
          displaySport.textContent = `Deporte: ${newSport}`;
          // Guardar con la clave del usuario actual
          localStorage.setItem(`userSport_${currentUserEmail}`, newSport);
        } else {
          displaySport.textContent = "Deporte: Corredor de larga distancia";
          // Eliminar si está vacío
          localStorage.removeItem(`userSport_${currentUserEmail}`);
        }
        alert("¡Información personal guardada!");
      } else if (section === "my-bio") {
        const newBiography = biographyTextarea.value.trim();
        // Guardar con la clave del usuario actual
        localStorage.setItem(`userBiography_${currentUserEmail}`, newBiography);
        alert("¡Biografía guardada!");
      }
    });
  });

  // --- Lógica para Mis Compras (sin cambios, pero recuerda que esto DEBERÍA venir de tu backend) ---
  // Si tus compras también son específicas del usuario, la clave para guardarlas también debería incluir el correo.

  // Funcionalidad del botón de logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Confirmar antes de cerrar sesión
      if (confirm("¿Estás seguro que quieres cerrar sesión?")) {
        // Limpiar datos de sesión
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("token");

        // Mostrar mensaje de confirmación
        alert("Sesión cerrada exitosamente");

        // Redireccionar al inicio
        window.location.href = "index.html";
      }
    });
  }
});
