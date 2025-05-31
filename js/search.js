document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("search-btn");
  const searchMenu = document.getElementById("searchMenu");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const mobileCloseBtn = document.getElementById("mobileCloseSearch");

  // Datos del sitio web
  const siteData = [
    {
      title: "Inicio",
      description: "Página principal del sitio",
      url: "index.html",
      icon: "🏠",
    },
    {
      title: "Membresías",
      description: "Conoce nuestros planes y beneficios",
      url: "membresias.html",
      icon: "🎯",
    },
    {
      title: "Eventos",
      description: "Calendario de eventos y carreras",
      url: "eventos.html",
      icon: "📅",
    },
    {
      title: "Tienda",
      description: "Productos y equipamiento deportivo",
      url: "tienda.html",
      icon: "🛍️",
    },
    {
      title: "NewLife PRO",
      description: "Beneficios exclusivos para miembros PRO",
      url: "newlifepro.html",
      icon: "⭐",
    },
    {
      title: "Quiénes Somos",
      description: "Conoce más sobre NewLifeRun Club",
      url: "index.html#quienes-somos",
      icon: "ℹ️",
    },
  ];

  // Función para abrir el menú de búsqueda
  function openSearchMenu() {
    searchMenu.classList.add("active");
    searchInput.focus();
    if (isMobile()) {
      document.body.style.overflow = "hidden"; // Prevenir scroll en móvil
    }
  }

  // Función para cerrar el menú de búsqueda
  function closeSearchMenu() {
    searchMenu.classList.remove("active");
    searchInput.value = "";
    if (isMobile()) {
      document.body.style.overflow = ""; // Restaurar scroll en móvil
    }
  }

  // Detectar si es dispositivo móvil
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Toggle del menú de búsqueda
  searchBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (searchMenu.classList.contains("active")) {
      closeSearchMenu();
    } else {
      openSearchMenu();
      displayResults(siteData); // Mostrar todos los resultados al abrir
    }
  });

  // Botón cerrar en móvil
  mobileCloseBtn.addEventListener("click", closeSearchMenu);

  // Cerrar al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (!searchMenu.contains(e.target) && e.target !== searchBtn) {
      closeSearchMenu();
    }
  });

  // Cerrar con ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeSearchMenu();
    }
  });

  // Búsqueda en tiempo real
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const filteredResults = siteData.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
    );

    displayResults(filteredResults);
  });

  // Mostrar resultados
  function displayResults(results) {
    searchResults.innerHTML = "";

    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="search-result-item"><div class="text">No se encontraron resultados</div></div>';
      return;
    }

    results.forEach((result) => {
      const resultElement = document.createElement("div");
      resultElement.className = "search-result-item";
      resultElement.innerHTML = `
                <div class="icon">${result.icon}</div>
                <div class="text">
                    <div class="title">${result.title}</div>
                    <div class="description">${result.description}</div>
                </div>
            `;

      resultElement.addEventListener("click", () => {
        window.location.href = result.url;
        closeSearchMenu(); // Cerrar el menú después de seleccionar
      });

      searchResults.appendChild(resultElement);
    });
  }
});
