<?php
/**
 * Shortcode Handler Class for Natal Chart Plugin
 * 
 * Handles shortcode registration and rendering
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Natal_Chart_Shortcode {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_shortcode('natal_chart_form', array($this, 'render_natal_chart_form'));
        add_shortcode('natal_chart_results', array($this, 'render_natal_chart_results'));
    }
    
    /**
     * Render natal chart form shortcode
     * 
     * @param array $atts Shortcode attributes
     * @return string Form HTML
     */
    public function render_natal_chart_form($atts) {
        // Parse attributes
        $atts = shortcode_atts(array(
            'title' => '',
            'description' => '',
            'button_text' => '',
            'show_results' => 'true',
            'form_id' => 'natal-chart-form',
            'class' => '',
            'style' => ''
        ), $atts, 'natal_chart_form');
        
        // Initialize form class
        $form = new Natal_Chart_Form();
        
        // Render form
        $form_html = $form->render_form($atts);
        
        // Add custom classes and styles
        $container_class = 'natal-chart-shortcode-container';
        if (!empty($atts['class'])) {
            $container_class .= ' ' . esc_attr($atts['class']);
        }
        
        $container_style = '';
        if (!empty($atts['style'])) {
            $container_style = ' style="' . esc_attr($atts['style']) . '"';
        }
        
        return sprintf(
            '<div class="%s" id="%s"%s>%s</div>',
            esc_attr($container_class),
            esc_attr($atts['form_id'] . '-container'),
            $container_style,
            $form_html
        );
    }
    
    /**
     * Render natal chart results shortcode
     * 
     * @param array $atts Shortcode attributes
     * @return string Results HTML
     */
    public function render_natal_chart_results($atts) {
        // Parse attributes
        $atts = shortcode_atts(array(
            'title' => __('Your Natal Chart Results', 'natal-chart-plugin'),
            'show_personal_info' => 'true',
            'show_chart_data' => 'true',
            'show_actions' => 'true',
            'class' => '',
            'style' => ''
        ), $atts, 'natal_chart_results');
        
        // Check if we have results in session or transient
        $results = $this->get_stored_results();
        
        if (empty($results)) {
            return sprintf(
                '<div class="natal-chart-no-results%s">%s</div>',
                !empty($atts['class']) ? ' ' . esc_attr($atts['class']) : '',
                __('No natal chart results available. Please generate a chart first.', 'natal-chart-plugin')
            );
        }
        
        // Initialize form class for rendering results
        $form = new Natal_Chart_Form();
        
        // Render results
        $results_html = $form->render_results($results['chart_data'], $results['form_data']);
        
        // Add custom classes and styles
        $container_class = 'natal-chart-results-shortcode-container';
        if (!empty($atts['class'])) {
            $container_class .= ' ' . esc_attr($atts['class']);
        }
        
        $container_style = '';
        if (!empty($atts['style'])) {
            $container_style = ' style="' . esc_attr($atts['style']) . '"';
        }
        
        return sprintf(
            '<div class="%s"%s><h3>%s</h3>%s</div>',
            esc_attr($container_class),
            $container_style,
            esc_html($atts['title']),
            $results_html
        );
    }
    
    /**
     * Get stored results from session or transient
     * 
     * @return array|false Results data or false if none
     */
    private function get_stored_results() {
        // Try to get from transient first
        $transient_key = 'natal_chart_results_' . $this->get_user_session_id();
        $results = get_transient($transient_key);
        
        if ($results !== false) {
            return $results;
        }
        
        // Try to get from session if available
        if (isset($_SESSION['natal_chart_results'])) {
            return $_SESSION['natal_chart_results'];
        }
        
        return false;
    }
    
    /**
     * Get user session identifier
     * 
     * @return string Session identifier
     */
    private function get_user_session_id() {
        // Use user ID if logged in, otherwise use IP address
        if (is_user_logged_in()) {
            return 'user_' . get_current_user_id();
        }
        
        $ip = $this->get_user_ip();
        return 'ip_' . md5($ip);
    }
    
    /**
     * Get user IP address
     * 
     * @return string User IP address
     */
    private function get_user_ip() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Store results for later retrieval
     * 
     * @param array $chart_data Chart data from API
     * @param array $form_data Original form data
     */
    public function store_results($chart_data, $form_data) {
        $results = array(
            'chart_data' => $chart_data,
            'form_data' => $form_data,
            'timestamp' => current_time('timestamp')
        );
        
        // Store in transient (expires in 1 hour)
        $transient_key = 'natal_chart_results_' . $this->get_user_session_id();
        set_transient($transient_key, $results, HOUR_IN_SECONDS);
        
        // Also store in session if available
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION['natal_chart_results'] = $results;
        }
    }
    
    /**
     * Clear stored results
     */
    public function clear_stored_results() {
        $transient_key = 'natal_chart_results_' . $this->get_user_session_id();
        delete_transient($transient_key);
        
        if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['natal_chart_results'])) {
            unset($_SESSION['natal_chart_results']);
        }
    }
    
    /**
     * Get shortcode usage examples
     * 
     * @return string Usage examples HTML
     */
    public function get_usage_examples() {
        ob_start();
        ?>
        <div class="natal-chart-shortcode-examples">
            <h3><?php _e('Shortcode Usage Examples', 'natal-chart-plugin'); ?></h3>
            
            <h4><?php _e('Basic Form', 'natal-chart-plugin'); ?></h4>
            <code>[natal_chart_form]</code>
            
            <h4><?php _e('Customized Form', 'natal-chart-plugin'); ?></h4>
            <code>[natal_chart_form title="Custom Title" description="Custom description" button_text="Generate Now"]</code>
            
            <h4><?php _e('Form with Custom Styling', 'natal-chart-plugin'); ?></h4>
            <code>[natal_chart_form class="my-custom-class" style="background: #f0f0f0; padding: 20px;"]</code>
            
            <h4><?php _e('Results Display', 'natal-chart-plugin'); ?></h4>
            <code>[natal_chart_results]</code>
            
            <h4><?php _e('Customized Results', 'natal_chart-plugin'); ?></h4>
            <code>[natal_chart_results title="Your Astrological Profile" show_actions="false"]</code>
            
            <h4><?php _e('Multiple Forms on Same Page', 'natal-chart-plugin'); ?></h4>
            <code>[natal_chart_form form_id="form1" title="First Chart"]</code><br>
            <code>[natal_chart_form form_id="form2" title="Second Chart"]</code>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get available shortcode attributes
     * 
     * @return array Available attributes
     */
    public function get_available_attributes() {
        return array(
            'natal_chart_form' => array(
                'title' => array(
                    'type' => 'string',
                    'default' => __('Generate Your Natal Chart', 'natal-chart-plugin'),
                    'description' => __('Custom title for the form', 'natal-chart-plugin')
                ),
                'description' => array(
                    'type' => 'string',
                    'default' => __('Enter your birth details to generate your personalized natal chart.', 'natal-chart-plugin'),
                    'description' => __('Custom description text', 'natal-chart-plugin')
                ),
                'button_text' => array(
                    'type' => 'string',
                    'default' => __('Generate Chart', 'natal-chart-plugin'),
                    'description' => __('Custom submit button text', 'natal-chart-plugin')
                ),
                'show_results' => array(
                    'type' => 'boolean',
                    'default' => 'true',
                    'description' => __('Whether to show results after form submission', 'natal-chart-plugin')
                ),
                'form_id' => array(
                    'type' => 'string',
                    'default' => 'natal-chart-form',
                    'description' => __('Custom form ID for styling or JavaScript targeting', 'natal-chart-plugin')
                ),
                'class' => array(
                    'type' => 'string',
                    'default' => '',
                    'description' => __('Additional CSS classes for styling', 'natal-chart-plugin')
                ),
                'style' => array(
                    'type' => 'string',
                    'default' => '',
                    'description' => __('Inline CSS styles', 'natal-chart-plugin')
                )
            ),
            'natal_chart_results' => array(
                'title' => array(
                    'type' => 'string',
                    'default' => __('Your Natal Chart Results', 'natal-chart-plugin'),
                    'description' => __('Custom title for results section', 'natal-chart-plugin')
                ),
                'show_personal_info' => array(
                    'type' => 'boolean',
                    'default' => 'true',
                    'description' => __('Whether to show personal information section', 'natal-chart-plugin')
                ),
                'show_chart_data' => array(
                    'type' => 'boolean',
                    'default' => 'true',
                    'description' => __('Whether to show chart data section', 'natal-chart-plugin')
                ),
                'show_actions' => array(
                    'type' => 'boolean',
                    'default' => 'true',
                    'description' => __('Whether to show action buttons', 'natal-chart-plugin')
                ),
                'class' => array(
                    'type' => 'string',
                    'default' => '',
                    'description' => __('Additional CSS classes for styling', 'natal-chart-plugin')
                ),
                'style' => array(
                    'type' => 'string',
                    'default' => '',
                    'description' => __('Inline CSS styles', 'natal-chart-plugin')
                )
            )
        );
    }
}
