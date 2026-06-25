/**
 * terminal.js
 * Phantom CLI - Terminal Interactiva para el Portfolio.
 */

function setupTerminal() {
    const isEn = document.documentElement.lang === "en";

    // 1. Inyectar HTML de la terminal dinámicamente
    const terminalHTML = `
      <div id="phantom-terminal" class="phantom-terminal">
        <div class="terminal-header" id="terminal-drag">
          <span>Phantom Protocol CLI v1.0.5 - Mario De La Rosa</span>
          <div class="terminal-controls">
            <div class="t-btn t-min" title="${isEn ? "Minimize" : "Minimizar"}"></div>
            <div class="t-btn t-close" title="${isEn ? "Close / Reset" : "Cerrar / Reset"}"></div>
          </div>
        </div>
        <div class="terminal-content" id="terminal-output">
          <canvas id="t-canvas"></canvas>
          <div class="terminal-line">${isEn ? "[SYSTEM] Welcome to Mario De La Rosa's Terminal." : "[SISTEMA] Bienvenido a la terminal de Mario De La Rosa."}</div>
          <div class="terminal-line">${isEn ? "[SYSTEM] Type 'help' to see available commands." : "[SISTEMA] Escribe 'ayuda' para ver los comandos disponibles."}</div>
        </div>
        <div class="terminal-input-line">
          <span class="t-prompt">visitor@phantom:~$ </span>
          <input type="text" id="t-input" autocomplete="off" spellcheck="false" autofocus>
        </div>
      </div>
      <div id="t-toggle" class="terminal-toggle" title="${isEn ? "Open Security Console" : "Abrir Consola de Seguridad"}">
        <i class='bx bx-terminal'></i>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", terminalHTML);

    const terminal = document.getElementById("phantom-terminal");
    const toggle = document.getElementById("t-toggle");
    const input = document.getElementById("t-input");
    const output = document.getElementById("terminal-output");
    const closeBtn = terminal.querySelector(".t-close");
    const minBtn = terminal.querySelector(".t-min");

    // 3. Lógica de Interacción
    let matrixStarted = false;
    let xOffset = 0;
    let yOffset = 0;

    const aplicarTema = (nuevoTema) => {
        if (nuevoTema === 'oscuro') {
            document.documentElement.classList.add('cambiocolor');
            document.body.classList.add('cambiocolor');
            try {
                localStorage.setItem('tema', 'oscuro');
                localStorage.setItem('temaManual', 'true');
            } catch (e) {
                console.warn("Storage write failed:", e);
            }
        } else {
            document.documentElement.classList.remove('cambiocolor');
            document.body.classList.remove('cambiocolor');
            try {
                localStorage.setItem('tema', 'claro');
                localStorage.setItem('temaManual', 'true');
            } catch (e) {
                console.warn("Storage write failed:", e);
            }
        }
        document.dispatchEvent(
            new CustomEvent('theme:changed', { detail: { isDark: nuevoTema === 'oscuro' } })
        );
    };

    // Inicializar Tema desde localStorage
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('tema');
    } catch (e) {
        console.warn("Storage read failed:", e);
    }
    if (savedTheme === 'oscuro') {
        aplicarTema('oscuro');
    } else if (savedTheme === 'claro') {
        aplicarTema('claro');
    } else {
        const prefiereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        aplicarTema(prefiereDark ? 'oscuro' : 'claro');
    }

    // Escuchar el evento de traducción i18n
    document.addEventListener("i18n:changed", (e) => {
        const lang = e.detail.lang;
        const isEnglish = lang === "en";
        if (toggle) toggle.setAttribute("title", isEnglish ? "Open Security Console" : "Abrir Consola de Seguridad");
        if (minBtn) minBtn.setAttribute("title", isEnglish ? "Minimize" : "Minimizar");
        if (closeBtn) closeBtn.setAttribute("title", isEnglish ? "Close / Reset" : "Cerrar / Reset");
    });

    const toggleTerminal = () => {
        const isVisible = terminal.style.display === "flex";
        terminal.style.display = isVisible ? "none" : "flex";
        if (!isVisible) {
            input.focus();
            if (!matrixStarted) {
                startMatrix("t-canvas");
                matrixStarted = true;
            }
            playTick(300, 0.1); 

            // Auto-Scan por primera vez en la sesión
            let isScanned = false;
            try {
                isScanned = sessionStorage.getItem("terminal_scanned") === "true";
            } catch (e) {
                console.warn("Storage read failed:", e);
            }
            if (!isScanned) {
                runAutoScan();
                try {
                    sessionStorage.setItem("terminal_scanned", "true");
                } catch (e) {
                    console.warn("Storage write failed:", e);
                }
            }
        }
    };

    // --- Audio Synthesis for Terminal ---
    let audioCtx = null;
    const playTick = (freq = 250, duration = 0.02) => {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.warn("Audio Context blocked or failed.");
        }
    };

    const runAutoScan = () => {
        const _isEn = document.documentElement.lang === "en";
        const browser = navigator.userAgent.split(' ').pop();
        const ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255) + 0) + "." + (Math.floor(Math.random() * 255) + 0) + "." + (Math.floor(Math.random() * 255) + 0);

        const scanLines = _isEn ? [
            "[SCANNING] Detecting visitor metadata...",
            `[SCANNING] Browser: ${browser}`,
            `[SCANNING] Origin: ${ip}`,
            "[SCANNING] Identity: GUEST_V3",
            "[SYSTEM] Access granted. Welcome back."
        ] : [
            "[SCANNING] Detectando metadatos del visitante...",
            `[SCANNING] Navegador: ${browser}`,
            `[SCANNING] Origen: ${ip}`,
            "[SCANNING] Identidad: GUEST_V3",
            "[SISTEMA] Acceso concedido. Bienvenido de nuevo."
        ];

        let delay = 0;
        scanLines.forEach(line => {
            setTimeout(() => addLine(line, "line"), delay);
            delay += 400;
        });
    };

    const addLine = (text, type = "line") => {
        const div = document.createElement("div");
        div.className = `terminal-line ${type}`;
        div.textContent = text;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
        
        // Efecto de sonido por cada línea del sistema
        if (type !== "t-prompt") playTick(200, 0.03); 
    };

    const resetTerminal = () => {
        const _isEn = document.documentElement.lang === "en";
        // Resetear Posición
        xOffset = 0;
        yOffset = 0;
        terminal.style.transform = `translate(0,0)`;

        // Limpiar Contenido (A estado inicial)
        output.innerHTML = '<canvas id="t-canvas"></canvas>';
        addLine(
            _isEn
                ? "[SYSTEM] Terminal reset. Temporary data purged."
                : "[SISTEMA] Terminal reiniciada. Se han purgado los datos temporales.",
        );
        addLine(
            _isEn
                ? '[SYSTEM] Type "help" to see commands.'
                : '[SISTEMA] Escribe "ayuda" para ver los comandos.',
        );

        // Reiniciar Matrix
        startMatrix("t-canvas");
    };

    // 2. Comandos configurados
    const commands = {
        help: () => {
            const _isEn = document.documentElement.lang === "en";
            return _isEn
                ? [
                      "help - Show this list",
                      "whoami - About Mario",
                      "projects - List key projects",
                      "theme [light/dark] - Change theme style",
                      "lang [es/en] - Switch language",
                      "integrity - Fake security scan",
                      "clear - Clean terminal",
                      "exit - Close CLI",
                  ]
                : [
                      "ayuda - Muestra esta lista",
                      "quiensoy - Sobre Mario",
                      "proyectos - Lista proyectos clave",
                      "tema [claro/oscuro] - Cambiar tema",
                      "idioma [es/en] - Cambiar idioma",
                      "integridad - Simular escaneo de seguridad",
                      "limpiar - Limpiar terminal",
                      "salir - Cerrar consola",
                  ];
        },
        whoami: () => {
            const _isEn = document.documentElement.lang === "en";
            return _isEn
                ? [
                      "Mario De La Rosa García",
                      "Specialist in Cybersecurity and Multiplatform App Dev.",
                      "Current status: Protecting data in the shadows.",
                  ]
                : [
                      "Mario De La Rosa García",
                      "Especialista en Ciberseguridad y Desarrollo de Apps Multiplataforma.",
                      "Estado: Protegiendo datos en las sombras.",
                  ];
        },
        projects: () => {
            const _isEn = document.documentElement.lang === "en";
            const targetUrl = location.protocol === "file:"
                ? (_isEn ? "../Mario1322.github.io/en/proyectos.html" : "../Mario1322.github.io/proyectos.html")
                : (_isEn ? "https://mario1322.github.io/en/proyectos.html" : "https://mario1322.github.io/proyectos.html");
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 1000);
            return _isEn
                ? [
                      "> Family Dashboard (Phantom Protocol)",
                      "> Arkanoid 2021 (Java Engine)",
                      "> Secure Management (Cryptography/C)",
                      "[SYSTEM] Redirecting to portfolio projects...",
                  ]
                : [
                      "> Family Dashboard (Phantom Protocol)",
                      "> Arkanoid 2021 (Java Engine)",
                      "> Secure Management (Cryptography/C)",
                      "[SISTEMA] Redirigiendo al portafolio de proyectos...",
                  ];
        },
        theme: (arg) => {
            const _isEn = document.documentElement.lang === "en";
            if (!arg) {
                return _isEn
                    ? [
                          "theme [light/dark] - Change theme style",
                          `Current: ${document.body.classList.contains("cambiocolor") ? "dark" : "light"}`
                      ]
                    : [
                          "tema [claro/oscuro] - Cambiar estilo de tema",
                          `Actual: ${document.body.classList.contains("cambiocolor") ? "oscuro" : "claro"}`
                      ];
            }
            const mode = arg.toLowerCase();
            if (mode === "dark" || mode === "oscuro") {
                aplicarTema("oscuro");
                return _isEn ? ["[SYSTEM] Theme set to: DARK"] : ["[SISTEMA] Tema configurado en: OSCURO"];
            } else if (mode === "light" || mode === "claro") {
                aplicarTema("claro");
                return _isEn ? ["[SYSTEM] Theme set to: LIGHT"] : ["[SISTEMA] Tema configurado en: CLARO"];
            } else {
                return _isEn
                    ? ["[ERROR] Invalid argument. Choose 'light' or 'dark'."]
                    : ["[ERROR] Argumento no válido. Elige 'claro' u 'oscuro'."];
            }
        },
        lang: (arg) => {
            const _isEn = document.documentElement.lang === "en";
            if (!arg) {
                return _isEn
                    ? [
                          "lang [en/es] - Switch language",
                          `Current: ${document.documentElement.lang}`
                      ]
                    : [
                          "idioma [es/en] - Cambiar idioma",
                          `Actual: ${document.documentElement.lang}`
                      ];
            }
            const nextLang = arg.toLowerCase();
            if (nextLang === "en" || nextLang === "es") {
                if (window.translatePage) {
                    window.translatePage(nextLang);
                    return nextLang === "en"
                        ? ["[SYSTEM] Language set to: English"]
                        : ["[SISTEMA] Idioma configurado en: Español"];
                } else {
                    return ["[ERROR] Translation engine not loaded."];
                }
            } else {
                return _isEn
                    ? ["[ERROR] Invalid argument. Choose 'es' or 'en'."]
                    : ["[ERROR] Argumento no válido. Elige 'es' o 'en'."];
            }
        },
        integrity: () => {
            const _isEn = document.documentElement.lang === "en";
            return _isEn
                ? [
                      "[SCAN] Starting system integrity scan...",
                      "[SCAN] CSP Check: PASSED",
                      "[SCAN] SRI Verification: PASSED",
                      "[SCAN] Phantom Protocol: ACTIVE",
                      "[SYSTEM] Status: 100% SECURE.",
                  ]
                : [
                      "[SCAN] Iniciando escaneo de integridad...",
                      "[SCAN] CSP Check: PASADO",
                      "[SCAN] SRI Verification: PASADO",
                      "[SCAN] Protocolo Fantasma: ACTIVO",
                      "[SISTEMA] Estado: 100% SEGURO.",
                  ];
        },
        clear: () => {
            output.innerHTML = '<canvas id="t-canvas"></canvas>';
            return [];
        },
        exit: () => {
            resetTerminal(); // Misma lógica que el botón rojo
            toggleTerminal(); // Cierre instantáneo
            return [];
        },
    };

    toggle.onclick = toggleTerminal;
    minBtn.onclick = toggleTerminal;
    closeBtn.onclick = () => {
        resetTerminal();
        toggleTerminal();
    };

    input.addEventListener("keydown", (e) => {
        // Sonido de clic sutil por cada tecla pulsada
        playTick(450, 0.015);

        if (e.key === "Enter") {
            const trimmed = input.value.trim();
            const parts = trimmed.split(/\s+/);
            const rawCmd = parts[0].toLowerCase();
            const arg = parts.slice(1).join(" ");
            addLine(`visitor@phantom:~$ ${trimmed}`, "t-prompt");

            let cmd = rawCmd;
            const _isEn = document.documentElement.lang === "en";

            const esToEnMap = {
                ayuda: "help",
                quiensoy: "whoami",
                proyectos: "projects",
                tema: "theme",
                idioma: "lang",
                integridad: "integrity",
                limpiar: "clear",
                salir: "exit"
            };

            if (!_isEn && esToEnMap[rawCmd]) {
                cmd = esToEnMap[rawCmd];
            }

            if (commands[cmd]) {
                const results = commands[cmd](arg);
                results.forEach((res) => addLine(res));
            } else if (rawCmd !== "") {
                addLine(
                    _isEn
                        ? `[ERROR] Command not found: ${rawCmd}`
                        : `[ERROR] Comando no encontrado: ${rawCmd}`,
                );
            }

            input.value = "";
        }
    });

    // --- Soporte de Arrastre Básico ---
    const dragHeader = document.getElementById("terminal-drag");
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    dragHeader.onmousedown = dragStart;
    document.onmouseup = dragEnd;
    document.onmousemove = drag;

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            terminal.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    }
}

// Ejecutar inmediatamente si el DOM ya está listo (evitar fallos con scripts de tipo module)
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupTerminal);
} else {
    setupTerminal();
}

/**
 * Efecto de lluvia digital (Matrix) en tonos dorados.
 */
function startMatrix(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const katakana = '01ABCDEFΣΩΔΨΦΠ$#@';
    const alphabet = katakana.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(11, 15, 26, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = alphabet[Math.floor(Math.random() * alphabet.length)];
            
            // Dorado con destellos blancos
            ctx.fillStyle = Math.random() > 0.98 ? '#fff' : '#d4a63a';

            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    setInterval(draw, 35);
}
