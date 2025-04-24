<?php
class OC_Frontend {
    public function __construct() {
        add_shortcode('offers_carousel', [$this, 'render_carousel']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        
        
    }

    public function enqueue_assets() {
        wp_enqueue_style('oc-frontend-css', OC_PLUGIN_URL . 'assets/css/frontend.css');
        wp_enqueue_script('oc-swiper', OC_PLUGIN_URL . 'assets/js/swiper-bundle.min.js', [], OC_VERSION, true);
        wp_enqueue_script('oc-frontend-js', OC_PLUGIN_URL . 'assets/js/frontend.js', ['oc-swiper'], OC_VERSION, true);
        
        // Localize script with plugin URL for lazy loading
        wp_localize_script('oc-frontend-js', 'oc_frontend_vars', [
            'plugin_url' => OC_PLUGIN_URL
        ]);
    }

    public function render_carousel($atts) {
        $atts = shortcode_atts(['slug' => ''], $atts);
        if (empty($atts['slug'])) return '';
        
        // Check shortcode cache first
        $cached_html = OC_Cache::get_shortcode_cache($atts['slug']);
        if ($cached_html) {
            return $cached_html;
        }
        
        // Get carousel from cache or DB
        $carousel = OC_Cache::get_carousel($atts['slug']);
        if (!$carousel) return '';
        
        $slides = json_decode($carousel->slides, true);
        $settings = json_decode($carousel->settings, true);
        
        ob_start();
        ?>
     <section class="oc-carousel-wrapper"
                 data-slides-per-view="<?php echo esc_attr($settings['slides_per_view']); ?>"
                 data-autoplay="<?php echo $settings['autoplay'] ? 'true' : 'false'; ?>"
                 data-autoplay-delay="<?php echo esc_attr($settings['autoplay_delay']); ?>">
        <h2 class="oc-carousel-title">Offers Zone</h2>
        
        <div class="oc-carousel-container">
            <?php foreach ($slides as $slide) : ?>
                <div class="oc-slide">
                    <div class="oc-coupon">
                        <!-- Your existing coupon HTML structure -->
                        <div class="oc-coupon-cuts top">
                            <div class="oc-top-cut"></div>
                        </div>
                        
                        <div class="oc-coupon-container">
                            <img draggable="false" alt="offer-bg" 
                                 src="<?php echo esc_url($slide['bg_image']); ?>" 
                                 class="oc-coupon-bg">
                            <div class="oc-coupon-content">
                                <p class="oc-coupon-title"><?php echo esc_html($slide['title']); ?></p>
                                <p class="oc-coupon-subtitle"><?php echo esc_html($slide['subtitle']); ?></p>
                            </div>
                        </div>
                        
                        <div class="oc-center-cut"></div>
                        
                        <button class="oc-coupon-button oc-shine-effect" onclick="window.location.href='<?php echo esc_url($slide['button_link']); ?>'">
    <div class="oc-cta-text">
        <p class="flex justify-center gap-1">
            <span><?php echo esc_html($slide['button_text'] ?: 'Shop Now'); ?></span>
        </p>
    </div>
</button>
                        
                        <div class="oc-coupon-cuts bottom">
                            <div class="oc-bottom-cut">
                                <span></span><span></span><span></span><span></span>
                                <span></span><span></span><span></span><span></span>
                                <span></span><span></span><span></span><span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        
        <!-- Navigation Buttons -->
         <!-- Navigation Buttons -->
    <button class="oc-carousel-nav prev">‹</button>
    <button class="oc-carousel-nav next">›</button>
    
    <!-- Pagination -->
    <div class="oc-carousel-pagination">
        <?php for ($i = 0; $i < count($slides); $i++) : ?>
            <button class="oc-carousel-dot <?php echo $i === 0 ? 'active' : ''; ?>" 
                    data-index="<?php echo $i; ?>"></button>
        <?php endfor; ?>
    </div>
    
    <!-- Add this new section RIGHT HERE (replace the placeholder comment) -->
    <div class="oc-bottom-strip-container">
        <div class="oc-stars-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#207BB4" opacity="0.8">
                <path d="M9 6c0 4.32 4.68 9 9 9-4.32 0-9 4.32-9 9 0-4.68-4.32-9-9-9 4.68 0 9-4.68 9-9ZM19.5 0c0 2.16 2.34 4.5 4.5 4.5-2.16 0-4.5 2.16-4.5 4.5 0-2.34-2.16-4.5-4.5-4.5 2.34 0 4.5-2.34 4.5-4.5Z"/>
            </svg>
        </div>
        <div class="oc-bottom-strip">
            <p class="z-20">+ Free Delivery &amp; Easy Returns</p>
        </div>
        <div class="oc-stars-right">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 26 24" fill="#207BB4" opacity="0.8">
                <path d="M17 6c0 4.32-4.68 9-9 9 4.32 0 9 4.32 9 9 0-4.68 4.32-9 9-9-4.68 0-9-4.68-9-9ZM6.5 0c0 2.16-2.34 4.5-4.5 4.5 2.16 0 4.5 2.16 4.5 4.5 0-2.34 2.16-4.5 4.5-4.5-2.34 0-4.5-2.34-4.5-4.5ZM3.5 15c0 1.68-1.82 3.5-3.5 3.5 1.68 0 3.5 1.68 3.5 3.5 0-1.82 1.68-3.5 3.5-3.5-1.82 0-3.5-1.82-3.5-3.5Z"/>
            </svg>
        </div>
    </div>
</section>
 <?php
        $html = ob_get_clean();
        
        // Cache the rendered HTML
        OC_Cache::set_shortcode_cache($atts['slug'], $html);
        
        return $html;
    }
}