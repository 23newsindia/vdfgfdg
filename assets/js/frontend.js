document.addEventListener('DOMContentLoaded', function() {
    const initCarousel = (carousel) => {
        const container = carousel.querySelector('.oc-carousel-container');
        const slides = Array.from(carousel.querySelectorAll('.oc-slide'));
        const prevBtn = carousel.querySelector('.oc-carousel-nav.prev');
        const nextBtn = carousel.querySelector('.oc-carousel-nav.next');
        const dots = Array.from(carousel.querySelectorAll('.oc-carousel-dot'));
        
        if (slides.length === 0) return;

        // Set initial states
        slides[0].classList.add('active');
        if (slides[1]) slides[1].classList.add('next');
        if (slides[slides.length - 1]) slides[slides.length - 1].classList.add('prev');
        
        const config = {
            slidesPerView: parseInt(carousel.dataset.slidesPerView) || 2,
            autoplay: carousel.dataset.autoplay === 'true',
            autoplayDelay: parseInt(carousel.dataset.autoplayDelay) || 3000
        };
        
        const state = {
            currentIndex: 0,
            autoplayInterval: null,
            isAnimating: false,
            isDragging: false,
            startX: 0,
            currentX: 0,
            isNavigating: false // New state to track navigation
        };

        const updateCarousel = (instant = false) => {
            if (state.isAnimating && !instant) return;
            state.isAnimating = true;

            const prevIndex = (state.currentIndex - 1 + slides.length) % slides.length;
            const nextIndex = (state.currentIndex + 1) % slides.length;

            slides.forEach((slide, index) => {
                slide.classList.remove('active', 'prev', 'next');
                if (instant) {
                    slide.style.transition = 'none';
                } else {
                    slide.style.transition = '';
                }

                if (index === state.currentIndex) {
                    slide.classList.add('active');
                    slide.style.transform = 'translateX(-50%) scale(1)';
                    slide.style.opacity = '1';
                    slide.style.zIndex = '3';
                } else if (index === prevIndex) {
                    slide.classList.add('prev');
                    slide.style.transform = 'translateX(-150%) scale(0.75)';
                    slide.style.opacity = '1';
                    slide.style.zIndex = '2';
                } else if (index === nextIndex) {
                    slide.classList.add('next');
                    slide.style.transform = 'translateX(50%) scale(0.75)';
                    slide.style.opacity = '1';
                    slide.style.zIndex = '2';
                } else {
                    slide.style.transform = 'translateX(0) scale(0.5)';
                    slide.style.opacity = '0';
                    slide.style.zIndex = '1';
                }
            });

            if (instant) {
                requestAnimationFrame(() => {
                    slides.forEach(slide => {
                        slide.style.transition = '';
                    });
                });
            }

            updatePagination();
            state.isAnimating = false;
        };

        const navigate = (direction) => {
            if (state.isAnimating || state.isNavigating) return;
            state.currentIndex = (state.currentIndex + direction + slides.length) % slides.length;
            updateCarousel();
        };

        const updatePagination = () => {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === state.currentIndex);
                dot.setAttribute('aria-selected', index === state.currentIndex ? 'true' : 'false');
            });
        };

        // Initialize
        updateCarousel(true);

        // Event Listeners
        if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));

        // Pagination
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (state.isAnimating || state.isNavigating) return;
                state.currentIndex = index;
                updateCarousel();
            });
        });

        // Touch and Mouse Events
        const handleDragStart = (e) => {
            if (state.isNavigating) return;
            state.isDragging = true;
            state.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            container.style.cursor = 'grabbing';
        };

        const handleDragMove = (e) => {
            if (!state.isDragging || state.isNavigating) return;
            e.preventDefault();
            state.currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const diff = state.currentX - state.startX;

            slides.forEach(slide => {
                slide.style.transition = 'none';
                const currentTransform = new WebKitCSSMatrix(window.getComputedStyle(slide).transform);
                const newX = currentTransform.m41 + diff * 0.1;
                slide.style.transform = `translateX(${newX}px) scale(${currentTransform.m11})`;
            });
        };

        const handleDragEnd = () => {
            if (!state.isDragging || state.isNavigating) return;
            state.isDragging = false;
            container.style.cursor = '';

            const diff = state.currentX - state.startX;
            if (Math.abs(diff) > 50) {
                navigate(diff > 0 ? -1 : 1);
            } else {
                updateCarousel();
            }
        };

        // Mouse Events
        container.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);

        // Touch Events
        container.addEventListener('touchstart', handleDragStart, { passive: true });
        container.addEventListener('touchmove', handleDragMove, { passive: false });
        container.addEventListener('touchend', handleDragEnd);

        // Autoplay
        if (config.autoplay) {
            const startAutoplay = () => {
                stopAutoplay();
                state.autoplayInterval = setInterval(() => {
                    if (!state.isDragging && !state.isNavigating) {
                        navigate(1);
                    }
                }, config.autoplayDelay);
            };

            const stopAutoplay = () => {
                if (state.autoplayInterval) {
                    clearInterval(state.autoplayInterval);
                    state.autoplayInterval = null;
                }
            };

            // Start autoplay if page is visible
            if (document.visibilityState === 'visible') {
                startAutoplay();
            }

            // Pause on hover
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', startAutoplay);

            // Handle visibility changes
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopAutoplay();
                } else {
                    startAutoplay();
                }
            });

            // Handle intersection
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startAutoplay();
                    } else {
                        stopAutoplay();
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(carousel);
        }

        // Button click handlers
        carousel.querySelectorAll('.oc-coupon-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling
                const href = button.dataset.href;
                if (href) {
                    state.isNavigating = true; // Set navigation state
                    window.location.href = href;
                }
            });
        });

        // Preload next and previous images
        const preloadImages = () => {
            if (state.isNavigating) return;
            const nextIndex = (state.currentIndex + 1) % slides.length;
            const prevIndex = (state.currentIndex - 1 + slides.length) % slides.length;
            
            [nextIndex, prevIndex].forEach(index => {
                const img = slides[index].querySelector('img');
                if (img && !img.complete) {
                    img.setAttribute('loading', 'eager');
                }
            });
        };

        // Call preloadImages initially and after each navigation
        preloadImages();
        carousel.addEventListener('slideChange', preloadImages);
    };

    // Initialize all carousels
    const carousels = document.querySelectorAll('.oc-carousel-wrapper');
    if ('requestIdleCallback' in window) {
        carousels.forEach(carousel => {
            requestIdleCallback(() => initCarousel(carousel));
        });
    } else {
        carousels.forEach(carousel => initCarousel(carousel));
    }
});