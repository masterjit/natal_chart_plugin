<?php
/**
 * API Integration Class for Natal Chart Plugin
 * 
 * Handles all external API calls, error handling, and rate limiting
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Natal_Chart_API {
    
    /**
     * API settings
     */
    private $settings;
    private $api_base_url;
    private $bearer_token;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->load_settings();
    }
    
    /**
     * Load API settings
     */
    private function load_settings() {
        $this->settings = get_option('natal_chart_settings', array());
        $this->api_base_url = isset($this->settings['api_base_url']) ? $this->settings['api_base_url'] : 'https://resource.astrologycosmic.com/public/api/v1';
        $this->bearer_token = isset($this->settings['bearer_token']) ? $this->settings['bearer_token'] : '';
    }
    
    /**
     * Search locations by name
     * 
     * @param string $query Search query (minimum 2 characters)
     * @return array|WP_Error Response data or error
     */
    public function search_locations($query) {
        // Validate query
        if (strlen($query) < 2) {
            return new WP_Error('invalid_query', __('Search query must be at least 2 characters long.', 'natal-chart-plugin'));
        }
        
        // Check rate limiting
        if (!$this->check_rate_limit()) {
            return new WP_Error('rate_limit_exceeded', __('Rate limit exceeded. Please try again later.', 'natal-chart-plugin'));
        }
        
        // Check if we have a cached result
        $cache_key = 'natal_chart_location_' . md5($query);
        $cached_result = get_transient($cache_key);
        
        if ($cached_result !== false) {
            $this->log_api_call('location_search', 'cache_hit', $query);
            return $cached_result;
        }
        
        // Make API call
        $url = trailingslashit($this->api_base_url) . 'cities';
        $args = array(
            'name' => $query
        );
        
        $response = $this->make_api_request($url, $args, 'GET');
        
        if (is_wp_error($response)) {
            $this->log_api_call('location_search', 'error', $query, $response->get_error_message());
            return $response;
        }
        
        // Cache successful results for 1 hour
        if (!empty($response) && is_array($response)) {
            set_transient($cache_key, $response, HOUR_IN_SECONDS);
            $this->log_api_call('location_search', 'success', $query);
        }
        
        return $response;
    }
    
    /**
     * Generate natal chart
     * 
     * @param array $data Birth data
     * @return array|WP_Error Response data or error
     */
    public function generate_natal_chart($data) {
        // Validate required fields
        $required_fields = array('name', 'birth_date', 'birth_time', 'location', 'latitude', 'longitude', 'timezone');
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                return new WP_Error('missing_field', sprintf(__('Missing required field: %s', 'natal-chart-plugin'), $field));
            }
        }
        
        // Check rate limiting
        if (!$this->check_rate_limit()) {
            return new WP_Error('rate_limit_exceeded', __('Rate limit exceeded. Please try again later.', 'natal-chart-plugin'));
        }
        
        // Make API call
        $url = trailingslashit($this->api_base_url) . 'natal-chart/generate';
        
        $response = $this->make_api_request($url, $data, 'POST');
        
        if (is_wp_error($response)) {
            $this->log_api_call('natal_chart_generation', 'error', $data['name'], $response->get_error_message());
            return $response;
        }
        
        $this->log_api_call('natal_chart_generation', 'success', $data['name']);
        return $response;
    }
    
    /**
     * Make API request
     * 
     * @param string $url API endpoint
     * @param array $data Request data
     * @param string $method HTTP method
     * @return array|WP_Error Response data or error
     */
    private function make_api_request($url, $data, $method = 'GET') {
        // Check if bearer token is configured
        if (empty($this->bearer_token)) {
            return new WP_Error('no_token', __('API bearer token not configured.', 'natal-chart-plugin'));
        }
        
        // Prepare request arguments
        $request_args = array(
            'method' => $method,
            'timeout' => 30,
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->bearer_token,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'User-Agent' => 'WordPress/Natal-Chart-Plugin/' . NATAL_CHART_PLUGIN_VERSION
            )
        );
        
        // Add data to request
        if ($method === 'GET') {
            $url = add_query_arg($data, $url);
        } else {
            $request_args['body'] = json_encode($data);
        }
        
        // Make the request
        $response = wp_remote_request($url, $request_args);
        
        // Check for WordPress errors
        if (is_wp_error($response)) {
            return $response;
        }
        
        // Get response code and body
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        // Check HTTP response code
        if ($response_code !== 200) {
            $error_message = $this->get_error_message_from_response($response_body, $response_code);
            return new WP_Error('api_error', $error_message, array('status' => $response_code));
        }
        
        // Parse response body
        $parsed_response = json_decode($response_body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error('invalid_response', __('Invalid JSON response from API.', 'natal-chart-plugin'));
        }
        
        return $parsed_response;
    }
    
    /**
     * Check rate limiting
     * 
     * @return bool True if within rate limit, false otherwise
     */
    private function check_rate_limit() {
        $rate_limit = isset($this->settings['rate_limit']) ? (int) $this->settings['rate_limit'] : 100;
        $user_ip = $this->get_user_ip();
        $cache_key = 'natal_chart_rate_limit_' . md5($user_ip);
        
        // Get current request count
        $current_count = get_transient($cache_key);
        
        if ($current_count === false) {
            // First request, set counter
            set_transient($cache_key, 1, HOUR_IN_SECONDS);
            return true;
        }
        
        if ($current_count >= $rate_limit) {
            return false;
        }
        
        // Increment counter
        set_transient($cache_key, $current_count + 1, HOUR_IN_SECONDS);
        return true;
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
     * Get error message from response
     * 
     * @param string $response_body Response body
     * @param int $response_code Response code
     * @return string Error message
     */
    private function get_error_message_from_response($response_body, $response_code) {
        // Try to parse error from response body
        $parsed_response = json_decode($response_body, true);
        
        if (json_last_error() === JSON_ERROR_NONE && isset($parsed_response['message'])) {
            return sanitize_text_field($parsed_response['message']);
        }
        
        // Default error messages based on response code
        $default_messages = array(
            400 => __('Bad Request - Invalid data provided.', 'natal-chart-plugin'),
            401 => __('Unauthorized - Invalid or missing API token.', 'natal-chart-plugin'),
            403 => __('Forbidden - Access denied.', 'natal-chart-plugin'),
            404 => __('Not Found - API endpoint not found.', 'natal-chart-plugin'),
            429 => __('Too Many Requests - Rate limit exceeded.', 'natal-chart-plugin'),
            500 => __('Internal Server Error - API service error.', 'natal-chart-plugin'),
            502 => __('Bad Gateway - API service unavailable.', 'natal-chart-plugin'),
            503 => __('Service Unavailable - API service temporarily unavailable.', 'natal-chart-plugin'),
        );
        
        return isset($default_messages[$response_code]) 
            ? $default_messages[$response_code] 
            : sprintf(__('API Error (HTTP %d)', 'natal-chart-plugin'), $response_code);
    }
    
    /**
     * Log API call
     * 
     * @param string $type Call type
     * @param string $status Call status
     * @param string $identifier Identifier (e.g., search query, user name)
     * @param string $error_message Error message (if any)
     */
    private function log_api_call($type, $status, $identifier = '', $error_message = '') {
        if (!isset($this->settings['enable_logging']) || !$this->settings['enable_logging']) {
            return;
        }
        
        $log_entry = array(
            'timestamp' => current_time('mysql'),
            'type' => $type,
            'status' => $status,
            'identifier' => $identifier,
            'error_message' => $error_message,
            'user_ip' => $this->get_user_ip(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        );
        
        // Store log entry in WordPress options (for simplicity)
        $logs = get_option('natal_chart_api_logs', array());
        $logs[] = $log_entry;
        
        // Keep only last 1000 log entries
        if (count($logs) > 1000) {
            $logs = array_slice($logs, -1000);
        }
        
        update_option('natal_chart_api_logs', $logs);
    }
    
    /**
     * Test API connection
     * 
     * @return array Test result
     */
    public function test_connection() {
        if (empty($this->bearer_token)) {
            return array(
                'success' => false,
                'message' => __('Bearer token not configured.', 'natal-chart-plugin')
            );
        }
        
        // Test with a simple location search
        $test_result = $this->search_locations('New York');
        
        if (is_wp_error($test_result)) {
            return array(
                'success' => false,
                'message' => $test_result->get_error_message()
            );
        }
        
        return array(
            'success' => true,
            'message' => __('API connection successful!', 'natal-chart-plugin'),
            'data' => $test_result
        );
    }
    
    /**
     * Get API status
     * 
     * @return array API status information
     */
    public function get_api_status() {
        return array(
            'configured' => !empty($this->bearer_token),
            'base_url' => $this->api_base_url,
            'logging_enabled' => isset($this->settings['enable_logging']) ? $this->settings['enable_logging'] : false,
            'rate_limit' => isset($this->settings['rate_limit']) ? $this->settings['rate_limit'] : 100
        );
    }
}
