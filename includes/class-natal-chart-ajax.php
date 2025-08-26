<?php
/**
 * AJAX Handler Class for Natal Chart Plugin
 * 
 * Handles all AJAX requests for location search and form submission
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Natal_Chart_Ajax {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_ajax_natal_chart_search_locations', array($this, 'search_locations'));
        add_action('wp_ajax_nopriv_natal_chart_search_locations', array($this, 'search_locations'));
        
        add_action('wp_ajax_natal_chart_generate_chart', array($this, 'generate_chart'));
        add_action('wp_ajax_nopriv_natal_chart_generate_chart', array($this, 'generate_chart'));
        
        add_action('wp_ajax_natal_chart_test_api', array($this, 'test_api'));
        add_action('wp_ajax_natal_chart_clear_results', array($this, 'clear_results'));
    }
    
    /**
     * Search locations via AJAX
     */
    public function search_locations() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'natal_chart_nonce')) {
            wp_die(__('Security check failed.', 'natal-chart-plugin'));
        }
        
        // Get search query
        $query = sanitize_text_field($_POST['query'] ?? '');
        
        if (empty($query)) {
            wp_send_json_error(array(
                'message' => __('Search query is required.', 'natal-chart-plugin')
            ));
        }
        
        // Initialize API class
        $api = new Natal_Chart_API();
        
        // Search locations
        $results = $api->search_locations($query);
        
        if (is_wp_error($results)) {
            wp_send_json_error(array(
                'message' => $results->get_error_message()
            ));
        }
        
        // Format results for frontend
        $formatted_results = $this->format_location_results($results);
        
        wp_send_json_success(array(
            'results' => $formatted_results,
            'count' => count($formatted_results)
        ));
    }
    
    /**
     * Generate natal chart via AJAX
     */
    public function generate_chart() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'natal_chart_nonce')) {
            wp_die(__('Security check failed.', 'natal-chart-plugin'));
        }
        
        // Get form data
        $form_data = array(
            'natal_chart_name' => sanitize_text_field($_POST['natal_chart_name'] ?? ''),
            'natal_chart_birth_date' => sanitize_text_field($_POST['natal_chart_birth_date'] ?? ''),
            'natal_chart_birth_time' => sanitize_text_field($_POST['natal_chart_birth_time'] ?? ''),
            'natal_chart_location' => sanitize_text_field($_POST['natal_chart_location'] ?? ''),
            'natal_chart_latitude' => sanitize_text_field($_POST['natal_chart_latitude'] ?? ''),
            'natal_chart_longitude' => sanitize_text_field($_POST['natal_chart_longitude'] ?? ''),
            'natal_chart_timezone' => sanitize_text_field($_POST['natal_chart_timezone'] ?? ''),
            'natal_chart_offset' => sanitize_text_field($_POST['natal_chart_offset'] ?? ''),
            'natal_chart_offset_round' => sanitize_text_field($_POST['natal_chart_offset_round'] ?? '')
        );
        
        // Initialize form class
        $form = new Natal_Chart_Form();
        
        // Process form
        $result = $form->process_form($form_data);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array(
                'message' => $result->get_error_message(),
                'errors' => $result->get_error_data()
            ));
        }
        
        // Store results for later retrieval
        $shortcode = new Natal_Chart_Shortcode();
        $shortcode->store_results($result['data'], $result['form_data']);
        
        // Render results HTML
        $results_html = $form->render_results($result['data'], $result['form_data']);
        
        wp_send_json_success(array(
            'message' => __('Natal chart generated successfully!', 'natal-chart-plugin'),
            'results_html' => $results_html,
            'chart_data' => $result['data'],
            'form_data' => $result['form_data']
        ));
    }
    
    /**
     * Test API connection via AJAX
     */
    public function test_api() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'natal-chart-plugin'));
        }
        
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'natal_chart_admin_nonce')) {
            wp_die(__('Security check failed.', 'natal-chart-plugin'));
        }
        
        // Initialize API class
        $api = new Natal_Chart_API();
        
        // Test connection
        $result = $api->test_connection();
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }
    
    /**
     * Clear stored results via AJAX
     */
    public function clear_results() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'natal_chart_nonce')) {
            wp_die(__('Security check failed.', 'natal-chart-plugin'));
        }
        
        // Clear results
        Natal_Chart_Shortcode::clear_results();
        
        wp_send_json_success(array(
            'message' => __('Results cleared successfully.', 'natal-chart-plugin')
        ));
    }
    
    /**
     * Format location results for frontend
     * 
     * @param array $results Raw API results
     * @return array Formatted results
     */
    private function format_location_results($results) {
        $formatted = array();
        
        if (!is_array($results)) {
            return $formatted;
        }
        
        foreach ($results as $result) {
            if (isset($result['id'], $result['label'], $result['latitude'], $result['longitude'], $result['timezone'])) {
                $formatted[] = array(
                    'id' => intval($result['id']),
                    'label' => sanitize_text_field($result['label']),
                    'city' => sanitize_text_field($result['city'] ?? ''),
                    'state' => sanitize_text_field($result['state'] ?? ''),
                    'country' => sanitize_text_field($result['country'] ?? ''),
                    'latitude' => floatval($result['latitude']),
                    'longitude' => floatval($result['longitude']),
                    'timezone' => sanitize_text_field($result['timezone']),
                    'offset' => sanitize_text_field($result['offset'] ?? ''),
                    'offset_round' => intval($result['offset_round'] ?? 0),
                    'population' => intval($result['population'] ?? 0)
                );
            }
        }
        
        return $formatted;
    }
    
    /**
     * Get rate limit information
     * 
     * @return array Rate limit info
     */
    public function get_rate_limit_info() {
        $user_ip = $this->get_user_ip();
        $cache_key = 'natal_chart_rate_limit_' . md5($user_ip);
        $current_count = get_transient($cache_key);
        
        $settings = get_option('natal_chart_settings', array());
        $rate_limit = isset($settings['rate_limit']) ? (int) $settings['rate_limit'] : 100;
        
        return array(
            'current' => $current_count ?: 0,
            'limit' => $rate_limit,
            'remaining' => max(0, $rate_limit - ($current_count ?: 0)),
            'reset_time' => time() + HOUR_IN_SECONDS
        );
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
     * Log AJAX request
     * 
     * @param string $action Action performed
     * @param string $status Success/failure status
     * @param array $data Additional data
     */
    private function log_ajax_request($action, $status, $data = array()) {
        $settings = get_option('natal_chart_settings', array());
        
        if (!isset($settings['enable_logging']) || !$settings['enable_logging']) {
            return;
        }
        
        $log_entry = array(
            'timestamp' => current_time('mysql'),
            'action' => $action,
            'status' => $status,
            'user_ip' => $this->get_user_ip(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'data' => $data
        );
        
        // Store log entry
        $logs = get_option('natal_chart_ajax_logs', array());
        $logs[] = $log_entry;
        
        // Keep only last 1000 log entries
        if (count($logs) > 1000) {
            $logs = array_slice($logs, -1000);
        }
        
        update_option('natal_chart_ajax_logs', $logs);
    }
    
    /**
     * Handle AJAX errors
     * 
     * @param string $message Error message
     * @param int $status_code HTTP status code
     */
    private function handle_ajax_error($message, $status_code = 400) {
        $this->log_ajax_request('error', 'failed', array(
            'message' => $message,
            'status_code' => $status_code
        ));
        
        wp_send_json_error(array(
            'message' => $message
        ), $status_code);
    }
    
    /**
     * Handle AJAX success
     * 
     * @param array $data Response data
     * @param string $action Action performed
     */
    private function handle_ajax_success($data, $action) {
        $this->log_ajax_request($action, 'success', $data);
        
        wp_send_json_success($data);
    }
    
    /**
     * Validate AJAX request
     * 
     * @param string $nonce_key Nonce key
     * @param string $nonce_action Nonce action
     * @return bool True if valid, false otherwise
     */
    private function validate_ajax_request($nonce_key, $nonce_action) {
        if (!isset($_POST[$nonce_key])) {
            return false;
        }
        
        return wp_verify_nonce($_POST[$nonce_key], $nonce_action);
    }
    
    /**
     * Sanitize AJAX input
     * 
     * @param mixed $input Input data
     * @param string $type Input type
     * @return mixed Sanitized data
     */
    private function sanitize_ajax_input($input, $type = 'text') {
        switch ($type) {
            case 'email':
                return sanitize_email($input);
            case 'url':
                return esc_url_raw($input);
            case 'int':
                return intval($input);
            case 'float':
                return floatval($input);
            case 'array':
                if (is_array($input)) {
                    return array_map('sanitize_text_field', $input);
                }
                return array();
            default:
                return sanitize_text_field($input);
        }
    }
}
