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
        try {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            const top = targetEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
            window.scrollTo(0, top);
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
        const canvas = document.createElement('canvas');
        canvas.className = 'snow-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let particles = [];
        let animationFrameId = null;

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            const count = width < 768 ? 22 : 46;
            if (particles.length === 0) {
                for (let i = 0; i < count; i++) {
                    particles.push(createParticle(true));
                }
            } else if (particles.length > count) {
                particles.length = count;
            } else {
                while (particles.length < count) {
                    particles.push(createParticle(false));
                }
            }
        }

        function createParticle(randomY) {
            return {
                x: Math.random() * (width || window.innerWidth),
                y: randomY ? Math.random() * (height || window.innerHeight) : -10,
                radius: Math.random() * 1.6 + 0.8,
                speedY: Math.random() * 0.85 + 0.45,
                speedX: (Math.random() - 0.5) * 0.35,
                angle: Math.random() * Math.PI * 2,
                swingSpeed: Math.random() * 0.02 + 0.01,
                opacity: Math.random() * 0.5 + 0.35
            };
        }

        function update() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#ffffff';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.angle += p.swingSpeed;
                p.y += p.speedY;
                p.x += p.speedX + Math.sin(p.angle) * 0.45;

                if (p.y > height + 5) {
                    p.y = -5;
                    p.x = Math.random() * width;
                }
                if (p.x < -10) p.x = width + 5;
                if (p.x > width + 10) p.x = -5;

                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(update);
        }

        window.addEventListener('resize', resize, { passive: true });
        resize();
        animationFrameId = requestAnimationFrame(update);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            } else {
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(update);
                }
            }
        });
    })();
});
