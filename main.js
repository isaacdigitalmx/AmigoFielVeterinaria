// Main.js - Amigo Fiel
// Script principal sin dependencias

// Aviso de demo
(() => {
  const notice = document.getElementById("demo-notice");
  const closeButton = document.getElementById("demo-notice-close");
  const storageKey = "amigoFielDemoNoticeClosed";

  if (!notice || !closeButton) return;

  try {
    if (sessionStorage.getItem(storageKey) !== "1") {
      notice.showModal();
    }

    closeButton.addEventListener("click", () => {
      sessionStorage.setItem(storageKey, "1");
      notice.close();
    });
  } catch {
    notice.showModal();
    closeButton.addEventListener("click", () => notice.close());
  }
})();

// Configuración
const SITE_CONFIG = {
  whatsapp: "524770000000",
  clinicName: "Amigo Fiel",
};

// Funciones de ayuda
function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildWhatsAppUrl(message = "") {
  const baseUrl = `https://wa.me/${SITE_CONFIG.whatsapp}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

// Enlaces directos a WhatsApp
function initWhatsAppLinks() {
  const links = document.querySelectorAll("[data-whatsapp]");
  links.forEach((link) => {
    const message = link.getAttribute("data-wa-text") || "";
    link.setAttribute("href", buildWhatsAppUrl(message));
  });
}

// Buscador y filtros del catálogo
function initCatalogFilters() {
  const searchInput = document.getElementById("catalog-search-input");
  const filterChips = document.querySelectorAll(".filter-chip[data-filter]");
  const products = document.querySelectorAll(".product-card[data-name]");
  const categorySections = document.querySelectorAll(
    ".category-section[data-category]",
  );
  const emptyMessage = document.getElementById("catalog-empty");

  if (!products.length) return;

  let activeCategory = "todos";

  function applyFilters() {
    const query = normalizeText(searchInput?.value || "");
    let visibleCount = 0;

    products.forEach((card) => {
      const name = normalizeText(card.getAttribute("data-name") || "");
      const category = normalizeText(card.getAttribute("data-category") || "");
      const species = normalizeText(card.getAttribute("data-species") || "");
      const visibleText = normalizeText(card.textContent || "");

      const searchableText = `${name} ${category} ${species} ${visibleText}`;

      const matchesCategory =
        activeCategory === "todos" ||
        category === normalizeText(activeCategory);
      const matchesQuery = !query || searchableText.includes(query);

      const isVisible = matchesCategory && matchesQuery;

      card.classList.toggle("is-hidden", !isVisible);
      card.setAttribute("aria-hidden", isVisible ? "false" : "true");

      if (isVisible) visibleCount++;
    });

    categorySections.forEach((section) => {
      const visibleProducts = section.querySelectorAll(
        ".product-card:not(.is-hidden)",
      );
      section.classList.toggle("is-hidden", visibleProducts.length === 0);
    });

    if (emptyMessage) {
      emptyMessage.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.getAttribute("data-filter") || "todos";

      filterChips.forEach((c) => {
        c.setAttribute("aria-pressed", c === chip ? "true" : "false");
      });

      applyFilters();
    });
  });

  applyFilters();
}

// Formulario de contacto
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.setAttribute("data-state", state);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus("Revisa los campos marcados antes de continuar.", "error");
      return;
    }

    const formData = new FormData(form);
    const nombre = String(formData.get("nombre") || "").trim();
    const telefono = String(formData.get("telefono") || "").trim();
    const mascota = String(formData.get("mascota") || "").trim();
    const especie = String(formData.get("especie") || "").trim();
    const zona = String(formData.get("zona") || "").trim();
    const mensaje = String(formData.get("mensaje") || "").trim();

    const phoneDigits = telefono.replace(/\D/g, "");

    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      setStatus("Ingresa un número de teléfono válido.", "error");
      return;
    }

    const lines = [
      `Hola, quisiera agendar una visita veterinaria con ${SITE_CONFIG.clinicName}.`,
      "",
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
    ];

    if (mascota) lines.push(`Mascota: ${mascota}`);
    if (especie) lines.push(`Especie: ${especie}`);
    if (zona) lines.push(`Zona / colonia: ${zona}`);
    lines.push("", `Motivo de consulta: ${mensaje}`);

    const url = buildWhatsAppUrl(lines.join("\n"));

    setStatus(
      "Abriendo WhatsApp con tu mensaje. Revísalo y presiona enviar.",
      "ok",
    );

    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) window.location.href = url;
  });
}

// Clases de carga básica (para no romper el CSS)
function initLoadState() {
  document.documentElement.classList.add("js-enabled");
  requestAnimationFrame(() => {
    document.body.classList.add("page-loaded");
  });
}

// Arrancar todo cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  initLoadState();
  initWhatsAppLinks();
  initCatalogFilters();
  initContactForm();
});
