document.addEventListener('DOMContentLoaded', function() {
    // Performance optimization: Use requestIdleCallback for non-critical initialization
    const initCarousel = (carousel) => {
        const container = carousel.querySelector('.oc-carousel-container');
        const slides = Array.from(carousel.querySelectorAll('.oc-slide'));
        const deferredSlides = Array.from(carousel.querySelectorAll('.oc-slide-deferred'));
        const prevBtn = carousel.querySelector('.oc-carousel-nav.prev');
        const nextBtn = carousel.querySelector('.oc-carousel-nav.next');
        const dots = Array.from(carousel.querySelectorAll('.oc-carousel-dot'));
        
        const config = {
            slidesPerView: parseInt(carousel.dataset.slidesPerView) || 2,
            autoplay: carousel.dataset.autoplay === 'true',
            autoplayDelay: parseInt(carousel.dataset.autoplayDelay) || 3000
        };
        
        const state = {
            currentIndex: 0,
            autoplayInterval: null,
            isAnimating: false
        };

        // Initialize deferred slides
        const loadDeferredSlides = () => {
            deferredSlides.forEach(slide => {
                if (slide.dataset.deferred === 'true') {
                    const placeholder = slide.querySelector('.oc-coupon-bg-placeholder');
                    if (placeholder) {
                        const img = document.createElement('img');
                        img.loading = 'lazy';
                        img.decoding = 'async';
                        img.draggable = false;
                        img.alt = '';
                        img.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E';
                        img.dataset.src = placeholder.dataset.src;
                        img.className = 'oc-coupon-bg lazy';
                        placeholder.parentNode.replaceChild(img, placeholder);
                    }
                    slide.dataset.deferred = 'false';
                }
            });
        };

        // Initialize lazy loading with Intersection Observer
        const lazyLoadImages = () => {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            const tempImage = new Image();
                            tempImage.onload = () => {
                                img.src = img.dataset.src;
                                img.classList.remove('lazy');
                                delete img.dataset.src;
                            };
                            tempImage.src = img.dataset.src;
                        }
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            carousel.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
        };

        const updateCarousel = () => {
            if (state.isAnimating) return;
            state.isAnimating = true;

            requestAnimationFrame(() => {
                slides.forEach((slide, index) => {
                    slide.classList.remove('active', 'prev', 'next');
                    
                    if (index === state.currentIndex) {
                        slide.classList.add('active');
                        slide.style.transform = 'translateX(-50%) scale(1)';
                        slide.style.opacity = '1';
                        slide.style.zIndex = '3';
                    } else if (index === getPrevIndex()) {
                        slide.classList.add('prev');
                        slide.style.transform = 'translateX(-150%) scale(0.95)';
                        slide.style.opacity = '1';
                        slide.style.zIndex = '2';
                    } else if (index === getNextIndex()) {
                        slide.classList.add('next');
                        slide.style.transform = 'translateX(50%) scale(0.95)';
                        slide.style.opacity = '1';
                        slide.style.zIndex = '2';
                    } else {
                        slide.style.opacity = '0';
                        slide.style.zIndex = '1';
                    }
                });
                
                updatePagination();
                state.isAnimating = false;
            });
        };

        const getPrevIndex = () => (state.currentIndex - 1 + slides.length) % slides.length;
        const getNextIndex = () => (state.currentIndex + 1) % slides.length;

        const navigate = (direction) => {
            if (state.isAnimating) return;
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
        loadDeferredSlides();
        lazyLoadImages();
        updateCarousel();

        // Event Listeners
        if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                state.currentIndex = index;
                updateCarousel();
            });
        });

        // Touch events with passive listeners
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            
            if (Math.abs(diff) > 50) {
                navigate(diff > 0 ? -1 : 1);
            }
        }, { passive: true });

        // Optimized autoplay
        if (config.autoplay) {
            const startAutoplay = () => {
                stopAutoplay();
                state.autoplayInterval = setInterval(() => {
                    requestAnimationFrame(() => navigate(1));
                }, config.autoplayDelay);
            };

            const stopAutoplay = () => {
                if (state.autoplayInterval) {
                    clearInterval(state.autoplayInterval);
                    state.autoplayInterval = null;
                }
            };

            // Start autoplay
            if (document.visibilityState === 'visible') {
                startAutoplay();
            }

            // Event listeners for autoplay control
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', startAutoplay);
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopAutoplay();
                } else {
                    startAutoplay();
                }
            });

            // Stop autoplay when page is not in viewport
            const observeVisibility = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startAutoplay();
                    } else {
                        stopAutoplay();
                    }
                });
            }, { threshold: 0.1 });

            observeVisibility.observe(carousel);
        }

        // Optimize button click handlers
        carousel.querySelectorAll('.oc-coupon-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = button.dataset.href;
            });
        });
    };

    // Initialize carousels using requestIdleCallback
    const carousels = document.querySelectorAll('.oc-carousel-wrapper');
    if ('requestIdleCallback' in window) {
        carousels.forEach(carousel => {
            requestIdleCallback(() => initCarousel(carousel));
        });
    } else {
        carousels.forEach(carousel => initCarousel(carousel));
    }
});