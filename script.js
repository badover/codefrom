document.addEventListener('DOMContentLoaded', function() {

    
    (function initLanguageDetect() {
        if (sessionStorage.getItem('cf_lang_checked')) return;
        sessionStorage.setItem('cf_lang_checked', '1');

        const path = window.location.pathname.toLowerCase();
        const navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        const isRu = navLang.startsWith('ru');
        const isEs = navLang.startsWith('es');

        const isRuPage = path.endsWith('/ru.html') || path.includes('/ru.html');
        const isEsPage = path.endsWith('/es.html') || path.includes('/es.html');
        const isEnPage = !isRuPage && !isEsPage;

        if (isRu && !isRuPage) {
            window.location.replace('ru.html');
        } else if (isEs && !isEsPage) {
            window.location.replace('es.html');
        } else if (!isRu && !isEs && !isEnPage) {
            window.location.replace('index.html');
        }
    })();

    
    const langBar = document.getElementById('langBar');
    const langGlobe = document.getElementById('langGlobe');

    if (langBar && langGlobe) {
        langGlobe.addEventListener('click', function(e) {
            e.stopPropagation();
            langBar.classList.toggle('is-open');
        });

        document.addEventListener('click', function(e) {
            if (!langBar.contains(e.target)) {
                langBar.classList.remove('is-open');
            }
        });
    }

    
    function scrollToTarget(targetEl) {
        if (!targetEl) return;
        const windowH = window.innerHeight;
        const isDesktop = window.innerWidth > 768;
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const container = targetEl.querySelector('.container') || targetEl;
        const rect = container.getBoundingClientRect();
        const containerTop = rect.top + currentScrollY;
        const containerH = container.offsetHeight;

        if (isDesktop) {
            if (containerH <= windowH) {
                const targetY = containerTop - Math.max(30, (windowH - containerH) / 2);
                window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
            } else {
                const targetY = containerTop - 65;
                window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
            }
        } else {
            try {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (err) {
                const top = targetEl.getBoundingClientRect().top + currentScrollY;
                window.scrollTo(0, top);
            }
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const hash = this.getAttribute('href');
            if (!hash || hash === '#') return;
            const targetEl = document.querySelector(hash);
            if (targetEl) {
                e.preventDefault();
                scrollToTarget(targetEl);
                if (langBar) langBar.classList.remove('is-open');
            }
        });
    });

    
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(ta);
            }
        });
    }

    const emailCopyBtn = document.getElementById('emailCopyBtn');
    if (emailCopyBtn) {
        let timer = null;
        emailCopyBtn.addEventListener('click', () => {
            const val = emailCopyBtn.getAttribute('data-copy') || 'codefromteam@proton.me';
            copyText(val).then(() => {
                clearTimeout(timer);
                emailCopyBtn.classList.add('copied');
                timer = setTimeout(() => {
                    emailCopyBtn.classList.remove('copied');
                }, 1800);
            }).catch(() => {});
        });
    }


    (function initSnow() {

        const snowMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const snowCanvas = document.createElement('canvas');
        snowCanvas.className = 'snow-canvas';
        snowCanvas.setAttribute('aria-hidden', 'true');
        const snowContext = snowCanvas.getContext('2d');
        if (!snowContext) return;
        document.body.appendChild(snowCanvas);

        function createSnowSprite() {
            const sprite = document.createElement('canvas');
            sprite.width = sprite.height = 128;
            const ctx = sprite.getContext('2d');
            ctx.scale(2, 2);
            ctx.translate(32, 32);
            // A single fine stroke and one pair of branches per ray.
            ctx.strokeStyle = '#e6edf3';
            ctx.lineWidth = 1.7;
            ctx.lineCap = 'round';
            ctx.beginPath();
            for (let arm = 0; arm < 6; arm++) {
                const angle = arm * Math.PI / 3;
                const point = (x, y) => [x * Math.cos(angle) - y * Math.sin(angle),
                    x * Math.sin(angle) + y * Math.cos(angle)];
                ctx.moveTo(0, 0);
                ctx.lineTo(...point(0, -25));
                for (const y of [-16]) {
                    ctx.moveTo(...point(-4, y - 4));
                    ctx.lineTo(...point(0, y));
                    ctx.lineTo(...point(4, y - 4));
                }
            }
            ctx.stroke();
            return sprite;
        }

        const snowSprite = createSnowSprite();
        let snowflakes = [];
        let snowWidth = 0;
        let snowHeight = 0;
        // Only opaque surfaces occlude snow; text boxes leave their empty space clear.
        const snowSurfaceSelector = (
            '.card-window, .card-wing, .joyrent-card-inner, .stat, .price-item, ' +
            '.lang-bar, .scroll-down-btn, .contact-btn, .contact-copy-btn'
        );
        let snowFrame = 0;
        let snowPreviousTime = 0;

        function resizeSnow() {
            const rect = snowCanvas.getBoundingClientRect();
            snowWidth = rect.width;
            snowHeight = rect.height;
            const mobile = window.innerWidth <= 768;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            snowCanvas.width = Math.round(snowWidth * dpr);
            snowCanvas.height = Math.round(snowHeight * dpr);
            snowContext.setTransform(dpr, 0, 0, dpr, 0, 0);
            snowflakes = Array.from({ length: mobile ? 11 : 24 }, () => {
                const depth = Math.random();
                return {
                    x: Math.random(),
                    y: Math.random() * snowHeight,
                    size: 26 + depth * 8,
                    speed: 8 + depth * 10,
                    opacity: 0.4 + depth * 0.25,
                    angle: Math.random() * Math.PI * 2,
                    spin: (Math.random() - 0.5) * 0.24,
                    phase: Math.random() * Math.PI * 2
                };
            });
        }

        function drawSnow(time) {
            const elapsed = snowPreviousTime ? Math.min((time - snowPreviousTime) / 1000, 0.05) : 0;
            snowPreviousTime = time;
            snowContext.clearRect(0, 0, snowWidth, snowHeight);
            const canvasTop = snowCanvas.getBoundingClientRect().top;
            // Read current bounds so scrolling and card reveal animations are respected.
            const obstacles = Array.from(document.querySelectorAll(snowSurfaceSelector)).flatMap(element => {
                const rect = element.getBoundingClientRect();
                if (!rect.width || !rect.height || rect.bottom < canvasTop ||
                    rect.top > canvasTop + snowHeight) return [];
                const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
                return [{ left: rect.left, right: rect.right,
                    top: rect.top - canvasTop, bottom: rect.bottom - canvasTop, radius }];
            });
            for (const flake of snowflakes) {
                flake.y += flake.speed * elapsed;
                flake.angle += flake.spin * elapsed;
                if (flake.y > snowHeight + flake.size) flake.y = -flake.size;
                const radius = flake.size / 2;
                const drift = Math.sin(time / 3000 + flake.phase) * 7;
                const inset = radius + 10;
                const x = inset + flake.x * Math.max(0, snowWidth - 2 * inset) + drift;
                snowContext.save();
                snowContext.globalAlpha = flake.opacity;
                snowContext.translate(x, flake.y);
                snowContext.rotate(flake.angle);
                // Slightly changing aspect adds the impression of tumbling in depth.
                snowContext.scale(0.94 + Math.sin(flake.angle) * 0.06, 1);
                snowContext.drawImage(snowSprite, -flake.size / 2, -flake.size / 2, flake.size, flake.size);
                snowContext.restore();
            }
            // Occlude only the covered part of each crystal, following the card's
            // rounded edge. Its trajectory continues behind the card uninterrupted.
            snowContext.save();
            snowContext.globalCompositeOperation = 'destination-out';
            snowContext.fillStyle = '#000';
            for (const rect of obstacles) {
                snowContext.beginPath();
                snowContext.roundRect(rect.left, rect.top, rect.right - rect.left,
                    rect.bottom - rect.top, rect.radius);
                snowContext.fill();
            }
            snowContext.restore();
            snowFrame = requestAnimationFrame(drawSnow);
        }

        function syncSnow() {
            cancelAnimationFrame(snowFrame);
            snowFrame = 0;
            snowPreviousTime = 0;
            snowCanvas.hidden = snowMotion.matches;
            if (!snowMotion.matches && !document.hidden) {
                resizeSnow();
                snowFrame = requestAnimationFrame(drawSnow);
            }
        }

        window.addEventListener('resize', syncSnow);
        if ('ResizeObserver' in window) new ResizeObserver(syncSnow).observe(snowCanvas);
        snowMotion.addEventListener('change', syncSnow);
        document.addEventListener('visibilitychange', syncSnow);
        syncSnow();
    })();
});
