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
        
        // Since we're not storing results, always show the "no results" message
        return '<div class="natal-chart-no-results">' . 
               __('No natal chart results found. Please generate a chart first.', 'natal-chart-plugin') . 
               '<br><small>Results will appear here after form submission</small>' .
               '</div>';
    }
    
    /**
     * Get stored results from session or transient
     * 
     * @return string|false Results HTML or false if not found
     */
    private function get_stored_results() {
        // This method is no longer needed since we don't store results
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
        // This method is no longer needed since we don't store results
        return false;
    }
    
    /**
     * Clear stored results
     * 
     * @param int $user_id User ID (optional)
     * @return bool Success status
     */
    public static function clear_results($user_id = null) {
        // This method is no longer needed since we don't store results
        return true;
    }
}
