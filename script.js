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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let smoothScrollFrame = 0;
    let restoreScrollBehavior = null;

    function cancelSmoothScroll() {
        if (!smoothScrollFrame) return;
        cancelAnimationFrame(smoothScrollFrame);
        smoothScrollFrame = 0;
        if (restoreScrollBehavior) {
            restoreScrollBehavior();
            restoreScrollBehavior = null;
        }
    }

    function scrollToSection(target) {
        cancelSmoothScroll();
        if (prefersReducedMotion) {
            target.scrollIntoView({ behavior: 'auto', block: 'start' });
            return;
        }

        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        restoreScrollBehavior = () => {
            root.style.scrollBehavior = previousScrollBehavior;
        };

        const scrollMargin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        const maxScroll = root.scrollHeight - window.innerHeight;
        const startY = window.scrollY;
        const targetY = Math.max(0, Math.min(
            maxScroll,
            startY + target.getBoundingClientRect().top - scrollMargin
        ));
        const distance = targetY - startY;

        if (Math.abs(distance) < 1) {
            root.style.scrollBehavior = previousScrollBehavior;
            restoreScrollBehavior = null;
            return;
        }

        const duration = Math.min(1500, Math.max(380, Math.abs(distance) * 0.5));
        let startTime = null;

        function animateScroll(timestamp) {
            if (startTime === null) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 4);
            window.scrollTo(0, startY + distance * easedProgress);

            if (progress < 1) {
                smoothScrollFrame = requestAnimationFrame(animateScroll);
            } else {
                smoothScrollFrame = 0;
                if (restoreScrollBehavior) {
                    restoreScrollBehavior();
                    restoreScrollBehavior = null;
                }
            }
        }

        smoothScrollFrame = requestAnimationFrame(animateScroll);
    }

    window.addEventListener('wheel', cancelSmoothScroll, { passive: true });
    window.addEventListener('touchstart', cancelSmoothScroll, { passive: true });
    window.addEventListener('pointerdown', cancelSmoothScroll, { passive: true });
    window.addEventListener('keydown', function(e) {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) {
            cancelSmoothScroll();
        }
    });

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleNavMenu();
        });
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

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

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                scrollToSection(targetElement);
                
                if (window.innerWidth <= 768) {
                    closeNavMenu();
                }
            }
        });
    });

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

    const hero = document.querySelector('.hero');
    const heroParallaxRange = hero ? hero.offsetHeight + 200 : 0;
    let ticking = false;
    let wasScrolled = null;
    let lastHeroY = null;

    function onScrollFrame() {
        const y = window.scrollY || window.pageYOffset;

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

    const revealTargets = document.querySelectorAll(
        '.feature-card, .project-card, .team-member, .price-item, .stat'
    );

    if (revealTargets.length) {
        revealTargets.forEach((el, i) => {
            el.classList.add('reveal');
            el.style.transitionDelay = prefersReducedMotion ? '0ms' : `${(i % 3) * 35}ms`;
        });

        if ('IntersectionObserver' in window && !prefersReducedMotion) {
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0, rootMargin: '0px 0px 15% 0px' });

            revealTargets.forEach(el => revealObserver.observe(el));
        } else {
            revealTargets.forEach(el => el.classList.add('in-view'));
        }
    }

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

    const navAnchorLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"], .mobile-tab[href^="#"]'));
    const sections = [...new Set(navAnchorLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean))];
    const mobileTabbar = document.querySelector('.mobile-tabbar');
    const mobileTabs = mobileTabbar
        ? Array.from(mobileTabbar.querySelectorAll('a[href^="#"]'))
        : [];
    const mobileTabIndicator = mobileTabbar?.querySelector('.mobile-tab-indicator');
    let activeMobileTab = null;

    function updateMobileTabIndicator(tab) {
        if (!mobileTabbar || !mobileTabIndicator || !tab || tab === activeMobileTab) return;

        activeMobileTab = tab;
        const indicatorWidth = Math.min(tab.offsetWidth + 8, mobileTabbar.clientWidth - 8);
        const indicatorLeft = Math.max(4, Math.min(
            mobileTabbar.clientWidth - indicatorWidth - 4,
            tab.offsetLeft - (indicatorWidth - tab.offsetWidth) / 2
        ));
        mobileTabIndicator.style.width = `${indicatorWidth}px`;
        mobileTabIndicator.style.height = `${tab.offsetHeight}px`;
        mobileTabIndicator.style.transform = `translate3d(${indicatorLeft}px, ${tab.offsetTop}px, 0)`;
        mobileTabbar.classList.add('has-active-tab');
    }

    function activateNavLinks(id) {
        navAnchorLinks.forEach(link => {
            const activeId = link.closest('.mobile-tabbar') && id === '#about' ? '#hero' : id;
            const isActive = link.getAttribute('href') === activeId;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
        const mobileId = id === '#about' ? '#hero' : id;
        updateMobileTabIndicator(mobileTabs.find(tab => tab.getAttribute('href') === mobileId));
    }

    if (mobileTabs.length) {
        const initialTab = mobileTabs.find(tab => tab.getAttribute('href') === window.location.hash) || mobileTabs[0];
        activateNavLinks(initialTab.getAttribute('href'));
        window.addEventListener('resize', () => {
            activeMobileTab = null;
            updateMobileTabIndicator(mobileTabs.find(tab => tab.classList.contains('active')));
        });
    }

    if (sections.length && 'IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = `#${entry.target.id}`;
                    activateNavLinks(id);
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

        sections.forEach(section => sectionObserver.observe(section));
    }

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

    document.querySelectorAll('.theme-toggle, .mobile-menu-btn, .mobile-lang-btn, .mobile-tab').forEach(el => {
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

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(textarea);
            }
        });
    }

    document.querySelectorAll('.contact-copy').forEach(btn => {
        let resetTimer = null;
        btn.addEventListener('click', () => {
            const value = btn.getAttribute('data-copy');
            if (!value) return;
            copyToClipboard(value).then(() => {
                clearTimeout(resetTimer);
                btn.classList.add('copied');
                resetTimer = setTimeout(() => btn.classList.remove('copied'), 1600);
            }).catch(() => {});
        });
    });

    function unstickPressedState() {
        if (document.activeElement && document.activeElement !== document.body && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        document.body.style.pointerEvents = 'none';
        requestAnimationFrame(() => {
            document.body.style.pointerEvents = '';
        });
    }

    window.addEventListener('pageshow', unstickPressedState);
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') unstickPressedState();
    });
});
