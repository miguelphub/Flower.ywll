document.addEventListener('DOMContentLoaded', () => {

            // Global State
            const state = {
                soundEnabled: false,
                loaded: false,
                opened: false,
                audioCtx: null,
                flowers: [],
                bees: [],
                particles: [],
                trailParticles: [],
                gardenFlowers: []
            };

            // DOM References
            const loadingOverlay = document.getElementById('loadingOverlay');
            const progressBar = document.getElementById('progressBar');
            const progressPercent = document.getElementById('progressPercent');
            const loadingText = document.getElementById('loadingText');
            const introOverlay = document.getElementById('introOverlay');
            const btnAbrir = document.getElementById('btnAbrir');
            const btnReset = document.getElementById('btnReset');
            const soundToggle = document.getElementById('soundToggle');
            const soundIcon = document.getElementById('soundIcon');
            const soundLabel = document.getElementById('soundLabel');
            const bouquetCanvas = document.getElementById('bouquetCanvas');
            const particlesCanvas = document.getElementById('particlesCanvas');
            const trailCanvas = document.getElementById('trailCanvas');
            const gardenCanvas = document.getElementById('gardenCanvas');
            const tiltContainer = document.getElementById('tiltContainer');

            // Setup Canvas Contexts
            const bCtx = bouquetCanvas.getContext('2d');
            const pCtx = particlesCanvas.getContext('2d');
            const tCtx = trailCanvas.getContext('2d');
            const gCtx = gardenCanvas.getContext('2d');


            // =========================================================
            // MÚSICA DE FONDO
            // =========================================================
            const backgroundMusic = document.getElementById('backgroundMusic');

            function startBackgroundMusic() {
                if (!backgroundMusic) return;

                // HTMLMediaElement limita volume a [0, 1].
                backgroundMusic.loop = true;
                backgroundMusic.volume = 1;
                backgroundMusic.muted = false;

                const promise = backgroundMusic.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(() => {
                        // Algunos navegadores móviles requieren una interacción.
                        // El botón ABRIR y el botón Música vuelven a intentarlo.
                    });
                }
            }

            function stopBackgroundMusic() {
                if (!backgroundMusic) return;
                backgroundMusic.pause();
            }

            function toggleBackgroundMusic() {
                if (!backgroundMusic) return;

                if (backgroundMusic.paused) {
                    backgroundMusic.volume = 1;
                    backgroundMusic.muted = false;
                    const promise = backgroundMusic.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(() => {});
                    }
                    state.soundEnabled = true;
                } else {
                    backgroundMusic.pause();
                    state.soundEnabled = false;
                }

                soundIcon.textContent = state.soundEnabled ? "🔊" : "🎵";
                soundLabel.textContent = state.soundEnabled ? "Activado" : "Música";
            }

            // Render loading SVG petals dynamically
            const loadingPetalsGroup = document.getElementById('loadingFlowerPetals');
            for (let i = 0; i < 12; i++) {
                const angle = (i * 30) * Math.PI / 180;
                const petal = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const x1 = 50 + Math.cos(angle) * 16;
                const y1 = 50 + Math.sin(angle) * 16;
                const x2 = 50 + Math.cos(angle) * 38;
                const y2 = 50 + Math.sin(angle) * 38;
                petal.setAttribute('d', `M ${x1} ${y1} Q ${50 + Math.cos(angle+0.3)*30} ${50 + Math.sin(angle+0.3)*30} ${x2} ${y2} Q ${50 + Math.cos(angle-0.3)*30} ${50 + Math.sin(angle-0.3)*30} ${x1} ${y1}`);
                petal.setAttribute('fill', '#FFC800');
                petal.setAttribute('stroke', '#E6A100');
                petal.setAttribute('stroke-width', '1');
                loadingPetalsGroup.appendChild(petal);
            }

            // Animate Bee on Loading
            const loadingBee = document.getElementById('loadingBee');
            let beeAngle = 0;
            const loadingPhrases = [
                "Cultivando tus flores amarillas...",
                "Juntando rayos de sol...",
                "Tejiendo la brisa cálida...",
                "Alistando un detalle del corazón..."
            ];

            let progress = 0;
            const loadingInterval = setInterval(() => {
                progress += Math.random() * 8 + 4;
                if (progress > 100) progress = 100;
                progressBar.style.width = `${progress}%`;
                progressPercent.textContent = `${Math.floor(progress)}%`;

                const phraseIdx = Math.min(Math.floor((progress / 100) * loadingPhrases.length), loadingPhrases.length - 1);
                loadingText.textContent = loadingPhrases[phraseIdx];

                // Orbit loading bee
                beeAngle += 0.15;
                const radius = 32;
                const bx = Math.cos(beeAngle) * radius;
                const by = Math.sin(beeAngle) * radius;
                loadingBee.style.transform = `translate(${bx}px, ${by}px) rotate(${beeAngle * 57.3 + 90}deg)`;

                if (progress >= 100) {
                    clearInterval(loadingInterval);
                    setTimeout(finishLoading, 400);
                }
            }, 120);

            function finishLoading() {
                loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    runIntroSequence();
                }, 700);
            }

            function runIntroSequence() {
                const s1 = document.getElementById('introStep1');
                const s2 = document.getElementById('introStep2');
                const s3 = document.getElementById('introStep3');

                setTimeout(() => {
                    s1.classList.add('opacity-0');
                    setTimeout(() => {
                        s1.classList.add('hidden');
                        s2.classList.remove('hidden');
                        setTimeout(() => s2.classList.remove('opacity-0'), 50);
                    }, 600);
                }, 2200);

                setTimeout(() => {
                    s2.classList.add('opacity-0');
                    setTimeout(() => {
                        s2.classList.add('hidden');
                        s3.classList.remove('hidden');
                        setTimeout(() => s3.classList.remove('opacity-0'), 50);
                    }, 600);
                }, 4600);
            }

            btnAbrir.addEventListener('click', () => {
                // La reproducción se inicia aquí porque este click es una
                // interacción directa del usuario y funciona mejor en móviles.
                startBackgroundMusic();
                state.soundEnabled = true;
                soundIcon.textContent = "🔊";
                soundLabel.textContent = "Activado";
                spawnBurstParticles();
                
                introOverlay.classList.add('opacity-0', 'pointer-events-none');
                setTimeout(() => {
                    introOverlay.style.display = 'none';
                    state.opened = true;
                    triggerBouquetBloom();
                }, 800);
            });

            btnReset.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                    location.reload();
                }, 400);
            });

            function resizeCanvas(canvas) {
                const rect = canvas.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                return { width: rect.width, height: rect.height, dpr };
            }

            // Define Bouquet Flowers Structured Array
            // 10 Sunflowers, 12 Tulips, 8 Gerberas
            function createBouquetData(width, height) {
                const cx = width / 2;
                const cy = height * 0.48; // Center shift
                const list = [];

                // 1. Stems & Eucalyptus leaves (rendered in background)
                
                // 2. 10 Sunflowers (Large, dark spiral center, golden petals)
                for (let i = 0; i < 10; i++) {
                    const ang = (i / 10) * Math.PI * 2 + (Math.random() * 0.3);
                    const dist = 35 + Math.random() * 75;
                    list.push({
                        type: 'sunflower',
                        x: cx + Math.cos(ang) * dist,
                        y: cy + Math.sin(ang) * (dist * 0.8) - 20,
                        size: 32 + Math.random() * 10,
                        rotation: Math.random() * Math.PI,
                        swayOffset: Math.random() * 100,
                        scale: 0,
                        targetScale: 1
                    });
                }

                // 3. 12 Tulips (Cup-shaped, layered)
                for (let i = 0; i < 12; i++) {
                    const ang = (i / 12) * Math.PI * 2 + 0.2;
                    const dist = 60 + Math.random() * 95;
                    list.push({
                        type: 'tulip',
                        x: cx + Math.cos(ang) * dist,
                        y: cy + Math.sin(ang) * (dist * 0.85) - 40,
                        size: 22 + Math.random() * 7,
                        rotation: (Math.random() - 0.5) * 0.5,
                        swayOffset: Math.random() * 100,
                        scale: 0,
                        targetScale: 1
                    });
                }

                // 4. 8 Gerberas (Fine dense ray petals)
                for (let i = 0; i < 8; i++) {
                    const ang = (i / 8) * Math.PI * 2 + 0.5;
                    const dist = 20 + Math.random() * 65;
                    list.push({
                        type: 'gerbera',
                        x: cx + Math.cos(ang) * dist,
                        y: cy + Math.sin(ang) * (dist * 0.75) + 10,
                        size: 24 + Math.random() * 8,
                        rotation: Math.random() * Math.PI,
                        swayOffset: Math.random() * 100,
                        scale: 0,
                        targetScale: 1
                    });
                }

                return { cx, cy, list };
            }

            let bouquetInfo = null;

            function initBouquetCanvas() {
                const { width, height } = resizeCanvas(bouquetCanvas);
                bouquetInfo = createBouquetData(width, height);
            }

            function triggerBouquetBloom() {
                if (!bouquetInfo) return;
                bouquetInfo.list.forEach((f, idx) => {
                    setTimeout(() => {
                        f.scale = 0;
                        f.targetScale = 1;
                    }, idx * 60);
                });
            }

            /* Procedural Drawing Helpers */
            function drawSunflower(ctx, x, y, size, rotation, time) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation + Math.sin(time + x) * 0.04);

                // Petals (Double Layer)
                const petalCount = 20;
                for (let layer = 0; layer < 2; layer++) {
                    const rInner = size * (layer === 0 ? 0.6 : 0.55);
                    const rOuter = size * (layer === 0 ? 1.3 : 1.15);
                    ctx.fillStyle = layer === 0 ? '#FFC800' : '#E6A100';

                    for (let i = 0; i < petalCount; i++) {
                        const a = (i / petalCount) * Math.PI * 2 + (layer * 0.15);
                        ctx.beginPath();
                        ctx.moveTo(Math.cos(a) * rInner, Math.sin(a) * rInner);
                        ctx.quadraticCurveTo(
                            Math.cos(a + 0.1) * rOuter * 1.1, Math.sin(a + 0.1) * rOuter * 1.1,
                            Math.cos(a) * rOuter, Math.sin(a) * rOuter
                        );
                        ctx.quadraticCurveTo(
                            Math.cos(a - 0.1) * rOuter * 1.1, Math.sin(a - 0.1) * rOuter * 1.1,
                            Math.cos(a) * rInner, Math.sin(a) * rInner
                        );
                        ctx.fill();
                    }
                }

                // Dark Center Disk with Golden Seed Dots
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
                ctx.fillStyle = '#3D2314';
                ctx.fill();
                ctx.strokeStyle = '#5A351D';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Golden Seeds Fibonacci Spiral
                ctx.fillStyle = '#D4A017';
                for (let i = 0; i < 40; i++) {
                    const r = Math.sqrt(i) * (size * 0.075);
                    const theta = i * 2.39996; // Golden angle
                    ctx.beginPath();
                    ctx.arc(Math.cos(theta) * r, Math.sin(theta) * r, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            function drawTulip(ctx, x, y, size, rotation, time) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation + Math.sin(time + y) * 0.05);

                const w = size * 0.85;
                const h = size * 1.25;

                // Outer Petals
                ctx.fillStyle = '#E69500';
                ctx.beginPath();
                ctx.moveTo(-w, -h*0.2);
                ctx.quadraticCurveTo(-w*1.2, -h, 0, -h*1.1);
                ctx.quadraticCurveTo(w*1.2, -h, w, -h*0.2);
                ctx.quadraticCurveTo(0, h*0.5, -w, -h*0.2);
                ctx.fill();

                // Inner Main Petals
                ctx.fillStyle = '#FFC800';
                ctx.beginPath();
                ctx.moveTo(-w*0.8, -h*0.1);
                ctx.quadraticCurveTo(-w*0.9, -h*0.95, 0, -h);
                ctx.quadraticCurveTo(w*0.9, -h*0.95, w*0.8, -h*0.1);
                ctx.quadraticCurveTo(0, h*0.4, -w*0.8, -h*0.1);
                ctx.fill();

                // Center Highlight Petal
                ctx.fillStyle = '#FFE066';
                ctx.beginPath();
                ctx.moveTo(-w*0.4, -h*0.2);
                ctx.quadraticCurveTo(0, -h*1.05, w*0.4, -h*0.2);
                ctx.quadraticCurveTo(0, h*0.2, -w*0.4, -h*0.2);
                ctx.fill();

                ctx.restore();
            }

            function drawGerbera(ctx, x, y, size, rotation, time) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation + Math.sin(time + x * 0.5) * 0.03);

                // Multiple fine ray petals
                const petals = 28;
                ctx.fillStyle = '#FFD000';
                for (let i = 0; i < petals; i++) {
                    const a = (i / petals) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * (size*0.3), Math.sin(a) * (size*0.3));
                    ctx.lineTo(Math.cos(a + 0.06) * size, Math.sin(a + 0.06) * size);
                    ctx.lineTo(Math.cos(a) * (size*1.1), Math.sin(a) * (size*1.1));
                    ctx.lineTo(Math.cos(a - 0.06) * size, Math.sin(a - 0.06) * size);
                    ctx.closePath();
                    ctx.fill();
                }

                // Center Corona
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
                ctx.fillStyle = '#C86D51';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
                ctx.fillStyle = '#3A4B29';
                ctx.fill();

                ctx.restore();
            }

            function drawEucalyptusLeaf(ctx, x1, y1, x2, y2) {
                ctx.save();
                ctx.strokeStyle = '#3A4B29';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.quadraticCurveTo((x1+x2)/2 + 20, (y1+y2)/2, x2, y2);
                ctx.stroke();

                // Oval Leaves along stem
                ctx.fillStyle = '#4A5E35';
                for (let t = 0.2; t <= 0.9; t += 0.2) {
                    const lx = x1 + (x2 - x1) * t;
                    const ly = y1 + (y2 - y1) * t;
                    ctx.beginPath();
                    ctx.ellipse(lx + 8, ly, 10, 6, 0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(lx - 8, ly, 10, 6, -0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            function renderBouquet(time) {
                if (!bouquetInfo) return;
                const { cx, cy, list } = bouquetInfo;
                const width = bouquetCanvas.width / (window.devicePixelRatio || 1);
                const height = bouquetCanvas.height / (window.devicePixelRatio || 1);

                bCtx.clearRect(0, 0, bouquetCanvas.width, bouquetCanvas.height);
                bCtx.save();
                bCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

                const stemBaseY = height * 0.95;

                // 1. Draw Stems in Background
                bCtx.strokeStyle = '#3A4B29';
                bCtx.lineWidth = 4;
                list.forEach(f => {
                    bCtx.beginPath();
                    bCtx.moveTo(f.x, f.y);
                    bCtx.quadraticCurveTo(cx + Math.sin(time + f.x) * 5, (f.y + stemBaseY)/2, cx, stemBaseY);
                    bCtx.stroke();
                });

                // 2. Draw Foliage & Eucalyptus
                drawEucalyptusLeaf(bCtx, cx, stemBaseY, cx - 110, cy - 40);
                drawEucalyptusLeaf(bCtx, cx, stemBaseY, cx + 110, cy - 30);

                // 3. Draw Flowers
                list.forEach(f => {
                    // Ease scale animation
                    f.scale += (f.targetScale - f.scale) * 0.1;
                    if (f.scale <= 0.01) return;

                    bCtx.save();
                    bCtx.translate(f.x, f.y);
                    bCtx.scale(f.scale, f.scale);
                    bCtx.translate(-f.x, -f.y);

                    if (f.type === 'sunflower') drawSunflower(bCtx, f.x, f.y, f.size, f.rotation, time);
                    else if (f.type === 'tulip') drawTulip(bCtx, f.x, f.y, f.size, f.rotation, time);
                    else if (f.type === 'gerbera') drawGerbera(bCtx, f.x, f.y, f.size, f.rotation, time);

                    bCtx.restore();
                });

                // 4. Draw Terracotta Bow & Ribbon
                bCtx.fillStyle = '#C86D51';
                bCtx.beginPath();
                bCtx.ellipse(cx - 18, stemBaseY - 60, 22, 12, -0.4, 0, Math.PI * 2);
                bCtx.ellipse(cx + 18, stemBaseY - 60, 22, 12, 0.4, 0, Math.PI * 2);
                bCtx.fill();

                bCtx.beginPath();
                bCtx.arc(cx, stemBaseY - 60, 10, 0, Math.PI * 2);
                bCtx.fillStyle = '#B85B3F';
                bCtx.fill();

                // Ribbon tails
                bCtx.strokeStyle = '#C86D51';
                bCtx.lineWidth = 6;
                bCtx.beginPath();
                bCtx.moveTo(cx, stemBaseY - 60);
                bCtx.quadraticCurveTo(cx - 20, stemBaseY - 20, cx - 35, stemBaseY);
                bCtx.moveTo(cx, stemBaseY - 60);
                bCtx.quadraticCurveTo(cx + 20, stemBaseY - 20, cx + 30, stemBaseY + 5);
                bCtx.stroke();

                bCtx.restore();
            }

            // Tilt Effect on Desktop / Drag on Mobile
            let tiltX = 0, tiltY = 0;
            tiltContainer.addEventListener('mousemove', (e) => {
                const rect = tiltContainer.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width/2;
                const y = e.clientY - rect.top - rect.height/2;
                tiltX = (y / rect.height) * 15;
                tiltY = -(x / rect.width) * 15;
                bouquetCanvas.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
            });

            tiltContainer.addEventListener('mouseleave', () => {
                bouquetCanvas.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            });

            // Tapping a flower in bouquet
            tiltContainer.addEventListener('click', (e) => {
                if (!bouquetInfo) return;
                const rect = bouquetCanvas.getBoundingClientRect();
                const scaleX = bouquetCanvas.width / (window.devicePixelRatio || 1) / rect.width;
                const scaleY = bouquetCanvas.height / (window.devicePixelRatio || 1) / rect.height;
                const clickX = (e.clientX - rect.left) * scaleX;
                const clickY = (e.clientY - rect.top) * scaleY;

                let hit = false;
                bouquetInfo.list.forEach(f => {
                    const dx = clickX - f.x;
                    const dy = clickY - f.y;
                    if (Math.sqrt(dx*dx + dy*dy) < f.size * 1.2) {
                        hit = true;
                        // Bounce scale effect
                        f.scale = 1.35;
                        f.targetScale = 1;
                        playFlowerBell();
                        spawnFlowerSparkles(e.clientX, e.clientY);
                    }
                });

                if (!hit) spawnFlowerSparkles(e.clientX, e.clientY);
            });

            function resizeGlobalCanvas() {
                resizeCanvas(particlesCanvas);
                resizeCanvas(trailCanvas);
            }

            const particles = [];
            function spawnBurstParticles() {
                for (let i = 0; i < 70; i++) {
                    particles.push({
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                        vx: (Math.random() - 0.5) * 12,
                        vy: (Math.random() - 0.7) * 12,
                        size: Math.random() * 8 + 4,
                        color: Math.random() > 0.3 ? '#FFC800' : '#E6A100',
                        rotation: Math.random() * 360,
                        vRot: (Math.random() - 0.5) * 10,
                        life: 1,
                        decay: Math.random() * 0.015 + 0.008
                    });
                }
            }

            function spawnFlowerSparkles(x, y) {
                for (let i = 0; i < 20; i++) {
                    particles.push({
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6 - 2,
                        size: Math.random() * 6 + 3,
                        color: '#FFE066',
                        rotation: 0,
                        vRot: 0,
                        life: 1,
                        decay: 0.03
                    });
                }
            }

            // Interactive Cursor / Touch Trail
            window.addEventListener('mousemove', (e) => {
                if (Math.random() > 0.4) return;
                state.trailParticles.push({
                    x: e.clientX,
                    y: e.clientY,
                    size: Math.random() * 5 + 2,
                    color: Math.random() > 0.5 ? '#FFC800' : '#FFFDF9',
                    life: 1,
                    decay: 0.04
                });
            });

            window.addEventListener('touchmove', (e) => {
                if (!e.touches[0] || Math.random() > 0.3) return;
                state.trailParticles.push({
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    size: Math.random() * 6 + 2,
                    color: '#FFC800',
                    life: 1,
                    decay: 0.04
                });
            });

            function renderParticles() {
                const w = window.innerWidth;
                const h = window.innerHeight;

                pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
                pCtx.save();
                pCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

                // Floating ambient petals
                if (state.opened && Math.random() < 0.08) {
                    particles.push({
                        x: Math.random() * w,
                        y: -20,
                        vx: Math.sin(Date.now() * 0.001) * 1.5 + (Math.random() - 0.5),
                        vy: Math.random() * 1.5 + 1,
                        size: Math.random() * 7 + 5,
                        color: '#FFC800',
                        rotation: Math.random() * 360,
                        vRot: Math.random() * 2 - 1,
                        life: 1,
                        decay: 0.003
                    });
                }

                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.rotation += p.vRot;
                    p.life -= p.decay;

                    if (p.life <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }

                    pCtx.save();
                    pCtx.translate(p.x, p.y);
                    pCtx.rotate(p.rotation * Math.PI / 180);
                    pCtx.globalAlpha = p.life;
                    pCtx.fillStyle = p.color;

                    // Petal shape
                    pCtx.beginPath();
                    pCtx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
                    pCtx.fill();
                    pCtx.restore();
                }
                pCtx.restore();

                // Render Cursor Trail
                tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
                tCtx.save();
                tCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

                for (let i = state.trailParticles.length - 1; i >= 0; i--) {
                    const tp = state.trailParticles[i];
                    tp.life -= tp.decay;
                    if (tp.life <= 0) {
                        state.trailParticles.splice(i, 1);
                        continue;
                    }
                    tCtx.beginPath();
                    tCtx.arc(tp.x, tp.y, tp.size * tp.life, 0, Math.PI * 2);
                    tCtx.fillStyle = tp.color;
                    tCtx.globalAlpha = tp.life;
                    tCtx.fill();
                }
                tCtx.restore();
            }

            let gardenBees = [];
            let gardenFlowers = [];

            function initGardenCanvas() {
                resizeCanvas(gardenCanvas);
                const width = gardenCanvas.width / (window.devicePixelRatio || 1);
                const height = gardenCanvas.height / (window.devicePixelRatio || 1);

                gardenFlowers = [];
                // Generate initial flower bed across bottom
                for (let x = 20; x < width; x += 35 + Math.random() * 25) {
                    gardenFlowers.push({
                        x: x,
                        y: height - 15 - Math.random() * 25,
                        size: 14 + Math.random() * 8,
                        type: Math.random() > 0.5 ? 'sunflower' : 'gerbera',
                        growth: 1
                    });
                }

                // Create 4 interactive Bees
                gardenBees = [];
                for (let i = 0; i < 4; i++) {
                    gardenBees.push({
                        x: Math.random() * width,
                        y: Math.random() * (height * 0.6),
                        targetX: Math.random() * width,
                        targetY: Math.random() * (height * 0.6),
                        speed: 1.8 + Math.random() * 1.2
                    });
                }
            }

            // Click garden canvas to plant a flower and attract bees
            gardenCanvas.addEventListener('click', (e) => {
                const rect = gardenCanvas.getBoundingClientRect();
                const scaleX = gardenCanvas.width / (window.devicePixelRatio || 1) / rect.width;
                const scaleY = gardenCanvas.height / (window.devicePixelRatio || 1) / rect.height;
                const gx = (e.clientX - rect.left) * scaleX;
                const gy = (e.clientY - rect.top) * scaleY;

                const newFlower = {
                    x: gx,
                    y: gy,
                    size: 16 + Math.random() * 8,
                    type: Math.random() > 0.5 ? 'sunflower' : 'tulip',
                    growth: 0
                };
                gardenFlowers.push(newFlower);

                // Direct all bees towards the tapped point
                gardenBees.forEach(b => {
                    b.targetX = gx + (Math.random() - 0.5) * 30;
                    b.targetY = gy + (Math.random() - 0.5) * 30;
                });

                playFlowerBell();
            });

            function renderGarden(time) {
                const width = gardenCanvas.width / (window.devicePixelRatio || 1);
                const height = gardenCanvas.height / (window.devicePixelRatio || 1);

                gCtx.clearRect(0, 0, gardenCanvas.width, gardenCanvas.height);
                gCtx.save();
                gCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

                // Draw Grass Background
                gCtx.fillStyle = '#3A4B29';
                for (let x = 0; x < width; x += 8) {
                    const h = 25 + Math.sin(time*2 + x) * 6;
                    gCtx.beginPath();
                    gCtx.moveTo(x, height);
                    gCtx.quadraticCurveTo(x + 5, height - h, x + 10, height);
                    gCtx.fill();
                }

                // Draw Garden Flowers
                gardenFlowers.forEach(f => {
                    if (f.growth < 1) f.growth += 0.05;
                    gCtx.save();
                    gCtx.translate(f.x, f.y);
                    gCtx.scale(f.growth, f.growth);
                    gCtx.translate(-f.x, -f.y);

                    // Stem
                    gCtx.strokeStyle = '#2D3B1E';
                    gCtx.lineWidth = 2.5;
                    gCtx.beginPath();
                    gCtx.moveTo(f.x, f.y);
                    gCtx.lineTo(f.x, height);
                    gCtx.stroke();

                    if (f.type === 'sunflower') drawSunflower(gCtx, f.x, f.y, f.size, 0, time);
                    else if (f.type === 'tulip') drawTulip(gCtx, f.x, f.y, f.size, 0, time);
                    else drawGerbera(gCtx, f.x, f.y, f.size, 0, time);

                    gCtx.restore();
                });

                // Update & Render Bees
                gardenBees.forEach(b => {
                    const dx = b.targetX - b.x;
                    const dy = b.targetY - b.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < 10) {
                        // Pick new random flower target
                        if (gardenFlowers.length > 0) {
                            const randomFlower = gardenFlowers[Math.floor(Math.random() * gardenFlowers.length)];
                            b.targetX = randomFlower.x;
                            b.targetY = randomFlower.y - 10;
                        }
                    } else {
                        b.x += (dx / dist) * b.speed;
                        b.y += (dy / dist) * b.speed;
                    }

                    // Render Bee
                    gCtx.save();
                    gCtx.translate(b.x, b.y);
                    const angle = Math.atan2(dy, dx);
                    gCtx.rotate(angle);

                    // Flapping Wings
                    const wingSway = Math.sin(time * 35) * 5;
                    gCtx.fillStyle = 'rgba(255,255,255,0.8)';
                    gCtx.beginPath();
                    gCtx.ellipse(0, -6 + wingSway*0.3, 6, 3, Math.PI*0.3, 0, Math.PI*2);
                    gCtx.ellipse(0, 6 - wingSway*0.3, 6, 3, -Math.PI*0.3, 0, Math.PI*2);
                    gCtx.fill();

                    // Bee Body
                    gCtx.fillStyle = '#FFC800';
                    gCtx.beginPath();
                    gCtx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
                    gCtx.fill();

                    // Stripes
                    gCtx.strokeStyle = '#2B2118';
                    gCtx.lineWidth = 1.8;
                    gCtx.beginPath();
                    gCtx.moveTo(-2, -4); gCtx.lineTo(-2, 4);
                    gCtx.moveTo(2, -4); gCtx.lineTo(2, 4);
                    gCtx.stroke();

                    gCtx.restore();
                });

                gCtx.restore();
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            }, { threshold: 0.15 });

            document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));


            // =========================================================
            // COMPATIBILIDAD / RESIZE / AUDIO
            // =========================================================
            if (backgroundMusic) {
                backgroundMusic.addEventListener('ended', () => {
                    // Refuerzo del loop para navegadores que manejan
                    // de forma irregular el atributo loop con ciertos formatos.
                    backgroundMusic.currentTime = 0;
                    startBackgroundMusic();
                });

                backgroundMusic.addEventListener('error', () => {
                    console.warn('No se pudo cargar song/floamr.mpeg. Verifica que el archivo exista.');
                });
            }

            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible' &&
                    state.soundEnabled &&
                    backgroundMusic &&
                    backgroundMusic.paused) {
                    startBackgroundMusic();
                }
            });

            function init() {
                initBouquetCanvas();
                resizeGlobalCanvas();
                initGardenCanvas();

                window.addEventListener('resize', () => {
                    initBouquetCanvas();
                    resizeGlobalCanvas();
                    initGardenCanvas();
                });

                function animationLoop(timestamp) {
                    const time = timestamp * 0.001;
                    renderBouquet(time);
                    renderParticles();
                    renderGarden(time);
                    requestAnimationFrame(animationLoop);
                }

                requestAnimationFrame(animationLoop);
            }

            window.onload = init;
        });
