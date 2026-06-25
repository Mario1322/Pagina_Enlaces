const LANG_KEY = "siteLang";

const TRANSLATIONS = {
  es: {
    tags: "Desarrollo · Ciberseguridad · Automatización",
    description: "Desarrollador de aplicaciones multiplataforma y especialista en ciberseguridad. Creando soluciones eficientes y automatizaciones inteligentes.",
    portfolioTitle: "Portafolio Web",
    portfolioSubtitle: "Explora mis proyectos y experiencia",
    githubTitle: "GitHub",
    githubSubtitle: "Revisa mis repositorios y código fuente",
    linkedinTitle: "LinkedIn",
    linkedinSubtitle: "Conectemos profesionalmente",
    armarioTitle: "Mi Armario Digital",
    armarioSubtitle: "Conoce el desarrollo de mi aplicación móvil",
    viajeTitle: "Viaje 2026",
    viajeSubtitle: "Planing del viaje",
    motherTitle: "Día de la Madre",
    motherSubtitle: "Detalle del día de la madre",
    emailText: "Escríbeme a mi Email",
    skipLink: "Saltar al contenido principal",
    updateText: "Nueva versión disponible offline.",
    updateBtn: "Actualizar"
  },
  en: {
    tags: "Development · Cybersecurity · Automation",
    description: "Multiplatform applications developer and cybersecurity specialist. Creating efficient solutions and smart automations.",
    portfolioTitle: "Web Portfolio",
    portfolioSubtitle: "Explore my projects and experience",
    githubTitle: "GitHub",
    githubSubtitle: "Review my repositories and source code",
    linkedinTitle: "LinkedIn",
    linkedinSubtitle: "Let's connect professionally",
    armarioTitle: "My Digital Closet",
    armarioSubtitle: "Discover the development of my mobile app",
    viajeTitle: "Trip 2026",
    viajeSubtitle: "Trip planning",
    motherTitle: "Mother's Day",
    motherSubtitle: "Mother's Day details",
    emailText: "Email Me",
    skipLink: "Skip to main content",
    updateText: "New version available offline.",
    updateBtn: "Update"
  }
};

function getPreferredLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch (e) {
    console.warn("Storage access blocked:", e);
  }
  
  const browserLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
  return browserLang.startsWith("en") ? "en" : "es";
}

function translatePage(lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    console.warn("Storage access blocked:", e);
  }
  
  const dict = TRANSLATIONS[lang];
  document.querySelectorAll("[data-i18n-key]").forEach((el) => {
    const key = el.dataset.i18nKey;
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
  
  document.dispatchEvent(new CustomEvent("i18n:changed", { detail: { lang } }));
}

// Exponer a la ventana global para intercomunicación con la terminal CLI
window.translatePage = translatePage;

// Inicialización de Idioma
const initLang = () => {
  const lang = getPreferredLang();
  translatePage(lang);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLang);
} else {
  initLang();
}
