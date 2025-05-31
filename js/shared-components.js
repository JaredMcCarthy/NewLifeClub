document.addEventListener("DOMContentLoaded", function () {
  // Verificar si ya existe el contenedor de user-actions
  const userActions = document.querySelector(".user-actions");
  if (!userActions) return;

  // Verificar si los botones ya existen
  const existingSearchBtn = userActions.querySelector("#search-btn");
  const existingCartBtn = userActions.querySelector("#cart-btn");

  // Solo agregar los botones si no existen
  if (!existingSearchBtn && !existingCartBtn) {
    // Agregar los botones de búsqueda y carrito
    const searchAndCartHTML = `
        <button href="#" class="user-button" id="search-btn">🔍</button>
        <!-- Menú de búsqueda -->
        <div class="search-menu" id="searchMenu">
            <div class="search-container">
                <button class="mobile-close-btn" id="mobileCloseSearch">×</button>
                <input type="text" id="searchInput" placeholder="Buscar en el sitio..." />
                <div class="search-results" id="searchResults">
                    <!-- Los resultados se mostrarán aquí -->
                </div>
            </div>
        </div>
        <button href="#" class="user-button" id="cart-btn">🛒</button>
    `;

    // Insertar antes del último botón (profile-btn)
    const profileBtn = userActions.querySelector("#profile-btn");
    if (profileBtn) {
      profileBtn.insertAdjacentHTML("beforebegin", searchAndCartHTML);
    }
  }

  // Agregar el HTML del carrito al final del body si no existe
  if (!document.querySelector(".cart-panel")) {
    // Agregar el HTML del carrito al final del body
    const cartHTML = `
        <!-- Carrito de Compras -->
        <div class="cart-overlay" id="cartOverlay" onclick="closeCart()"></div>
        <div class="cart-panel" id="cartPanel">
            <!-- Header -->
            <div class="cart-header">
                <h2 class="cart-title">Mi Carrito</h2>
                <button class="close-btn" onclick="closeCart()">×</button>
            </div>

            <!-- Indicador de progreso -->
            <div class="progress-indicator">
                <div class="progress-steps">
                    <div class="progress-line">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="step active" data-step="1">1</div>
                    <div class="step" data-step="2">2</div>
                    <div class="step" data-step="3">3</div>
                    <div class="step" data-step="4">4</div>
                </div>
            </div>

            <!-- Contenido -->
            <div class="cart-content">
                <!-- Paso 1: Productos -->
                <div class="cart-step active" id="step1">
                    <h3 style="margin-bottom: 20px; color: #333">Tus Productos</h3>

                    <div class="cart-item">
                        <div class="item-image">IMG</div>
                        <div class="item-details">
                            <div class="item-name">Producto Premium</div>
                            <div class="item-price">$89.99</div>
                            <div class="quantity-controls">
                                <button class="qty-btn" onclick="updateQuantity(1, -1)">-</button>
                                <span id="qty1" style="color: #000;">2</span>
                                <button class="qty-btn" onclick="updateQuantity(1, 1)">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="cart-item">
                        <div class="item-image">IMG</div>
                        <div class="item-details">
                            <div class="item-name">Producto Especial</div>
                            <div class="item-price">$45.50</div>
                            <div class="quantity-controls">
                                <button class="qty-btn" onclick="updateQuantity(2, -1)">-</button>
                                <span id="qty2" style="color: #000;">1</span>
                                <button class="qty-btn" onclick="updateQuantity(2, 1)">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="order-summary">
                        <div class="summary-row">
                            <span style="color: #000;">Subtotal:</span>
                            <span id="subtotal" style="color: #000;">$225.48</span>
                        </div>
                        <div class="summary-row">
                            <span style="color: #000;">Envío:</span>
                            <span style="color: #000;">$15.00</span>
                        </div>
                        <div class="summary-row summary-total">
                            <span style="color: #000;">Total:</span>
                            <span id="total" style="color: #000;">$240.48</span>
                        </div>
                    </div>
                </div>

                <!-- Paso 2: Información de envío -->
                <div class="cart-step" id="step2">
                    <h3 style="margin-bottom: 20px; color: #333">Información de Envío</h3>
                    <form id="shippingForm">
                        <div class="form-row">
                            <div class="form-col">
                                <div class="form-group">
                                    <label class="form-label">Nombre</label>
                                    <input type="text" class="form-input" id="shipping-name" required placeholder="Tu nombre" />
                                </div>
                            </div>
                            <div class="form-col">
                                <div class="form-group">
                                    <label class="form-label">Apellido</label>
                                    <input type="text" class="form-input" id="shipping-lastname" required placeholder="Tu apellido" />
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Dirección</label>
                            <input type="text" class="form-input" id="shipping-address" required placeholder="Calle y número" />
                        </div>

                        <div class="form-row">
                            <div class="form-col">
                                <div class="form-group">
                                    <label class="form-label">Ciudad</label>
                                    <input type="text" class="form-input" id="shipping-city" required placeholder="Tu ciudad" />
                                </div>
                            </div>
                            <div class="form-col">
                                <div class="form-group">
                                    <label class="form-label">Código Postal</label>
                                    <input type="text" class="form-input" id="shipping-zip" required placeholder="12345" />
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Teléfono</label>
                            <input type="tel" class="form-input" id="shipping-phone" required placeholder="+1 234 567 8900" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="shipping-email" required placeholder="tu@email.com" />
                        </div>
                    </form>
                </div>

                <!-- Paso 3: Método de pago -->
                <div class="cart-step" id="step3">
                    <h3 style="margin-bottom: 20px; color: #333">Método de Pago</h3>
                    <form id="paymentForm">
                        <div class="payment-methods">
                            <div class="payment-option" data-payment="card">
                                <div class="payment-icon">💳</div>
                                <div>
                                    <h4 style="color: #000;">Tarjeta de Crédito/Débito</h4>
                                    <p style="color: #000;">Visa, MasterCard, American Express</p>
                                </div>
                            </div>
                        </div>

                        <div id="cardForm" class="payment-details" style="display: none; margin-top: 20px;">
                            <div class="form-group">
                                <label class="form-label">Número de Tarjeta</label>
                                <input type="text" class="form-input" id="card-number" placeholder="1234 5678 9012 3456" />
                            </div>
                            <div class="form-row">
                                <div class="form-col">
                                    <div class="form-group">
                                        <label class="form-label">Vencimiento</label>
                                        <input type="text" class="form-input" id="card-expiry" placeholder="MM/AA" />
                                    </div>
                                </div>
                                <div class="form-col">
                                    <div class="form-group">
                                        <label class="form-label">CVV</label>
                                        <input type="text" class="form-input" id="card-cvv" placeholder="123" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Paso 4: Confirmación -->
                <div class="cart-step" id="step4">
                    <div class="success-animation">
                        <div class="success-icon">✓</div>
                        <h3 style="color: #ff1493;">¡Pedido Confirmado!</h3>
                        <p class="order-number" style="color: #000;">Número de pedido: <span id="orderNumber" style="color: #000;"></span></p>
                        <div class="order-details">
                            <h4 style="color: #ff1493;">Resumen del Pedido</h4>
                            <div id="orderSummary"></div>
                            <div class="total-amount" style="color: #000;">
                                Total: <span id="finalAmount" style="color: #000;"></span>
                            </div>
                        </div>
                        <p class="confirmation-email" style="color: #000;">
                            Hemos enviado un correo de confirmación a <span id="confirmationEmail" style="color: #000;"></span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="cart-actions">
                <button class="btn btn-secondary" id="backBtn" onclick="previousStep()" style="display: none">Atrás</button>
                <button class="btn btn-primary" id="nextBtn" onclick="nextStep()">Continuar</button>
            </div>
        </div>
    `;

    // Agregar el HTML del carrito al final del body
    document.body.insertAdjacentHTML("beforeend", cartHTML);
  }
});
