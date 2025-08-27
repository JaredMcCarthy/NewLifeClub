document.addEventListener("DOMContentLoaded", () => {
  // Referencia al correo del usuario actualmente loggeado
  const currentUserEmail = localStorage.getItem("userEmail");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!currentUserEmail || !isLoggedIn) {
    console.warn("⚠️ No hay usuario loggeado válido");
    // Solo redirigir en móvil y solo si realmente no está loggeado
    if (window.innerWidth <= 768) {
      alert("Debes iniciar sesión para acceder a tu perfil");
      window.location.href = "sesion.html";
      return;
    }
  }

  console.log("✅ Usuario loggeado en perfil:", currentUserEmail);

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

        // Usar popup personalizado para información personal guardada
        if (typeof CustomPopups !== "undefined") {
          CustomPopups.showAlert(
            "Información personal guardada exitosamente",
            "success",
            "💾 Información Guardada"
          );
        } else {
          alert("¡Información personal guardada!");
        }
      } else if (section === "my-bio") {
        const newBiography = biographyTextarea?.value.trim() || "";
        localStorage.setItem(`userBiography_${currentUserEmail}`, newBiography);

        // Usar popup personalizado para biografía guardada
        if (typeof CustomPopups !== "undefined") {
          CustomPopups.showAlert(
            "Tu biografía ha sido guardada correctamente",
            "success",
            "📝 Biografía Guardada"
          );
        } else {
          alert("¡Biografía guardada!");
        }
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

    // Cargar compras cuando se hace clic en el botón
    comprasBtn.addEventListener("click", () => {
      console.log("🛍️ Cargando historial de compras...");
      loadPurchaseHistory();
    });
  }

  // ========== BOTÓN CERRAR SESIÓN - MEJORADO ==========
  const logoutBtn = document.getElementById("logout-btn");
  const logoutButton = document.querySelector(".logout-button");

  // 🔧 FUNCIÓN MEJORADA PARA CERRAR SESIÓN
  async function cerrarSesion() {
    console.log("🚪 Intentando cerrar sesión...");

    try {
      // Usar popup personalizado para confirmar cierre de sesión
      let confirmed = false;
      if (typeof confirmLogout !== "undefined") {
        confirmed = await confirmLogout();
      } else if (typeof CustomPopups !== "undefined") {
        confirmed = await CustomPopups.confirmLogout();
      } else {
        confirmed = confirm("¿Estás seguro que quieres cerrar sesión?");
      }

      if (confirmed) {
        console.log("✅ Usuario confirmó cierre de sesión");

        // Limpiar TODOS los datos de sesión
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("token");
        localStorage.removeItem("sessionStartTime");
        localStorage.removeItem("lastActivity");

        // Limpiar timers de sesión si existen
        if (typeof clearSessionTimer !== "undefined") {
          clearSessionTimer();
        }

        // Mostrar mensaje de confirmación con popup personalizado
        if (typeof showAlert !== "undefined") {
          await showAlert(
            "Sesión cerrada exitosamente",
            "success",
            "✅ Sesión Cerrada"
          );
        } else if (typeof CustomPopups !== "undefined") {
          await CustomPopups.showAlert(
            "Sesión cerrada exitosamente",
            "success",
            "✅ Sesión Cerrada"
          );
        } else {
          alert("Sesión cerrada exitosamente");
        }

        // Redireccionar al inicio
        console.log("🏠 Redirigiendo a inicio...");
        window.location.href = "index.html";
      } else {
        console.log("❌ Usuario canceló cierre de sesión");
      }
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);

      // Fallback: cerrar sesión sin confirmación
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("token");
      localStorage.removeItem("sessionStartTime");
      localStorage.removeItem("lastActivity");

      alert("Sesión cerrada");
      window.location.href = "index.html";
    }
  }

  // ⏰ SISTEMA DE AUTO-LOGOUT POR INACTIVIDAD (2-3 minutos)
  let inactivityTimer;
  const INACTIVITY_TIMEOUT = 2.5 * 60 * 1000; // 2.5 minutos en milisegundos

  function resetInactivityTimer() {
    // Limpiar timer anterior
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    // Guardar última actividad
    localStorage.setItem("lastActivity", Date.now().toString());

    // Configurar nuevo timer
    inactivityTimer = setTimeout(async () => {
      console.log("⏰ Sesión expirada por inactividad");

      // Mostrar alerta de sesión expirada
      if (typeof showAlert !== "undefined") {
        await showAlert(
          "Tu sesión ha expirado por inactividad (2.5 minutos).\nPor favor, inicia sesión nuevamente.",
          "warning",
          "⏰ Sesión Expirada"
        );
      } else {
        alert(
          "Tu sesión ha expirado por inactividad.\nPor favor, inicia sesión nuevamente."
        );
      }

      // Cerrar sesión automáticamente
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("token");
      localStorage.removeItem("sessionStartTime");
      localStorage.removeItem("lastActivity");

      // Redireccionar a login
      window.location.href = "sesion.html";
    }, INACTIVITY_TIMEOUT);

    console.log("⏰ Timer de inactividad reiniciado (2.5 min)");
  }

  // Eventos que resetean el timer de inactividad
  const resetEvents = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
    "keydown",
    "mouseup",
  ];

  resetEvents.forEach((event) => {
    document.addEventListener(event, resetInactivityTimer, true);
  });

  // Función para limpiar timer (exportada globalmente)
  window.clearSessionTimer = function () {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
      console.log("⏰ Timer de sesión limpiado");
    }
  };

  // Inicializar timer de inactividad solo si hay sesión activa
  if (currentUserEmail && isLoggedIn) {
    resetInactivityTimer();
    console.log("⏰ Sistema de auto-logout activado");
  }

  // Agregar event listeners para botón de cerrar sesión CON MÚLTIPLES MÉTODOS
  if (logoutBtn) {
    // Remover listeners anteriores
    logoutBtn.removeEventListener("click", cerrarSesion);
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      cerrarSesion();
    });
    console.log("✅ Event listener agregado a #logout-btn");
  }

  if (logoutButton) {
    // Remover listeners anteriores
    logoutButton.removeEventListener("click", cerrarSesion);
    logoutButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      cerrarSesion();
    });
    console.log("✅ Event listener agregado a .logout-button");
  }

  // También buscar por texto del botón (método de respaldo)
  const allButtons = document.querySelectorAll("button, .nav-button");
  allButtons.forEach((button) => {
    const buttonText = button.textContent.trim().toLowerCase();
    if (
      buttonText.includes("cerrar sesión") ||
      buttonText.includes("cerrar sesion") ||
      buttonText.includes("logout") ||
      buttonText.includes("🚪")
    ) {
      button.removeEventListener("click", cerrarSesion);
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        cerrarSesion();
      });
      console.log("✅ Event listener agregado a botón con texto:", buttonText);
    }
  });

  // Función global para cerrar sesión (accesible desde cualquier lugar)
  window.cerrarSesionProfile = cerrarSesion;

  console.log("🎯 Perfil de usuario completamente configurado");

  // 🛍️ CARGAR HISTORIAL AUTOMÁTICAMENTE AL INICIO
  setTimeout(() => {
    const comprasSection = document.getElementById("my-purchases");
    if (comprasSection) {
      loadPurchaseHistory();
      console.log("🛍️ Historial de compras cargado automáticamente");
    }
  }, 500);

  // 🐛 FUNCIÓN DE DEBUG PARA LOGOUT
  window.debugLogout = function () {
    console.log("🧪 === DEBUG LOGOUT ===");
    console.log(
      "Botón logout-btn existe:",
      !!document.getElementById("logout-btn")
    );
    console.log(
      "Botón .logout-button existe:",
      !!document.querySelector(".logout-button")
    );
    console.log("Función cerrarSesion definida:", typeof cerrarSesion);
    console.log(
      "Función global cerrarSesionProfile:",
      typeof window.cerrarSesionProfile
    );
    console.log("Custom popups disponible:", typeof confirmLogout);
    console.log("Timer de inactividad activo:", !!inactivityTimer);
    console.log("Usuario actual:", localStorage.getItem("userEmail"));
    console.log("========================");

    // Probar logout manualmente
    if (typeof cerrarSesion === "function") {
      console.log("🧪 Ejecutando logout manual...");
      cerrarSesion();
    }
  };

  console.log("🧪 Usa debugLogout() en la consola para probar el logout");
});

// 🛍️ NUEVA FUNCIÓN: Cargar historial de compras
function loadPurchaseHistory() {
  const purchasesSection = document.getElementById("my-purchases");
  if (!purchasesSection) return;

  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    purchasesSection.innerHTML = `
      <h3>Mis Compras</h3>
      <p class="no-purchases">Debes iniciar sesión para ver tu historial de compras.</p>
    `;
    return;
  }

  // Obtener historial del usuario
  const historyKey = `purchaseHistory_${userEmail}`;
  const userHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

  if (userHistory.length === 0) {
    purchasesSection.innerHTML = `
      <h3>Mis Compras</h3>
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 4rem; opacity: 0.3; margin-bottom: 20px;">🛒</div>
        <p style="color: #666; font-size: 1.1rem; margin-bottom: 10px;">Aún no tienes compras registradas</p>
        <p style="color: #999; font-size: 0.9rem;">Tus futuras compras aparecerán aquí</p>
        <a href="tienda.html" style="
          display: inline-block;
          background: linear-gradient(45deg, #ff69b4, #ff0080);
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 20px;
          transition: transform 0.3s ease;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          🛍️ Ir a la Tienda
        </a>
      </div>
    `;
    return;
  }

  // Generar HTML del historial
  let purchasesHTML = `
    <h3>Mis Compras</h3>
    <p style="color: #666; margin-bottom: 25px;">
      Historial completo de tus compras en NewLifeRun Club (${
        userHistory.length
      } compra${userHistory.length > 1 ? "s" : ""})
    </p>
  `;

  userHistory.forEach((purchase, index) => {
    const statusColor =
      purchase.estado === "Procesado"
        ? "#4CAF50"
        : purchase.estado === "Pendiente de Confirmación"
        ? "#ff9800"
        : "#666";

    const statusIcon =
      purchase.estado === "Procesado"
        ? "✅"
        : purchase.estado === "Pendiente de Confirmación"
        ? "⏳"
        : "📦";

    purchasesHTML += `
      <div class="purchase-card" style="
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border: 2px solid #e9ecef;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.1)'">
        
        <!-- Header de la compra -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
          <div>
            <h4 style="
              color: #333;
              margin: 0 0 5px 0;
              font-size: 1.1rem;
              font-weight: 700;
            ">Pedido #${purchase.id}</h4>
            <p style="
              color: #666;
              margin: 0;
              font-size: 0.9rem;
            ">${purchase.fecha} • ${purchase.hora}</p>
          </div>
          <div style="text-align: right;">
            <span style="
              background: ${statusColor};
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 0.8rem;
              font-weight: 600;
              display: inline-flex;
              align-items: center;
              gap: 5px;
            ">
              ${statusIcon} ${purchase.estado}
            </span>
          </div>
        </div>

        <!-- Productos -->
        <div style="margin-bottom: 15px;">
          <h5 style="color: #333; margin-bottom: 10px; font-size: 0.95rem; font-weight: 600;">Productos (${purchase.productos.length}):</h5>
          <div style="display: flex; flex-direction: column; gap: 8px;">
    `;

    purchase.productos.forEach((producto) => {
      purchasesHTML += `
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: rgba(255, 105, 180, 0.05);
          border-radius: 8px;
          border-left: 3px solid #ff69b4;
        ">
          <img src="${producto.imagen}" alt="${producto.nombre}" style="
            width: 40px;
            height: 40px;
            border-radius: 6px;
            object-fit: cover;
            border: 1px solid #e9ecef;
          ">
          <div style="flex: 1;">
            <p style="
              margin: 0;
              font-weight: 600;
              color: #333;
              font-size: 0.9rem;
              line-height: 1.3;
            ">${producto.nombre}</p>
            <p style="
              margin: 0;
              color: #666;
              font-size: 0.8rem;
            ">${producto.categoria} • Cant: ${producto.cantidad}</p>
          </div>
          <div style="
            font-weight: 700;
            color: #ff69b4;
            font-size: 0.9rem;
          ">L.${producto.precio}</div>
        </div>
      `;
    });

    purchasesHTML += `
          </div>
        </div>

        <!-- Footer de la compra -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
            font-size: 0.9rem;
          ">
            💳 ${purchase.metodoPago}
          </div>
          <div style="
            font-size: 1.2rem;
            font-weight: 800;
            color: #333;
          ">
            Total: <span style="color: #ff69b4;">L.${purchase.total}</span>
          </div>
        </div>

        <!-- Decoración -->
        <div style="
          position: absolute;
          top: -20px;
          right: -20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(45deg, #ff69b4, #ff0080);
          border-radius: 50%;
          opacity: 0.1;
        "></div>
      </div>
    `;
  });

  purchasesSection.innerHTML = purchasesHTML;
}

// 🧪 FUNCIÓN DE TESTING: Generar compras de prueba
window.generateTestPurchases = function () {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    alert("Debes estar loggeado para generar compras de prueba");
    return;
  }

  const testPurchases = [
    {
      id: "NRC-250123-TEST1",
      fecha: "23/01/2025",
      hora: "14:30",
      productos: [
        {
          nombre: "Membresía Elite NewLife",
          precio: "500.00",
          cantidad: 1,
          categoria: "Membresías",
          imagen: "https://via.placeholder.com/60x60/ff69b4/FFFFFF?text=ME",
        },
        {
          nombre: "Camiseta Running Pro",
          precio: "350.00",
          cantidad: 2,
          categoria: "Ropa Deportiva",
          imagen: "https://via.placeholder.com/60x60/1a1a1a/FFFFFF?text=RP",
        },
      ],
      total: "1200.00",
      metodoPago: "Tarjeta de Crédito",
      estado: "Procesado",
      userEmail: userEmail,
    },
    {
      id: "NRC-220123-TEST2",
      fecha: "22/01/2025",
      hora: "09:15",
      productos: [
        {
          nombre: "Plan de Entrenamiento 21K",
          precio: "800.00",
          cantidad: 1,
          categoria: "Planes de Entrenamiento",
          imagen: "https://via.placeholder.com/60x60/ff0080/FFFFFF?text=21K",
        },
      ],
      total: "800.00",
      metodoPago: "Depósito Bancario",
      estado: "Pendiente de Confirmación",
      userEmail: userEmail,
    },
  ];

  // Guardar en localStorage
  const historyKey = `purchaseHistory_${userEmail}`;
  localStorage.setItem(historyKey, JSON.stringify(testPurchases));

  // Recargar historial
  loadPurchaseHistory();

  console.log("🧪 Compras de prueba generadas");
  if (typeof CustomPopups !== "undefined") {
    CustomPopups.showAlert(
      "¡Compras de prueba generadas exitosamente!",
      "success",
      "🧪 Testing"
    );
  } else {
    alert("¡Compras de prueba generadas!");
  }
};

// 🧹 FUNCIÓN DE TESTING: Limpiar historial
window.clearTestPurchases = function () {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const historyKey = `purchaseHistory_${userEmail}`;
  localStorage.removeItem(historyKey);
  loadPurchaseHistory();

  console.log("🧹 Historial limpiado");
  if (typeof CustomPopups !== "undefined") {
    CustomPopups.showAlert(
      "Historial de compras limpiado",
      "info",
      "🧹 Limpieza"
    );
  } else {
    alert("Historial limpiado");
  }
};
