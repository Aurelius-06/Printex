/**
 * PRINTX - Application Core Controller (Awwwards SOTD Polish & PT-BR Localization)
 * Lenis Inertia Scroll, GSAP ScrollTrigger Timelines, Web Audio API Synth Engine,
 * Liquid Magnetic Cursor, Dynamic Curtain Wipes, Kinetic Typography,
 * Comprehensive i18n Engine (EN / PT-BR), Interactive Typing Simulator, and G-Code Terminal.
 */

(function () {
    'use strict';

    // Global App State
    const AppState = {
        lang: localStorage.getItem('printx_lang') || 'pt', // Default to Portuguese for academic A1
        audioEnabled: localStorage.getItem('printx_audio') === 'true',
        audioCtx: null,
        lenis: null,
        fps: 60,
        frameCount: 0,
        lastFpsUpdate: performance.now(),
        cursor: {
            dot: null,
            ring: null,
            text: null,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            ringX: window.innerWidth / 2,
            ringY: window.innerHeight / 2
        }
    };

    /* ==========================================================================
       I18N BILINGUAL DICTIONARY (EN / PT-BR)
       ========================================================================== */
    const I18N = {
        en: {
            nav_overview: "Overview",
            nav_history: "History",
            nav_fundamentals: "Fundamentals",
            nav_summary: "Spec Matrix",
            sound_on: "SOUND: ON",
            sound_muted: "SOUND: MUTED",
            hud_system: "SYS // PRINT-X.PRECISION.CORE",
            hud_tolerance: "GEOMETRIC RES // 0.005 MM",
            hud_render: "RENDER // WEBGL THREE.JS SHADER",
            badge_academic: "ACADEMIC ACTIVITY A1 // MECHANICAL ENGINEERING",
            hero_title_1: "ENGINEERING",
            hero_title_2: "THE PRINTED WORD",
            hero_title_3: "& ADDITIVE LATTICE",
            hero_desc: "An editorial interactive deep dive dissecting solenoid mechanical impact, picoliter-volume drop-on-demand fluidics, 6-stage electrophotographic xerography, and layer-by-layer additive photopolymerization.",
            btn_explore: "Launch 3D Simulators",
            btn_compare: "Compare Spec Matrix",
            btn_history: "Chronology (1968–2026)",
            telemetry_res: "Max Droplet Resolution",
            telemetry_pico: "Picoliter Droplet Volume",
            telemetry_laser: "Laser Drum Exposure Bias",
            telemetry_sla: "SLA Photopolymer Wavelength",
            tax_title: "Four Core Printing Paradigms",
            tax_sub: "Scroll vertically to traverse our horizontal engineering showcase across physical impact, liquid micro-jets, optical toner, and additive layers.",
            card_1_cat: "Impact Mechanics",
            card_1_title: "Dot Matrix Printhead",
            card_1_desc: "Solenoid-actuated tungsten needles striking fabric ribbon directly against multi-part paper sheets, synthesizing high-pressure carbon copies.",
            card_1_spec_1: "Solenoid Coil Pulses",
            card_1_spec_2: "100 – 600 CPS",
            card_1_spec_3: "Multipart Carbon Forms",
            card_1_link: "Inspect Solenoid Simulator →",
            card_2_cat: "Micro-Fluidics",
            card_2_title: "Drop-on-Demand Inkjet",
            card_2_desc: "Microscopic fluidic ejection governed either by 300°C vapor bubble nucleation (Thermal) or reverse piezoelectric ceramic deformation (Piezo).",
            card_2_spec_1: "15 – 25 Microns",
            card_2_spec_2: "1.0 – 5.0 Picoliters",
            card_2_spec_3: "Continuous Color Gamut",
            card_2_link: "Compare Thermal vs Piezo →",
            card_3_cat: "Electrophotography",
            card_3_title: "Laser Xerography",
            card_3_desc: "A rotating organic photoconductor (OPC) drum manipulated by laser discharge, electrostatic toner attraction, and heated fusing pressure rollers.",
            card_3_spec_1: "-600V Primary Charge",
            card_3_spec_2: "180°C – 210°C",
            card_3_spec_3: "High Speed (70+ PPM)",
            card_3_link: "Run 6-Step Drum Cycle →",
            card_4_cat: "Additive Manufacturing",
            card_4_title: "FDM & SLA 3D Printing",
            card_4_desc: "Layer-by-layer geometric synthesis via thermoplastic extrusion (FDM) or selective 405nm ultraviolet photopolymer crosslinking (SLA).",
            card_4_spec_1: "10 – 200 Microns",
            card_4_spec_2: "Cartesian G-Code",
            card_4_spec_3: "Geometric Complexity",
            card_4_link: "Simulate G-Code Toolpaths →",
            history_hero_badge: "HISTORICAL TAXONOMY // 1968 TO MODERN DAY",
            history_title_1: "CHRONOLOGICAL",
            history_title_2: "EVOLUTION OF PRINT",
            history_desc: "Follow the scrubbed optical trace line across 6 decades of mechanical solenoids, micro-fluidic vaporization, electrophotography, and photopolymer lasers.",
            fund_hero_badge: "PHYSICAL MECHANICS • INTERACTIVE LABORATORY",
            fund_title_1: "PHYSICS & SCHEMATICS",
            fund_title_2: "MECHANICAL DEEP DIVE",
            fund_desc: "Interact directly with functional engineering simulations of solenoid pin strike velocity, micro-fluidic vapor nucleation, 6-step xerographic charge transfer, and G-code additive toolpaths.",
            sum_hero_badge: "QUANTITATIVE BENCHMARKS • SPECIFICATION MATRIX",
            sum_title_1: "COMPARATIVE",
            sum_title_2: "DATA & METRICS MATRIX",
            sum_desc: "Filter, search, and benchmark engineering tolerances, throughput speeds (PPM/CPS), consumable overhead, and resolution metrics side by side."
        },
        pt: {
            nav_overview: "Visão Geral",
            nav_history: "História",
            nav_fundamentals: "Fundamentos",
            nav_summary: "Matriz de Specs",
            sound_on: "SOM: ATIVADO",
            sound_muted: "SOM: MUDO",
            hud_system: "SISTEMA // NÚCLEO.PRECISÃO.PRINT-X",
            hud_tolerance: "TOLERÂNCIA GEOMÉTRICA // 0.005 MM",
            hud_render: "RENDER // SHADER WEBGL THREE.JS",
            badge_academic: "ATIVIDADE ACADÊMICA A1 // ENGENHARIA MECÂNICA & COMPUTAÇÃO",
            hero_title_1: "ENGENHARIA",
            hero_title_2: "DA PALAVRA IMPRESSA",
            hero_title_3: "& MANUFATURA ADITIVA",
            hero_desc: "Uma imersão editorial interativa dissecando o impacto mecânico por solenoides, microfluídica gota-por-demanda picolitro, xerografia eletrofotográfica em 6 etapas e fotopolimerização aditiva 3D camada por camada.",
            btn_explore: "Iniciar Simuladores 3D",
            btn_compare: "Comparar Matriz de Specs",
            btn_history: "Cronologia (1968–2026)",
            telemetry_res: "Resolução Máxima de Gotas",
            telemetry_pico: "Volume por Gota Picolitro",
            telemetry_laser: "Tensão de Carga do Cilindro",
            telemetry_sla: "Comprimento de Onda UV SLA",
            tax_title: "Quatro Paradigmas Fundamentais",
            tax_sub: "Role verticalmente para percorrer nossa vitrine horizontal de engenharia através do impacto físico, microjatos líquidos, toner óptico e camadas aditivas.",
            card_1_cat: "Mecânica de Impacto",
            card_1_title: "Cabeçote Matricial",
            card_1_desc: "Agulhas de tungstênio acionadas por solenoides impactando fita entintada diretamente contra formulários contínuos, sintetizando vias carbonadas sob pressão mecânica.",
            card_1_spec_1: "Pulsos Eletromagnéticos",
            card_1_spec_2: "100 – 600 Caracteres/s",
            card_1_spec_3: "Vias Múltiplas de Carbono",
            card_1_link: "Inspecionar Simulador Matricial →",
            card_2_cat: "Microfluídica",
            card_2_title: "Jato de Tinta por Demanda",
            card_2_desc: "Expulsão microscópica de fluido governada por nucleação de bolhas de vapor a 300°C (Térmica) ou deformação mecânica de cristal piezelétrico (Piezo).",
            card_2_spec_1: "Orifício de 15 a 25 Microns",
            card_2_spec_2: "Gotículas de 1.0 a 5.0 pL",
            card_2_spec_3: "Gama Contínua de Cores",
            card_2_link: "Comparar Térmico vs Piezo →",
            card_3_cat: "Eletrofotografia",
            card_3_title: "Xerografia a Laser",
            card_3_desc: "Cilindro fotorreceptor orgânico (OPC) rotativo sensibilizado por varredura laser, atração eletrostática de pó de toner e rolos térmicos de fusão.",
            card_3_spec_1: "Carga Primária de -600V",
            card_3_spec_2: "Fusão a 180°C – 210°C",
            card_3_spec_3: "Alta Velocidade (70+ PPM)",
            card_3_link: "Executar Ciclo de 6 Etapas →",
            card_4_cat: "Manufatura Aditiva",
            card_4_title: "Impressão 3D FDM & SLA",
            card_4_desc: "Síntese geométrica aditiva camada por camada via extrusão de filamento termoplástico (FDM) ou cura ultravioleta 405nm de resina fotopolimérica (SLA).",
            card_4_spec_1: "Resolução Z de 10 a 200 µm",
            card_4_spec_2: "Trajetória G-Code Cartesiana",
            card_4_spec_3: "Complexidade Geométrica Livre",
            card_4_link: "Simular Trajetória G-Code →",
            history_hero_badge: "TAXONOMIA HISTÓRICA // 1968 AO PRESENTE",
            history_title_1: "EVOLUÇÃO",
            history_title_2: "CRONOLÓGICA DA IMPRESSÃO",
            history_desc: "Acompanhe o traço óptico através de 6 décadas de solenoides mecânicos, vaporização microfluídica, eletrofotografia a laser e polímeros aditivos.",
            fund_hero_badge: "MECÂNICA FÍSICA • LABORATÓRIO INTERATIVO",
            fund_title_1: "FÍSICA & ESQUEMAS",
            fund_title_2: "DISSECAÇÃO MECÂNICA",
            fund_desc: "Interaja diretamente com simulações de engenharia: velocidade do disparo de agulha solenoide, nucleação de bolha térmica, transferência de carga eletrostática e trajetórias G-Code.",
            sum_hero_badge: "BENCHMARKS QUANTITATIVOS • MATRIZ DE SPECS",
            sum_title_1: "MATRIZ",
            sum_title_2: "DE DADOS & COMPARAÇÃO",
            sum_desc: "Filtre, pesquise e analise tolerâncias de engenharia, velocidade de produção (PPM/CPS), custo de consumíveis e densidade de resolução lado a lado."
        }
    };

    /* ==========================================================================
       1. WEB AUDIO API SYNTHESIS ENGINE
       ========================================================================== */
    const SoundEngine = {
        init() {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass && !AppState.audioCtx) {
                AppState.audioCtx = new AudioContextClass();
            }
        },

        ensureContext() {
            if (!AppState.audioCtx) {
                this.init();
            }
            if (AppState.audioCtx && AppState.audioCtx.state === 'suspended') {
                AppState.audioCtx.resume();
            }
        },

        playHoverBlip(freqStart = 880, freqEnd = 1320, duration = 0.045) {
            if (!AppState.audioEnabled) return;
            this.ensureContext();
            if (!AppState.audioCtx) return;

            try {
                const ctx = AppState.audioCtx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);

                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + duration);
            } catch (e) {
                console.error(e);
            }
        },

        playClickBeep() {
            if (!AppState.audioEnabled) return;
            this.ensureContext();
            if (!AppState.audioCtx) return;

            try {
                const ctx = AppState.audioCtx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.06);

                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.06);
            } catch (e) {
                console.error(e);
            }
        },

        playStrike() {
            if (!AppState.audioEnabled) return;
            this.ensureContext();
            if (!AppState.audioCtx) return;

            try {
                const ctx = AppState.audioCtx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'square';
                osc.frequency.setValueAtTime(320, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);

                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            } catch (e) {
                console.error(e);
            }
        },

        playBubble() {
            if (!AppState.audioEnabled) return;
            this.ensureContext();
            if (!AppState.audioCtx) return;

            try {
                const ctx = AppState.audioCtx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.05);
                osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

                gain.gain.setValueAtTime(0.07, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            } catch (e) {
                console.error(e);
            }
        },

        playLaser() {
            if (!AppState.audioEnabled) return;
            this.ensureContext();
            if (!AppState.audioCtx) return;

            try {
                const ctx = AppState.audioCtx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1800, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(3400, ctx.currentTime + 0.07);

                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.07);
            } catch (e) {
                console.error(e);
            }
        },

        playExtrude() {
            if (!AppState.audioEnabled) return;
            this.ensureContext();
            if (!AppState.audioCtx) return;

            try {
                const ctx = AppState.audioCtx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'square';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                osc.frequency.setValueAtTime(220, ctx.currentTime + 0.02);

                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.04);
            } catch (e) {
                console.error(e);
            }
        },

        playMilestoneWarp() {
            if (!AppState.audioEnabled) return;
            this.ensureContext();
            if (!AppState.audioCtx) return;

            try {
                const ctx = AppState.audioCtx;
                const freqs = [440, 659.25, 880];
                freqs.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.25);

                    gain.gain.setValueAtTime(0.03 / (idx + 1), ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start();
                    osc.stop(ctx.currentTime + 0.25);
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    /* ==========================================================================
       2. I18N LOCALIZATION SWITCHER
       ========================================================================== */
    function initLanguageEngine() {
        const langBtn = document.querySelector('.lang-toggle-btn');

        const updateLanguageUI = () => {
            const currentLang = AppState.lang;
            document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en';

            if (langBtn) {
                langBtn.querySelector('.lang-label').textContent = currentLang.toUpperCase();
                langBtn.querySelector('.lang-flag').textContent = currentLang === 'pt' ? '🇧🇷' : '🇺🇸';
            }

            const dict = I18N[currentLang] || I18N.en;

            // Update all DOM elements with data-i18n
            document.querySelectorAll('[data-i18n]').forEach((el) => {
                const key = el.getAttribute('data-i18n');
                if (dict[key]) {
                    if (el.classList.contains('kinetic-title')) {
                        buildKineticTitle(el, dict[key]);
                    } else {
                        el.textContent = dict[key];
                    }
                }
            });

            // Update sound button label
            const soundText = document.querySelector('.audio-state-text');
            if (soundText) {
                soundText.textContent = AppState.audioEnabled ? dict.sound_on : dict.sound_muted;
            }
        };

        updateLanguageUI();

        if (langBtn) {
            langBtn.addEventListener('click', () => {
                AppState.lang = AppState.lang === 'pt' ? 'en' : 'pt';
                localStorage.setItem('printx_lang', AppState.lang);
                SoundEngine.playHoverBlip(1200, 1600);
                updateLanguageUI();
            });
        }
    }

    /* ==========================================================================
       3. LENIS SMOOTH INERTIA SCROLL & GSAP SYNC
       ========================================================================== */
    function initScrollEngine() {
        if (!window.Lenis) {
            console.warn('[Scroll Engine] Lenis not detected.');
            return;
        }

        AppState.lenis = new Lenis({
            duration: 1.25,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.8
        });

        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);

            AppState.lenis.on('scroll', (e) => {
                ScrollTrigger.update();
                if (window.PrinterCanvas3D) {
                    window.PrinterCanvas3D.updateScroll(e.scroll, e.velocity);
                }
                updateSystemHudScroll(e.scroll);
            });

            gsap.ticker.add((time) => {
                AppState.lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                AppState.lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        console.log('[Scroll Engine] Lenis inertia scroll synchronized with GSAP.');
    }

    /* ==========================================================================
       4. SYSTEM HUD WIDGET (FPS & SCROLL TRACKER)
       ========================================================================== */
    function initSystemHud() {
        let hud = document.querySelector('.system-hud-bottom');
        if (!hud) {
            hud = document.createElement('div');
            hud.className = 'system-hud-bottom';
            hud.innerHTML = `
                <div>FPS: <span id="hud-fps-val">60</span></div>
                <div>SCROLL: <span id="hud-scroll-val">0%</span></div>
                <div>MODE: <span id="hud-mode-val">A1.PT_BR</span></div>
            `;
            document.body.appendChild(hud);
        }

        // FPS calculation loop
        function updateFps() {
            AppState.frameCount++;
            const now = performance.now();
            if (now - AppState.lastFpsUpdate >= 1000) {
                AppState.fps = Math.round((AppState.frameCount * 1000) / (now - AppState.lastFpsUpdate));
                const fpsEl = document.getElementById('hud-fps-val');
                if (fpsEl) fpsEl.textContent = AppState.fps;
                AppState.frameCount = 0;
                AppState.lastFpsUpdate = now;
            }
            requestAnimationFrame(updateFps);
        }
        updateFps();
    }

    function updateSystemHudScroll(scrollY) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = totalHeight > 0 ? Math.round((scrollY / totalHeight) * 100) : 0;
        const scrollEl = document.getElementById('hud-scroll-val');
        if (scrollEl) scrollEl.textContent = `${Math.min(100, Math.max(0, percent))}%`;
    }

    /* ==========================================================================
       5. LIQUID-TRAILING MAGNETIC CURSOR
       ========================================================================== */
    function initLiquidCursor() {
        let dot = document.querySelector('.custom-cursor-dot');
        let ring = document.querySelector('.custom-cursor-ring');

        if (!dot) {
            dot = document.createElement('div');
            dot.className = 'custom-cursor-dot';
            document.body.appendChild(dot);
        }

        if (!ring) {
            ring = document.createElement('div');
            ring.className = 'custom-cursor-ring';
            ring.innerHTML = '<span class="cursor-text">VIEW</span>';
            document.body.appendChild(ring);
        }

        AppState.cursor.dot = dot;
        AppState.cursor.ring = ring;
        AppState.cursor.text = ring.querySelector('.cursor-text');

        window.addEventListener('mousemove', (e) => {
            AppState.cursor.x = e.clientX;
            AppState.cursor.y = e.clientY;

            dot.style.left = `${e.clientX}px`;
            dot.style.top = `${e.clientY}px`;
        });

        function renderCursorRing() {
            AppState.cursor.ringX += (AppState.cursor.x - AppState.cursor.ringX) * 0.18;
            AppState.cursor.ringY += (AppState.cursor.y - AppState.cursor.ringY) * 0.18;

            ring.style.left = `${AppState.cursor.ringX}px`;
            ring.style.top = `${AppState.cursor.ringY}px`;

            requestAnimationFrame(renderCursorRing);
        }
        renderCursorRing();

        bindCursorInteractions();
    }

    function bindCursorInteractions() {
        const ring = AppState.cursor.ring;
        const textSpan = AppState.cursor.text;
        if (!ring) return;

        const interactives = document.querySelectorAll('a, button, .interactive-card, .milestone-node-circle, .sim-btn, .x-step-btn');

        interactives.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                SoundEngine.playHoverBlip(880, 1100);

                const cursorText = el.getAttribute('data-cursor') || '';
                if (cursorText) {
                    textSpan.textContent = cursorText;
                    ring.classList.add('active');
                } else {
                    ring.classList.add('hover-glow');
                }
            });

            el.addEventListener('mouseleave', () => {
                ring.classList.remove('active');
                ring.classList.remove('hover-glow');
            });

            el.addEventListener('click', () => {
                SoundEngine.playClickBeep();
            });
        });
    }

    /* ==========================================================================
       6. DYNAMIC PAGE TRANSITION CURTAIN WIPES
       ========================================================================== */
    function initPageTransitions() {
        let curtain = document.querySelector('.page-curtain');
        if (!curtain) {
            curtain = document.createElement('div');
            curtain.className = 'page-curtain';
            curtain.innerHTML = `
                <div class="curtain-bar"></div>
                <div class="curtain-brand">PRINTX // PRECISION ENGINE</div>
            `;
            document.body.appendChild(curtain);
        }

        if (window.gsap) {
            gsap.set(curtain, { y: '0%' });
            gsap.to(curtain, {
                y: '-100%',
                duration: 0.85,
                ease: 'power4.inOut',
                onComplete: () => {
                    gsap.set(curtain, { y: '100%' });
                }
            });
        }

        document.querySelectorAll('a').forEach((link) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('http')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    SoundEngine.playClickBeep();

                    if (window.gsap) {
                        gsap.set(curtain, { y: '100%' });
                        gsap.to(curtain, {
                            y: '0%',
                            duration: 0.6,
                            ease: 'power3.inOut',
                            onComplete: () => {
                                window.location.href = href;
                            }
                        });
                    } else {
                        window.location.href = href;
                    }
                });
            }
        });
    }

    /* ==========================================================================
       7. KINETIC VARIABLE TYPOGRAPHY SPLIT REVEAL
       ========================================================================== */
    function buildKineticTitle(titleEl, text) {
        const rawText = (text !== undefined ? text : titleEl.textContent).trim();
        if (!rawText) return;

        titleEl.innerHTML = '';

        const words = rawText.split(' ');
        words.forEach((word, wIdx) => {
            if (wIdx > 0) {
                // Real space node to prevent word concatenation
                titleEl.appendChild(document.createTextNode(' '));
            }

            const wordWrap = document.createElement('span');
            wordWrap.className = 'word-wrap';
            wordWrap.style.display = 'inline-block';
            wordWrap.style.whiteSpace = 'nowrap';

            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const mask = document.createElement('span');
                mask.className = 'char-mask';
                mask.style.display = 'inline-block';
                mask.style.overflow = 'hidden';
                mask.style.verticalAlign = 'bottom';

                const inner = document.createElement('span');
                inner.className = 'char-inner';
                inner.textContent = char;
                inner.style.display = 'inline-block';

                mask.appendChild(inner);
                wordWrap.appendChild(mask);
            }

            titleEl.appendChild(wordWrap);
        });

        if (window.gsap) {
            const charInners = titleEl.querySelectorAll('.char-inner');
            const rect = titleEl.getBoundingClientRect();

            // If title is already visible or in the top viewport fold, animate immediately!
            if (rect.top < window.innerHeight * 0.9) {
                gsap.fromTo(charInners,
                    { y: '105%', opacity: 0 },
                    {
                        y: '0%',
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out',
                        stagger: 0.015,
                        delay: 0.1
                    }
                );
            } else if (window.ScrollTrigger) {
                gsap.fromTo(charInners,
                    { y: '105%', opacity: 0 },
                    {
                        y: '0%',
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out',
                        stagger: 0.015,
                        scrollTrigger: {
                            trigger: titleEl,
                            start: 'top 88%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        }
    }

    function initKineticTypography() {
        const kineticTitles = document.querySelectorAll('.kinetic-title');
        if (!kineticTitles.length) return;

        kineticTitles.forEach((title) => {
            // If already initialized with char-inner, skip to prevent double wrapping
            if (!title.querySelector('.char-inner')) {
                buildKineticTitle(title);
            }
        });
    }

    /* ==========================================================================
       8. AUDIO CONTROLLER TOGGLE
       ========================================================================== */
    function initAudioToggle() {
        const audioBtn = document.querySelector('.audio-toggle-btn');
        if (!audioBtn) return;

        const updateBtnUI = () => {
            const dict = I18N[AppState.lang] || I18N.en;
            if (AppState.audioEnabled) {
                audioBtn.classList.add('sound-on');
                audioBtn.querySelector('.audio-state-text').textContent = dict.sound_on;
            } else {
                audioBtn.classList.remove('sound-on');
                audioBtn.querySelector('.audio-state-text').textContent = dict.sound_muted;
            }
        };

        updateBtnUI();

        audioBtn.addEventListener('click', () => {
            AppState.audioEnabled = !AppState.audioEnabled;
            localStorage.setItem('printx_audio', AppState.audioEnabled ? 'true' : 'false');
            updateBtnUI();

            if (AppState.audioEnabled) {
                SoundEngine.ensureContext();
                SoundEngine.playHoverBlip(1200, 1600);
            }
        });
    }

    /* ==========================================================================
       9. PAGE 1: INDEX HORIZONTAL SCROLL PINNING
       ========================================================================== */
    function initHorizontalScrollPin() {
        const section = document.querySelector('.horizontal-section');
        const track = document.querySelector('.horizontal-track');
        if (!section || !track || !window.gsap || !window.ScrollTrigger) return;

        const getScrollDistance = () => track.scrollWidth - window.innerWidth + 120;

        gsap.to(track, {
            x: () => -getScrollDistance(),
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: () => `+=${getScrollDistance()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                anticipatePin: 1
            }
        });

        console.log('[Horizontal Showcase] GSAP ScrollTrigger horizontal pinning attached.');
    }

    /* ==========================================================================
       10. PAGE 2: HISTORY SCRUBBED SVG TIMELINE & MILESTONES
       ========================================================================== */
    function initHistoryTimeline() {
        const scrubPath = document.querySelector('.timeline-scrub-line');
        const timelineWrap = document.querySelector('.history-timeline-section');
        if (!scrubPath || !timelineWrap || !window.gsap || !window.ScrollTrigger) return;

        const pathLength = scrubPath.getTotalLength();
        scrubPath.style.strokeDasharray = pathLength;
        scrubPath.style.strokeDashoffset = pathLength;

        gsap.to(scrubPath, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: timelineWrap,
                start: 'top 40%',
                end: 'bottom 85%',
                scrub: 0.5
            }
        });

        const milestoneNodes = document.querySelectorAll('.milestone-node-circle');
        milestoneNodes.forEach((node, idx) => {
            node.addEventListener('mouseenter', () => {
                SoundEngine.playMilestoneWarp();
                if (window.PrinterCanvas3D) {
                    const colors = [0x00f0ff, 0x6e00ff, 0xff007a, 0x00ffaa];
                    window.PrinterCanvas3D.triggerDistortion(1.8, colors[idx % colors.length]);
                }
            });
        });
    }

    /* ==========================================================================
       11. PAGE 3: FUNDAMENTALS INTERACTIVE SIMULATORS
       ========================================================================== */
    function initFundamentalsSimulators() {
        const dotCanvas = document.getElementById('dot-matrix-canvas');
        if (dotCanvas) initDotMatrixSimulator(dotCanvas);

        const inkjetCanvas = document.getElementById('inkjet-fluid-canvas');
        if (inkjetCanvas) initInkjetSimulator(inkjetCanvas);

        const laserCanvas = document.getElementById('xerography-canvas');
        if (laserCanvas) initXerographySimulator(laserCanvas);

        // 3D Printer Studio — WebGL engine wired to Printer3DStudio
        initPrinter3DStudio();
    }

    // Dot Matrix Solenoid Strike & Typing Terminal Logic
    function initDotMatrixSimulator(canvas) {
        const ctx = canvas.getContext('2d');
        let pinPos = 0;
        let isStriking = false;
        let continuousInterval = null;
        let printedDots = [];

        function resize() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight || 380;
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const w = canvas.width;
            const h = canvas.height;
            const midY = h / 2;

            // Solenoid Coil Housing
            ctx.fillStyle = '#101522';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.fillRect(40, midY - 60, 140, 120);
            ctx.strokeRect(40, midY - 60, 140, 120);

            // Copper Coil Windings
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 3;
            for (let x = 55; x < 170; x += 14) {
                ctx.beginPath();
                ctx.moveTo(x, midY - 50);
                ctx.lineTo(x, midY + 50);
                ctx.stroke();
            }

            // Needle Pin
            const needleX = 140 + pinPos * 75;
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(needleX, midY - 4, 110, 8);

            // Needle Tip
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.moveTo(needleX + 110, midY - 4);
            ctx.lineTo(needleX + 120, midY);
            ctx.lineTo(needleX + 110, midY + 4);
            ctx.fill();

            // Inked Fabric Ribbon
            ctx.fillStyle = '#7000ff';
            ctx.fillRect(280, midY - 110, 8, 220);

            // Continuous Paper Platen
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(305, midY - 130, 14, 260);

            // Sheets 1 & 2
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(322, midY - 130, 5, 260);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(330, midY - 130, 4, 260);

            if (pinPos > 0.85) {
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(300, midY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Render printed dots
            ctx.fillStyle = '#00f0ff';
            printedDots.forEach((dot) => {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(draw);
        }
        draw();

        function triggerStrike() {
            if (isStriking) return;
            isStriking = true;
            SoundEngine.playStrike();

            if (window.gsap) {
                gsap.to({ val: 0 }, {
                    val: 1,
                    duration: 0.05,
                    ease: 'power2.in',
                    onUpdate: function () { pinPos = this.targets()[0].val; },
                    onComplete: () => {
                        printedDots.push({
                            x: 325,
                            y: (canvas.height / 2) + (Math.random() - 0.5) * 80
                        });
                        if (printedDots.length > 40) printedDots.shift();

                        gsap.to({ val: 1 }, {
                            val: 0,
                            duration: 0.08,
                            ease: 'power2.out',
                            onUpdate: function () { pinPos = this.targets()[0].val; },
                            onComplete: () => { isStriking = false; }
                        });
                    }
                });
            }
        }

        const fireBtn = document.getElementById('btn-dot-single-strike');
        const contBtn = document.getElementById('btn-dot-continuous');
        if (fireBtn) fireBtn.addEventListener('click', triggerStrike);
        if (contBtn) {
            contBtn.addEventListener('click', () => {
                if (continuousInterval) {
                    clearInterval(continuousInterval);
                    continuousInterval = null;
                    contBtn.classList.remove('active');
                } else {
                    contBtn.classList.add('active');
                    continuousInterval = setInterval(triggerStrike, 140);
                }
            });
        }

        // Typing Terminal Input
        const textInput = document.getElementById('dot-matrix-text-input');
        const printTextBtn = document.getElementById('btn-print-custom-text');
        if (printTextBtn && textInput) {
            printTextBtn.addEventListener('click', () => {
                const text = textInput.value || 'PRINTX';
                let charIdx = 0;
                const typeInterval = setInterval(() => {
                    if (charIdx >= text.length) {
                        clearInterval(typeInterval);
                        return;
                    }
                    triggerStrike();
                    charIdx++;
                }, 120);
            });
        }
    }

    // Inkjet Simulator Logic (Thermal vs Piezo & Slow-Mo)
    function initInkjetSimulator(canvas) {
        const ctx = canvas.getContext('2d');
        let mode = 'thermal';
        let cycleProgress = 0;
        let droplets = [];
        let isSlowMo = false;

        function resize() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight || 380;
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const w = canvas.width;
            const h = canvas.height;
            const midX = w / 2;

            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 3;

            // Left Chamber
            ctx.beginPath();
            ctx.moveTo(midX - 120, 40);
            ctx.lineTo(midX - 30, 40);
            ctx.lineTo(midX - 12, 180);
            ctx.lineTo(midX - 12, 220);
            ctx.lineTo(midX - 120, 220);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Right Chamber
            ctx.beginPath();
            ctx.moveTo(midX + 120, 40);
            ctx.lineTo(midX + 30, 40);
            ctx.lineTo(midX + 12, 180);
            ctx.lineTo(midX + 12, 220);
            ctx.lineTo(midX + 120, 220);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Liquid Ink Reservoir
            ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
            ctx.beginPath();
            ctx.moveTo(midX - 28, 45);
            ctx.lineTo(midX + 28, 45);
            ctx.lineTo(midX + 11, 200);
            ctx.lineTo(midX - 11, 200);
            ctx.closePath();
            ctx.fill();

            if (mode === 'thermal') {
                const heaterGlow = cycleProgress > 0.1 && cycleProgress < 0.6;
                ctx.fillStyle = heaterGlow ? '#ef4444' : '#64748b';
                ctx.fillRect(midX - 25, 60, 50, 10);

                if (cycleProgress > 0.15 && cycleProgress < 0.85) {
                    const bubbleRadius = Math.sin((cycleProgress - 0.15) * Math.PI / 0.7) * 28;
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = '#00f0ff';
                    ctx.shadowBlur = 20;
                    ctx.beginPath();
                    ctx.arc(midX, 90, bubbleRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            } else {
                const piezoDeform = Math.sin(cycleProgress * Math.PI) * 12;
                ctx.fillStyle = '#8b5cf6';
                ctx.fillRect(midX - 35 + piezoDeform, 70, 70, 16);
            }

            // Droplets
            const dropSpeed = isSlowMo ? 1.5 : 6;
            droplets.forEach((d) => {
                d.y += dropSpeed;
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(midX, d.y, d.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            droplets = droplets.filter((d) => d.y < h - 20);

            // Paper substrate
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(midX - 160, h - 30, 320, 8);

            requestAnimationFrame(draw);
        }
        draw();

        function triggerExpulsion() {
            SoundEngine.playBubble();
            const duration = isSlowMo ? 1.4 : 0.45;
            if (window.gsap) {
                gsap.to({ p: 0 }, {
                    p: 1,
                    duration: duration,
                    ease: 'power1.inOut',
                    onUpdate: function () { cycleProgress = this.targets()[0].p; },
                    onComplete: () => {
                        cycleProgress = 0;
                        droplets.push({ y: 220, radius: 4 });
                    }
                });
            }
        }

        const modeBtnThermal = document.getElementById('btn-ink-thermal');
        const modeBtnPiezo = document.getElementById('btn-ink-piezo');
        const fireBtn = document.getElementById('btn-ink-fire');
        const slowMoBtn = document.getElementById('btn-ink-slowmo');

        if (modeBtnThermal) {
            modeBtnThermal.addEventListener('click', () => {
                mode = 'thermal';
                modeBtnThermal.classList.add('active');
                if (modeBtnPiezo) modeBtnPiezo.classList.remove('active');
            });
        }
        if (modeBtnPiezo) {
            modeBtnPiezo.addEventListener('click', () => {
                mode = 'piezo';
                modeBtnPiezo.classList.add('active');
                if (modeBtnThermal) modeBtnThermal.classList.remove('active');
            });
        }
        if (fireBtn) fireBtn.addEventListener('click', triggerExpulsion);
        if (slowMoBtn) {
            slowMoBtn.addEventListener('click', () => {
                isSlowMo = !isSlowMo;
                slowMoBtn.classList.toggle('active', isSlowMo);
                slowMoBtn.textContent = isSlowMo ? 'Slow-Mo: 100,000 FPS [ON]' : 'Slow-Mo: 100,000 FPS [OFF]';
            });
        }
    }

    // 6-Step Laser Xerography Simulator Logic
    function initXerographySimulator(canvas) {
        const ctx = canvas.getContext('2d');
        let currentStep = 1;
        let drumAngle = 0;

        function resize() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight || 420;
        }
        resize();
        window.addEventListener('resize', resize);

        const stepNames = [
            '1. CARGA (-600V CORONA)',
            '2. EXPOSIÇÃO LASER (IMAGEM LATENTE)',
            '3. REVELAÇÃO (ATRAÇÃO DE TONER)',
            '4. TRANSFERÊNCIA (+1000V PARA PAPEL)',
            '5. FUSÃO TÉRMICA (200°C CALOR & PRESSÃO)',
            '6. LIMPEZA & APAGAMENTO (LÂMINA)'
        ];

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const w = canvas.width;
            const h = canvas.height;
            const centerX = w / 2;
            const centerY = h / 2 - 20;
            const drumRadius = 110;

            drumAngle += 0.005;

            // OPC Drum
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(drumAngle);

            ctx.fillStyle = '#064e3b';
            ctx.beginPath();
            ctx.arc(0, 0, drumRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#059669';
            ctx.lineWidth = 4;
            ctx.stroke();

            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * drumRadius, Math.sin(a) * drumRadius);
                ctx.stroke();
            }
            ctx.restore();

            // 1. Charge Roller (-600V)
            ctx.fillStyle = currentStep === 1 ? '#00f0ff' : '#334155';
            ctx.beginPath();
            ctx.arc(centerX, centerY - drumRadius - 28, 22, 0, Math.PI * 2);
            ctx.fill();

            // 2. Laser Polygon Mirror Exposure
            if (currentStep === 2) {
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.moveTo(centerX + 180, centerY - 140);
                ctx.lineTo(centerX + 85, centerY - 70);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // 3. Developer Roller (Toner)
            ctx.fillStyle = currentStep === 3 ? '#a855f7' : '#334155';
            ctx.beginPath();
            ctx.arc(centerX + drumRadius + 30, centerY, 26, 0, Math.PI * 2);
            ctx.fill();

            // 4. Transfer Roller (+1000V)
            ctx.fillStyle = currentStep === 4 ? '#00ffaa' : '#334155';
            ctx.beginPath();
            ctx.arc(centerX, centerY + drumRadius + 32, 24, 0, Math.PI * 2);
            ctx.fill();

            // Paper Path
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(centerX - 160, centerY + drumRadius + 6, 320, 6);

            // 5. Heat Fuser Rollers
            ctx.fillStyle = currentStep === 5 ? '#f97316' : '#334155';
            ctx.beginPath();
            ctx.arc(centerX - 120, centerY + drumRadius + 6, 18, 0, Math.PI * 2);
            ctx.arc(centerX - 120, centerY + drumRadius + 42, 18, 0, Math.PI * 2);
            ctx.fill();

            // 6. Cleaning Wiper Blade
            ctx.fillStyle = currentStep === 6 ? '#e2e8f0' : '#475569';
            ctx.fillRect(centerX - drumRadius - 35, centerY - 60, 30, 8);

            requestAnimationFrame(draw);
        }
        draw();

        function setStep(stepNum) {
            currentStep = stepNum;
            SoundEngine.playLaser();

            document.querySelectorAll('.x-step-btn').forEach((btn, idx) => {
                if (idx + 1 === stepNum) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            const statusLabel = document.getElementById('x-step-status-label');
            if (statusLabel) {
                statusLabel.textContent = stepNames[stepNum - 1];
            }
        }

        document.querySelectorAll('.x-step-btn').forEach((btn, idx) => {
            btn.addEventListener('click', () => setStep(idx + 1));
        });

        const autoPlayBtn = document.getElementById('btn-xerography-cycle');
        if (autoPlayBtn) {
            let autoInterval = null;
            autoPlayBtn.addEventListener('click', () => {
                if (autoInterval) {
                    clearInterval(autoInterval);
                    autoInterval = null;
                    autoPlayBtn.classList.remove('active');
                } else {
                    autoPlayBtn.classList.add('active');
                    autoInterval = setInterval(() => {
                        let next = currentStep + 1;
                        if (next > 6) next = 1;
                        setStep(next);
                    }, 1400);
                }
            });
        }
    }

    /* ==========================================================================
       11b. INTERACTIVE 3D PRINTER STUDIO (WebGL Printer3DStudio Engine Wiring)
       ========================================================================= */
    function initPrinter3DStudio() {
        const studio = window.Printer3DStudio;
        if (!studio) return; // Engine not loaded

        // Initialize the WebGL engine onto our canvas
        studio.init('printer3d-canvas');

        // --- Helpers ---
        function appendGcodeLog(command) {
            const terminal = document.getElementById('gcode-terminal-box');
            if (!terminal) return;
            const line = document.createElement('div');
            line.className = 'gcode-line';
            line.textContent = command;
            terminal.appendChild(line);
            if (terminal.childNodes.length > 6) terminal.removeChild(terminal.firstChild);
            terminal.scrollTop = terminal.scrollHeight;
        }

        function setTelemetry(mode) {
            const modeEl = document.getElementById('telemetry-mode');
            const tempEl = document.getElementById('telemetry-temp');
            const badgeEl = document.getElementById('additive-layer-count');
            if (mode === 'fdm') {
                if (modeEl) modeEl.textContent = 'FDM — Extrusão Termoplástica';
                if (tempEl) tempEl.textContent = '215°C PLA';
                if (badgeEl) badgeEl.textContent = '3D STUDIO • FDM';
            } else {
                if (modeEl) modeEl.textContent = 'SLA — Fotopolimerização UV';
                if (tempEl) tempEl.textContent = 'UV 405 nm Laser';
                if (badgeEl) badgeEl.textContent = '3D STUDIO • SLA';
            }
        }

        // --- Progress bar animation loop (reads printProgress from RAF) ---
        let progressPoller = null;
        let localProgress = 0;
        let isPrinting = false;

        function startProgressPoll() {
            if (progressPoller) return;
            progressPoller = setInterval(() => {
                if (!isPrinting) return;
                localProgress = Math.min(1.0, localProgress + 0.001);
                const progressBar = document.getElementById('printer3d-progress');
                const progressLabel = document.getElementById('printer3d-progress-label');
                if (progressBar) progressBar.style.width = `${(localProgress * 100).toFixed(1)}%`;
                if (progressLabel) progressLabel.textContent = localProgress >= 0.999
                    ? 'IMPRESSÃO CONCLUÍDA ✓'
                    : `IMPRIMINDO • ${(localProgress * 100).toFixed(0)}%`;

                if (localProgress >= 1.0) {
                    isPrinting = false;
                    appendGcodeLog('M84 ; Motores Desligados — Impressão concluída');
                }
            }, 50);
        }
        startProgressPoll();

        // --- Camera Preset Pills ---
        const camPills = document.querySelectorAll('.cam-pill-btn');
        camPills.forEach((btn) => {
            btn.addEventListener('click', () => {
                SoundEngine.playClickBeep();
                const preset = btn.getAttribute('data-cam');
                studio.setCameraPreset(preset);
                camPills.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                appendGcodeLog(`; Câmera: ${preset.toUpperCase()} view ativada`);
            });
        });

        // --- FDM / SLA Mode Toggle ---
        const btnFdm = document.getElementById('btn-mode-fdm');
        const btnSla = document.getElementById('btn-mode-sla');
        if (btnFdm) {
            btnFdm.addEventListener('click', () => {
                SoundEngine.playHoverBlip(600, 900);
                studio.setMode('fdm');
                btnFdm.classList.add('active');
                if (btnSla) btnSla.classList.remove('active');
                setTelemetry('fdm');
                appendGcodeLog('M104 S215 ; Extrusor FDM aquecido a 215°C');
                appendGcodeLog('M140 S60  ; Mesa aquecida a 60°C');
                localProgress = 0;
                const pb = document.getElementById('printer3d-progress');
                if (pb) pb.style.width = '0%';
                const pl = document.getElementById('printer3d-progress-label');
                if (pl) pl.textContent = 'MODO FDM ATIVADO';
            });
        }
        if (btnSla) {
            btnSla.addEventListener('click', () => {
                SoundEngine.playLaser();
                studio.setMode('sla');
                btnSla.classList.add('active');
                if (btnFdm) btnFdm.classList.remove('active');
                setTelemetry('sla');
                appendGcodeLog('UV_LASER_ENABLE 1  ; Laser 405nm ligado');
                appendGcodeLog('EXPOSURE_MS 3.5    ; Tempo de exposição 3.5ms/layer');
                localProgress = 0;
                const pb = document.getElementById('printer3d-progress');
                if (pb) pb.style.width = '0%';
                const pl = document.getElementById('printer3d-progress-label');
                if (pl) pl.textContent = 'MODO SLA ATIVADO';
            });
        }

        // --- Print Controls ---
        const btnStart = document.getElementById('btn-printer-start');
        const btnPause = document.getElementById('btn-printer-pause');
        const btnReset = document.getElementById('btn-printer-reset');

        if (btnStart) {
            btnStart.addEventListener('click', () => {
                SoundEngine.playExtrude();
                studio.startPrint();
                isPrinting = true;
                btnStart.classList.add('active');
                if (btnPause) btnPause.classList.remove('active');
                appendGcodeLog('G1 F3000    ; Iniciando sequência de impressão');
                appendGcodeLog(`G1 X${(Math.random()*80+60).toFixed(1)} Y${(Math.random()*60+40).toFixed(1)} E0.000`);
                const pl = document.getElementById('printer3d-progress-label');
                if (pl) pl.textContent = 'IMPRIMINDO • 0%';
            });
        }
        if (btnPause) {
            btnPause.addEventListener('click', () => {
                SoundEngine.playClickBeep();
                studio.pausePrint();
                isPrinting = false;
                btnPause.classList.add('active');
                if (btnStart) btnStart.classList.remove('active');
                appendGcodeLog('M0         ; Pausa de impressão ativada');
                const pl = document.getElementById('printer3d-progress-label');
                if (pl) pl.textContent = 'EM PAUSA';
            });
        }
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                SoundEngine.playHoverBlip(440, 550);
                studio.resetPrint();
                isPrinting = false;
                localProgress = 0;
                if (btnStart) btnStart.classList.remove('active');
                if (btnPause) btnPause.classList.remove('active');
                const pb = document.getElementById('printer3d-progress');
                if (pb) pb.style.width = '0%';
                const pl = document.getElementById('printer3d-progress-label');
                if (pl) pl.textContent = 'AGUARDANDO IMPRESSÃO';
                appendGcodeLog('G28 X Y Z  ; Home all axes — Reset completo');
                appendGcodeLog('M84        ; Motores desligados');
                const progEl = document.getElementById('telemetry-progress');
                if (progEl) progEl.textContent = '0%';
            });
        }

        // --- Speed Pills ---
        const speedPills = document.querySelectorAll('.speed-pill');
        speedPills.forEach((pill) => {
            pill.addEventListener('click', () => {
                SoundEngine.playHoverBlip(800, 1200);
                const speed = parseFloat(pill.getAttribute('data-speed'));
                studio.setSpeed(speed);
                speedPills.forEach((p) => p.classList.remove('active'));
                pill.classList.add('active');
                appendGcodeLog(`M220 S${speed * 100} ; Velocidade definida a ${speed * 100}%`);
            });
        });

        // --- Live telemetry progress update from poll ---
        setInterval(() => {
            const progEl = document.getElementById('telemetry-progress');
            if (progEl) progEl.textContent = `${(localProgress * 100).toFixed(0)}%`;
        }, 200);

        // Auto-start the print loop so the 3D printer is animated from page load
        setTimeout(() => {
            studio.startPrint();
            isPrinting = true;
            const pl = document.getElementById('printer3d-progress-label');
            if (pl) pl.textContent = 'IMPRIMINDO • 0%';
            appendGcodeLog('G90        ; Posicionamento absoluto Cartesiano');
            appendGcodeLog('M109 S215  ; Aquecendo extrusor...');
        }, 800);
    }

    /* ==========================================================================
       12. PAGE 4: SUMMARY DYNAMIC MATRIX & COMPARISON ARENA
       ========================================================================= */
    function initSummaryMatrix() {
        const searchInput = document.getElementById('matrix-search-input');
        const tableBody = document.querySelector('.data-table tbody');
        const filterPills = document.querySelectorAll('.filter-pill');

        if (!tableBody) return;

        const tableRows = Array.from(tableBody.querySelectorAll('tr'));

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                tableRows.forEach((row) => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            });
        }

        filterPills.forEach((pill) => {
            pill.addEventListener('click', () => {
                filterPills.forEach((p) => p.classList.remove('active'));
                pill.classList.add('active');
                SoundEngine.playHoverBlip(1000, 1400);

                const category = pill.getAttribute('data-filter');
                tableRows.forEach((row) => {
                    if (category === 'all') {
                        row.style.display = '';
                    } else {
                        const rowCat = row.getAttribute('data-category');
                        row.style.display = rowCat === category ? '' : 'none';
                    }
                });
            });
        });

        const tableHeaders = document.querySelectorAll('.data-table th[data-sort]');
        let sortDirection = 1;
        tableHeaders.forEach((th) => {
            th.addEventListener('click', () => {
                const sortKey = th.getAttribute('data-sort');
                sortDirection *= -1;
                SoundEngine.playClickBeep();

                tableRows.sort((a, b) => {
                    const valA = a.querySelector(`[data-key="${sortKey}"]`)?.textContent.trim() || '';
                    const valB = b.querySelector(`[data-key="${sortKey}"]`)?.textContent.trim() || '';
                    return valA.localeCompare(valB, undefined, { numeric: true }) * sortDirection;
                });

                tableRows.forEach((row) => tableBody.appendChild(row));
            });
        });

        initComparisonArena();
    }

    function initComparisonArena() {
        const selectA = document.getElementById('arena-select-a');
        const selectB = document.getElementById('arena-select-b');
        if (!selectA || !selectB) return;

        const techData = {
            'dot-matrix': {
                name: 'Dot Matrix Impact',
                speed: 35,
                dpi: 20,
                cost: 95,
                durability: 98,
                application: 'Multipart Invoices, Receipts (Vias Carbonadas)'
            },
            'inkjet': {
                name: 'DoD Inkjet (Thermal/Piezo)',
                speed: 65,
                dpi: 95,
                cost: 50,
                durability: 60,
                application: 'Gallery Photography, Color Proofing'
            },
            'laser': {
                name: '6-Step Laser Xerography',
                speed: 92,
                dpi: 80,
                cost: 85,
                durability: 88,
                application: 'High-Volume Enterprise Docs'
            },
            '3d-fdm': {
                name: '3D FDM / Extrusion',
                speed: 45,
                dpi: 55,
                cost: 80,
                durability: 75,
                application: 'Functional Prototypes, Tooling'
            },
            '3d-sla': {
                name: '3D SLA / Photopolymer',
                speed: 40,
                dpi: 98,
                cost: 45,
                durability: 70,
                application: 'Dental Aligners, Jewelry Casts'
            }
        };

        function updateArena() {
            const dataA = techData[selectA.value];
            const dataB = techData[selectB.value];
            if (!dataA || !dataB) return;

            document.getElementById('arena-title-a').textContent = dataA.name;
            document.getElementById('arena-app-a').textContent = dataA.application;
            document.getElementById('arena-fill-speed-a').style.width = `${dataA.speed}%`;
            document.getElementById('arena-fill-dpi-a').style.width = `${dataA.dpi}%`;
            document.getElementById('arena-fill-cost-a').style.width = `${dataA.cost}%`;
            document.getElementById('arena-fill-dur-a').style.width = `${dataA.durability}%`;

            document.getElementById('arena-title-b').textContent = dataB.name;
            document.getElementById('arena-app-b').textContent = dataB.application;
            document.getElementById('arena-fill-speed-b').style.width = `${dataB.speed}%`;
            document.getElementById('arena-fill-dpi-b').style.width = `${dataB.dpi}%`;
            document.getElementById('arena-fill-cost-b').style.width = `${dataB.cost}%`;
            document.getElementById('arena-fill-dur-b').style.width = `${dataB.durability}%`;
        }

        selectA.addEventListener('change', () => {
            SoundEngine.playHoverBlip(880, 1100);
            updateArena();
        });
        selectB.addEventListener('change', () => {
            SoundEngine.playHoverBlip(880, 1100);
            updateArena();
        });

        updateArena();
    }

    /* ==========================================================================
       INITIALIZATION ENTRYPOINT
       ========================================================================== */
    function initializeApp() {
        console.log('[PRINTX Core] Initializing Awwwards digital experience (Bilingual EN/PT-BR)...');

        initLanguageEngine();
        initScrollEngine();
        initSystemHud();
        initLiquidCursor();
        initPageTransitions();
        initKineticTypography();
        initAudioToggle();

        initHorizontalScrollPin();
        initHistoryTimeline();
        initFundamentalsSimulators();
        initSummaryMatrix();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();
