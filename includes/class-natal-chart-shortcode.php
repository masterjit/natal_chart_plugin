<?php
/**
 * Natal Chart Shortcode Handler
 * 
 * @package Natal_Chart_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handles shortcode registration and rendering
 */
class Natal_Chart_Shortcode {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_shortcode('natal_chart_form', array($this, 'render_natal_chart_form'));
        add_shortcode('natal_chart_results', array($this, 'render_natal_chart_results'));
    }
    
    /**
     * Render the natal chart form shortcode
     * 
     * @param array $atts Shortcode attributes
     * @return string Form HTML
     */
    public function render_natal_chart_form($atts = array()) {
        // Get the form instance and render the form
        $form = new Natal_Chart_Form();
        return $form->render_natal_chart_form($atts);
    }
    
    /**
     * Render the natal chart results shortcode
     * 
     * @param array $atts Shortcode attributes
     * @return string Results HTML
     */
    public function render_natal_chart_results($atts = array()) {
        $atts = shortcode_atts(array(
            'title' => __('Your Natal Chart Results', 'natal-chart-plugin'),
            'show_actions' => 'true'
        ), $atts);
        
        // Get results from session/transient
        $results = $this->get_stored_results();
        
        if (!$results) {
            return '<div class="natal-chart-no-results">' . 
                   __('No natal chart results found. Please generate a chart first.', 'natal-chart-plugin') . 
                   '</div>';
        }
        
        ob_start();
        ?>
        <div class="natal-chart-results-shortcode">
            <div class="natal-chart-results-header">
                <h3><?php echo esc_html($atts['title']); ?></h3>
            </div>
            <div class="natal-chart-results-content">
                <?php echo wp_kses_post($results); ?>
            </div>
            <?php if ($atts['show_actions'] === 'true'): ?>
            <div class="natal-chart-results-actions">
                <button type="button" class="natal-chart-print-results" onclick="window.print()">
                    <?php _e('Print Results', 'natal-chart-plugin'); ?>
                </button>
                <button type="button" class="natal-chart-download-results" onclick="downloadResults()">
                    <?php _e('Download PDF', 'natal-chart-plugin'); ?>
                </button>
                <button type="button" class="natal-chart-new-chart" onclick="generateNewChart()">
                    <?php _e('Generate New Chart', 'natal-chart-plugin'); ?>
                </button>
            </div>
            <?php endif; ?>
        </div>
        
        <script>
        function downloadResults() {
            // Implementation for PDF download
            alert('PDF download functionality would be implemented here.');
        }
        
        function generateNewChart() {
            // Clear results and show form
            const resultsContainer = document.querySelector('.natal-chart-results-shortcode');
            if (resultsContainer) {
                resultsContainer.style.display = 'none';
            }
            
            // Scroll to form if it exists on the page
            const formContainer = document.querySelector('.natal-chart-form-container');
            if (formContainer) {
                formContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }
        </script>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get stored results from session or transient
     * 
     * @return string|false Results HTML or false if not found
     */
    private function get_stored_results() {
        // Try to get from session first
        if (isset($_SESSION['natal_chart_results'])) {
            return $_SESSION['natal_chart_results'];
        }
        
        // Try to get from transient
        $user_id = get_current_user_id();
        if ($user_id) {
            $transient_key = 'natal_chart_results_' . $user_id;
            $results = get_transient($transient_key);
            if ($results !== false) {
                return $results;
            }
        }
        
        // Try to get from cookie
        if (isset($_COOKIE['natal_chart_results'])) {
            $results = sanitize_text_field($_COOKIE['natal_chart_results']);
            if ($results) {
                return $results;
            }
        }
        
        return false;
    }
    
    /**
     * Store results for later display
     * 
     * @param string $results_html Results HTML content
     * @param int $user_id User ID (optional)
     * @return bool Success status
     */
    public static function store_results($results_html, $user_id = null) {
        if (!$user_id) {
            $user_id = get_current_user_id();
        }
        
        // Store in session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['natal_chart_results'] = $results_html;
        
        // Store in transient (expires in 1 hour)
        if ($user_id) {
            $transient_key = 'natal_chart_results_' . $user_id;
            set_transient($transient_key, $results_html, HOUR_IN_SECONDS);
        }
        
        // Store in cookie (expires in 1 hour)
        $cookie_value = sanitize_text_field($results_html);
        setcookie('natal_chart_results', $cookie_value, time() + HOUR_IN_SECONDS, '/');
        
        return true;
    }
    
    /**
     * Clear stored results
     * 
     * @param int $user_id User ID (optional)
     * @return bool Success status
     */
    public static function clear_results($user_id = null) {
        if (!$user_id) {
            $user_id = get_current_user_id();
        }
        
        // Clear from session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        unset($_SESSION['natal_chart_results']);
        
        // Clear from transient
        if ($user_id) {
            $transient_key = 'natal_chart_results_' . $user_id;
            delete_transient($transient_key);
        }
        
        // Clear from cookie
        setcookie('natal_chart_results', '', time() - 3600, '/');
        
        return true;
    }
}
