document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
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
                
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
    });

    // Мобильное меню языков
    const mobileLangBtn = document.getElementById('mobileLangBtn');
    const mobileLanguageDropdown = document.getElementById('mobileLanguageDropdown');
    const dropdownOverlay = document.getElementById('dropdownOverlay');
    
    function toggleLanguageMenu() {
        mobileLanguageDropdown.classList.toggle('active');
        dropdownOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }
    
    function closeLanguageMenu() {
        mobileLanguageDropdown.classList.remove('active');
        dropdownOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
    
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
        if (mobileLanguageDropdown.classList.contains('active') &&
            !mobileLanguageDropdown.contains(e.target) &&
            !mobileLangBtn.contains(e.target)) {
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
});