// ============================================
// 🔒 AUTH PROTECTION SYSTEM - NewLifeRun Club
// Sistema de Protección de Autenticación
// ============================================

class AuthProtection {
  constructor() {
    this.isUserLoggedIn = this.checkUserSession();
    this.protectedPages = [
      "tienda.html",
      "membresias.html",
      "eventos.html",
      "newlifepro.html",
      "plan10k.html",
      "plan21k.html",
      "plan42k.html",
    ];
    this.init();
  }

  // ==========================================
  // 🔍 VERIFICAR SESIÓN DEL USUARIO
  // ==========================================
  checkUserSession() {
    const userEmail = localStorage.getItem("userEmail");
    return userEmail && userEmail.trim() !== "";
  }

  // ==========================================
  // 🚀 INICIALIZAR PROTECCIÓN
  // ==========================================
  init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupProtection();
      });
    } else {
      this.setupProtection();
    }
  }

  // ==========================================
  // 🛡️ CONFIGURAR PROTECCIÓN
  // ==========================================
  setupProtection() {
    const currentPage = window.location.pathname.split("/").pop();

    // Si estamos en una página protegida y no hay sesión
    if (this.protectedPages.includes(currentPage) && !this.isUserLoggedIn) {
      this.blockPageAccess();
      return;
    }

    // Proteger formularios y botones en index.html
    if (
      currentPage === "index.html" ||
      currentPage === "" ||
      window.location.pathname === "/"
    ) {
      this.protectPageElements();
    }
  }

  // ==========================================
  // 🚫 BLOQUEAR ACCESO A PÁGINA
  // ==========================================
  blockPageAccess() {
    // Ocultar todo el contenido de la página
    document.body.style.display = "none";

    // Mostrar popup de autenticación requerida
    setTimeout(() => {
      this.showAuthRequiredPopup();
    }, 100);
  }

  // ==========================================
  // 🔒 PROTEGER ELEMENTOS DE LA PÁGINA
  // ==========================================
  protectPageElements() {
    // Proteger formulario de contacto
    this.protectContactForm();

    // Proteger otros elementos interactivos
    this.protectInteractiveElements();
  }

  // ==========================================
  // 📧 PROTEGER FORMULARIO DE CONTACTO
  // ==========================================
  protectContactForm() {
    const contactForm = document.querySelector(".contact-form");
    const contactButton = document.querySelector(
      '.contact-form button[type="submit"]'
    );

    if (contactForm && contactButton) {
      // Interceptar el envío del formulario
      contactForm.addEventListener(
        "submit",
        (e) => {
          if (!this.isUserLoggedIn) {
            e.preventDefault();
            e.stopPropagation();
            this.showAuthRequiredPopup();
          }
        },
        true
      ); // true para capturar en fase de captura

      // También proteger el botón directamente
      contactButton.addEventListener(
        "click",
        (e) => {
          if (!this.isUserLoggedIn) {
            e.preventDefault();
            e.stopPropagation();
            this.showAuthRequiredPopup();
          }
        },
        true
      );
    }
  }

  // ==========================================
  // 🎯 PROTEGER ELEMENTOS INTERACTIVOS
  // ==========================================
  protectInteractiveElements() {
    // Proteger botones de llamada a la acción
    const ctaButtons = document.querySelectorAll(
      'a[href*="tienda"], a[href*="membresias"], a[href*="eventos"], a[href*="newlifepro"], a[href*="plan"]'
    );

    ctaButtons.forEach((button) => {
      button.addEventListener(
        "click",
        (e) => {
          if (!this.isUserLoggedIn) {
            e.preventDefault();
            e.stopPropagation();
            this.showAuthRequiredPopup();
          }
        },
        true
      );
    });

    // Proteger cualquier formulario adicional
    const forms = document.querySelectorAll(
      "form:not(.login-form):not(.register-form)"
    );
    forms.forEach((form) => {
      form.addEventListener(
        "submit",
        (e) => {
          if (!this.isUserLoggedIn) {
            e.preventDefault();
            e.stopPropagation();
            this.showAuthRequiredPopup();
          }
        },
        true
      );
    });
  }

  // ==========================================
  // 🔔 MOSTRAR POPUP DE AUTENTICACIÓN REQUERIDA
  // ==========================================
  showAuthRequiredPopup() {
    // Crear overlay
    const overlay = document.createElement("div");
    overlay.className = "auth-required-overlay";

    const popup = document.createElement("div");
    popup.className = "auth-required-popup";

    popup.innerHTML = `
      <div class="popup-icon auth-required">
        🔒
      </div>
      <div class="popup-title">¡Acceso Restringido!</div>
      <div class="popup-message">
        Inicia sesión o regístrate gratis para poder acceder a nuestro contenido exclusivo y todas las funcionalidades.
      </div>
      <div style="margin: 20px 0; padding: 15px; background: rgba(255, 105, 180, 0.1); border-radius: 10px; border: 1px solid rgba(255, 105, 180, 0.3);">
        <p style="margin: 0; color: #495057; font-size: 14px;">
          <strong>💎 Con tu cuenta podrás:</strong><br>
          • Comprar productos exclusivos<br>
          • Acceder a membresías premium<br>
          • Participar en eventos<br>
          • Usar planes de entrenamiento<br>
          • Contactarnos directamente
        </p>
      </div>
      <div class="popup-buttons">
        <button class="popup-btn secondary back-btn">
          🏠 Volver al Inicio
        </button>
        <button class="popup-btn primary login-btn">
          🚀 Iniciar Sesión
        </button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Aplicar estilos
    this.applyPopupStyles();

    // 🔧 MEJORA PARA MÓVIL: Prevenir scroll y asegurar posicionamiento
    if (window.innerWidth <= 768) {
      // Prevenir scroll del body
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";

      // Forzar scroll al top para centrado perfecto
      window.scrollTo(0, 0);

      // Aplicar estilos adicionales al overlay para móvil
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.zIndex = "999999";
    }

    // Mostrar con animación
    setTimeout(() => {
      overlay.classList.add("show");
    }, 10);

    // Event listeners para botones
    const loginBtn = popup.querySelector(".login-btn");
    const backBtn = popup.querySelector(".back-btn");

    loginBtn.addEventListener("click", () => {
      window.location.href = "sesion.html";
    });

    backBtn.addEventListener("click", () => {
      // Si estamos en una página protegida, ir al inicio
      if (
        this.protectedPages.includes(window.location.pathname.split("/").pop())
      ) {
        window.location.href = "index.html";
      } else {
        // Si estamos en inicio, solo cerrar popup
        this.closePopup(overlay);
        document.body.style.display = "";
      }
    });

    // Cerrar con ESC
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        backBtn.click();
        document.removeEventListener("keydown", handleEsc);
      }
    };
    document.addEventListener("keydown", handleEsc);
  }

  // ==========================================
  // 🎨 APLICAR ESTILOS AL POPUP
  // ==========================================
  applyPopupStyles() {
    if (document.getElementById("auth-protection-styles")) return;

    const style = document.createElement("style");
    style.id = "auth-protection-styles";
    style.textContent = `
      .auth-required-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .auth-required-overlay.show {
        opacity: 1;
      }

      .auth-required-popup {
        background: white;
        border-radius: 20px;
        padding: 40px 30px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: translateY(-50px);
        transition: transform 0.3s ease;
        font-family: 'Montserrat', sans-serif;
      }

      .auth-required-overlay.show .auth-required-popup {
        transform: translateY(0);
      }

      .popup-icon.auth-required {
        font-size: 60px;
        margin-bottom: 20px;
        display: block;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .popup-title {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
      }

      .popup-message {
        font-size: 16px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 25px;
      }

      .popup-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .popup-btn {
        padding: 12px 25px;
        border: none;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Montserrat', sans-serif;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .popup-btn.primary {
        background: linear-gradient(135deg, #ff69b4, #ff1493);
        color: white;
        box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
      }

      .popup-btn.primary:hover {
        background: linear-gradient(135deg, #ff1493, #dc143c);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 105, 180, 0.4);
      }

      .popup-btn.secondary {
        background: #f8f9fa;
        color: #495057;
        border: 2px solid #dee2e6;
      }

      .popup-btn.secondary:hover {
        background: #e9ecef;
        border-color: #adb5bd;
        color: #343a40;
      }

      @media (max-width: 600px) {
        .auth-required-overlay {
          /* Asegurar que el overlay cubra toda la pantalla visible */
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          /* Prevenir scroll del fondo */
          overflow: hidden;
          /* Forzar centrado perfecto */
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          /* Z-index muy alto para móvil */
          z-index: 999999 !important;
        }
        
        .auth-required-popup {
          margin: 20px;
          padding: 30px 20px;
          /* Asegurar que no se salga de la pantalla */
          max-height: 90vh;
          overflow-y: auto;
          /* Posicionamiento absoluto dentro del overlay */
          position: relative;
          /* Centrado perfecto */
          transform: none !important;
        }
        
        .auth-required-overlay.show .auth-required-popup {
          transform: none !important;
        }
        
        .popup-buttons {
          flex-direction: column;
        }
        
        .popup-btn {
          width: 100%;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================
  // ❌ CERRAR POPUP
  // ==========================================
  closePopup(overlay) {
    overlay.classList.remove("show");

    // 🔧 RESTAURAR SCROLL EN MÓVIL
    if (window.innerWidth <= 768) {
      // Restaurar scroll del body
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    setTimeout(() => {
      overlay.remove();
    }, 300);
  }

  // ==========================================
  // 🔄 ACTUALIZAR ESTADO DE AUTENTICACIÓN
  // ==========================================
  updateAuthStatus() {
    this.isUserLoggedIn = this.checkUserSession();
  }
}

// ==========================================
// 🚀 INICIALIZAR SISTEMA DE PROTECCIÓN
// ==========================================
const authProtection = new AuthProtection();

// Exponer funciones globales si es necesario
window.authProtection = authProtection;

console.log("🔒 Auth Protection System - Inicializado correctamente ✅");
