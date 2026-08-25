document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    const mobileLangBtn = document.getElementById('mobileLangBtn');
    const mobileLanguageDropdown = document.getElementById('mobileLanguageDropdown');
    const dropdownOverlay = document.getElementById('dropdownOverlay');
    const header = document.querySelector('header');
    
    function closeNavMenu() {
        if (!navLinks || !mobileMenuBtn) return;
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    function closeLanguageMenu() {
        if (!mobileLanguageDropdown || !dropdownOverlay) return;
        mobileLanguageDropdown.classList.remove('active');
        dropdownOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    function toggleNavMenu() {
        if (!navLinks || !mobileMenuBtn) return;
        const isOpen = navLinks.classList.contains('active');
        if (!isOpen) {
            closeLanguageMenu();
        }
        navLinks.classList.toggle('active', !isOpen);
        document.body.classList.toggle('menu-open', !isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    }

    function toggleLanguageMenu() {
        if (!mobileLanguageDropdown || !dropdownOverlay) return;
        const isOpen = mobileLanguageDropdown.classList.contains('active');
        if (!isOpen) {
            closeNavMenu();
        }
        mobileLanguageDropdown.classList.toggle('active', !isOpen);
        dropdownOverlay.classList.toggle('active', !isOpen);
        document.body.classList.toggle('menu-open', !isOpen);
    }

    function updateHeaderOffset() {
        if (!header) return;
        const height = Math.ceil(header.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--header-offset', `${height}px`);
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleNavMenu();
        });
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    // Тема сайта
    const themeToggle = document.getElementById('themeToggle');
    const themeIconMoon = themeToggle?.querySelector('.fa-moon');
    const themeIconSun = themeToggle?.querySelector('.fa-sun');

    function updateThemeIcon(theme) {
        if (themeIconMoon && themeIconSun) {
            if (theme === 'dark') {
                themeIconMoon.style.display = 'none';
                themeIconSun.style.display = 'block';
            } else {
                themeIconMoon.style.display = 'block';
                themeIconSun.style.display = 'none';
            }
        }
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle?.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        this.style.transform = 'rotate(180deg) scale(1.1)';
        setTimeout(() => {
            this.style.transform = '';
        }, 300);
    });

    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                if (window.innerWidth <= 768) {
                    closeNavMenu();
                }
            }
        });
    });

    // Мобильное меню языков
    if (mobileLangBtn) {
        mobileLangBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleLanguageMenu();
        });
    }
    
    if (dropdownOverlay) {
        dropdownOverlay.addEventListener('click', closeLanguageMenu);
    }
    
    document.querySelectorAll('.dropdown-lang-option').forEach(option => {
        option.addEventListener('click', closeLanguageMenu);
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLanguageMenu();
        }
    });
    
    document.addEventListener('click', function(e) {
        if (mobileLanguageDropdown &&
            mobileLanguageDropdown.classList.contains('active') &&
            !mobileLanguageDropdown.contains(e.target) &&
            (!mobileLangBtn || !mobileLangBtn.contains(e.target))) {
            closeLanguageMenu();
        }
    });

    function updateCurrentLang() {
        const path = window.location.pathname;
        const currentLangSpan = document.querySelector('.current-lang');
        
        if (currentLangSpan) {
            if (path.includes('ru.html')) {
                currentLangSpan.textContent = 'RU';
            } else if (path.includes('es.html')) {
                currentLangSpan.textContent = 'ES';
            } else {
                currentLangSpan.textContent = 'EN';
            }
        }
    }
    
    updateCurrentLang();
    updateHeaderOffset();

    window.addEventListener('load', updateHeaderOffset);

    window.addEventListener('resize', function() {
        updateHeaderOffset();
        if (window.innerWidth > 768) {
            closeNavMenu();
            closeLanguageMenu();
        }
    });

    // ===== Apple-style scroll interactivity =====
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hero = document.querySelector('.hero');
    const heroParallaxRange = hero ? hero.offsetHeight + 200 : 0;
    let ticking = false;
    let wasScrolled = null;
    let lastHeroY = null;

    function onScrollFrame() {
        const y = window.scrollY || window.pageYOffset;

        // Only touch the DOM when a value actually changed — avoids pointless
        // style writes on every single scroll frame, which is what was making
        // mobile scrolling feel torn/laggy.
        const isScrolled = y > 8;
        if (header && isScrolled !== wasScrolled) {
            header.classList.toggle('scrolled', isScrolled);
            wasScrolled = isScrolled;
        }

        if (hero && !prefersReducedMotion && y <= heroParallaxRange) {
            const clamped = Math.min(y, 800);
            if (clamped !== lastHeroY) {
                hero.style.setProperty('--scrollY', clamped);
                lastHeroY = clamped;
            }
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(onScrollFrame);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScrollFrame();

    // Reveal-on-scroll: fade + rise elements into view as they're reached
    const revealTargets = document.querySelectorAll(
        '.feature-card, .project-card, .team-member, .price-item, .stat'
    );

    if (revealTargets.length) {
        revealTargets.forEach((el, i) => {
            el.classList.add('reveal');
            el.style.transitionDelay = prefersReducedMotion ? '0ms' : `${(i % 4) * 70}ms`;
        });

        if ('IntersectionObserver' in window && !prefersReducedMotion) {
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

            revealTargets.forEach(el => revealObserver.observe(el));
        } else {
            revealTargets.forEach(el => el.classList.add('in-view'));
        }
    }

    // Animated stat counters (e.g. "1000+" counts up from 0)
    document.querySelectorAll('.stat-number').forEach(el => {
        const raw = el.textContent.trim();
        const match = raw.match(/^(\d+)([+%]?)$/);
        if (!match || prefersReducedMotion) return;

        const target = parseInt(match[1], 10);
        const suffix = match[2] || '';
        let counted = false;

        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counted) {
                    counted = true;
                    const duration = 900;
                    const start = performance.now();

                    function tick(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.round(eased * target) + suffix;
                        if (progress < 1) {
                            requestAnimationFrame(tick);
                        } else {
                            el.textContent = target + suffix;
                        }
                    }

                    requestAnimationFrame(tick);
                    countObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        countObserver.observe(el);
    });

    // Active nav link follows the section currently in view
    const navAnchorLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const sections = navAnchorLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (sections.length && 'IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = `#${entry.target.id}`;
                    navAnchorLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === id);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // Subtle pointer-driven tilt on feature/project cards (mouse & trackpad only)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
        document.querySelectorAll('.feature-card, .project-card').forEach(card => {
            card.addEventListener('mouseenter', () => card.classList.add('tilt'));
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width - 0.5;
                const py = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.setProperty('--tilt-y', `${px * 6}deg`);
                card.style.setProperty('--tilt-x', `${py * -6}deg`);
            });
            card.addEventListener('mouseleave', () => {
                card.classList.remove('tilt');
                card.style.setProperty('--tilt-x', '0deg');
                card.style.setProperty('--tilt-y', '0deg');
            });
        });
    }

    // Liquid Glass shimmer — the highlight tracks the touch/press point,
    // mirroring glassEffect(.interactive()) on iOS 26's floating controls
    document.querySelectorAll('.theme-toggle, .mobile-menu-btn, .mobile-lang-btn').forEach(el => {
        function setShimmer(e) {
            const rect = el.getBoundingClientRect();
            const point = e.touches ? e.touches[0] : e;
            const x = ((point.clientX - rect.left) / rect.width) * 100;
            const y = ((point.clientY - rect.top) / rect.height) * 100;
            el.style.setProperty('--tx', `${x}%`);
            el.style.setProperty('--ty', `${y}%`);
            el.classList.add('glass-touch');
        }
        function clearShimmer() {
            el.classList.remove('glass-touch');
        }
        el.addEventListener('pointerdown', setShimmer);
        el.addEventListener('pointerup', clearShimmer);
        el.addEventListener('pointerleave', clearShimmer);
        el.addEventListener('pointercancel', clearShimmer);
    });
});
