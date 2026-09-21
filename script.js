document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // ESTADO GLOBAL
    // =========================================================

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


    // =========================================================
    // ELEMENTOS HTML
    // =========================================================

    const loadingOverlay =
        document.getElementById('loadingOverlay');

    const progressBar =
        document.getElementById('progressBar');

    const progressPercent =
        document.getElementById('progressPercent');

    const loadingText =
        document.getElementById('loadingText');

    const introOverlay =
        document.getElementById('introOverlay');

    const btnAbrir =
        document.getElementById('btnAbrir');

    const btnReset =
        document.getElementById('btnReset');

    const soundToggle =
        document.getElementById('soundToggle');

    const soundIcon =
        document.getElementById('soundIcon');

    const soundLabel =
        document.getElementById('soundLabel');

    const bouquetCanvas =
        document.getElementById('bouquetCanvas');

    const particlesCanvas =
        document.getElementById('particlesCanvas');

    const trailCanvas =
        document.getElementById('trailCanvas');

    const gardenCanvas =
        document.getElementById('gardenCanvas');

    const tiltContainer =
        document.getElementById('tiltContainer');


    // =========================================================
    // CONTEXTOS CANVAS
    // =========================================================

    const bCtx =
        bouquetCanvas.getContext('2d');

    const pCtx =
        particlesCanvas.getContext('2d');

    const tCtx =
        trailCanvas.getContext('2d');

    const gCtx =
        gardenCanvas.getContext('2d');


    // =========================================================
    // MÚSICA
    // =========================================================

    const backgroundMusic =
        document.getElementById('backgroundMusic');


    async function startBackgroundMusic() {

        if (!backgroundMusic) {
            return false;
        }

        backgroundMusic.loop = true;

        backgroundMusic.volume = 0.85;

        backgroundMusic.muted = false;

        try {

            await backgroundMusic.play();

            return true;

        } catch (error) {

            console.warn(
                'El navegador bloqueó la reproducción automática. Usa el botón de música para intentarlo de nuevo.'
            );

            return false;
        }
    }


    function stopBackgroundMusic() {

        if (!backgroundMusic) {
            return;
        }

        backgroundMusic.pause();
    }


    // =========================================================
    // ACTUALIZAR BOTÓN DE SONIDO
    // =========================================================

    function updateSoundButton() {

        soundIcon.textContent =
            state.soundEnabled
                ? '🔊'
                : '🔇';

        soundLabel.textContent =
            state.soundEnabled
                ? 'Activado'
                : 'Activar';

        soundToggle.setAttribute(
            'aria-pressed',
            String(state.soundEnabled)
        );

        soundToggle.classList.toggle(
            'sound-on',
            state.soundEnabled
        );
    }


    // =========================================================
    // BOTÓN ACTIVAR / DESACTIVAR
    // =========================================================

    async function toggleBackgroundMusic() {

        if (!backgroundMusic) {
            return;
        }


        if (backgroundMusic.paused) {

            try {

                backgroundMusic.muted = false;

                backgroundMusic.volume = 0.85;

                await backgroundMusic.play();

                state.soundEnabled = true;

            } catch (error) {

                state.soundEnabled = false;

                soundIcon.textContent = '⚠️';

                soundLabel.textContent = 'Reintentar';

                soundToggle.setAttribute(
                    'aria-pressed',
                    'false'
                );

                return;
            }

        } else {

            backgroundMusic.pause();

            state.soundEnabled = false;
        }


        updateSoundButton();
    }


    soundToggle.addEventListener(
        'click',
        toggleBackgroundMusic
    );


    updateSoundButton();


    // =========================================================
    // FLOR DE CARGA
    // =========================================================

    const loadingPetalsGroup =
        document.getElementById('loadingFlowerPetals');


    for (let i = 0; i < 12; i++) {

        const angle =
            (i * 30) * Math.PI / 180;


        const petal =
            document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
            );


        const x1 =
            50 +
            Math.cos(angle) * 16;


        const y1 =
            50 +
            Math.sin(angle) * 16;


        const x2 =
            50 +
            Math.cos(angle) * 38;


        const y2 =
            50 +
            Math.sin(angle) * 38;


        petal.setAttribute(
            'd',
            `M ${x1} ${y1}
             Q ${50 + Math.cos(angle + 0.3) * 30}
               ${50 + Math.sin(angle + 0.3) * 30}
               ${x2} ${y2}
             Q ${50 + Math.cos(angle - 0.3) * 30}
               ${50 + Math.sin(angle - 0.3) * 30}
               ${x1} ${y1}`
        );


        petal.setAttribute(
            'fill',
            '#FFC800'
        );


        petal.setAttribute(
            'stroke',
            '#E6A100'
        );


        petal.setAttribute(
            'stroke-width',
            '1'
        );


        loadingPetalsGroup.appendChild(
            petal
        );
    }


    // =========================================================
    // ABEJA DE CARGA
    // =========================================================

    const loadingBee =
        document.getElementById('loadingBee');

    let beeAngle = 0;


    const loadingPhrases = [

        'Cultivando tus flores amarillas...',

        'Juntando rayos de sol...',

        'Tejiendo la brisa cálida...',

        'Alistando un detalle del corazón...'
    ];


    let progress = 0;


    const loadingInterval =
        setInterval(() => {

            progress +=
                Math.random() * 8 + 4;


            if (progress > 100) {
                progress = 100;
            }


            progressBar.style.width =
                `${progress}%`;


            progressPercent.textContent =
                `${Math.floor(progress)}%`;


            const phraseIdx =
                Math.min(
                    Math.floor(
                        (progress / 100) *
                        loadingPhrases.length
                    ),
                    loadingPhrases.length - 1
                );


            loadingText.textContent =
                loadingPhrases[phraseIdx];


            beeAngle += 0.15;


            const radius = 32;


            const bx =
                Math.cos(beeAngle) *
                radius;


            const by =
                Math.sin(beeAngle) *
                radius;


            loadingBee.style.transform =
                `translate(${bx}px, ${by}px)
                 rotate(${beeAngle * 57.3 + 90}deg)`;


            if (progress >= 100) {

                clearInterval(
                    loadingInterval
                );

                setTimeout(
                    finishLoading,
                    400
                );
            }

        }, 120);


    function finishLoading() {

        loadingOverlay.classList.add(
            'opacity-0',
            'pointer-events-none'
        );


        setTimeout(() => {

            loadingOverlay.style.display =
                'none';

            runIntroSequence();

        }, 700);
    }


    // =========================================================
    // INTRO
    // =========================================================

    function runIntroSequence() {

        const s1 =
            document.getElementById('introStep1');

        const s2 =
            document.getElementById('introStep2');

        const s3 =
            document.getElementById('introStep3');


        setTimeout(() => {

            s1.classList.add(
                'opacity-0'
            );


            setTimeout(() => {

                s1.classList.add(
                    'hidden'
                );

                s2.classList.remove(
                    'hidden'
                );


                setTimeout(() => {

                    s2.classList.remove(
                        'opacity-0'
                    );

                }, 50);

            }, 600);

        }, 2200);


        setTimeout(() => {

            s2.classList.add(
                'opacity-0'
            );


            setTimeout(() => {

                s2.classList.add(
                    'hidden'
                );

                s3.classList.remove(
                    'hidden'
                );


                setTimeout(() => {

                    s3.classList.remove(
                        'opacity-0'
                    );

                }, 50);

            }, 600);

        }, 4600);
    }


    // =========================================================
    // BOTÓN ABRIR
    // =========================================================

    btnAbrir.addEventListener(
        'click',
        async () => {

            const musicStarted =
                await startBackgroundMusic();


            state.soundEnabled =
                musicStarted;


            updateSoundButton();


            spawnBurstParticles();


            introOverlay.classList.add(
                'opacity-0',
                'pointer-events-none'
            );


            setTimeout(() => {

                introOverlay.style.display =
                    'none';

                state.opened = true;

                triggerBouquetBloom();

            }, 800);
        }
    );


    // =========================================================
    // BOTÓN REINICIAR
    // =========================================================

    if (btnReset) {

        btnReset.addEventListener(
            'click',
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });


                setTimeout(() => {

                    location.reload();

                }, 400);
            }
        );
    }


    // =========================================================
    // RESIZE CANVAS
    // =========================================================

    function resizeCanvas(canvas) {

        const rect =
            canvas.getBoundingClientRect();


        const dpr =
            window.devicePixelRatio || 1;


        canvas.width =
            rect.width * dpr;


        canvas.height =
            rect.height * dpr;


        return {
            width: rect.width,
            height: rect.height,
            dpr
        };
    }


    // =========================================================
    // DATOS DEL RAMO
    // SOLO 5 GIRASOLES + 4 TULIPANES
    // =========================================================

    function createBouquetData(
        width,
        height
    ) {

        const cx =
            width / 2;


        const cy =
            height * 0.48;


        const list = [];


        // -----------------------------------------------------
        // 5 GIRASOLES
        // -----------------------------------------------------

        for (let i = 0; i < 5; i++) {

            const ang =
                (i / 5) *
                Math.PI * 2 +
                (Math.random() * 0.3);


            const dist =
                35 +
                Math.random() * 75;


            list.push({

                type: 'sunflower',

                x:
                    cx +
                    Math.cos(ang) *
                    dist,

                y:
                    cy +
                    Math.sin(ang) *
                    (dist * 0.8) -
                    20,

                size:
                    32 +
                    Math.random() * 10,

                rotation:
                    Math.random() *
                    Math.PI,

                swayOffset:
                    Math.random() * 100,

                scale: 0,

                targetScale: 1
            });
        }


        // -----------------------------------------------------
        // 4 TULIPANES
        // -----------------------------------------------------

        for (let i = 0; i < 4; i++) {

            const ang =
                (i / 4) *
                Math.PI * 2 +
                0.2;


            const dist =
                60 +
                Math.random() * 95;


            list.push({

                type: 'tulip',

                x:
                    cx +
                    Math.cos(ang) *
                    dist,

                y:
                    cy +
                    Math.sin(ang) *
                    (dist * 0.85) -
                    40,

                size:
                    22 +
                    Math.random() * 7,

                rotation:
                    (Math.random() - 0.5) *
                    0.5,

                swayOffset:
                    Math.random() * 100,

                scale: 0,

                targetScale: 1
            });
        }


        return {
            cx,
            cy,
            list
        };
    }


    let bouquetInfo = null;


    function initBouquetCanvas() {

        const {
            width,
            height
        } = resizeCanvas(
            bouquetCanvas
        );


        bouquetInfo =
            createBouquetData(
                width,
                height
            );
    }


    function triggerBouquetBloom() {

        if (!bouquetInfo) {
            return;
        }


        bouquetInfo.list.forEach(
            (flower, index) => {

                setTimeout(() => {

                    flower.scale = 0;

                    flower.targetScale = 1;

                }, index * 100);
            }
        );
    }


    // =========================================================
    // DIBUJAR GIRASOL
    // =========================================================

    function drawSunflower(
        ctx,
        x,
        y,
        size,
        rotation,
        time
    ) {

        ctx.save();


        ctx.translate(
            x,
            y
        );


        ctx.rotate(
            rotation +
            Math.sin(time + x) *
            0.04
        );


        const petalCount = 20;


        for (
            let layer = 0;
            layer < 2;
            layer++
        ) {

            const rInner =
                size *
                (layer === 0
                    ? 0.6
                    : 0.55);


            const rOuter =
                size *
                (layer === 0
                    ? 1.3
                    : 1.15);


            ctx.fillStyle =
                layer === 0
                    ? '#FFC800'
                    : '#E6A100';


            for (
                let i = 0;
                i < petalCount;
                i++
            ) {

                const a =
                    (i / petalCount) *
                    Math.PI * 2 +
                    (layer * 0.15);


                ctx.beginPath();


                ctx.moveTo(
                    Math.cos(a) *
                    rInner,

                    Math.sin(a) *
                    rInner
                );


                ctx.quadraticCurveTo(

                    Math.cos(a + 0.1) *
                        rOuter *
                        1.1,

                    Math.sin(a + 0.1) *
                        rOuter *
                        1.1,

                    Math.cos(a) *
                        rOuter,

                    Math.sin(a) *
                        rOuter
                );


                ctx.quadraticCurveTo(

                    Math.cos(a - 0.1) *
                        rOuter *
                        1.1,

                    Math.sin(a - 0.1) *
                        rOuter *
                        1.1,

                    Math.cos(a) *
                        rInner,

                    Math.sin(a) *
                        rInner
                );


                ctx.fill();
            }
        }


        // Centro
        ctx.beginPath();

        ctx.arc(
            0,
            0,
            size * 0.55,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            '#3D2314';

        ctx.fill();


        ctx.strokeStyle =
            '#5A351D';

        ctx.lineWidth = 2;

        ctx.stroke();


        // Semillas
        ctx.fillStyle =
            '#D4A017';


        for (
            let i = 0;
            i < 40;
            i++
        ) {

            const r =
                Math.sqrt(i) *
                (size * 0.075);


            const theta =
                i * 2.39996;


            ctx.beginPath();


            ctx.arc(

                Math.cos(theta) * r,

                Math.sin(theta) * r,

                1.2,

                0,

                Math.PI * 2

            );


            ctx.fill();
        }


        ctx.restore();
    }


    // =========================================================
    // DIBUJAR TULIPÁN
    // =========================================================

    function drawTulip(
        ctx,
        x,
        y,
        size,
        rotation,
        time
    ) {

        ctx.save();


        ctx.translate(
            x,
            y
        );


        ctx.rotate(
            rotation +
            Math.sin(time + y) *
            0.05
        );


        const w =
            size * 0.85;


        const h =
            size * 1.25;


        // Capa exterior
        ctx.fillStyle =
            '#E69500';


        ctx.beginPath();


        ctx.moveTo(
            -w,
            -h * 0.2
        );


        ctx.quadraticCurveTo(
            -w * 1.2,
            -h,
            0,
            -h * 1.1
        );


        ctx.quadraticCurveTo(
            w * 1.2,
            -h,
            w,
            -h * 0.2
        );


        ctx.quadraticCurveTo(
            0,
            h * 0.5,
            -w,
            -h * 0.2
        );


        ctx.fill();


        // Capa interior
        ctx.fillStyle =
            '#FFC800';


        ctx.beginPath();


        ctx.moveTo(
            -w * 0.8,
            -h * 0.1
        );


        ctx.quadraticCurveTo(
            -w * 0.9,
            -h * 0.95,
            0,
            -h
        );


        ctx.quadraticCurveTo(
            w * 0.9,
            -h * 0.95,
            w * 0.8,
            -h * 0.1
        );


        ctx.quadraticCurveTo(
            0,
            h * 0.4,
            -w * 0.8,
            -h * 0.1
        );


        ctx.fill();


        // Brillo
        ctx.fillStyle =
            '#FFE066';


        ctx.beginPath();


        ctx.moveTo(
            -w * 0.4,
            -h * 0.2
        );


        ctx.quadraticCurveTo(
            0,
            -h * 1.05,
            w * 0.4,
            -h * 0.2
        );


        ctx.quadraticCurveTo(
            0,
            h * 0.2,
            -w * 0.4,
            -h * 0.2
        );


        ctx.fill();


        ctx.restore();
    }


    // =========================================================
    // HOJAS
    // =========================================================

    function drawEucalyptusLeaf(
        ctx,
        x1,
        y1,
        x2,
        y2
    ) {

        const dx =
            x2 - x1;


        const dy =
            y2 - y1;


        const angle =
            Math.atan2(
                dy,
                dx
            );


        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        ctx.save();


        ctx.translate(
            x1,
            y1
        );


        ctx.rotate(
            angle
        );


        ctx.fillStyle =
            '#687A4A';


        ctx.beginPath();


        ctx.ellipse(
            length * 0.5,
            0,
            length * 0.35,
            6,
            0,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.restore();
    }


    // =========================================================
    // RENDER DEL RAMO
    // =========================================================

    function renderBouquet(time) {

        if (!bouquetInfo) {
            return;
        }


        const width =
            bouquetCanvas.width /
            (window.devicePixelRatio || 1);


        const height =
            bouquetCanvas.height /
            (window.devicePixelRatio || 1);


        bCtx.clearRect(
            0,
            0,
            bouquetCanvas.width,
            bouquetCanvas.height
        );


        bCtx.save();


        bCtx.scale(
            window.devicePixelRatio || 1,
            window.devicePixelRatio || 1
        );


        const cx =
            bouquetInfo.cx;


        const cy =
            bouquetInfo.cy;


        // Tallos
        bouquetInfo.list.forEach(
            flower => {

                bCtx.save();

                bCtx.strokeStyle =
                    '#52653A';

                bCtx.lineWidth = 3;

                bCtx.beginPath();

                bCtx.moveTo(
                    cx,
                    height
                );

                bCtx.quadraticCurveTo(

                    cx +
                        (flower.x - cx) *
                        0.3,

                    flower.y +
                        100,

                    flower.x,

                    flower.y
                );

                bCtx.stroke();

                bCtx.restore();
            }
        );


        // Hojas decorativas
        drawEucalyptusLeaf(
            bCtx,
            cx - 20,
            height - 30,
            cx - 90,
            height - 110
        );


        drawEucalyptusLeaf(
            bCtx,
            cx + 20,
            height - 40,
            cx + 90,
            height - 120
        );


        // Flores
        bouquetInfo.list.forEach(
            flower => {

                if (flower.scale < 1) {

                    flower.scale +=
                        0.035;

                    if (flower.scale > 1) {
                        flower.scale = 1;
                    }
                }


                const scale =
                    flower.scale;


                bCtx.save();


                bCtx.translate(
                    flower.x,
                    flower.y
                );


                bCtx.scale(
                    scale,
                    scale
                );


                bCtx.translate(
                    -flower.x,
                    -flower.y
                );


                if (
                    flower.type ===
                    'sunflower'
                ) {

                    drawSunflower(
                        bCtx,
                        flower.x,
                        flower.y,
                        flower.size,
                        flower.rotation,
                        time
                    );

                } else {

                    drawTulip(
                        bCtx,
                        flower.x,
                        flower.y,
                        flower.size,
                        flower.rotation,
                        time
                    );
                }


                bCtx.restore();


                if (flower.scale > 1) {

                    flower.scale -=
                        0.025;

                    if (flower.scale < 1) {
                        flower.scale = 1;
                    }
                }
            }
        );


        bCtx.restore();
    }


    // =========================================================
    // EFECTO TILT DEL RAMO
    // =========================================================

    let tiltX = 0;
    let tiltY = 0;


    tiltContainer.addEventListener(
        'mousemove',
        event => {

            const rect =
                tiltContainer.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left -
                rect.width / 2;


            const y =
                event.clientY -
                rect.top -
                rect.height / 2;


            tiltX =
                (y / rect.height) *
                15;


            tiltY =
                -(x / rect.width) *
                15;


            bouquetCanvas.style.transform =
                `perspective(1000px)
                 rotateX(${tiltX}deg)
                 rotateY(${tiltY}deg)
                 scale(1.03)`;
        }
    );


    tiltContainer.addEventListener(
        'mouseleave',
        () => {

            bouquetCanvas.style.transform =
                `perspective(1000px)
                 rotateX(0deg)
                 rotateY(0deg)
                 scale(1)`;
        }
    );


    // =========================================================
    // SONIDO DE FLOR
    // =========================================================

    function playFlowerBell() {

        try {

            if (!state.audioCtx) {

                state.audioCtx =
                    new (
                        window.AudioContext ||
                        window.webkitAudioContext
                    )();
            }


            const ctx =
                state.audioCtx;


            if (
                ctx.state ===
                'suspended'
            ) {

                ctx.resume();
            }


            const oscillator =
                ctx.createOscillator();


            const gain =
                ctx.createGain();


            oscillator.type =
                'sine';


            oscillator.frequency.setValueAtTime(
                620,
                ctx.currentTime
            );


            oscillator.frequency.exponentialRampToValueAtTime(
                980,
                ctx.currentTime + 0.12
            );


            gain.gain.setValueAtTime(
                0.0001,
                ctx.currentTime
            );


            gain.gain.exponentialRampToValueAtTime(
                0.12,
                ctx.currentTime + 0.02
            );


            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                ctx.currentTime + 0.3
            );


            oscillator.connect(gain);

            gain.connect(ctx.destination);


            oscillator.start();

            oscillator.stop(
                ctx.currentTime + 0.3
            );

        } catch (error) {

            console.warn(
                'No se pudo reproducir el sonido de la flor.'
            );
        }
    }


    // =========================================================
    // TOCAR FLORES DEL RAMO
    // =========================================================

    tiltContainer.addEventListener(
        'click',
        event => {

            if (!bouquetInfo) {
                return;
            }


            const rect =
                bouquetCanvas.getBoundingClientRect();


            const dpr =
                window.devicePixelRatio || 1;


            const scaleX =
                bouquetCanvas.width /
                dpr /
                rect.width;


            const scaleY =
                bouquetCanvas.height /
                dpr /
                rect.height;


            const clickX =
                (event.clientX -
                    rect.left) *
                scaleX;


            const clickY =
                (event.clientY -
                    rect.top) *
                scaleY;


            let hit = false;


            bouquetInfo.list.forEach(
                flower => {

                    const dx =
                        clickX -
                        flower.x;


                    const dy =
                        clickY -
                        flower.y;


                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    if (
                        distance <
                        flower.size * 1.2
                    ) {

                        hit = true;


                        flower.scale =
                            1.35;


                        flower.targetScale =
                            1;


                        playFlowerBell();


                        spawnFlowerSparkles(
                            event.clientX,
                            event.clientY
                        );
                    }
                }
            );


            if (!hit) {

                spawnFlowerSparkles(
                    event.clientX,
                    event.clientY
                );
            }
        }
    );


    // =========================================================
    // CANVAS GLOBALES
    // =========================================================

    function resizeGlobalCanvas() {

        resizeCanvas(
            particlesCanvas
        );

        resizeCanvas(
            trailCanvas
        );
    }


    const particles = [];


    // =========================================================
    // EXPLOSIÓN DE PARTÍCULAS
    // =========================================================

    function spawnBurstParticles() {

        for (
            let i = 0;
            i < 70;
            i++
        ) {

            particles.push({

                x:
                    window.innerWidth / 2,

                y:
                    window.innerHeight / 2,

                vx:
                    (Math.random() - 0.5) *
                    12,

                vy:
                    (Math.random() - 0.7) *
                    12,

                size:
                    Math.random() * 8 + 4,

                color:
                    Math.random() > 0.3
                        ? '#FFC800'
                        : '#E6A100',

                rotation:
                    Math.random() * 360,

                vRot:
                    (Math.random() - 0.5) * 10,

                life: 1,

                decay:
                    Math.random() *
                    0.015 +
                    0.008
            });
        }
    }


    // =========================================================
    // CHISPAS
    // =========================================================

    function spawnFlowerSparkles(
        x,
        y
    ) {

        for (
            let i = 0;
            i < 20;
            i++
        ) {

            particles.push({

                x,

                y,

                vx:
                    (Math.random() - 0.5) *
                    6,

                vy:
                    (Math.random() - 0.5) *
                    6 -
                    2,

                size:
                    Math.random() * 6 + 3,

                color:
                    '#FFE066',

                rotation: 0,

                vRot: 0,

                life: 1,

                decay: 0.03
            });
        }
    }


    // =========================================================
    // RASTRO DEL CURSOR
    // =========================================================

    window.addEventListener(
        'mousemove',
        event => {

            if (
                Math.random() >
                0.4
            ) {
                return;
            }


            state.trailParticles.push({

                x:
                    event.clientX,

                y:
                    event.clientY,

                size:
                    Math.random() * 5 + 2,

                color:
                    Math.random() > 0.5
                        ? '#FFC800'
                        : '#FFFDF9',

                life: 1,

                decay: 0.04
            });
        }
    );


    window.addEventListener(
        'touchmove',
        event => {

            if (
                !event.touches[0] ||
                Math.random() > 0.3
            ) {
                return;
            }


            state.trailParticles.push({

                x:
                    event.touches[0].clientX,

                y:
                    event.touches[0].clientY,

                size:
                    Math.random() * 6 + 2,

                color:
                    '#FFC800',

                life: 1,

                decay: 0.04
            });
        }
    );


    // =========================================================
    // RENDER PARTÍCULAS
    // =========================================================

    function renderParticles() {

        const w =
            window.innerWidth;


        const h =
            window.innerHeight;


        pCtx.clearRect(
            0,
            0,
            particlesCanvas.width,
            particlesCanvas.height
        );


        pCtx.save();


        pCtx.scale(
            window.devicePixelRatio || 1,
            window.devicePixelRatio || 1
        );


        // Pétalos ambientales
        if (
            state.opened &&
            Math.random() < 0.08
        ) {

            particles.push({

                x:
                    Math.random() * w,

                y:
                    -20,

                vx:
                    Math.sin(
                        Date.now() * 0.001
                    ) * 1.5 +
                    (Math.random() - 0.5),

                vy:
                    Math.random() * 1.5 +
                    1,

                size:
                    Math.random() * 7 + 5,

                color:
                    '#FFC800',

                rotation:
                    Math.random() * 360,

                vRot:
                    Math.random() * 2 - 1,

                life: 1,

                decay: 0.003
            });
        }


        for (
            let i = particles.length - 1;
            i >= 0;
            i--
        ) {

            const p =
                particles[i];


            p.x += p.vx;

            p.y += p.vy;

            p.rotation += p.vRot;

            p.life -= p.decay;


            if (p.life <= 0) {

                particles.splice(
                    i,
                    1
                );

                continue;
            }


            pCtx.save();


            pCtx.translate(
                p.x,
                p.y
            );


            pCtx.rotate(
                p.rotation *
                Math.PI /
                180
            );


            pCtx.globalAlpha =
                p.life;


            pCtx.fillStyle =
                p.color;


            pCtx.beginPath();


            pCtx.ellipse(
                0,
                0,
                p.size,
                p.size * 0.5,
                0,
                0,
                Math.PI * 2
            );


            pCtx.fill();


            pCtx.restore();
        }


        pCtx.restore();


        // -----------------------------------------------------
        // RASTRO
        // -----------------------------------------------------

        tCtx.clearRect(
            0,
            0,
            trailCanvas.width,
            trailCanvas.height
        );


        tCtx.save();


        tCtx.scale(
            window.devicePixelRatio || 1,
            window.devicePixelRatio || 1
        );


        for (
            let i =
                state.trailParticles.length - 1;
            i >= 0;
            i--
        ) {

            const particle =
                state.trailParticles[i];


            particle.life -=
                particle.decay;


            if (
                particle.life <= 0
            ) {

                state.trailParticles.splice(
                    i,
                    1
                );

                continue;
            }


            tCtx.beginPath();


            tCtx.arc(

                particle.x,

                particle.y,

                particle.size *
                    particle.life,

                0,

                Math.PI * 2
            );


            tCtx.fillStyle =
                particle.color;


            tCtx.globalAlpha =
                particle.life;


            tCtx.fill();
        }


        tCtx.restore();
    }


    // =========================================================
    // JARDÍN
    // =========================================================

    let gardenBees = [];

    let gardenFlowers = [];


    function initGardenCanvas() {

        resizeCanvas(
            gardenCanvas
        );


        const width =
            gardenCanvas.width /
            (window.devicePixelRatio || 1);


        const height =
            gardenCanvas.height /
            (window.devicePixelRatio || 1);


        gardenFlowers = [];


        // Flores iniciales reducidas
        for (
            let x = 30;
            x < width;
            x += 65 +
                Math.random() * 40
        ) {

            gardenFlowers.push({

                x,

                y:
                    height -
                    15 -
                    Math.random() *
                    25,

                size:
                    14 +
                    Math.random() * 8,

                type:
                    Math.random() > 0.5
                        ? 'sunflower'
                        : 'tulip',

                growth: 1
            });
        }


        // Solo 3 abejas
        gardenBees = [];


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            gardenBees.push({

                x:
                    Math.random() *
                    width,

                y:
                    Math.random() *
                    (height * 0.6),

                targetX:
                    Math.random() *
                    width,

                targetY:
                    Math.random() *
                    (height * 0.6),

                speed:
                    1.8 +
                    Math.random() * 1.2
            });
        }
    }


    // =========================================================
    // PLANTAR FLORES EN EL JARDÍN
    // =========================================================

    gardenCanvas.addEventListener(
        'click',
        event => {

            const rect =
                gardenCanvas.getBoundingClientRect();


            const dpr =
                window.devicePixelRatio || 1;


            const scaleX =
                gardenCanvas.width /
                dpr /
                rect.width;


            const scaleY =
                gardenCanvas.height /
                dpr /
                rect.height;


            const gx =
                (event.clientX -
                    rect.left) *
                scaleX;


            const gy =
                (event.clientY -
                    rect.top) *
                scaleY;


            const newFlower = {

                x: gx,

                y: gy,

                size:
                    16 +
                    Math.random() * 8,

                type:
                    Math.random() > 0.5
                        ? 'sunflower'
                        : 'tulip',

                growth: 0
            };


            gardenFlowers.push(
                newFlower
            );


            // Todas las abejas van al lugar tocado
            gardenBees.forEach(
                bee => {

                    bee.targetX =
                        gx +
                        (Math.random() - 0.5) *
                        30;


                    bee.targetY =
                        gy +
                        (Math.random() - 0.5) *
                        30;
                }
            );


            playFlowerBell();


            spawnFlowerSparkles(
                event.clientX,
                event.clientY
            );
        }
    );


    // =========================================================
    // RENDER JARDÍN
    // =========================================================

    function renderGarden(time) {

        const width =
            gardenCanvas.width /
            (window.devicePixelRatio || 1);


        const height =
            gardenCanvas.height /
            (window.devicePixelRatio || 1);


        gCtx.clearRect(
            0,
            0,
            gardenCanvas.width,
            gardenCanvas.height
        );


        gCtx.save();


        gCtx.scale(
            window.devicePixelRatio || 1,
            window.devicePixelRatio || 1
        );


        // Hierba
        gCtx.fillStyle =
            '#3A4B29';


        for (
            let x = 0;
            x < width;
            x += 8
        ) {

            const h =
                25 +
                Math.sin(
                    time * 2 + x
                ) *
                6;


            gCtx.beginPath();


            gCtx.moveTo(
                x,
                height
            );


            gCtx.quadraticCurveTo(

                x + 5,

                height - h,

                x + 10,

                height
            );


            gCtx.fill();
        }


        // Flores
        gardenFlowers.forEach(
            flower => {

                if (
                    flower.growth < 1
                ) {

                    flower.growth +=
                        0.05;
                }


                gCtx.save();


                gCtx.translate(
                    flower.x,
                    flower.y
                );


                gCtx.scale(
                    flower.growth,
                    flower.growth
                );


                gCtx.translate(
                    -flower.x,
                    -flower.y
                );


                // Tallo
                gCtx.strokeStyle =
                    '#2D3B1E';


                gCtx.lineWidth =
                    2.5;


                gCtx.beginPath();


                gCtx.moveTo(
                    flower.x,
                    flower.y
                );


                gCtx.lineTo(
                    flower.x,
                    height
                );


                gCtx.stroke();


                if (
                    flower.type ===
                    'sunflower'
                ) {

                    drawSunflower(
                        gCtx,
                        flower.x,
                        flower.y,
                        flower.size,
                        0,
                        time
                    );

                } else {

                    drawTulip(
                        gCtx,
                        flower.x,
                        flower.y,
                        flower.size,
                        0,
                        time
                    );
                }


                gCtx.restore();
            }
        );


        // Abejas
        gardenBees.forEach(
            bee => {

                const dx =
                    bee.targetX -
                    bee.x;


                const dy =
                    bee.targetY -
                    bee.y;


                const dist =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    dist < 10
                ) {

                    if (
                        gardenFlowers.length >
                        0
                    ) {

                        const flower =
                            gardenFlowers[
                                Math.floor(
                                    Math.random() *
                                    gardenFlowers.length
                                )
                            ];


                        bee.targetX =
                            flower.x;


                        bee.targetY =
                            flower.y -
                            10;
                    }

                } else {

                    bee.x +=
                        (dx / dist) *
                        bee.speed;


                    bee.y +=
                        (dy / dist) *
                        bee.speed;
                }


                // Dibujar abeja
                gCtx.save();


                gCtx.translate(
                    bee.x,
                    bee.y
                );


                const angle =
                    Math.atan2(
                        dy,
                        dx
                    );


                gCtx.rotate(
                    angle
                );


                const wingSway =
                    Math.sin(
                        time * 35
                    ) * 5;


                // Alas
                gCtx.fillStyle =
                    'rgba(255,255,255,0.8)';


                gCtx.beginPath();


                gCtx.ellipse(
                    0,
                    -6 + wingSway * 0.3,
                    6,
                    3,
                    Math.PI * 0.3,
                    0,
                    Math.PI * 2
                );


                gCtx.ellipse(
                    0,
                    6 - wingSway * 0.3,
                    6,
                    3,
                    -Math.PI * 0.3,
                    0,
                    Math.PI * 2
                );


                gCtx.fill();


                // Cuerpo
                gCtx.fillStyle =
                    '#FFC800';


                gCtx.beginPath();


                gCtx.ellipse(
                    0,
                    0,
                    7,
                    5,
                    0,
                    0,
                    Math.PI * 2
                );


                gCtx.fill();


                // Rayas
                gCtx.strokeStyle =
                    '#2B2118';


                gCtx.lineWidth =
                    1.8;


                gCtx.beginPath();


                gCtx.moveTo(
                    -2,
                    -4
                );


                gCtx.lineTo(
                    -2,
                    4
                );


                gCtx.moveTo(
                    2,
                    -4
                );


                gCtx.lineTo(
                    2,
                    4
                );


                gCtx.stroke();


                gCtx.restore();
            }
        );


        gCtx.restore();
    }


    // =========================================================
    // ANIMACIÓN DE LAS TARJETAS
    // =========================================================
    // El poema ya es visible desde el inicio. No dependemos de
    // IntersectionObserver para mostrar el contenido.

    // =========================================================
    // AUDIO
    // =========================================================

    if (backgroundMusic) {

        backgroundMusic.addEventListener(
            'ended',
            async () => {

                if (
                    state.soundEnabled
                ) {

                    const started =
                        await startBackgroundMusic();


                    if (!started) {

                        state.soundEnabled =
                            false;

                        updateSoundButton();
                    }
                }
            }
        );


        backgroundMusic.addEventListener(
            'error',
            () => {

                console.warn(
                    'No se pudo cargar song/floamr.mpeg. Verifica que el archivo exista.'
                );
            }
        );
    }


    // =========================================================
    // VOLVER A LA PÁGINA
    // =========================================================

    document.addEventListener(
        'visibilitychange',
        () => {

            if (
                document.visibilityState ===
                    'visible' &&
                state.soundEnabled &&
                backgroundMusic &&
                backgroundMusic.paused
            ) {

                startBackgroundMusic();
            }
        }
    );


    // =========================================================
    // INICIALIZACIÓN
    // =========================================================

    function init() {

        initBouquetCanvas();

        resizeGlobalCanvas();

        initGardenCanvas();


        window.addEventListener(
            'resize',
            () => {

                initBouquetCanvas();

                resizeGlobalCanvas();

                initGardenCanvas();
            }
        );


        function animationLoop(
            timestamp
        ) {

            const time =
                timestamp * 0.001;


            renderBouquet(
                time
            );


            renderParticles();


            renderGarden(
                time
            );


            requestAnimationFrame(
                animationLoop
            );
        }


        requestAnimationFrame(
            animationLoop
        );
    }

    window.onload = init;

});