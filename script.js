/* ========================================
    VITALYX STUDIOS - JavaScript Functions
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initNavbar();
    initMobileMenu();
    initCounters();
    initScrollAnimations();
    initSmoothScroll();
    initFormValidation();
    initFAQ();
    initPortfolioHover();
    initHeroFloatingCards();
    initSplashWelcome();
    initSecretLoginSequence();
    
    // IMPORTANT: Assign IDs to all potential editable elements FIRST
    // This happens regardless of admin status so content can be loaded
    assignElementIds();
    
    // Then initialize admin editor if logged in
    initAdminEditor();
    
    // THEN load saved content (can find elements by their IDs)
    initSavedContentLoader();
    
    // Load custom portfolio games if on portfolio page
    if (window.location.pathname.includes('portfolio.html')) {
        loadPortfolioGames();
    }
});

/* ========================================
   NAVBAR SCROLL EFFECT
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Initial check
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }
}

/* ========================================
   MOBILE MENU
   ======================================== */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        
        // Animate hamburger
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (mobileMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
    
    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            const spans = mobileMenuBtn.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });
}

/* ========================================
   COUNTER ANIMATION
   ======================================== */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    if (counters.length === 0) return;
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + '+';
            }
        };
        
        updateCounter();
    };
    
    // Intersection Observer for triggering animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

/* ========================================
   SCROLL ANIMATIONS
   ======================================== */
function initScrollAnimations() {
    // Handle .animate-on-scroll elements with data-delay support
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        animatedElements.forEach(el => observer.observe(el));
    }
    
    // Legacy support for specific card classes
    const legacyElements = document.querySelectorAll('.service-card, .process-step, .feature-card, .portfolio-item, .faq-item');
    
    if (legacyElements.length === 0) return;
    
    // Add initial styles
    legacyElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    const legacyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                legacyObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    legacyElements.forEach(el => legacyObserver.observe(el));
}

function initHeroFloatingCards() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wrappers = Array.from(document.querySelectorAll('.hero__floating-cards'));
    if (wrappers.length === 0) return;

    const cards = [];
    const baseDepth = [-90, -55, -25, 10, 24, 34, 46, 58];
    let animationFrameId = 0;
    let lastTime = performance.now();
    let resizeTimeout = null;

    function setupCards() {
        cards.length = 0;

        wrappers.forEach((wrapper, wrapperIndex) => {
            const wrapperRect = wrapper.getBoundingClientRect();
            const bounds = {
                width: Math.max(0, wrapperRect.width),
                height: Math.max(0, wrapperRect.height)
            };

            const nodes = Array.from(wrapper.querySelectorAll('.hero__float-card'));
            const activeNodes = window.matchMedia('(max-width: 900px)').matches ? nodes.slice(0, 4) : nodes;

            activeNodes.forEach((node, index) => {
                const rect = node.getBoundingClientRect();
                const w = rect.width || 140;
                const h = rect.height || 190;
                const radius = Math.min(w, h) * 0.38;
                const pad = 18;
                const x = pad + radius + Math.random() * Math.max(1, bounds.width - (pad + radius) * 2);
                const y = pad + radius + Math.random() * Math.max(1, bounds.height - (pad + radius) * 2);
                const speed = 36 + Math.random() * 28;
                const angle = Math.random() * Math.PI * 2;

                cards.push({
                    node,
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius,
                    rz: -8 + Math.random() * 16,
                    rx: -12 + Math.random() * 24,
                    ry: -30 + Math.random() * 60,
                    depth: baseDepth[index % baseDepth.length],
                    bounds
                });
            });
        });
    }

    function renderCards() {
        cards.forEach((card) => {
            card.node.style.left = '0';
            card.node.style.top = '0';
            card.node.style.transform = `translate3d(${card.x - card.radius}px, ${card.y - card.radius}px, ${card.depth}px) rotateX(${card.rx}deg) rotateY(${card.ry}deg) rotateZ(${card.rz}deg)`;
        });
    }

    function keepInBounds(card) {
        const minX = card.radius;
        const maxX = card.bounds.width - card.radius;
        const minY = card.radius;
        const maxY = card.bounds.height - card.radius;

        if (card.x < minX) {
            card.x = minX;
            card.vx *= -1;
        } else if (card.x > maxX) {
            card.x = maxX;
            card.vx *= -1;
        }

        if (card.y < minY) {
            card.y = minY;
            card.vy *= -1;
        } else if (card.y > maxY) {
            card.y = maxY;
            card.vy *= -1;
        }
    }

    function solveCollisions() {
        for (let i = 0; i < cards.length; i += 1) {
            for (let j = i + 1; j < cards.length; j += 1) {
                const a = cards[i];
                const b = cards[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const minDist = a.radius + b.radius;
                const distSq = dx * dx + dy * dy;
                if (distSq === 0 || distSq >= minDist * minDist) continue;

                const dist = Math.sqrt(distSq);
                const nx = dx / dist;
                const ny = dy / dist;
                const overlap = minDist - dist;

                a.x -= nx * overlap * 0.5;
                a.y -= ny * overlap * 0.5;
                b.x += nx * overlap * 0.5;
                b.y += ny * overlap * 0.5;

                const tx = -ny;
                const ty = nx;
                const dpTanA = a.vx * tx + a.vy * ty;
                const dpTanB = b.vx * tx + b.vy * ty;
                const dpNormA = a.vx * nx + a.vy * ny;
                const dpNormB = b.vx * nx + b.vy * ny;

                a.vx = tx * dpTanA + nx * dpNormB;
                a.vy = ty * dpTanA + ny * dpNormB;
                b.vx = tx * dpTanB + nx * dpNormA;
                b.vy = ty * dpTanB + ny * dpNormA;
            }
        }
    }

    function tick(now) {
        const delta = Math.min((now - lastTime) / 1000, 0.04);
        lastTime = now;

        cards.forEach((card) => {
            card.x += card.vx * delta;
            card.y += card.vy * delta;
            keepInBounds(card);
            card.ry += card.vx * 0.0022;
            card.rz += card.vy * 0.0009;
        });

        solveCollisions();
        renderCards();
        animationFrameId = requestAnimationFrame(tick);
    }

    setupCards();
    renderCards();
    animationFrameId = requestAnimationFrame(tick);

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setupCards();
            renderCards();
        }, 120);
    });
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   FORM VALIDATION
   ======================================== */
function initFormValidation() {
    const forms = document.querySelectorAll('.contact-form, .contact-form-full, .contact-form-modern');
    
    forms.forEach(form => {
        const budget = form.querySelector('select[name="budget"]');
        const customBudget = form.querySelector('input[name="custom_budget"]');
        const customBudgetGroup = form.querySelector('.custom-budget-group');
        
        if (budget && customBudgetGroup && budget.value === 'other') {
            customBudgetGroup.style.display = 'block';
        }
        
        if (budget && customBudgetGroup) {
            budget.addEventListener('change', () => {
                if (budget.value === 'other') {
                    customBudgetGroup.style.display = 'block';
                    if (customBudget) customBudget.focus();
                } else {
                    customBudgetGroup.style.display = 'none';
                    if (customBudget) {
                        clearError(customBudget);
                        customBudget.value = '';
                    }
                }
            });
        }
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = form.querySelector('input[name="name"]');
            const email = form.querySelector('input[name="email"]');
            const message = form.querySelector('textarea[name="message"]');
            
            let isValid = true;
            
            // Validate name
            if (name && name.value.trim() === '') {
                showError(name, 'Please enter your name');
                isValid = false;
            } else if (name) {
                clearError(name);
            }
            
            // Validate email
            if (email && !isValidEmail(email.value)) {
                showError(email, 'Please enter a valid email');
                isValid = false;
            } else if (email) {
                clearError(email);
            }
            
            // Validate message
            if (message && message.value.trim() === '') {
                showError(message, 'Please enter your message');
                isValid = false;
            } else if (message) {
                clearError(message);
            }
            
            if (budget && budget.value === '') {
                showError(budget, 'Please select your estimated budget');
                isValid = false;
            } else if (budget) {
                clearError(budget);
            }
            
            if (budget && budget.value === 'other') {
                if (customBudget && customBudget.value.trim() === '') {
                    showError(customBudget, 'Please enter your desired budget');
                    isValid = false;
                } else if (customBudget) {
                    clearError(customBudget);
                }
            }
            
            if (isValid) {
                // Simulate form submission
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    // Show success message
                    showSuccessMessage(form);
                    form.reset();
                    if (customBudgetGroup) {
                        customBudgetGroup.style.display = 'none';
                    }
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            }
        });
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(input, message) {
    clearError(input);
    input.style.borderColor = '#ff4757';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#ff4757';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
}

function clearError(input) {
    input.style.borderColor = '';
    const errorDiv = input.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showSuccessMessage(form) {
    // Remove existing success message
    const existingMsg = form.parentNode.querySelector('.success-message');
    if (existingMsg) existingMsg.remove();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.background = 'rgba(232, 255, 71, 0.1)';
    successDiv.style.border = '1px solid rgba(232, 255, 71, 0.3)';
    successDiv.style.borderRadius = '8px';
    successDiv.style.padding = '16px';
    successDiv.style.marginTop = '16px';
    successDiv.style.textAlign = 'center';
    successDiv.innerHTML = '<i class="fas fa-check-circle" style="color: var(--accent); margin-right: 8px;"></i><span style="color: var(--accent);">Thank you! We\'ll be in touch soon.</span>';
    
    form.parentNode.appendChild(successDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

/* ========================================
   FAQ ACCORDION
   ======================================== */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length === 0) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* ========================================
   PORTFOLIO HOVER EFFECTS
   ======================================== */
function initPortfolioHover() {
    const portfolioItems = document.querySelectorAll('.portfolio-item, .portfolio-full-item');
    
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

/* ========================================
   PORTFOLIO FILTER FUNCTIONALITY
   ======================================== */
function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-pill');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length === 0 || projectCards.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');

            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter projects
            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Initialize portfolio filters
initPortfolioFilters();

/* ========================================
   PARALLAX EFFECT (Optional)
   ======================================== */
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        const rate = scrolled * 0.3;
        hero.style.backgroundPositionY = rate + 'px';
    }
});

/* ========================================
   LAZY LOAD IMAGES (Optional)
   ======================================== */
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

/* ========================================
   KEYBOARD ACCESSIBILITY
   ======================================== */
document.addEventListener('keydown', function(e) {
    // Close mobile menu on Escape
    if (e.key === 'Escape') {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            const spans = mobileMenuBtn.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    }
});

/* ========================================
   PREVENT SCROLL ON MODAL OPEN
   ======================================== */
function preventBackgroundScroll() {
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenu) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isActive = mobileMenu.classList.contains('active');
                    document.body.style.overflow = isActive ? 'hidden' : '';
                }
            });
        });
        
        observer.observe(mobileMenu, { attributes: true });
    }
}

preventBackgroundScroll();

/* ========================================
   ADDITIONAL UTILITY FUNCTIONS
   ======================================== */

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Console message for developers
console.log('%c🚀 VITALYX STUDIOS - Built with ❤️', 'font-size: 20px; color: #E8FF47;');
console.log('%cCustomize your styles in styles.css', 'font-size: 14px; color: #B0B0B0;');

// Splash Bienvenida
const SPLASH_STORAGE_KEY = "vitalyxstudios_splash_seen";

function hasSeenSplash() {
  return typeof window.localStorage !== "undefined" && localStorage.getItem(SPLASH_STORAGE_KEY) === "1";
}

function markSplashSeen() {
  if (typeof window.localStorage !== "undefined") {
    localStorage.setItem(SPLASH_STORAGE_KEY, "1");
  }
}

function initSplashWelcome() {
  const splash = document.getElementById("splash");
  const enterBtn = document.getElementById("splash-enter-btn");
  if (!splash || !enterBtn) {
    return;
  }

  const navigationEntries = performance.getEntriesByType ? performance.getEntriesByType("navigation") : [];
  const navigationType = navigationEntries[0]?.type || (performance?.navigation?.type === 1 ? "reload" : "navigate");

  if (navigationType === "reload") {
    if (typeof window.localStorage !== "undefined") {
      localStorage.removeItem(SPLASH_STORAGE_KEY);
    }
  }

  if (hasSeenSplash()) {
    splash.hidden = true;
    return;
  }

  window.scrollTo({ top: 0, behavior: "auto" });
  if (window.location.hash !== "#inicio") {
    window.history.replaceState(null, "", "#inicio");
  }

  enterBtn.addEventListener("click", () => {
    markSplashSeen();
    splash.hidden = true;
    const inicioSection = document.getElementById("hero") || document.getElementById("inicio");
    if (inicioSection) {
      inicioSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

function initSavedContentLoader() {
    // Cargar contenido guardado inmediatamente
    loadAndApplySavedContent();
}

async function loadAndApplySavedContent() {
    console.log('Loading saved content...');
    const localContentBackup = JSON.parse(localStorage.getItem('vitalyx_content_backup') || '{}');
    let serverData = null;
    let contentBackup = {};

    try {
        // Intentar cargar datos del servidor primero
        const url = 'api/portfolio';
        console.log('Fetching from:', url);

        const response = await fetch(url);
        console.log('Server response status:', response.status);

        if (response.ok) {
            serverData = await response.json();
            console.log('Server data received:', serverData);
            contentBackup = serverData.contentBackup || {};

            if (!contentBackup || Object.keys(contentBackup).length === 0) {
                console.log('No contentBackup data from server, keeping localStorage data if present');
            }
        } else {
            console.warn('Server not available, falling back to localStorage. Status:', response.status);
        }
    } catch (error) {
        console.warn('Error loading from server, falling back to localStorage', error);
    }

    const mergedContentBackup = Object.assign({}, contentBackup, localContentBackup);
    console.log('Merged content backup keys:', Object.keys(mergedContentBackup));

    Object.entries(mergedContentBackup).forEach(([elementId, content]) => {
        let element = document.querySelector(`[data-edit-id="${elementId}"]`);
        if (!element) {
            element = document.getElementById(elementId);
        }
        if (element) {
            element.textContent = content;
            element.setAttribute('data-edit-id', elementId);
            element.id = elementId;
            console.log('Applied content for element:', elementId);
        } else {
            console.warn('Element not found:', elementId);
        }
    });

    if (serverData && (window.location.pathname.includes('portfolio.html') || document.querySelector('.portfolio-grid-modern'))) {
        await applyPortfolioChangesFromServer(serverData);
    }
}

async function applyPortfolioChangesFromServer(data) {
    const portfolioGrid = document.querySelector('.portfolio-grid-modern');
    if (!portfolioGrid) return;

    const games = data.portfolioGames || [];
    const deletedDefaultGames = data.deletedDefaultGames || [];
    const editedDefaultGames = data.editedDefaultGames || {};

    // Get existing default games
    const defaultCards = Array.from(portfolioGrid.querySelectorAll('.project-card')).filter(card =>
        card.querySelector('.project-placeholder') && card.dataset.customIndex === undefined
    );

    // Clear all cards first
    portfolioGrid.innerHTML = '';

    // Add default games back, skipping deleted ones, using edited if available
    defaultCards.forEach((card, index) => {
        if (!deletedDefaultGames.includes(index)) {
            if (editedDefaultGames[index]) {
                // Use edited version
                const gameCard = createGameCard(editedDefaultGames[index], index, { defaultIndex: index });
                portfolioGrid.appendChild(gameCard);
            } else {
                // Use original
                card.dataset.defaultIndex = index;
                card.dataset.gameId = `default-${index}`;
                portfolioGrid.appendChild(card);
            }
        }
    });

    // Add custom games
    games.forEach((game, index) => {
        const gameCard = createGameCard(game, index, { customIndex: index });
        portfolioGrid.appendChild(gameCard);
    });

    // Re-add admin controls only for admins
    if (isAdminUser()) {
        addPortfolioAdminControls();
    }
}

function loadSavedContentFromLocalStorage() {
    // Fallback function for localStorage
    const contentBackup = JSON.parse(localStorage.getItem('vitalyx_content_backup') || '{}');
    Object.keys(contentBackup).forEach(elementId => {
        let element = document.querySelector(`[data-edit-id="${elementId}"]`);
        if (!element) {
            element = document.getElementById(elementId);
        }
        if (element) {
            element.textContent = contentBackup[elementId];
            element.setAttribute('data-edit-id', elementId);
            element.id = elementId;
        }
    });
}
function initSecretLoginSequence() {
    // Only initialize on index.html
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') return;
    
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length === 0) return;
    
    let clickSequence = [];
    const requiredSequence = ['juegos', 'visitas', 'experiencia'];
    
    statItems.forEach((item, index) => {
        item.style.cursor = 'pointer';
        
        item.addEventListener('click', function() {
            const statLabel = item.querySelector('.stat-label').textContent.toLowerCase();
            
            // Determine which stat was clicked
            let statType = '';
            if (statLabel.includes('juegos publicados')) {
                statType = 'juegos';
            } else if (statLabel.includes('millones de visitas')) {
                statType = 'visitas';
            } else if (statLabel.includes('años de experiencia')) {
                statType = 'experiencia';
            }
            
            // Check if this is the next expected click in sequence
            if (statType === requiredSequence[clickSequence.length]) {
                clickSequence.push(statType);
                
                // Add visual feedback
                item.style.transform = 'scale(1.05)';
                item.style.transition = 'transform 0.2s';
                setTimeout(() => {
                    item.style.transform = '';
                }, 200);
                
                // Check if sequence is complete
                if (clickSequence.length === requiredSequence.length) {
                    // Sequence completed! Redirect to login page
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 500);
                }
            } else {
                // Wrong sequence, reset
                clickSequence = [];
                
                // Add error feedback
                item.style.transform = 'scale(0.95)';
                item.style.transition = 'transform 0.2s';
                setTimeout(() => {
                    item.style.transform = '';
                }, 200);
            }
        });
    });
}

/* ========================================
   ADMIN INLINE EDITOR
   ======================================== */
function isAdminUser() {
    return sessionStorage.getItem('vitalyx_admin_logged_in') === 'true';
}

function assignElementIds() {
    // Define editable elements
    const editableSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p:not(.form-note):not(.footer-legal)',
        '.hero-subtitle',
        '.section-title',
        '.section-description',
        '.service-description',
        '.feature-description',
        '.project-desc',
        '.faq-answer p',
        '.contact-subtitle'
    ];
    
    console.log('Assigning element IDs for content tracking...');
    let elementCounter = 0;
    
    editableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            if (!element.closest('#admin-panel') && !element.closest('.login-section')) {
                // Generate consistent ID based on page structure
                let elementId = element.getAttribute('data-edit-id');
                if (!elementId) {
                    // Use a combination of selector and index to make it consistent
                    const cleanSelector = selector.replace(/[^a-z0-9]/gi, '_');
                    elementId = 'edit_' + cleanSelector + '_' + index;
                    element.setAttribute('data-edit-id', elementId);
                    element.id = elementId;
                    console.log('Assigned data-edit-id:', elementId);
                } else {
                    element.id = elementId;
                }
                elementCounter++;
            }
        });
    });
    
    console.log('Total elements assigned IDs:', elementCounter);
}

function initAdminEditor() {
    // Check if user is logged in as admin
    const isAdmin = isAdminUser();
    const loginTime = sessionStorage.getItem('vitalyx_admin_login_time');
    
    // Check if login is still valid (24 hours)
    if (isAdmin && loginTime) {
        const timeDiff = Date.now() - parseInt(loginTime);
        const hours24 = 24 * 60 * 60 * 1000;
        if (timeDiff > hours24) {
            // Login expired
            sessionStorage.removeItem('vitalyx_admin_logged_in');
            sessionStorage.removeItem('vitalyx_admin_login_time');
            return;
        }
    } else {
        return;
    }
    
    // Admin is logged in, initialize editor
    createAdminPanel();
    makeElementsEditable();
    loadSavedContent();
}

function createAdminPanel() {
    const adminPanel = document.createElement('div');
    adminPanel.id = 'admin-panel';
    
    // Check if we're on portfolio page
    const isPortfolioPage = window.location.pathname.includes('portfolio.html');
    
    adminPanel.innerHTML = `
        <div class="admin-panel-content">
            <div class="admin-panel-header">
                <span class="admin-badge">MODO ADMIN</span>
                <button id="admin-logout" class="admin-btn admin-btn-secondary">Cerrar Sesión</button>
            </div>
            <div class="admin-panel-actions">
                <button id="admin-save-all" class="admin-btn admin-btn-primary">Guardar Cambios</button>
                <button id="admin-reset-all" class="admin-btn admin-btn-danger">Restaurar Original</button>
            </div>
            ${isPortfolioPage ? `
            <div class="admin-panel-portfolio">
                <div class="admin-panel-section">
                    <h4>Gestión de Portfolio</h4>
                    <div class="portfolio-actions">
                        <button id="admin-add-game" class="admin-btn admin-btn-success">
                            <i class="fas fa-plus"></i> Nuevo Juego
                        </button>
                    </div>
                </div>
            </div>
            ` : ''}
            <div class="admin-panel-status">
                <span id="admin-status">Listo para editar</span>
            </div>
        </div>
    `;
    document.body.appendChild(adminPanel);
    
    // Show welcome notification
    showAdminNotification();
    
    // Add event listeners
    document.getElementById('admin-logout').addEventListener('click', function() {
        sessionStorage.removeItem('vitalyx_admin_logged_in');
        sessionStorage.removeItem('vitalyx_admin_login_time');
        location.reload();
    });
    
    document.getElementById('admin-save-all').addEventListener('click', function() {
        saveAllChanges();
        showStatus('Cambios guardados correctamente', 'success');
    });
    
    document.getElementById('admin-reset-all').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres restaurar todo el contenido original?')) {
            localStorage.removeItem('vitalyx_content_backup');
            localStorage.removeItem('vitalyx_portfolio_games');
            location.reload();
        }
    });
    
    // Portfolio-specific actions
    if (isPortfolioPage) {
        document.getElementById('admin-add-game').addEventListener('click', function() {
            showGameModal();
        });
    }
}

function showAdminNotification() {
    const notification = document.createElement('div');
    notification.id = 'admin-notification';
    notification.innerHTML = `
        <div class="admin-notification-content">
            <i class="fas fa-shield-alt"></i>
            <span>Modo Administrador Activado</span>
            <button id="dismiss-notification">×</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Dismiss on click
    document.getElementById('dismiss-notification').addEventListener('click', function() {
        notification.remove();
    });
}

function makeElementsEditable() {
    // Make all elements with data-edit-id editable in admin mode
    // IDs were already assigned by assignElementIds()
    const editableElements = document.querySelectorAll('[data-edit-id]');
    
    console.log('Making ' + editableElements.length + ' elements editable for admin mode...');
    
    editableElements.forEach(element => {
        if (!element.closest('#admin-panel') && !element.closest('.login-section')) {
            makeEditable(element);
        }
    });
    
    console.log('Total elements made editable:', editableElements.length);
}

function makeEditable(element) {
    element.classList.add('editable-element');
    element.setAttribute('contenteditable', 'false');
    
    // Ensure element has data-edit-id set (should already be set by assignElementIds)
    if (!element.getAttribute('data-edit-id')) {
        const uniqueId = 'elem_' + element.tagName.toLowerCase() + '_' + Math.random().toString(36).substr(2, 9);
        element.setAttribute('data-edit-id', uniqueId);
        element.id = uniqueId;
    }
    // Create edit indicator
    const editIndicator = document.createElement('div');
    editIndicator.className = 'edit-indicator';
    editIndicator.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editIndicator.title = 'Click para editar';

    element.style.position = 'relative';
    element.appendChild(editIndicator);
    element.style.cursor = 'text';

    // Add click handler: edit when clicking anywhere inside the element
    element.addEventListener('click', function(e) {
        if (element.getAttribute('contenteditable') === 'true') return;
        e.stopPropagation();
        startEditing(element);
    });
}

function startEditing(element) {
    const editIndicator = element.querySelector('.edit-indicator');
    const originalText = element.textContent.replace('✏️', '').trim();
    
    element.setAttribute('contenteditable', 'true');
    element.focus();
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Hide indicator while editing
    editIndicator.style.display = 'none';
    
    let typingSavedText = originalText;
    const debouncedSave = debounce(() => {
        const currentText = element.textContent.trim();
        if (currentText !== typingSavedText) {
            typingSavedText = currentText;
            saveContentChange(element, currentText);
        }
    }, 500);

    function handleInput() {
        debouncedSave();
    }

    // Handle finish editing
    let editingFinished = false;
    
    function finishEditing() {
        if (editingFinished) return;
        editingFinished = true;
        
        element.setAttribute('contenteditable', 'false');
        editIndicator.style.display = 'block';
        
        // Save final change
        const newText = element.textContent.trim();
        if (newText !== originalText) {
            saveContentChange(element, newText);
            showStatus('Contenido actualizado', 'success');
        }
        
        // Remove event listeners
        element.removeEventListener('blur', finishEditing);
        element.removeEventListener('keydown', handleKeyDown);
        element.removeEventListener('input', handleInput);
        document.removeEventListener('click', handleOutsideClick);
    }
    
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            finishEditing();
        } else if (e.key === 'Escape') {
            element.textContent = originalText;
            finishEditing();
        }
    }
    
    function handleOutsideClick(e) {
        if (!element.contains(e.target)) {
            finishEditing();
        }
    }
    
    element.addEventListener('blur', finishEditing);
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('input', handleInput);
    document.addEventListener('click', handleOutsideClick);
}

window.addEventListener('beforeunload', function() {
    const editingElements = document.querySelectorAll('[contenteditable="true"]');
    editingElements.forEach(element => {
        const elementId = element.getAttribute('data-edit-id') || element.id;
        if (!elementId) return;
        const newText = element.textContent.trim();
        saveContentChangeLocal(elementId, newText);
    });
});

async function saveContentChange(element, newText) {
    // Generate consistent ID and store in data attribute
    let elementId = element.getAttribute('data-edit-id');
    if (!elementId) {
        elementId = 'elem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        element.setAttribute('data-edit-id', elementId);
    }
    element.id = elementId; // Also set as ID for compatibility

    console.log('Saving content change:', elementId, newText.substring(0, 50) + '...');
    console.log('Element:', element.tagName, element.className);

    // Always save to localStorage first (immediate feedback)
    saveContentChangeLocal(elementId, newText);
    console.log('✓ Saved to localStorage:', elementId, newText.substring(0, 50));

    // Also try to save to server
    if (useServerApi()) {
        console.log('Attempting to save to server...');
        try {
            await saveContentChangeServer(elementId, newText);
            console.log('✓ Content saved to server successfully');
            showStatus('✓ Cambios guardados en servidor', 'success');
        } catch (error) {
            console.warn('✗ Server save failed, content saved locally only', error);
            showStatus('⚠ Cambios guardados localmente (servidor no disponible)', 'warning');
        }
    } else {
        console.log('Server API not available, saving locally only');
        showStatus('✓ Cambios guardados localmente', 'success');
    }
}

function saveContentChangeLocal(elementId, newText) {
    let contentBackup = JSON.parse(localStorage.getItem('vitalyx_content_backup') || '{}');
    contentBackup[elementId] = newText;
    localStorage.setItem('vitalyx_content_backup', JSON.stringify(contentBackup));
}

function getApiBaseUrl() {
    return '';
}

async function saveContentChangeServer(elementId, newText) {
    const headers = { 'Content-Type': 'application/json' };
    const url = 'api/content';
    console.log('Making request to:', url);

    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id: elementId, content: newText })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error('Failed to save content to server');
    }

    const result = await response.json();
    console.log('Server response:', result);
}

async function saveAllChanges() {
    try {
        showStatus('🔄 Sincronizando con servidor...', 'info');

        // Get all data from localStorage
        const contentBackup = JSON.parse(localStorage.getItem('vitalyx_content_backup') || '{}');
        const portfolioGames = JSON.parse(localStorage.getItem('vitalyx_portfolio_games') || '[]');
        const editedDefaultGames = JSON.parse(localStorage.getItem('vitalyx_edited_default_games') || '{}');
        const deletedDefaultGames = JSON.parse(localStorage.getItem('vitalyx_deleted_default_games') || '[]');

        console.log('Syncing data:', {
            contentBackup: Object.keys(contentBackup).length,
            portfolioGames: portfolioGames.length,
            editedDefaultGames: Object.keys(editedDefaultGames).length,
            deletedDefaultGames: deletedDefaultGames.length
        });

        if (useServerApi()) {
            // Sync all content backups to server
            let syncedContent = 0;
            for (const [elementId, content] of Object.entries(contentBackup)) {
                try {
                    await fetch('api/content', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: elementId, content })
                    });
                    syncedContent++;
                } catch (err) {
                    console.error('Error syncing content:', elementId, err);
                }
            }

            // Sync all portfolio games to server
            let syncedGames = 0;
            for (let i = 0; i < portfolioGames.length; i++) {
                try {
                    await fetch(`api/portfolio/custom/${i}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(portfolioGames[i])
                    });
                    syncedGames++;
                } catch (err) {
                    console.error('Error syncing game:', i, err);
                }
            }

            // Sync edited default games
            let syncedEdited = 0;
            for (const [index, gameData] of Object.entries(editedDefaultGames)) {
                try {
                    await fetch(`api/portfolio/default/${index}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(gameData)
                    });
                    syncedEdited++;
                } catch (err) {
                    console.error('Error syncing default game:', index, err);
                }
            }

            // Sync deleted default games
            let syncedDeleted = 0;
            for (const index of deletedDefaultGames) {
                try {
                    await fetch(`api/portfolio/default/${index}`, {
                        method: 'DELETE'
                    });
                    syncedDeleted++;
                } catch (err) {
                    console.error('Error syncing deleted game:', index, err);
                }
            }

            showStatus(`✓ Sincronizado: ${syncedContent} textos, ${syncedGames} juegos, ${syncedEdited} editados, ${syncedDeleted} eliminados`, 'success');
        } else {
            showStatus('✓ Datos guardados localmente (sin servidor)', 'success');
        }
    } catch (error) {
        console.error('Error syncing all changes:', error);
        showStatus('✗ Error al sincronizar cambios', 'error');
    }
}

async function loadSavedContent() {
    console.log('loadSavedContent() called');
    const localContentBackup = JSON.parse(localStorage.getItem('vitalyx_content_backup') || '{}');
    let contentBackup = {};

    if (useServerApi()) {
        try {
            console.log('Loading from server...');
            const state = await getPortfolioState();
            contentBackup = state.contentBackup || {};
            console.log('Loaded from server:', Object.keys(contentBackup).length, 'items');
        } catch (error) {
            console.warn('Could not load admin content from server, falling back to localStorage', error);
            contentBackup = {};
        }
    }

    contentBackup = Object.assign({}, contentBackup, localContentBackup);

    console.log('Content backup to load:', Object.keys(contentBackup).length, 'items');
    console.log('Available keys:', Object.keys(contentBackup));

    // Try to find elements by data-edit-id first, then by id
    Object.keys(contentBackup).forEach(elementId => {
        console.log('Looking for element with id:', elementId);
        
        // First try to find by data-edit-id
        let element = document.querySelector(`[data-edit-id="${elementId}"]`);
        
        // If not found, try by id
        if (!element) {
            element = document.getElementById(elementId);
        }

        if (element) {
            console.log('Found element, applying content:', elementId);
            element.textContent = contentBackup[elementId];
            // Ensure data-edit-id is set
            element.setAttribute('data-edit-id', elementId);
            element.id = elementId;
        } else {
            console.warn('Element not found for id:', elementId);
        }
    });
}

function generateElementId(element) {
    // Generate a stable ID based on element position and structure
    const tag = element.tagName.toLowerCase();
    const classes = Array.from(element.classList).join('-') || 'noclass';
    const parent = element.parentNode;
    const index = parent ? Array.from(parent.children).indexOf(element) : 0;
    const pathParts = [];
    let node = element;

    while (node && node !== document.body && node.tagName) {
        const nodeIndex = node.parentNode ? Array.from(node.parentNode.children).indexOf(node) : 0;
        pathParts.unshift(`${node.tagName.toLowerCase()}${nodeIndex}`);
        node = node.parentNode;
    }

    return `editable-${tag}-${classes}-${index}-${pathParts.join('-')}`;
}

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('admin-status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `admin-status-${type}`;
        setTimeout(() => {
            statusEl.textContent = 'Listo para editar';
            statusEl.className = '';
        }, 3000);
    }
}

/* ========================================
   PORTFOLIO ADMIN FUNCTIONS
   ======================================== */
function addPortfolioAdminControls() {
    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    const customCards = projectCards.filter(card => card.dataset.customIndex !== undefined);
    const defaultCards = projectCards.filter(card => card.dataset.defaultIndex !== undefined || (card.querySelector('.project-placeholder') && card.dataset.customIndex === undefined));

    projectCards.forEach((card) => {
        // Skip if already has admin controls
        if (card.querySelector('.project-admin-controls')) return;

        // Add admin controls overlay
        const adminControls = document.createElement('div');
        adminControls.className = 'project-admin-controls';

        const isCustomGame = card.dataset.customIndex !== undefined;

        if (isCustomGame) {
            const customIndex = parseInt(card.dataset.customIndex, 10);

            adminControls.innerHTML = `
                <button class="project-admin-btn edit-btn" data-index="${customIndex}" title="Editar juego">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="project-admin-btn delete-btn" data-index="${customIndex}" title="Eliminar juego">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            adminControls.querySelector('.edit-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                editGame(customIndex);
            });

            adminControls.querySelector('.delete-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                deleteGame(customIndex);
            });
        } else {
            // Always use dataset.defaultIndex for consistency
            const defaultIndex = card.dataset.defaultIndex !== undefined ? parseInt(card.dataset.defaultIndex, 10) : null;
            
            if (defaultIndex === null) return; // Skip if no index found

            adminControls.innerHTML = `
                <button class="project-admin-btn edit-btn" data-index="${defaultIndex}" data-default="true" title="Editar juego">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="project-admin-btn delete-btn" data-index="${defaultIndex}" data-default="true" title="Eliminar juego">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            adminControls.querySelector('.edit-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                // Pass card reference instead of just index
                editDefaultGame(defaultIndex, card);
            });

            adminControls.querySelector('.delete-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                deleteDefaultGame(defaultIndex);
            });
        }

        card.appendChild(adminControls);
    });
}

async function deleteDefaultGame(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este juego por defecto? Esta acción es permanente.')) {
        try {
            // Mark as deleted in localStorage
            let deletedGames = JSON.parse(localStorage.getItem('vitalyx_deleted_default_games') || '[]');
            if (!deletedGames.includes(index)) {
                deletedGames.push(index);
                localStorage.setItem('vitalyx_deleted_default_games', JSON.stringify(deletedGames));
            }

            // Try to delete from server
            if (useServerApi()) {
                try {
                    await deleteDefaultGameServer(index);
                } catch (err) {
                    console.warn('Server delete failed, deleted locally only', err);
                }
            }

            // Reload portfolio
            await loadPortfolioGames();
            showStatus('Juego eliminado', 'success');
        } catch (error) {
            console.error('Error deleting game:', error);
            showStatus('Error al eliminar juego', 'error');
        }
    }
}

function useServerApi() {
    return window.location.protocol.startsWith('http');
}

async function getPortfolioState() {
    if (useServerApi()) {
        try {
            const response = await fetch('api/portfolio');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Could not load admin content from server, falling back to localStorage', error);
        }
    }

    return {
        portfolioGames: JSON.parse(localStorage.getItem('vitalyx_portfolio_games') || '[]'),
        editedDefaultGames: JSON.parse(localStorage.getItem('vitalyx_edited_default_games') || '{}'),
        deletedDefaultGames: JSON.parse(localStorage.getItem('vitalyx_deleted_default_games') || '[]'),
        contentBackup: JSON.parse(localStorage.getItem('vitalyx_content_backup') || '{}')
    };
}

async function saveGameToServer(gameData, editIndex, editType) {
    const headers = { 'Content-Type': 'application/json' };
    
    try {
        let response;
        
        if (editType === 'edit-default') {
            response = await fetch(`api/portfolio/default/${editIndex}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(gameData)
            });
        } else if (editIndex !== null) {
            response = await fetch(`api/portfolio/custom/${editIndex}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(gameData)
            });
        } else {
            response = await fetch('api/portfolio/custom', {
                method: 'POST',
                headers,
                body: JSON.stringify(gameData)
            });
        }
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error saving game to server:', error);
        throw error;
    }
}

async function deleteGameServer(index) {
    try {
        const response = await fetch(`api/portfolio/custom/${index}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        // Client handles reload and status
        return true;
    } catch (error) {
        console.error('Error deleting game from server:', error);
        throw error;
    }
}

async function deleteDefaultGameServer(index) {
    try {
        const response = await fetch(`api/portfolio/default/${index}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        // Client handles reload and status
        return true;
    } catch (error) {
        console.error('Error deleting default game from server:', error);
        throw error;
    }
}


function showGameModal(gameData = null, editType = null, editIndex = null) {
    const modal = document.createElement('div');
    modal.id = 'game-modal';
    modal.innerHTML = `
        <div class="game-modal-overlay">
            <div class="game-modal-content">
                <div class="game-modal-header">
                    <h3>${gameData ? (editType === 'edit-default' ? 'Editar Juego por Defecto' : 'Editar Juego') : 'Nuevo Juego'}</h3>
                    <button id="close-modal" class="modal-close-btn">&times;</button>
                </div>
                <form id="game-form" class="game-form">
                    <div class="form-group">
                        <label for="game-title">Título del Juego *</label>
                        <input type="text" id="game-title" name="title" required value="${gameData ? gameData.title : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="game-category">Categoría *</label>
                        <select id="game-category" name="category" required>
                            <option value="">Seleccionar categoría</option>
                            <option value="tycoon" ${gameData && gameData.category === 'tycoon' ? 'selected' : ''}>Tycoon</option>
                            <option value="obby" ${gameData && gameData.category === 'obby' ? 'selected' : ''}>Obby</option>
                            <option value="horror" ${gameData && gameData.category === 'horror' ? 'selected' : ''}>Horror</option>
                            <option value="rpg" ${gameData && gameData.category === 'rpg' ? 'selected' : ''}>RPG</option>
                            <option value="simulator" ${gameData && gameData.category === 'simulator' ? 'selected' : ''}>Simulación</option>
                            <option value="fps" ${gameData && gameData.category === 'fps' ? 'selected' : ''}>FPS</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="game-description">Descripción *</label>
                        <textarea id="game-description" name="description" rows="3" required>${gameData ? gameData.description : ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="game-plays">Número de Jugadas</label>
                            <input type="text" id="game-plays" name="plays" placeholder="2.5M+" value="${gameData ? gameData.plays : ''}">
                        </div>
                        <div class="form-group">
                            <label for="game-rating">Calificación</label>
                            <input type="text" id="game-rating" name="rating" placeholder="4.8★" value="${gameData ? gameData.rating : ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="game-image">Imagen del Juego</label>
                        <input type="file" id="game-image" name="image" accept="image/*">
                        <div class="image-preview ${gameData && gameData.image ? 'has-image' : ''}">
                            ${gameData && gameData.image ? `<img src="${gameData.image}" alt="Preview" class="preview-img">` : ''}
                        </div>
                        <small class="form-help">Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 2MB</small>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" id="cancel-game" class="admin-btn admin-btn-secondary">Cancelar</button>
                        <button type="submit" class="admin-btn admin-btn-primary">
                            ${gameData ? (editType === 'edit-default' ? 'Actualizar Juego' : 'Actualizar Juego') : 'Crear Juego'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle image preview
    const imageInput = document.getElementById('game-image');
    const imagePreview = document.querySelector('.image-preview');
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="preview-img">`;
                imagePreview.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = '';
            imagePreview.classList.remove('has-image');
        }
    });
    
    // Handle form submission
    document.getElementById('game-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveGame(this, editIndex, editType);
    });
    
    // Handle modal close
    document.getElementById('close-modal').addEventListener('click', () => modal.remove());
    document.getElementById('cancel-game').addEventListener('click', () => modal.remove());
    
    modal.querySelector('.game-modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            modal.remove();
        }
    });
}

async function saveGame(form, editIndex, editType) {
    const formData = new FormData(form);
    const imageFile = formData.get('image');
    
    // Convert image to base64 if provided
    if (imageFile && imageFile.size > 0) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const gameData = {
                        title: formData.get('title'),
                        category: formData.get('category'),
                        description: formData.get('description'),
                        plays: formData.get('plays'),
                        rating: formData.get('rating'),
                        image: e.target.result
                    };
                    
                    await saveGameToStorage(gameData, editIndex, editType);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    }

    // Use existing image or placeholder
    const existingGames = JSON.parse(localStorage.getItem('vitalyx_portfolio_games') || '[]');
    const existingImage = editIndex !== null && existingGames[editIndex] ? existingGames[editIndex].image : null;
    
    const gameData = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        plays: formData.get('plays'),
        rating: formData.get('rating'),
        image: existingImage
    };
    
    await saveGameToStorage(gameData, editIndex, editType);
}

async function saveGameToStorage(gameData, editIndex, editType) {
    // Always save to localStorage first
    if (editType === 'edit-default') {
        let editedDefaults = JSON.parse(localStorage.getItem('vitalyx_edited_default_games') || '{}');
        editedDefaults[editIndex] = gameData;
        localStorage.setItem('vitalyx_edited_default_games', JSON.stringify(editedDefaults));
    } else {
        let games = JSON.parse(localStorage.getItem('vitalyx_portfolio_games') || '[]');

        if (editIndex !== null) {
            games[editIndex] = gameData;
        } else {
            games.push(gameData);
        }

        localStorage.setItem('vitalyx_portfolio_games', JSON.stringify(games));
    }

    // Also try to save to server
    if (useServerApi()) {
        try {
            await saveGameToServer(gameData, editIndex, editType);
            console.log('Game saved to server successfully');
        } catch (err) {
            console.warn('Server save failed, game saved locally only', err);
        }
    }

    return true;
}

function editGame(index) {
    const games = JSON.parse(localStorage.getItem('vitalyx_portfolio_games') || '[]');
    if (games[index]) {
        showGameModal(games[index], null, index);
    }
}

function editDefaultGame(index, cardElement = null) {
    // If cardElement is provided, use it directly; otherwise find it by index
    let card = cardElement;
    
    if (!card) {
        const cards = Array.from(document.querySelectorAll('.project-card'));
        for (let c of cards) {
            if (c.dataset.defaultIndex !== undefined && parseInt(c.dataset.defaultIndex) === index) {
                card = c;
                break;
            }
        }
    }
    
    if (!card) return;

    const title = card.querySelector('.project-title')?.textContent || '';
    const category = card.querySelector('.project-category')?.textContent.toLowerCase() || '';
    const description = card.querySelector('.project-desc')?.textContent || '';
    const stats = card.querySelectorAll('.project-stats span');
    const plays = stats[0] ? stats[0].textContent.replace(/<[^>]*>/g, '').trim() : '';
    const rating = stats[1] ? stats[1].textContent.replace(/<[^>]*>/g, '').trim() : '';

    const categoryMap = {
        'tycoon': 'tycoon',
        'obby': 'obby',
        'horror': 'horror',
        'rpg': 'rpg',
        'simulación': 'simulator',
        'tycoon • rpg': 'tycoon',
        'obby • competitivo': 'obby',
        'horror • survival': 'horror'
    };

    const categoryKey = category.split(' • ')[0];
    const formCategory = categoryMap[categoryKey] || categoryMap[category] || 'tycoon';

    const gameData = {
        title: title,
        category: formCategory,
        description: description,
        plays: plays,
        rating: rating,
        image: null
    };

    showGameModal(gameData, 'edit-default', index);
}

async function deleteGame(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este juego?')) {
        try {
            if (useServerApi()) {
                try {
                    await deleteGameServer(index);
                } catch (err) {
                    console.warn('Server delete failed, deleting locally only', err);
                }
            }

            // Always delete from localStorage
            let games = JSON.parse(localStorage.getItem('vitalyx_portfolio_games') || '[]');
            games.splice(index, 1);
            localStorage.setItem('vitalyx_portfolio_games', JSON.stringify(games));

            await loadPortfolioGames();
            showStatus('Juego eliminado', 'success');
        } catch (error) {
            console.error('Error deleting game:', error);
            showStatus('Error al eliminar juego', 'error');
        }
    }
}

async function loadPortfolioGames() {
    const state = await getPortfolioState();
    const games = state.portfolioGames || [];
    const deletedDefaultGames = state.deletedDefaultGames || [];
    const editedDefaultGames = state.editedDefaultGames || {};
    const portfolioGrid = document.querySelector('.portfolio-grid-modern');
    
    if (!portfolioGrid) return;
    
    // Get existing default games (those with project-placeholder and not custom-generated)
    const defaultCards = Array.from(portfolioGrid.querySelectorAll('.project-card')).filter(card => 
        card.querySelector('.project-placeholder') && card.dataset.customIndex === undefined
    );
    
    // Clear all cards first
    portfolioGrid.innerHTML = '';
    
    // Add default games back, skipping deleted ones, using edited if available
    defaultCards.forEach((card, index) => {
        if (!deletedDefaultGames.includes(index)) {
            if (editedDefaultGames[index]) {
                // Use edited version
                const gameCard = createGameCard(editedDefaultGames[index], index, { defaultIndex: index });
                portfolioGrid.appendChild(gameCard);
            } else {
                // Use original - always set the defaultIndex attribute
                card.dataset.defaultIndex = index;
                card.dataset.gameId = `default-${index}`;
                portfolioGrid.appendChild(card);
            }
        }
    });
    
    // Add custom games
    games.forEach((game, index) => {
        const gameCard = createGameCard(game, index, { customIndex: index });
        portfolioGrid.appendChild(gameCard);
    });
    
    // Re-add admin controls only for admins
    if (isAdminUser()) {
        addPortfolioAdminControls();
    }
}

function createGameCard(game, index, options = {}) {
    const card = document.createElement('div');
    card.className = 'project-card animate-on-scroll';
    card.setAttribute('data-category', game.category);
    
    if (options.hasOwnProperty('defaultIndex')) {
        card.dataset.defaultIndex = options.defaultIndex;
        card.dataset.gameId = `default-${options.defaultIndex}`;
    }
    if (options.hasOwnProperty('customIndex')) {
        card.dataset.customIndex = options.customIndex;
        card.dataset.gameId = `custom-${options.customIndex}`;
    }
    
    const categoryText = getCategoryText(game.category);
    const hasImage = game.image && game.image.trim() !== '';
    
    card.innerHTML = `
        <div class="project-image">
            <div class="project-placeholder ${hasImage ? 'has-custom-image' : ''}" ${hasImage ? `style="background-image: url('${game.image}')"` : ''}>
                ${!hasImage ? getCategoryIcon(game.category) : ''}
            </div>
            <div class="project-overlay">
                <div class="project-stats">
                    <span><i class="fas fa-play"></i> ${game.plays || '0'}</span>
                    <span><i class="fas fa-star"></i> ${game.rating || '0★'}</span>
                </div>
            </div>
        </div>
        <div class="project-info">
            <span class="project-category">${categoryText}</span>
            <h3 class="project-title">${game.title}</h3>
            <p class="project-desc">${game.description}</p>
        </div>
    `;
    
    return card;
}

function getCategoryText(category) {
    const categoryMap = {
        'tycoon': 'Tycoon',
        'obby': 'Obby',
        'horror': 'Horror',
        'rpg': 'RPG',
        'simulator': 'Simulación',
        'fps': 'FPS',
        'multiplayer': 'Multiplayer'
    };
    return categoryMap[category] || category;
}

function getCategoryIcon(category) {
    const iconMap = {
        'tycoon': '<i class="fas fa-dragon"></i>',
        'obby': '<i class="fas fa-running"></i>',
        'horror': '<i class="fas fa-ghost"></i>',
        'rpg': '<i class="fas fa-magic"></i>',
        'simulator': '<i class="fas fa-city"></i>'
    };
    return iconMap[category] || '<i class="fas fa-gamepad"></i>';
}

