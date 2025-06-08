// ============================================
// 🎨 CUSTOM POPUPS SYSTEM - NewLifeRun Club
// ============================================

class CustomPopups {
  constructor() {
    this.currentPopup = null;
    this.init();
  }

  init() {
    // Crear contenedor para popups si no existe
    if (!document.getElementById("custom-popups-container")) {
      const container = document.createElement("div");
      container.id = "custom-popups-container";
      document.body.appendChild(container);
    }
  }

  // ==========================================
  // 🚨 FUNCIÓN ALERT PERSONALIZADA
  // ==========================================
  customAlert(message, type = "info", title = null) {
    return new Promise((resolve) => {
      // Cerrar popup anterior si existe
      this.closeCurrentPopup();

      const overlay = document.createElement("div");
      overlay.className = "custom-popup-overlay";

      const popup = document.createElement("div");
      popup.className = "custom-popup";

      // Determinar icono y título según el tipo
      let icon, defaultTitle, iconClass;
      switch (type) {
        case "success":
          icon = "✅";
          defaultTitle = "¡Éxito!";
          iconClass = "success";
          break;
        case "error":
          icon = "❌";
          defaultTitle = "Error";
          iconClass = "error";
          break;
        case "warning":
          icon = "⚠️";
          defaultTitle = "Atención";
          iconClass = "warning";
          break;
        default:
          icon = "ℹ️";
          defaultTitle = "Información";
          iconClass = "info";
      }

      popup.innerHTML = `
        <div class="popup-icon ${iconClass}">
          ${icon}
        </div>
        <div class="popup-title">${title || defaultTitle}</div>
        <div class="popup-message">${message}</div>
        <div class="popup-buttons">
          <button class="popup-btn primary" onclick="this.closest('.custom-popup-overlay').remove()">
            OK
          </button>
        </div>
      `;

      overlay.appendChild(popup);
      document.getElementById("custom-popups-container").appendChild(overlay);

      // Mostrar con animación
      setTimeout(() => {
        overlay.classList.add("show");
      }, 10);

      // Agregar event listener para cerrar
      const okButton = popup.querySelector(".popup-btn");
      okButton.addEventListener("click", () => {
        this.closePopup(overlay);
        resolve(true);
      });

      // Cerrar con ESC
      const handleEsc = (e) => {
        if (e.key === "Escape") {
          this.closePopup(overlay);
          resolve(true);
          document.removeEventListener("keydown", handleEsc);
        }
      };
      document.addEventListener("keydown", handleEsc);

      this.currentPopup = overlay;
    });
  }

  // ==========================================
  // ❓ FUNCIÓN CONFIRM PERSONALIZADA
  // ==========================================
  customConfirm(message, title = "¿Estás seguro?") {
    return new Promise((resolve) => {
      // Cerrar popup anterior si existe
      this.closeCurrentPopup();

      const overlay = document.createElement("div");
      overlay.className = "custom-popup-overlay";

      const popup = document.createElement("div");
      popup.className = "custom-popup";

      popup.innerHTML = `
        <div class="popup-icon confirm">
          ❓
        </div>
        <div class="popup-title">${title}</div>
        <div class="popup-message">${message}</div>
        <div class="popup-buttons">
          <button class="popup-btn secondary cancel-btn">
            Cancelar
          </button>
          <button class="popup-btn primary confirm-btn">
            Confirmar
          </button>
        </div>
      `;

      overlay.appendChild(popup);
      document.getElementById("custom-popups-container").appendChild(overlay);

      // Mostrar con animación
      setTimeout(() => {
        overlay.classList.add("show");
      }, 10);

      // Event listeners para botones
      const confirmBtn = popup.querySelector(".confirm-btn");
      const cancelBtn = popup.querySelector(".cancel-btn");

      confirmBtn.addEventListener("click", () => {
        this.closePopup(overlay);
        resolve(true);
      });

      cancelBtn.addEventListener("click", () => {
        this.closePopup(overlay);
        resolve(false);
      });

      // Cerrar con ESC (considera como cancelar)
      const handleEsc = (e) => {
        if (e.key === "Escape") {
          this.closePopup(overlay);
          resolve(false);
          document.removeEventListener("keydown", handleEsc);
        }
      };
      document.addEventListener("keydown", handleEsc);

      this.currentPopup = overlay;
    });
  }

  // ==========================================
  // 📝 FUNCIÓN PROMPT PERSONALIZADA
  // ==========================================
  customPrompt(message, defaultValue = "", title = "Ingresa la información") {
    return new Promise((resolve) => {
      // Cerrar popup anterior si existe
      this.closeCurrentPopup();

      const overlay = document.createElement("div");
      overlay.className = "custom-popup-overlay";

      const popup = document.createElement("div");
      popup.className = "custom-popup";

      popup.innerHTML = `
        <div class="popup-icon info">
          📝
        </div>
        <div class="popup-title">${title}</div>
        <div class="popup-message">${message}</div>
        <div style="margin-bottom: 20px;">
          <input type="text" class="popup-input" value="${defaultValue}" placeholder="Escribe aquí..." style="
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #dee2e6;
            border-radius: 10px;
            font-size: 16px;
            font-family: 'Montserrat', sans-serif;
            outline: none;
            transition: border-color 0.3s ease;
          ">
        </div>
        <div class="popup-buttons">
          <button class="popup-btn secondary cancel-btn">
            Cancelar
          </button>
          <button class="popup-btn primary confirm-btn">
            Aceptar
          </button>
        </div>
      `;

      overlay.appendChild(popup);
      document.getElementById("custom-popups-container").appendChild(overlay);

      // Mostrar con animación
      setTimeout(() => {
        overlay.classList.add("show");
        // Focus en el input
        popup.querySelector(".popup-input").focus();
      }, 10);

      // Event listeners
      const confirmBtn = popup.querySelector(".confirm-btn");
      const cancelBtn = popup.querySelector(".cancel-btn");
      const input = popup.querySelector(".popup-input");

      // Estilo focus para el input
      input.addEventListener("focus", () => {
        input.style.borderColor = "#ff69b4";
      });

      input.addEventListener("blur", () => {
        input.style.borderColor = "#dee2e6";
      });

      confirmBtn.addEventListener("click", () => {
        const value = input.value.trim();
        this.closePopup(overlay);
        resolve(value || null);
      });

      cancelBtn.addEventListener("click", () => {
        this.closePopup(overlay);
        resolve(null);
      });

      // Enter para confirmar
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const value = input.value.trim();
          this.closePopup(overlay);
          resolve(value || null);
        }
      });

      // ESC para cancelar
      const handleEsc = (e) => {
        if (e.key === "Escape") {
          this.closePopup(overlay);
          resolve(null);
          document.removeEventListener("keydown", handleEsc);
        }
      };
      document.addEventListener("keydown", handleEsc);

      this.currentPopup = overlay;
    });
  }

  // ==========================================
  // 🔄 FUNCIONES AUXILIARES
  // ==========================================
  closePopup(overlay) {
    overlay.classList.remove("show");
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }

  closeCurrentPopup() {
    if (this.currentPopup) {
      this.closePopup(this.currentPopup);
      this.currentPopup = null;
    }
  }

  // ==========================================
  // 🎯 MÉTODOS ESPECÍFICOS PARA EL SITIO
  // ==========================================

  // Para registro exitoso
  showRegistrationSuccess(email) {
    return this.customAlert(
      `¡Bienvenido a NewLifeRun Club!<br><br>Tu cuenta ha sido creada exitosamente con el email:<br><strong>${email}</strong>`,
      "success",
      "🎉 ¡Registro Exitoso!"
    );
  }

  // Para login exitoso
  showLoginSuccess(name) {
    return this.customAlert(
      `¡Hola ${name}!<br><br>Has iniciado sesión correctamente.`,
      "success",
      "🔑 ¡Bienvenido!"
    );
  }

  // Para errores de validación
  showValidationError(message) {
    return this.customAlert(message, "warning", "⚠️ Campos Requeridos");
  }

  // Para errores del servidor
  showServerError(message) {
    return this.customAlert(
      `Ocurrió un error: ${message}<br><br>Por favor, inténtalo de nuevo.`,
      "error",
      "❌ Error del Servidor"
    );
  }

  // Para confirmación de cerrar sesión
  confirmLogout() {
    return this.customConfirm(
      "Se cerrará tu sesión actual y tendrás que volver a iniciar sesión.",
      "¿Cerrar Sesión?"
    );
  }

  // Para vaciar carrito
  confirmClearCart() {
    return this.customConfirm(
      "Se eliminarán todos los productos de tu carrito de compras.",
      "¿Vaciar Carrito?"
    );
  }

  // Para reemplazar membresía
  confirmReplaceMembership(currentName, newName) {
    return this.customConfirm(
      `Ya tienes "<strong>${currentName}</strong>" en tu carrito.<br><br>¿Quieres reemplazarla con "<strong>${newName}</strong>"?`,
      "¿Reemplazar Membresía?"
    );
  }

  // Para contacto enviado
  showContactSuccess() {
    return this.customAlert(
      "¡Gracias por contactarnos!<br><br>Hemos recibido tu mensaje y te responderemos pronto.",
      "success",
      "📧 ¡Mensaje Enviado!"
    );
  }

  // Para recuperar contraseña
  showPasswordRecovery(email) {
    return this.customAlert(
      `Se ha enviado un enlace de recuperación a:<br><strong>${email}</strong><br><br>Revisa tu bandeja de entrada y spam.`,
      "info",
      "📧 Enlace Enviado"
    );
  }
}

// ==========================================
// 🌍 INSTANCIA GLOBAL
// ==========================================
const customPopups = new CustomPopups();

// ==========================================
// 🔄 FUNCIONES GLOBALES PARA REEMPLAZAR ALERT/CONFIRM
// ==========================================

// Reemplazar alert() nativo
window.showAlert = function (message, type = "info", title = null) {
  return customPopups.customAlert(message, type, title);
};

// Reemplazar confirm() nativo
window.showConfirm = function (message, title = "¿Estás seguro?") {
  return customPopups.customConfirm(message, title);
};

// Reemplazar prompt() nativo
window.showPrompt = function (
  message,
  defaultValue = "",
  title = "Ingresa la información"
) {
  return customPopups.customPrompt(message, defaultValue, title);
};

// Funciones específicas del sitio
window.showRegistrationSuccess = function (email) {
  return customPopups.showRegistrationSuccess(email);
};

window.showLoginSuccess = function (name) {
  return customPopups.showLoginSuccess(name);
};

window.showValidationError = function (message) {
  return customPopups.showValidationError(message);
};

window.showServerError = function (message) {
  return customPopups.showServerError(message);
};

window.confirmLogout = function () {
  return customPopups.confirmLogout();
};

window.confirmClearCart = function () {
  return customPopups.confirmClearCart();
};

window.confirmReplaceMembership = function (currentName, newName) {
  return customPopups.confirmReplaceMembership(currentName, newName);
};

window.showContactSuccess = function () {
  return customPopups.showContactSuccess();
};

window.showPasswordRecovery = function (email) {
  return customPopups.showPasswordRecovery(email);
};

// =================================
// FUNCIONES ESPECÍFICAS ADICIONALES
// =================================

// Para mostrar cuando se agrega un plan de entrenamiento
window.showTrainingPlanAdded = async function (planName) {
  return await customPopups.customAlert(
    `¡Plan de entrenamiento "${planName}" agregado exitosamente! Ahora puedes seguir tu rutina personalizada.`,
    "success",
    "🏃‍♂️ Plan Agregado"
  );
};

// Para mostrar confirmación de biografía guardada
window.showBiographySaved = async function () {
  return await customPopups.customAlert(
    "Tu biografía ha sido guardada correctamente en tu perfil",
    "success",
    "📝 Biografía Guardada"
  );
};

// Para mostrar confirmación de información personal guardada
window.showPersonalInfoSaved = async function () {
  return await customPopups.customAlert(
    "Tu información personal ha sido actualizada exitosamente",
    "success",
    "💾 Información Guardada"
  );
};

// Para confirmación de selección de plan NewLifePro
window.showPlanSelected = async function (planName) {
  return await customPopups.customAlert(
    `¡Excelente elección! Has seleccionado el plan "${planName}". Bienvenido a NewLifePro Club.`,
    "success",
    "🎯 Plan Seleccionado"
  );
};

// Para funcionalidad de editoriales
window.showEditorialInfo = async function () {
  return await customPopups.customAlert(
    "Esta funcionalidad te llevaría a la página completa de artículos motivacionales y contenido exclusivo.",
    "info",
    "📚 Editoriales NewLifePro"
  );
};

console.log("🎨 Custom Popups System cargado exitosamente");
