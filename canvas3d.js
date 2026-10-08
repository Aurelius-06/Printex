/**
 * PRINTX - WebGL 3D Canvas Scene Engine (Awwwards SOTD Polish)
 * Three.js (r128) Interactive Precision Mesh & Particle Field
 * Handles mouse inertia, noise shaders, scroll depth, ripple shockwaves, and distortion shifts.
 */

(function () {
    'use strict';

    // Global Singleton API
    window.PrinterCanvas3D = {
        init: initScene,
        setPageMode: setPageMode,
        triggerDistortion: triggerDistortion,
        triggerShockwave: triggerShockwave,
        updateScroll: updateScroll,
        onMouseMove: onMouseMove,
        destroy: destroyScene
    };

    let scene, camera, renderer, animationFrameId;
    let mainMesh, innerMesh, particleSystem, ringsGroup;
    let clock;
    let canvasEl;

    // Uniforms for custom shaders
    let customUniforms = {
        uTime: { value: 0 },
        uNoiseStrength: { value: 0.35 },
        uColorA: { value: new THREE.Color(0x00f0ff) }, // Cyan
        uColorB: { value: new THREE.Color(0x6e00ff) }, // Violet
        uScrollOffset: { value: 0.0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uDistortionPulse: { value: 0.0 },
        uShockwaveCenter: { value: new THREE.Vector2(0, 0) },
        uShockwaveProgress: { value: 0.0 }
    };

    // Inertia state for smooth camera / object motion
    const pointer = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
    };

    let scrollProgress = 0;
    let currentPageMode = 'index';

    // Vertex shader with 3D simplex noise displacement + shockwave ring ripple
    const vertexShader = `
        uniform float uTime;
        uniform float uNoiseStrength;
        uniform float uScrollOffset;
        uniform vec2 uMouse;
        uniform float uDistortionPulse;
        uniform vec2 uShockwaveCenter;
        uniform float uShockwaveProgress;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vDisplacement;

        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        
        float snoise(vec3 v){
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
            i = mod(i, 289.0 );
            vec4 p = permute( permute( permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 0.142857142857;
            vec3  ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
            vNormal = normal;
            vPosition = position;
            
            // Simplex noise base
            float noiseFactor = snoise(position * 0.85 + vec3(uTime * 0.35)) * (uNoiseStrength + uDistortionPulse * 1.5);
            noiseFactor += snoise(position * 2.2 - vec3(uTime * 0.25)) * 0.18;
            
            // Mouse distance reaction
            float mouseDist = distance(position.xy, uMouse * 3.2);
            float mouseReact = smoothstep(3.5, 0.0, mouseDist) * 0.42;
            
            // Shockwave pulse ripple
            float shockDist = distance(position.xy, uShockwaveCenter);
            float waveRadius = uShockwaveProgress * 5.0;
            float waveWidth = 0.8;
            float waveEffect = smoothstep(waveRadius - waveWidth, waveRadius, shockDist) * 
                               (1.0 - smoothstep(waveRadius, waveRadius + waveWidth, shockDist)) *
                               (1.0 - uShockwaveProgress) * 0.9;
            
            vDisplacement = noiseFactor + mouseReact + waveEffect;
            
            vec3 newPosition = position + normal * (vDisplacement * 0.65);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `;

    // Fragment shader with luminous Fresnel and cybernetic chromatic falloff
    const fragmentShader = `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uTime;
        uniform float uDistortionPulse;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vDisplacement;

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = vec3(0.0, 0.0, 1.0);
            
            float fresnel = dot(normal, viewDir);
            fresnel = clamp(1.0 - abs(fresnel), 0.0, 1.0);
            fresnel = pow(fresnel, 2.2);
            
            vec3 baseColor = mix(uColorA, uColorB, vDisplacement * 1.4 + 0.5);
            baseColor += vec3(uDistortionPulse * 0.4);
            
            float alpha = smoothstep(0.0, 0.8, fresnel) * 0.78 + 0.18;
            gl_FragColor = vec4(baseColor * (fresnel + 0.45), alpha);
        }
    `;

    function initScene(containerId) {
        if (!window.THREE) {
            console.warn('[3D Engine] Three.js is not loaded yet.');
            return;
        }

        canvasEl = document.getElementById(containerId || 'webgl-bg-canvas');
        if (!canvasEl) {
            canvasEl = document.createElement('canvas');
            canvasEl.id = 'webgl-bg-canvas';
            document.body.prepend(canvasEl);
        }

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x07080a, 0.035);

        const width = window.innerWidth;
        const height = window.innerHeight;

        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 0, 7.5);

        renderer = new THREE.WebGLRenderer({
            canvas: canvasEl,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x07080a, 0);

        clock = new THREE.Clock();

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const dirLightCyan = new THREE.DirectionalLight(0x00f0ff, 1.4);
        dirLightCyan.position.set(5, 10, 7);
        scene.add(dirLightCyan);

        const pointLightViolet = new THREE.PointLight(0x6e00ff, 2.4, 25);
        pointLightViolet.position.set(-5, -5, 3);
        scene.add(pointLightViolet);

        buildPrecisionCore();
        buildHolographicRings();
        buildParticleField();

        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('mousemove', onGlobalMouseMove, false);
        window.addEventListener('click', onGlobalClick, false);

        detectPageContext();
        startAnimationLoop();

        console.log('[3D Engine] WebGL Precision Canvas initialized successfully.');
    }

    function buildPrecisionCore() {
        const geometry = new THREE.IcosahedronGeometry(2.35, 18);

        const shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: customUniforms,
            wireframe: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        mainMesh = new THREE.Mesh(geometry, shaderMaterial);
        scene.add(mainMesh);

        const innerGeom = new THREE.IcosahedronGeometry(1.85, 4);
        const innerMat = new THREE.MeshStandardMaterial({
            color: 0x05070d,
            roughness: 0.2,
            metalness: 0.9,
            wireframe: false
        });
        innerMesh = new THREE.Mesh(innerGeom, innerMat);
        mainMesh.add(innerMesh);
    }

    function buildHolographicRings() {
        ringsGroup = new THREE.Group();

        const ringMatCyan = new THREE.LineBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending
        });

        const ringMatViolet = new THREE.LineBasicMaterial({
            color: 0x6e00ff,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending
        });

        const ringGeom1 = new THREE.RingGeometry(3.2, 3.22, 64);
        const ring1 = new THREE.LineLoop(ringGeom1, ringMatCyan);
        ring1.rotation.x = Math.PI * 0.45;
        ringsGroup.add(ring1);

        const ringGeom2 = new THREE.RingGeometry(3.8, 3.82, 64);
        const ring2 = new THREE.LineLoop(ringGeom2, ringMatViolet);
        ring2.rotation.y = Math.PI * 0.35;
        ring2.rotation.x = Math.PI * 0.2;
        ringsGroup.add(ring2);

        const ringGeom3 = new THREE.RingGeometry(4.4, 4.42, 64);
        const ring3 = new THREE.LineLoop(ringGeom3, ringMatCyan);
        ring3.rotation.z = Math.PI * 0.25;
        ringsGroup.add(ring3);

        scene.add(ringsGroup);
    }

    function buildParticleField() {
        const particleCount = 1400;
        const coords = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = 3.5 + Math.random() * 8.5;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 16.0;

            coords[i3] = Math.cos(theta) * radius;
            coords[i3 + 1] = y;
            coords[i3 + 2] = Math.sin(theta) * radius - 2.0;

            scales[i] = Math.random() * 2.5 + 0.8;
        }

        const particleGeom = new THREE.BufferGeometry();
        particleGeom.setAttribute('position', new THREE.BufferAttribute(coords, 3));
        particleGeom.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

        const dotCanvas = document.createElement('canvas');
        dotCanvas.width = 32;
        dotCanvas.height = 32;
        const ctx = dotCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(110, 0, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        const particleTexture = new THREE.CanvasTexture(dotCanvas);

        const particleMat = new THREE.PointsMaterial({
            size: 0.16,
            map: particleTexture,
            transparent: true,
            opacity: 0.68,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        particleSystem = new THREE.Points(particleGeom, particleMat);
        scene.add(particleSystem);
    }

    function detectPageContext() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('history')) {
            setPageMode('history');
        } else if (path.includes('fundamentals')) {
            setPageMode('fundamentals');
        } else if (path.includes('summary')) {
            setPageMode('summary');
        } else {
            setPageMode('index');
        }
    }

    function setPageMode(mode) {
        currentPageMode = mode;
        if (!mainMesh) return;

        if (mode === 'index') {
            mainMesh.position.set(2.4, 0, 0);
            mainMesh.scale.set(1, 1, 1);
            customUniforms.uColorA.value.set(0x00f0ff);
            customUniforms.uColorB.value.set(0x6e00ff);
            if (ringsGroup) ringsGroup.position.set(2.4, 0, 0);
        } else if (mode === 'history') {
            mainMesh.position.set(-2.8, 0, -1.0);
            mainMesh.scale.set(0.85, 0.85, 0.85);
            customUniforms.uColorA.value.set(0x00f0ff);
            customUniforms.uColorB.value.set(0x00ffaa); // Emerald
            if (ringsGroup) ringsGroup.position.set(-2.8, 0, -1.0);
        } else if (mode === 'fundamentals') {
            mainMesh.position.set(0, 0, -2.5);
            mainMesh.scale.set(1.2, 1.2, 1.2);
            customUniforms.uColorA.value.set(0xff007a); // Magenta
            customUniforms.uColorB.value.set(0x00f0ff);
            if (ringsGroup) ringsGroup.position.set(0, 0, -2.5);
        } else if (mode === 'summary') {
            mainMesh.position.set(0, -1.5, -1.5);
            mainMesh.scale.set(0.9, 0.9, 0.9);
            customUniforms.uColorA.value.set(0x6e00ff);
            customUniforms.uColorB.value.set(0xffaa00); // Amber
            if (ringsGroup) ringsGroup.position.set(0, -1.5, -1.5);
        }
    }

    function triggerDistortion(intensity, hexColor) {
        if (!customUniforms) return;
        customUniforms.uDistortionPulse.value = intensity || 1.0;

        if (hexColor) {
            customUniforms.uColorA.value.set(hexColor);
        }

        if (window.gsap) {
            window.gsap.to(customUniforms.uDistortionPulse, {
                value: 0.0,
                duration: 0.8,
                ease: 'power2.out'
            });
        } else {
            setTimeout(() => {
                customUniforms.uDistortionPulse.value = 0.0;
            }, 500);
        }
    }

    function triggerShockwave(normX, normY) {
        if (!customUniforms) return;
        customUniforms.uShockwaveCenter.value.set(normX * 3.0, normY * 3.0);
        customUniforms.uShockwaveProgress.value = 0.0;

        if (window.gsap) {
            window.gsap.to(customUniforms.uShockwaveProgress, {
                value: 1.0,
                duration: 0.75,
                ease: 'power2.out'
            });
        }
    }

    function onGlobalClick(e) {
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        triggerShockwave(normX, normY);
    }

    function onGlobalMouseMove(e) {
        pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        customUniforms.uMouse.value.set(pointer.targetX, pointer.targetY);
    }

    function onMouseMove(normalizedX, normalizedY) {
        pointer.targetX = normalizedX;
        pointer.targetY = normalizedY;
        customUniforms.uMouse.value.set(normalizedX, normalizedY);
    }

    function updateScroll(scrollY, velocity) {
        scrollProgress = scrollY;
        customUniforms.uScrollOffset.value = scrollY * 0.001;

        if (mainMesh) {
            const speed = velocity || 0;
            customUniforms.uNoiseStrength.value = 0.35 + Math.min(Math.abs(speed) * 0.005, 0.45);
        }
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    function startAnimationLoop() {
        const render = () => {
            animationFrameId = requestAnimationFrame(render);

            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            customUniforms.uTime.value = elapsedTime;

            pointer.x += (pointer.targetX - pointer.x) * 0.05;
            pointer.y += (pointer.targetY - pointer.y) * 0.05;

            camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
            camera.position.y += (pointer.y * 0.6 - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);

            if (mainMesh) {
                mainMesh.rotation.y = elapsedTime * 0.2 + pointer.x * 0.3;
                mainMesh.rotation.x = elapsedTime * 0.12 + pointer.y * 0.2;
            }

            if (ringsGroup) {
                ringsGroup.rotation.y = -elapsedTime * 0.15;
                ringsGroup.rotation.z = elapsedTime * 0.08;
            }

            if (particleSystem) {
                particleSystem.rotation.y = elapsedTime * 0.04 + scrollProgress * 0.0002;
                particleSystem.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;
            }

            renderer.render(scene, camera);
        };

        render();
    }

    /* ==========================================================================
       PRINTER 3D STUDIO - PROCEDURAL 3D PRINTER ENGINE (FDM & SLA)
       ========================================================================== */
    window.Printer3DStudio = (function () {
        let scene, camera, renderer, animId, clock;
        let canvasEl;
        let rootGroup, baseGroup, towersGroup, gantryGroup, toolheadGroup, bedGroup, partMesh;
        let slaGroup, resinMesh, buildPlatform, laserLine;
        let nozzleLight;

        let isPrinting = true;
        let isExploded = false;
        let mode = 'fdm'; // 'fdm' or 'sla'
        let printProgress = 0.25;
        let printSpeed = 1.0;

        const orbit = {
            isDragging: false,
            prevX: 0,
            prevY: 0,
            rotY: Math.PI * 0.22,
            rotX: 0.32,
            distance: 8.8,
            targetRotY: Math.PI * 0.22,
            targetRotX: 0.32,
            targetDistance: 8.8
        };

        function init(canvasId) {
            if (!window.THREE) return;
            canvasEl = document.getElementById(canvasId || 'printer3d-canvas');
            if (!canvasEl) return;

            const width = canvasEl.parentElement.clientWidth || 600;
            const height = canvasEl.parentElement.clientHeight || 460;

            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x030407, 0.04);

            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
            updateCameraPosition();

            renderer = new THREE.WebGLRenderer({
                canvas: canvasEl,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            clock = new THREE.Clock();

            // Lighting
            const ambient = new THREE.AmbientLight(0xffffff, 0.55);
            scene.add(ambient);

            const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
            keyLight.position.set(6, 12, 8);
            scene.add(keyLight);

            const fillLight = new THREE.DirectionalLight(0x00f0ff, 0.85);
            fillLight.position.set(-6, 6, -5);
            scene.add(fillLight);

            // Assembly Model
            build3DPrinterAssembly();

            // Event Listeners for Orbit Controls
            setupOrbitEvents();
            window.addEventListener('resize', onStudioResize);

            // Start Render Loop
            startStudioLoop();
            console.log('[3D Printer Studio] WebGL Procedural 3D Printer initialized.');
        }

        function build3DPrinterAssembly() {
            rootGroup = new THREE.Group();
            rootGroup.position.y = -1.2;
            scene.add(rootGroup);

            // Metallic / Aluminum material
            const alumMat = new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.3,
                metalness: 0.85
            });

            const steelMat = new THREE.MeshStandardMaterial({
                color: 0xe2e8f0,
                roughness: 0.15,
                metalness: 0.95
            });

            const brassMat = new THREE.MeshStandardMaterial({
                color: 0xd97706,
                roughness: 0.35,
                metalness: 0.8
            });

            const cyanGlowMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff
            });

            // 1. Base Frame Group
            baseGroup = new THREE.Group();
            rootGroup.add(baseGroup);

            // Bottom aluminum rails
            const railGeomX = new THREE.BoxGeometry(3.6, 0.2, 0.2);
            const railGeomZ = new THREE.BoxGeometry(0.2, 0.2, 3.6);

            const railB1 = new THREE.Mesh(railGeomX, alumMat);
            railB1.position.set(0, 0, 1.7);
            const railB2 = new THREE.Mesh(railGeomX, alumMat);
            railB2.position.set(0, 0, -1.7);
            const railB3 = new THREE.Mesh(railGeomZ, alumMat);
            railB3.position.set(1.7, 0, 0);
            const railB4 = new THREE.Mesh(railGeomZ, alumMat);
            railB4.position.set(-1.7, 0, 0);
            baseGroup.add(railB1, railB2, railB3, railB4);

            // Corner brackets with cyan accent
            for (let x of [-1.7, 1.7]) {
                for (let z of [-1.7, 1.7]) {
                    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), cyanGlowMat);
                    bracket.position.set(x, 0, z);
                    baseGroup.add(bracket);
                }
            }

            // Electronics control box
            const electronicsBox = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.28, 1.4),
                new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5, metalness: 0.5 })
            );
            electronicsBox.position.set(0, -0.05, 0);
            baseGroup.add(electronicsBox);

            // 2. Heated Print Bed Group
            bedGroup = new THREE.Group();
            rootGroup.add(bedGroup);

            // Heated bed sub-plate & glass
            const bedPlate = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 0.08, 2.8),
                new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.2, metalness: 0.7 })
            );
            bedPlate.position.set(0, 0.25, 0);
            bedGroup.add(bedPlate);

            // Bed Grid
            const bedGrid = new THREE.GridHelper(2.7, 18, 0x00f0ff, 0x1e293b);
            bedGrid.position.set(0, 0.295, 0);
            bedGroup.add(bedGrid);

            // Leveling knobs
            for (let x of [-1.2, 1.2]) {
                for (let z of [-1.2, 1.2]) {
                    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), brassMat);
                    knob.position.set(x, 0.16, z);
                    bedGroup.add(knob);
                }
            }

            // 3. Vertical Towers & Guide Rods
            towersGroup = new THREE.Group();
            rootGroup.add(towersGroup);

            // Left & Right Aluminum Z-pillars
            const pillarGeom = new THREE.BoxGeometry(0.25, 4.8, 0.35);
            const pillarLeft = new THREE.Mesh(pillarGeom, alumMat);
            pillarLeft.position.set(-1.7, 2.4, 0);
            const pillarRight = new THREE.Mesh(pillarGeom, alumMat);
            pillarRight.position.set(1.7, 2.4, 0);

            // Top crossbar
            const topBar = new THREE.Mesh(new THREE.BoxGeometry(3.65, 0.25, 0.35), alumMat);
            topBar.position.set(0, 4.8, 0);
            towersGroup.add(pillarLeft, pillarRight, topBar);

            // Linear steel guide rods
            const rodGeom = new THREE.CylinderGeometry(0.04, 0.04, 4.6, 16);
            const rodLeft = new THREE.Mesh(rodGeom, steelMat);
            rodLeft.position.set(-1.55, 2.4, 0.1);
            const rodRight = new THREE.Mesh(rodGeom, steelMat);
            rodRight.position.set(1.55, 2.4, 0.1);

            // Brass lead screws
            const screwGeom = new THREE.CylinderGeometry(0.045, 0.045, 4.6, 16);
            const screwLeft = new THREE.Mesh(screwGeom, brassMat);
            screwLeft.position.set(-1.55, 2.4, -0.1);
            const screwRight = new THREE.Mesh(screwGeom, brassMat);
            screwRight.position.set(1.55, 2.4, -0.1);

            towersGroup.add(rodLeft, rodRight, screwLeft, screwRight);

            // Top-mounted Filament Spool
            const spoolGroup = new THREE.Group();
            spoolGroup.position.set(0.6, 5.4, 0);
            const spoolRim1 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 24), alumMat);
            spoolRim1.rotation.z = Math.PI * 0.5;
            spoolRim1.position.x = -0.2;
            const spoolRim2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 24), alumMat);
            spoolRim2.rotation.z = Math.PI * 0.5;
            spoolRim2.position.x = 0.2;
            const filamentCoil = new THREE.Mesh(
                new THREE.CylinderGeometry(0.48, 0.48, 0.36, 24),
                new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.3, metalness: 0.2 })
            );
            filamentCoil.rotation.z = Math.PI * 0.5;
            spoolGroup.add(spoolRim1, spoolRim2, filamentCoil);
            towersGroup.add(spoolGroup);

            // 4. X-Gantry Crossbeam & Toolhead Carriage
            gantryGroup = new THREE.Group();
            gantryGroup.position.set(0, 1.8, 0); // Initial Z height
            rootGroup.add(gantryGroup);

            const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 0.2), alumMat);
            gantryGroup.add(gantryBeam);

            // Toolhead assembly
            toolheadGroup = new THREE.Group();
            gantryGroup.add(toolheadGroup);

            // Extruder stepper motor & fan shroud
            const extruderBody = new THREE.Mesh(
                new THREE.BoxGeometry(0.45, 0.45, 0.4),
                new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 })
            );
            extruderBody.position.set(0, 0.1, 0.18);
            toolheadGroup.add(extruderBody);

            // Fan grille
            const fanGrille = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 16), cyanGlowMat);
            fanGrille.rotation.x = Math.PI * 0.5;
            fanGrille.position.set(0, 0.1, 0.39);
            toolheadGroup.add(fanGrille);

            // Brass heater block
            const heaterBlock = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.24), brassMat);
            heaterBlock.position.set(0, -0.2, 0.18);
            toolheadGroup.add(heaterBlock);

            // Brass conical nozzle tip
            const nozzleTip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 16), brassMat);
            nozzleTip.rotation.x = Math.PI;
            nozzleTip.position.set(0, -0.32, 0.18);
            toolheadGroup.add(nozzleTip);

            // Nozzle LED worklight pointing at bed
            nozzleLight = new THREE.PointLight(0x00f0ff, 1.6, 2.5);
            nozzleLight.position.set(0, -0.35, 0.18);
            toolheadGroup.add(nozzleLight);

            // 5. The 3D Printed Object (Growing layer-by-layer)
            const partGeom = new THREE.CylinderGeometry(0.65, 0.65, 1.2, 12, 16);
            const partMat = new THREE.MeshStandardMaterial({
                color: 0x00f0ff,
                roughness: 0.25,
                metalness: 0.4,
                wireframe: false
            });
            partMesh = new THREE.Mesh(partGeom, partMat);
            partMesh.position.set(0, 0.85, 0);
            partMesh.scale.set(1, 0.3, 1);
            rootGroup.add(partMesh);

            // Active top layer glowing ring
            const topRing = new THREE.LineLoop(
                new THREE.RingGeometry(0.64, 0.66, 24),
                new THREE.LineBasicMaterial({ color: 0xffaa00, linewidth: 2 })
            );
            topRing.rotation.x = Math.PI * 0.5;
            topRing.position.y = 0.6;
            partMesh.add(topRing);

            // 6. SLA Stereolithography Module (Toggleable)
            slaGroup = new THREE.Group();
            slaGroup.position.set(0, 0, 0);
            slaGroup.visible = false;
            rootGroup.add(slaGroup);

            // Resin Vat
            const vatGeom = new THREE.BoxGeometry(2.4, 0.35, 2.4);
            const vatMat = new THREE.MeshStandardMaterial({
                color: 0x1e1b4b,
                roughness: 0.1,
                metalness: 0.8
            });
            const vat = new THREE.Mesh(vatGeom, vatMat);
            vat.position.set(0, 0.45, 0);
            slaGroup.add(vat);

            // Translucent photopolymer resin pool
            const resinGeom = new THREE.BoxGeometry(2.2, 0.2, 2.2);
            const resinMat = new THREE.MeshStandardMaterial({
                color: 0x7c3aed,
                roughness: 0.05,
                metalness: 0.1,
                transparent: true,
                opacity: 0.65
            });
            resinMesh = new THREE.Mesh(resinGeom, resinMat);
            resinMesh.position.set(0, 0.5, 0);
            slaGroup.add(resinMesh);

            // Build platform dipping & ascending
            const platformGeom = new THREE.BoxGeometry(1.6, 0.08, 1.6);
            buildPlatform = new THREE.Mesh(platformGeom, alumMat);
            buildPlatform.position.set(0, 0.8, 0);
            slaGroup.add(buildPlatform);

            // UV Laser Beam simulation
            const laserGeom = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0.1, 0),
                new THREE.Vector3(0.5, 0.4, 0.5)
            ]);
            laserLine = new THREE.Line(laserGeom, new THREE.LineBasicMaterial({ color: 0xc084fc, linewidth: 2 }));
            slaGroup.add(laserLine);
        }

        function setupOrbitEvents() {
            if (!canvasEl) return;

            const onPointerDown = (clientX, clientY) => {
                orbit.isDragging = true;
                orbit.prevX = clientX;
                orbit.prevY = clientY;
            };

            const onPointerMove = (clientX, clientY) => {
                if (!orbit.isDragging) return;
                const deltaX = clientX - orbit.prevX;
                const deltaY = clientY - orbit.prevY;
                orbit.prevX = clientX;
                orbit.prevY = clientY;

                orbit.targetRotY += deltaX * 0.007;
                orbit.targetRotX = Math.max(0.05, Math.min(Math.PI * 0.48, orbit.targetRotX + deltaY * 0.007));
            };

            const onPointerUp = () => {
                orbit.isDragging = false;
            };

            // Mouse events
            canvasEl.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
            window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
            window.addEventListener('mouseup', onPointerUp);

            // Wheel zoom
            canvasEl.addEventListener('wheel', (e) => {
                e.preventDefault();
                orbit.targetDistance = Math.max(4.5, Math.min(16.0, orbit.targetDistance + e.deltaY * 0.006));
            }, { passive: false });

            // Touch events
            canvasEl.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
            });
            window.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            });
            window.addEventListener('touchend', onPointerUp);
        }

        function updateCameraPosition() {
            orbit.rotY += (orbit.targetRotY - orbit.rotY) * 0.1;
            orbit.rotX += (orbit.targetRotX - orbit.rotX) * 0.1;
            orbit.distance += (orbit.targetDistance - orbit.distance) * 0.1;

            camera.position.x = Math.sin(orbit.rotY) * Math.cos(orbit.rotX) * orbit.distance;
            camera.position.y = Math.sin(orbit.rotX) * orbit.distance + 0.6;
            camera.position.z = Math.cos(orbit.rotY) * Math.cos(orbit.rotX) * orbit.distance;

            camera.lookAt(0, 0.4, 0);
        }

        function startStudioLoop() {
            const renderStudio = () => {
                animId = requestAnimationFrame(renderStudio);
                const delta = clock.getDelta();
                const time = clock.getElapsedTime() * printSpeed;

                updateCameraPosition();

                if (isPrinting && !isExploded) {
                    if (mode === 'fdm') {
                        // Kinematics: Extruder moves in toolpath pattern
                        const toolX = Math.sin(time * 3.5) * 0.85;
                        const toolZ = Math.cos(time * 4.2) * 0.75;
                        toolheadGroup.position.x = toolX;
                        toolheadGroup.position.z = toolZ * 0.25;

                        // Bed moves slightly along Y/Z
                        bedGroup.position.z = Math.sin(time * 2.0) * 0.3;

                        // Increment print progress
                        printProgress = (printProgress + delta * 0.04 * printSpeed) % 1.0;
                        const currentZ = 0.5 + printProgress * 2.5;

                        gantryGroup.position.y = currentZ;

                        // Scaled printed model
                        if (partMesh) {
                            partMesh.scale.y = 0.1 + printProgress * 1.2;
                            partMesh.position.y = 0.3 + (partMesh.scale.y * 0.6);
                        }

                        if (nozzleLight) {
                            nozzleLight.intensity = 1.2 + Math.sin(time * 12) * 0.6;
                        }
                    } else {
                        // SLA Mode: Platform ascends out of resin
                        printProgress = (printProgress + delta * 0.03 * printSpeed) % 1.0;
                        if (buildPlatform) {
                            buildPlatform.position.y = 0.55 + printProgress * 1.8;
                        }
                        // Animate UV laser galvo scanning line
                        if (laserLine) {
                            const positions = laserLine.geometry.attributes.position.array;
                            positions[3] = Math.sin(time * 8) * 0.9;
                            positions[5] = Math.cos(time * 10) * 0.9;
                            laserLine.geometry.attributes.position.needsUpdate = true;
                        }
                    }
                }

                renderer.render(scene, camera);
            };

            renderStudio();
        }

        function setCameraPreset(preset) {
            currentCamPreset = preset;
            if (preset === 'iso') {
                orbit.targetRotY = Math.PI * 0.25;
                orbit.targetRotX = 0.35;
                orbit.targetDistance = 8.5;
            } else if (preset === 'nozzle') {
                orbit.targetRotY = 0.35;
                orbit.targetRotX = 0.12;
                orbit.targetDistance = 4.2;
            } else if (preset === 'top') {
                orbit.targetRotY = 0;
                orbit.targetRotX = 1.48;
                orbit.targetDistance = 9.2;
            } else if (preset === 'exploded') {
                toggleExploded();
            }
        }

        function toggleExploded() {
            isExploded = !isExploded;
            if (!window.gsap) return;

            const spread = isExploded ? 1.4 : 0.0;
            gsap.to(baseGroup.position, { y: -spread * 0.8, duration: 0.8, ease: 'power3.out' });
            gsap.to(towersGroup.position, { z: -spread * 0.9, duration: 0.8, ease: 'power3.out' });
            gsap.to(bedGroup.position, { y: spread * 0.4, duration: 0.8, ease: 'power3.out' });
            gsap.to(gantryGroup.position, { y: 2.2 + spread * 1.2, duration: 0.8, ease: 'power3.out' });
            gsap.to(toolheadGroup.position, { x: spread * 1.1, duration: 0.8, ease: 'power3.out' });

            if (isExploded) {
                orbit.targetDistance = 11.5;
            } else {
                orbit.targetDistance = 8.8;
            }
        }

        function setMode(newMode) {
            mode = newMode;
            if (newMode === 'sla') {
                gantryGroup.visible = false;
                towersGroup.visible = false;
                bedGroup.visible = false;
                partMesh.visible = false;
                slaGroup.visible = true;
            } else {
                gantryGroup.visible = true;
                towersGroup.visible = true;
                bedGroup.visible = true;
                partMesh.visible = true;
                slaGroup.visible = false;
            }
        }

        function startPrint() { isPrinting = true; }
        function pausePrint() { isPrinting = false; }
        function resetPrint() {
            printProgress = 0.05;
            if (partMesh) {
                partMesh.scale.y = 0.1;
                partMesh.position.y = 0.35;
            }
            if (buildPlatform) {
                buildPlatform.position.y = 0.55;
            }
        }

        function onStudioResize() {
            if (!camera || !renderer || !canvasEl) return;
            const w = canvasEl.parentElement.clientWidth;
            const h = canvasEl.parentElement.clientHeight || 460;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }

        return {
            init: init,
            setMode: setMode,
            setCameraPreset: setCameraPreset,
            toggleExploded: toggleExploded,
            startPrint: startPrint,
            pausePrint: pausePrint,
            resetPrint: resetPrint,
            setSpeed: (spd) => { printSpeed = spd; }
        };
    })();

    function destroyScene() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', onWindowResize);
        window.removeEventListener('mousemove', onGlobalMouseMove);
        window.removeEventListener('click', onGlobalClick);
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initScene());
    } else {
        initScene();
    }
})();
