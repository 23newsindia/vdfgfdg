document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.oc-carousel-wrapper');
    
    carousels.forEach(carousel => {
        const container = carousel.querySelector('.oc-carousel-container');
        const slides = Array.from(carousel.querySelectorAll('.oc-slide'));
        const prevBtn = carousel.querySelector('.oc-carousel-nav.prev');
        const nextBtn = carousel.querySelector('.oc-carousel-nav.next');
        const dots = Array.from(carousel.querySelectorAll('.oc-carousel-dot'));
        
        const config = {
            slidesPerView: 2, // Changed to always show 2 slides
            autoplay: carousel.dataset.autoplay === 'true',
            autoplayDelay: parseInt(carousel.dataset.autoplayDelay) || 3000
        };
        
        const state = {
            currentIndex: 0,
            autoplayInterval: null
        };

        const updateCarousel = () => {
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
        };

        const getPrevIndex = () => {
            return (state.currentIndex - 1 + slides.length) % slides.length;
        };

        const getNextIndex = () => {
            return (state.currentIndex + 1) % slides.length;
        };

        const navigate = (direction) => {
            state.currentIndex = (state.currentIndex + direction + slides.length) % slides.length;
            updateCarousel();
        };

        const updatePagination = () => {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === state.currentIndex);
            });
        };
        
        // Initialize
        updateCarousel();
        
        if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                state.currentIndex = index;
                updateCarousel();
            });
        });

        // Touch events
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

        // Autoplay
        if (config.autoplay) {
            const startAutoplay = () => {
                stopAutoplay();
                state.autoplayInterval = setInterval(() => {
                    navigate(1);
                }, config.autoplayDelay);
            };

            const stopAutoplay = () => {
                if (state.autoplayInterval) {
                    clearInterval(state.autoplayInterval);
                    state.autoplayInterval = null;
                }
            };

            startAutoplay();
            
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', startAutoplay);
        }



 const couponButtons = carousel.querySelectorAll('.oc-coupon-button');
        
        couponButtons.forEach(button => {
            // Remove the oc-shine-effect class initially
            button.classList.remove('oc-shine-effect');
            
            button.addEventListener('mouseenter', function() {
                // Add the class to trigger animation
                this.classList.add('oc-shine-effect');
                
                // Remove after animation completes
                setTimeout(() => {
                    this.classList.remove('oc-shine-effect');
                }, 1500);
            });
        });



      
    });
});