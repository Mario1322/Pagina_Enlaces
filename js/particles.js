const PARTICLES_SRC = "https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-dynamic-src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.dynamicSrc = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function shouldRenderParticles() {
  const hasReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveDataEnabled = navigator.connection && navigator.connection.saveData;
  // Permitir partículas en móviles y ventanas estrechas (sitio web de enlaces ligero)
  return !hasReducedMotion && !saveDataEnabled;
}

function getParticleColor() {
  return getComputedStyle(document.body).getPropertyValue("--particle-color").trim() || "#1B365D";
}

function destroyParticles() {
  if (window.pJSDom && window.pJSDom.length) {
    window.pJSDom[0].pJS.fn.vendors.destroypJS();
    window.pJSDom = [];
  }
}

function initParticles() {
  if (typeof window.particlesJS !== "function") {
    return;
  }

  window.particlesJS("particles-js", {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: getParticleColor() },
      shape: { type: "edge" },
      opacity: { value: 1, random: true },
      size: { value: 4, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: getParticleColor(),
        opacity: 0.4,
        width: 1,
      },
      move: { enable: true, speed: 1.5, random: true, out_mode: "out" },
    },
    interactivity: {
      detect_on: "window",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        repulse: { distance: 200, duration: 0.4 },
      },
    },
    retina_detect: true,
  });
}

function setupParticles() {
  const particlesContainer = document.getElementById("particles-js");
  if (!particlesContainer) {
    return;
  }

  if (!shouldRenderParticles()) {
    particlesContainer.style.display = "none";
    return;
  }

  const startParticles = () => {
    loadScript(PARTICLES_SRC)
      .then(initParticles)
      .catch(() => {
        particlesContainer.style.display = "none";
      });
  };

  document.addEventListener("theme:changed", () => {
    if (!shouldRenderParticles()) {
      particlesContainer.style.display = "none";
      return;
    }
    particlesContainer.style.display = "";
    if (typeof window.particlesJS === "function") {
      destroyParticles();
      initParticles();
    } else {
      startParticles();
    }
  });

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(startParticles, { timeout: 2000 });
  } else {
    setTimeout(startParticles, 600);
  }
}

// Ejecutar inmediatamente si el DOM ya está listo (evitar fallos con scripts de tipo module)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupParticles);
} else {
  setupParticles();
}
