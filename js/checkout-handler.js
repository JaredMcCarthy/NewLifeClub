// ======================================
// �� CHECKOUT HANDLER - SISTEMA DE DESCUENTOS
// NewLife Run Club - Versión Producción
// ======================================

// Códigos de descuento activos
const PROMO_CODES = {
  WELCOME10: {
    percentage: 10,
    description: "Descuento de bienvenida",
    active: true,
    minAmount: 0,
  },
  NEWLIFE15: {
    percentage: 15,
    description: "Descuento NewLife Club",
    active: true,
    minAmount: 50,
  },
  RUNNER20: {
    percentage: 20,
    description: "Descuento especial runner",
    active: true,
    minAmount: 100,
  },
  VIP25: {
    percentage: 25,
    description: "Descuento VIP",
    active: true,
    minAmount: 150,
  },
  SAVE10: {
    percentage: 10,
    description: "Ahorra 10%",
    active: true,
    minAmount: 30,
  },
  MEGA15: {
    percentage: 15,
    description: "Mega descuento",
    active: true,
    minAmount: 75,
  },
  FIRST20: {
    percentage: 20,
    description: "Primer compra",
    active: true,
    minAmount: 60,
  },
};

// Variables globales para descuentos
let appliedDiscount = {
  code: null,
  percentage: 0,
  amount: 0,
  active: false,
};

// Variable para controlar actualizaciones
let discountUpdateInProgress = false;

// ======================================
// 🎟️ FUNCIONES DE CÓDIGOS DE DESCUENTO
// ======================================

// Aplicar código de descuento
async function applyPromoCode() {
  const promoInput = document.getElementById("promo-input");
  const promoBtn = document.querySelector(".promo-btn");

  if (!promoInput || !promoBtn) return;

  const code = promoInput.value.trim();

  if (!code) {
    showPromoNotification("Por favor ingresa un código válido", "error");
    return;
  }

  // Mostrar estado de carga
  promoBtn.textContent = "Validando...";
  promoBtn.disabled = true;

  try {
    // 🆕 PRIMERO: Intentar validar con nuestra API de códigos únicos
    console.log("🔍 Validando código único:", code);

    const response = await fetch(
      "https://newlifeclub.onrender.com/tienda-newsletter/validate-promo-code",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promoCode: code }),
      }
    );

    const data = await response.json();

    console.log("🔍 Respuesta completa de la API:", {
      status: response.status,
      ok: response.ok,
      data: data,
    });

    if (response.ok && data.success) {
      // ✅ Código único válido
      console.log("✅ Código único válido:", data);

      const cartInfo = getCartInfo();
      const subtotal = cartInfo.total;

      // 🔧 CORREGIR: La API devuelve discount como porcentaje (ej: "10%")
      // Necesitamos extraer el número y convertirlo a decimal
      let discountPercentage = 10; // Default 10% para códigos WELCOME10

      if (data.data && data.data.discount) {
        // Si viene como "10%", extraer el número
        const discountStr = data.data.discount.toString();
        discountPercentage = parseInt(discountStr.replace("%", "")) || 10;
      }

      console.log("💰 Porcentaje de descuento calculado:", discountPercentage);

      // Calcular descuento correctamente
      const discountAmount =
        Math.round(subtotal * (discountPercentage / 100) * 100) / 100;

      console.log("💸 Cálculo de descuento:", {
        subtotal: subtotal,
        percentage: discountPercentage,
        amount: discountAmount,
      });

      // Aplicar descuento
      appliedDiscount = {
        code: code,
        percentage: discountPercentage,
        amount: discountAmount,
        active: true,
        description: "Código de descuento único",
        isUniqueCode: true, // Marcar como código único
      };

      console.log("🎯 Descuento aplicado:", appliedDiscount);

      // Actualizar UI del input
      promoInput.value = `${code} - APLICADO`;
      promoInput.style.borderColor = "#4CAF50";
      promoInput.style.color = "#4CAF50";
      promoInput.disabled = true;

      promoBtn.textContent = "✓ Aplicado";
      promoBtn.style.background = "#4CAF50";
      promoBtn.disabled = true;

      // Mostrar notificación de éxito
      showPromoNotification(
        `✅ Código único aplicado! ${discountPercentage}% de descuento`,
        "success"
      );

      // Actualizar resumen del carrito
      updateCartSummaryWithDiscount();

      console.log("🎟️ Código único aplicado:", appliedDiscount);

      console.log("✅ Código promocional aplicado:", {
        code: code,
        discount: appliedDiscount,
      });

      // Forzar actualización inmediata del resumen
      updateCartSummaryWithDiscount();

      // Forzar actualización adicional después de un momento
      setTimeout(() => {
        updateCartSummaryWithDiscount();
        console.log("🔄 Actualización forzada de totales con descuento");

        // NUEVA: Forzar actualización visual
        forceUpdatePriceDisplay();

        // Verificación final
        console.log(
          "🔍 Verificación final - appliedDiscount:",
          appliedDiscount
        );
        if (!appliedDiscount.active) {
          console.error("❌ ERROR: El descuento no se mantuvo activo!");
        }
      }, 500);

      return;
    }
  } catch (error) {
    console.log(
      "⚠️ Error al validar código único, intentando códigos hardcodeados:",
      error.message
    );
  }

  // 🔄 FALLBACK: Si no es código único, usar códigos hardcodeados
  console.log("🔄 Validando con códigos hardcodeados...");

  const codeUpper = code.toUpperCase();
  const promoData = PROMO_CODES[codeUpper];

  // Resetear botón
  promoBtn.textContent = "Aplicar";
  promoBtn.disabled = false;

  if (!promoData || !promoData.active) {
    showPromoNotification("Código de descuento no válido", "error");
    promoInput.style.borderColor = "#ff4444";

    setTimeout(() => {
      promoInput.style.borderColor = "#e0e0e0";
      promoInput.value = "";
    }, 3000);
    return;
  }

  // Obtener subtotal actual del carrito
  const cartInfo = getCartInfo();
  const subtotal = cartInfo.total;

  if (subtotal < promoData.minAmount) {
    showPromoNotification(
      `Monto mínimo requerido: L.${promoData.minAmount}`,
      "error"
    );
    return;
  }

  // Calcular descuento
  const discountAmount =
    Math.round(subtotal * (promoData.percentage / 100) * 100) / 100;

  // Aplicar descuento
  appliedDiscount = {
    code: codeUpper,
    percentage: promoData.percentage,
    amount: discountAmount,
    active: true,
    description: promoData.description,
    isUniqueCode: false, // Marcar como código hardcodeado
  };

  // Actualizar UI del input
  promoInput.value = `${codeUpper} - APLICADO`;
  promoInput.style.borderColor = "#4CAF50";
  promoInput.style.color = "#4CAF50";
  promoInput.disabled = true;

  promoBtn.textContent = "✓ Aplicado";
  promoBtn.style.background = "#4CAF50";
  promoBtn.disabled = true;

  // Mostrar notificación de éxito
  showPromoNotification(
    `✅ ${promoData.description} aplicado! ${promoData.percentage}% de descuento`,
    "success"
  );

  // Actualizar resumen del carrito
  updateCartSummaryWithDiscount();

  console.log("✅ Código hardcodeado aplicado:", appliedDiscount);

  // Forzar actualización inmediata del resumen
  updateCartSummaryWithDiscount();

  // Forzar actualización adicional después de un momento
  setTimeout(() => {
    updateCartSummaryWithDiscount();
    console.log(
      "🔄 Actualización forzada de totales con descuento (hardcoded)"
    );

    // NUEVA: Forzar actualización visual
    forceUpdatePriceDisplay();

    // Verificación final
    console.log("🔍 Verificación final - appliedDiscount:", appliedDiscount);
    if (!appliedDiscount.active) {
      console.error("❌ ERROR: El descuento hardcodeado no se mantuvo activo!");
    }
  }, 500);

  // Una tercera actualización para asegurar que se mantenga
  setTimeout(() => {
    updateCartSummaryWithDiscount();
    console.log("🔄 Actualización final de totales con descuento (hardcoded)");

    // NUEVA: Forzar actualización visual
    forceUpdatePriceDisplay();

    // Verificación final
    console.log("🔍 Verificación final - appliedDiscount:", appliedDiscount);
    if (!appliedDiscount.active) {
      console.error("❌ ERROR: El descuento hardcodeado no se mantuvo activo!");
    }
  }, 500);

  return;
}

// Remover código de descuento
function removePromoCode() {
  const promoInput = document.getElementById("promo-input");
  const promoBtn = document.querySelector(".promo-btn");

  if (!promoInput || !promoBtn) return;

  // Resetear descuento
  appliedDiscount = {
    code: null,
    percentage: 0,
    amount: 0,
    active: false,
  };

  // Resetear UI
  promoInput.value = "";
  promoInput.style.borderColor = "#e0e0e0";
  promoInput.style.color = "#333";
  promoInput.disabled = false;

  promoBtn.textContent = "Aplicar";
  promoBtn.style.background = "#000";
  promoBtn.disabled = false;

  // Actualizar resumen
  updateCartSummaryWithDiscount();

  showPromoNotification("Código de descuento removido", "info");
}

// ======================================
// 🧮 FUNCIONES DE CÁLCULO CON DESCUENTO
// ======================================

// Actualizar resumen del carrito incluyendo descuentos
function updateCartSummaryWithDiscount() {
  // Obtener información del carrito actual
  const cartInfo = getCartInfo();

  if (!cartInfo || cartInfo.count === 0) {
    // Si no hay productos, mostrar totales en cero
    updateSummaryElements(0, 0, 0, 0, 0);
    return;
  }

  const subtotal = cartInfo.total;
  const shipping = subtotal >= 75 ? 0 : 10; // Envío gratis en compras mayores a L.75

  // 🎯 NUEVA LÓGICA: Solo aplicar descuento a productos de tienda
  let discountAmount = 0;
  if (appliedDiscount.active) {
    // Obtener productos del carrito desde localStorage
    const cartData = localStorage.getItem("newlife_cart");
    let tiendaSubtotal = 0;

    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        const cartItems = Array.isArray(cart) ? cart : cart.items || [];

        // Calcular subtotal solo de productos de tienda
        cartItems.forEach((item) => {
          if (item.source === "tienda") {
            tiendaSubtotal += item.price * (item.quantity || 1);
          }
        });

        console.log("🛒 Análisis de productos para descuento:", {
          subtotalTotal: subtotal,
          subtotalTienda: tiendaSubtotal,
          productosEnCarrito: cartItems.map((item) => ({
            name: item.name,
            source: item.source,
            price: item.price,
          })),
        });
      } catch (e) {
        console.error("Error al analizar productos del carrito:", e);
        tiendaSubtotal = subtotal; // Fallback
      }
    }

    // Solo aplicar descuento al subtotal de productos de tienda
    if (tiendaSubtotal > 0) {
      discountAmount =
        Math.round(tiendaSubtotal * (appliedDiscount.percentage / 100) * 100) /
        100;
      console.log("💰 Descuento aplicado solo a productos de tienda:", {
        tiendaSubtotal: tiendaSubtotal,
        porcentajeDescuento: appliedDiscount.percentage,
        montoDescuento: discountAmount,
      });
    } else {
      console.log("⚠️ No hay productos de tienda en el carrito, descuento = 0");
    }
  }

  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxRate = 0.15; // 15% de impuestos
  const taxes =
    Math.round((subtotalAfterDiscount + shipping) * taxRate * 100) / 100;
  const finalTotal = subtotalAfterDiscount + shipping + taxes;

  // Actualizar elementos del DOM
  updateSummaryElements(subtotal, discountAmount, shipping, taxes, finalTotal);

  console.log("💰 Totales con descuento:", {
    subtotal: subtotal,
    discount: discountAmount,
    subtotalAfterDiscount: subtotalAfterDiscount,
    shipping: shipping,
    taxes: taxes,
    finalTotal: finalTotal,
  });
}

// Actualizar elementos del resumen en el DOM
function updateSummaryElements(
  subtotal,
  discount,
  shipping,
  taxes,
  finalTotal
) {
  // Actualizar subtotal
  const subtotalElement = document.querySelector(".subtotal-amount");
  if (subtotalElement) {
    subtotalElement.textContent = `L.${subtotal.toFixed(2)}`;
  }

  // Mostrar/ocultar fila de descuento
  let discountRow = document.querySelector(".discount-row");
  if (discount > 0 && appliedDiscount.active) {
    if (!discountRow) {
      // Crear fila de descuento si no existe
      const summaryContainer = document.querySelector(".summary-totals");
      const subtotalRow = summaryContainer.querySelector(".total-row");

      discountRow = document.createElement("div");
      discountRow.className = "total-row discount-row";
      discountRow.style.color = "#4CAF50";
      discountRow.style.fontWeight = "600";

      // Insertar después del subtotal
      subtotalRow.insertAdjacentElement("afterend", discountRow);
    }

    discountRow.innerHTML = `
      <span>Descuento (${appliedDiscount.code}):</span>
      <span>-L.${discount.toFixed(2)}</span>
    `;
    discountRow.style.display = "flex";
  } else if (discountRow) {
    discountRow.style.display = "none";
  }

  // Actualizar envío
  const shippingElement = document.querySelector(".shipping-amount");
  if (shippingElement) {
    shippingElement.textContent =
      shipping === 0 ? "GRATIS" : `L.${shipping.toFixed(2)}`;
    shippingElement.style.color = shipping === 0 ? "#4CAF50" : "inherit";
  }

  // Actualizar impuestos
  const taxElement = document.querySelector(".tax-amount");
  if (taxElement) {
    taxElement.textContent = `L.${taxes.toFixed(2)}`;
  }

  // Actualizar total final
  const totalElement = document.querySelector(".total-amount");
  if (totalElement) {
    totalElement.textContent = `L.${finalTotal.toFixed(2)}`;
  }

  // Actualizar botón de pago
  const payButton =
    document.querySelector("#payment-button") ||
    document.querySelector(".btn-primary");
  if (payButton) {
    if (finalTotal === 0 || subtotal === 0) {
      payButton.textContent = "Carrito Vacío";
      payButton.disabled = true;
      payButton.style.background = "#ccc";
      payButton.style.cursor = "not-allowed";
    } else {
      payButton.textContent = `Completar Pago - L.${finalTotal.toFixed(2)}`;
      payButton.disabled = false;
      payButton.style.background = "";
      payButton.style.cursor = "";
    }
  }
}

// ======================================
// 🔔 SISTEMA DE NOTIFICACIONES PARA PROMOS
// ======================================

// Mostrar notificaciones específicas para códigos promocionales
function showPromoNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `promo-notification notification-${type}`;
  notification.innerHTML = message;

  const colors = {
    success: "#4CAF50",
    error: "#ff4444",
    info: "#2196F3",
    warning: "#ff9800",
  };

  notification.style.cssText = `
    position: fixed;
    top: 120px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    max-width: 320px;
    font-size: 14px;
    line-height: 1.4;
  `;

  document.body.appendChild(notification);

  // Remover después de 4 segundos
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-in";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// ======================================
// 🚀 INICIALIZACIÓN Y EVENT LISTENERS
// ======================================

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  console.log("🎟️ Checkout Handler - Sistema de Descuentos inicializado");

  // Solo ejecutar si estamos en la página de checkout
  if (!window.location.pathname.includes("checkout.html")) {
    return;
  }

  // Configurar event listeners para códigos promocionales
  setTimeout(() => {
    const promoBtn = document.querySelector(".promo-btn");
    const promoInput = document.getElementById("promo-input");

    console.log("🔧 Configurando event listeners...");
    console.log("🔧 Botón encontrado:", promoBtn ? "✅ Sí" : "❌ No");
    console.log("🔧 Input encontrado:", promoInput ? "✅ Sí" : "❌ No");

    if (promoBtn) {
      promoBtn.addEventListener("click", applyPromoCode);
      console.log("✅ Event listener agregado al botón");

      // Test adicional: agregar estilo hover para confirmar que el botón es clickeable
      promoBtn.style.cursor = "pointer";
      promoBtn.addEventListener("mouseenter", () => {
        console.log("🖱️ Mouse sobre el botón");
      });
      promoBtn.addEventListener("click", () => {
        console.log("🖱️ Clic detectado en el botón");
      });
    } else {
      console.error("❌ No se encontró el botón .promo-btn");
    }

    if (promoInput) {
      // Aplicar código al presionar Enter
      promoInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          console.log("⌨️ Enter presionado en input");
          applyPromoCode();
        }
      });

      // Agregar botón para remover código si está aplicado
      promoInput.addEventListener("input", function () {
        if (appliedDiscount.active && this.value === "") {
          removePromoCode();
        }
      });

      console.log("✅ Event listeners agregados al input");
    } else {
      console.error("❌ No se encontró el input #promo-input");
    }

    // Integrar con el sistema de carrito principal
    // Override la función updateCartSummary para incluir descuentos
    if (typeof window.updateCartSummary === "function") {
      const originalUpdateCartSummary = window.updateCartSummary;
      window.updateCartSummary = function () {
        // Si hay descuento activo y estamos actualizando, no sobrescribir
        if (appliedDiscount.active && discountUpdateInProgress) {
          console.log("🚫 Bloqueando updateCartSummary - descuento activo");
          return;
        }

        // Llamar función original primero
        originalUpdateCartSummary();

        // Si hay descuento activo, aplicar inmediatamente
        if (appliedDiscount.active) {
          setTimeout(() => {
            updateCartSummaryWithDiscount();
            forceUpdatePriceDisplay();
          }, 10);
        }
      };

      console.log(
        "✅ Override de updateCartSummary configurado con protección"
      );
    }

    // También llamar directamente después de aplicar descuento
    const originalApplyPromoCode = window.applyPromoCode;
    if (originalApplyPromoCode) {
      window.applyPromoCode = async function () {
        await originalApplyPromoCode();
        // Forzar actualización después de aplicar código
        setTimeout(() => {
          updateCartSummaryWithDiscount();
        }, 100);
      };
    }

    console.log("✅ Event listeners de descuentos configurados");
  }, 300);
});

// ======================================
// 🌐 FUNCIONES GLOBALES PARA API
// ======================================

// 🛒 NUEVA FUNCIÓN PARA PROCESAR COMPRAS CON NUESTRA API
async function procesarCompraCompleta(datosFormulario) {
  try {
    console.log("🛒 Iniciando procesamiento de compra...");

    // Obtener información del carrito
    const cartInfo = getCartInfo ? getCartInfo() : { items: [], total: 0 };
    const descuentoAplicado = getAppliedDiscount();

    // Preparar datos para la API
    const datosCompra = {
      // Información del cliente (del formulario)
      email: datosFormulario.email,
      nombre: datosFormulario.firstName,
      apellido: datosFormulario.lastName,
      telefono: datosFormulario.phone,
      direccion: datosFormulario.address,
      ciudad: datosFormulario.city,
      departamento: datosFormulario.state || "Honduras",
      codigo_postal: datosFormulario.zip,

      // Información de la compra
      metodo_pago:
        datosFormulario.paymentMethod === "card"
          ? "tarjeta_credito"
          : "deposito_bancario",
      subtotal: cartInfo.subtotal || cartInfo.total,
      impuestos: cartInfo.taxes || 0,
      descuentos: descuentoAplicado.active ? descuentoAplicado.amount : 0,
      total: cartInfo.finalTotal || cartInfo.total,

      // Productos del carrito
      productos: cartInfo.items.map((item) => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        nombre: item.name || item.title,
        precio: item.price,
        cantidad: item.quantity || 1,
        talla: item.size || "Sin especificar",
      })),

      // Información de tarjeta (solo últimos 4 dígitos si es tarjeta)
      ultimos_4_digitos:
        datosFormulario.paymentMethod === "card" && datosFormulario.cardNumber
          ? datosFormulario.cardNumber.replace(/\s/g, "").slice(-4)
          : null,
      tipo_tarjeta:
        datosFormulario.paymentMethod === "card"
          ? detectarTipoTarjeta(datosFormulario.cardNumber)
          : null,
    };

    console.log("📦 Datos preparados para envío:", datosCompra);

    // Enviar a nuestra API
    const response = await fetch("/api/compras/nueva-compra", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosCompra),
    });

    const resultado = await response.json();

    if (resultado.success) {
      console.log(
        "✅ Compra guardada exitosamente:",
        resultado.data.token_compra
      );

      // 🎟️ Marcar código único como usado si se aplicó uno
      if (descuentoAplicado.active && descuentoAplicado.isUniqueCode) {
        try {
          console.log(
            "🎟️ Marcando código único como usado:",
            descuentoAplicado.code
          );

          const useCodeResponse = await fetch(
            "https://newlifeclub.onrender.com/tienda-newsletter/use-promo-code",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ promoCode: descuentoAplicado.code }),
            }
          );

          const useCodeData = await useCodeResponse.json();

          if (useCodeResponse.ok && useCodeData.success) {
            console.log("✅ Código único marcado como usado exitosamente");
          } else {
            console.warn(
              "⚠️ No se pudo marcar el código como usado:",
              useCodeData.message
            );
          }
        } catch (error) {
          console.warn("⚠️ Error al marcar código como usado:", error.message);
          // No fallar la compra por esto
        }
      }

      return {
        success: true,
        token: resultado.data.token_compra,
        data: resultado.data,
      };
    } else {
      console.error("❌ Error en la API:", resultado.message);
      return {
        success: false,
        error: resultado.message,
      };
    }
  } catch (error) {
    console.error("❌ Error procesando compra:", error);
    return {
      success: false,
      error: "Error de conexión con el servidor",
    };
  }
}

// 🔍 Detectar tipo de tarjeta por el número
function detectarTipoTarjeta(numeroTarjeta) {
  if (!numeroTarjeta) return null;

  const numero = numeroTarjeta.replace(/\s/g, "");

  if (numero.startsWith("4")) return "visa";
  if (numero.startsWith("5") || numero.startsWith("2")) return "mastercard";
  if (numero.startsWith("3")) return "amex";
  if (numero.startsWith("6")) return "discover";

  return "otras";
}

// 📋 Obtener información del carrito (compatible con tu sistema actual)
function getCartInfo() {
  // Intentar obtener del localStorage primero
  const cartData = localStorage.getItem("newlife_cart");

  if (cartData) {
    try {
      const cart = JSON.parse(cartData);

      // ✅ FIXED: El carrito es un array directo, no objeto con items
      const cartItems = Array.isArray(cart) ? cart : cart.items || [];

      // Calcular totales
      let subtotal = 0;
      const items = cartItems.map((item) => {
        const itemTotal = item.price * (item.quantity || 1);
        subtotal += itemTotal;

        return {
          id: item.id,
          name: item.name || item.title,
          price: item.price,
          quantity: item.quantity || 1,
          size: item.size,
        };
      });

      const descuentoAplicado = getAppliedDiscount();
      const descuento = descuentoAplicado.active ? descuentoAplicado.amount : 0;
      const impuestos = subtotal * 0.15; // 15% de impuestos
      const total = subtotal - descuento + impuestos;

      return {
        items: items,
        subtotal: subtotal,
        taxes: impuestos,
        discount: descuento,
        finalTotal: total,
        total: total,
        count: items.length,
      };
    } catch (e) {
      console.error("Error parsing cart data:", e);
    }
  }

  // Fallback: carrito vacío
  return {
    items: [],
    subtotal: 0,
    taxes: 0,
    discount: 0,
    finalTotal: 0,
    total: 0,
    count: 0,
  };
}

// Exponer funciones principales
window.applyPromoCode = applyPromoCode;
window.removePromoCode = removePromoCode;
window.updateCartSummaryWithDiscount = updateCartSummaryWithDiscount;
// 🆕 NUEVA FUNCIÓN EXPUESTA
window.procesarCompraCompleta = procesarCompraCompleta;

// Función para obtener descuento actual
window.getAppliedDiscount = function () {
  return appliedDiscount;
};

// Función para obtener códigos disponibles (para desarrollo/debug)
window.getAvailablePromoCodes = function () {
  return Object.keys(PROMO_CODES);
};

// Función de debug para descuentos
window.debugDiscount = function () {
  console.log("🎟️ DEBUG DESCUENTOS:");
  console.log("Códigos disponibles:", Object.keys(PROMO_CODES));
  console.log("Descuento aplicado:", appliedDiscount);
  return {
    availableCodes: Object.keys(PROMO_CODES),
    appliedDiscount: appliedDiscount,
  };
};

// 🧪 Función de test para verificar que el botón funcione
window.testPromoButton = function () {
  console.log("🧪 === TEST DEL BOTÓN PROMOCIONAL ===");

  const promoBtn = document.querySelector(".promo-btn");
  const promoInput = document.getElementById("promo-input");

  console.log("Botón encontrado:", promoBtn ? "✅ Sí" : "❌ No");
  console.log("Input encontrado:", promoInput ? "✅ Sí" : "❌ No");

  if (promoBtn) {
    console.log("Texto del botón:", promoBtn.textContent);
    console.log("Botón deshabilitado:", promoBtn.disabled);
    console.log("Estilo cursor:", promoBtn.style.cursor);
  }

  if (promoInput) {
    console.log("Valor del input:", promoInput.value);
    console.log("Input deshabilitado:", promoInput.disabled);
  }

  // Test manual del botón
  if (promoBtn && promoInput) {
    promoInput.value = "WELCOME10-TEST";
    console.log("✅ Valor de test agregado al input");
    console.log("🔄 Intentando aplicar código...");
    applyPromoCode();
  }

  console.log("=================================");
};

// Función de debug para verificar estado de descuentos
function debugDiscountState() {
  console.log("🔍 DEBUG - Estado actual de descuentos:");
  console.log("📊 appliedDiscount:", appliedDiscount);

  const cartInfo = getCartInfo();
  console.log("🛒 Cart Info:", cartInfo);

  const subtotalElement = document.querySelector(".subtotal-amount");
  const totalElement = document.querySelector(".total-amount");
  const discountRow = document.querySelector(".discount-row");

  console.log("💰 Elementos DOM:");
  console.log("  - Subtotal:", subtotalElement?.textContent);
  console.log("  - Total:", totalElement?.textContent);
  console.log("  - Descuento visible:", discountRow?.style.display !== "none");

  if (appliedDiscount.active) {
    const expectedDiscount =
      Math.round(cartInfo.total * (appliedDiscount.percentage / 100) * 100) /
      100;
    console.log("💸 Descuento esperado:", expectedDiscount);
  }
}

// Hacer función disponible globalmente para testing
window.debugDiscountState = debugDiscountState;

// Función para forzar reaplicación de descuento
function forceReapplyDiscount() {
  if (appliedDiscount.active) {
    console.log("🔄 Forzando reaplicación de descuento:", appliedDiscount);

    // Recalcular el descuento
    const cartInfo = getCartInfo();
    const subtotal = cartInfo.total;
    const discountAmount =
      Math.round(subtotal * (appliedDiscount.percentage / 100) * 100) / 100;

    // Actualizar el monto del descuento
    appliedDiscount.amount = discountAmount;

    // Forzar actualización del DOM
    updateCartSummaryWithDiscount();

    console.log("✅ Descuento reaplicado:", appliedDiscount);
  }
}

// Hacer función disponible globalmente
window.forceReapplyDiscount = forceReapplyDiscount;

// Función para forzar actualización visual de precios
function forceUpdatePriceDisplay() {
  if (!appliedDiscount.active) return;

  discountUpdateInProgress = true;
  console.log("🔄 Forzando actualización visual de precios...");

  const cartInfo = getCartInfo();
  const subtotal = cartInfo.total;
  const shipping = subtotal >= 75 ? 0 : 10;

  // Calcular descuento
  const discountAmount =
    Math.round(subtotal * (appliedDiscount.percentage / 100) * 100) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxes =
    Math.round((subtotalAfterDiscount + shipping) * 0.15 * 100) / 100;
  const finalTotal = subtotalAfterDiscount + shipping + taxes;

  console.log("💰 Valores calculados:", {
    subtotal,
    discountAmount,
    subtotalAfterDiscount,
    taxes,
    finalTotal,
  });

  // FORZAR actualización de elementos específicos
  const elements = {
    subtotal: document.querySelector(".subtotal-amount"),
    shipping: document.querySelector(".shipping-amount"),
    tax: document.querySelector(".tax-amount"),
    total: document.querySelector(".total-amount"),
  };

  console.log("🎯 Elementos encontrados:", {
    subtotal: !!elements.subtotal,
    shipping: !!elements.shipping,
    tax: !!elements.tax,
    total: !!elements.total,
  });

  // Actualizar subtotal
  if (elements.subtotal) {
    elements.subtotal.textContent = `L.${subtotal.toFixed(2)}`;
    elements.subtotal.style.fontWeight = "bold";
    console.log("✅ Subtotal actualizado:", elements.subtotal.textContent);
  }

  // Crear/mostrar fila de descuento
  let discountRow = document.querySelector(".discount-row");
  const summaryContainer = document.querySelector(".summary-totals");

  if (discountAmount > 0) {
    if (!discountRow) {
      discountRow = document.createElement("div");
      discountRow.className = "total-row discount-row";
      discountRow.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        color: #4CAF50;
        font-weight: 600;
        border-bottom: 1px solid #eee;
      `;

      // Insertar después del subtotal
      const subtotalRow = summaryContainer.children[0];
      subtotalRow.insertAdjacentElement("afterend", discountRow);
    }

    discountRow.innerHTML = `
      <span>Descuento (${appliedDiscount.code}):</span>
      <span>-L.${discountAmount.toFixed(2)}</span>
    `;
    discountRow.style.display = "flex";
    console.log("✅ Descuento mostrado:", discountRow.textContent);
  }

  // Actualizar envío
  if (elements.shipping) {
    elements.shipping.textContent =
      shipping === 0 ? "GRATIS" : `L.${shipping.toFixed(2)}`;
    elements.shipping.style.color = shipping === 0 ? "#4CAF50" : "inherit";
    console.log("✅ Envío actualizado:", elements.shipping.textContent);
  }

  // Actualizar impuestos
  if (elements.tax) {
    elements.tax.textContent = `L.${taxes.toFixed(2)}`;
    console.log("✅ Impuestos actualizados:", elements.tax.textContent);
  }

  // Actualizar total final - MUY IMPORTANTE
  if (elements.total) {
    elements.total.textContent = `L.${finalTotal.toFixed(2)}`;
    elements.total.style.fontWeight = "bold";
    elements.total.style.fontSize = "18px";
    elements.total.style.color = "#4CAF50"; // Verde para mostrar el ahorro
    console.log("✅ TOTAL FINAL ACTUALIZADO:", elements.total.textContent);
  }

  setTimeout(() => {
    discountUpdateInProgress = false;
  }, 1000);
}

// Hacer función disponible globalmente
window.forceUpdatePriceDisplay = forceUpdatePriceDisplay;

console.log(
  "🎟️ Checkout Handler - Sistema de Descuentos v1.0 cargado exitosamente"
);
