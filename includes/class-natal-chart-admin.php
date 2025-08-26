<?php
/**
 * Admin Management Class for Natal Chart Plugin
 * 
 * Handles admin interface, settings page, and configuration management
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Natal_Chart_Admin {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_settings'));
        add_action('admin_notices', array($this, 'admin_notices'));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('Natal Chart Generator', 'natal-chart-plugin'),
            __('Natal Chart', 'natal-chart-plugin'),
            'manage_options',
            'natal-chart-settings',
            array($this, 'admin_page'),
            'dashicons-chart-area',
            30
        );
        
        add_submenu_page(
            'natal-chart-settings',
            __('Settings', 'natal-chart-plugin'),
            __('Settings', 'natal-chart-plugin'),
            'manage_options',
            'natal-chart-settings',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        register_setting(
            'natal_chart_settings_group',
            'natal_chart_settings',
            array($this, 'sanitize_settings')
        );
        
        add_settings_section(
            'natal_chart_api_section',
            __('API Configuration', 'natal-chart-plugin'),
            array($this, 'api_section_callback'),
            'natal-chart-settings'
        );
        
        add_settings_field(
            'bearer_token',
            __('Bearer Token', 'natal-chart-plugin'),
            array($this, 'bearer_token_field_callback'),
            'natal-chart-settings',
            'natal_chart_api_section'
        );
        
        add_settings_field(
            'api_base_url',
            __('API Base URL', 'natal-chart-plugin'),
            array($this, 'api_base_url_field_callback'),
            'natal-chart-settings',
            'natal_chart_api_section'
        );
        
        add_settings_field(
            'enable_logging',
            __('Enable Logging', 'natal-chart-plugin'),
            array($this, 'enable_logging_field_callback'),
            'natal-chart-settings',
            'natal_chart_api_section'
        );
        
        add_settings_field(
            'rate_limit',
            __('Rate Limit (requests/hour)', 'natal-chart-plugin'),
            array($this, 'rate_limit_field_callback'),
            'natal-chart-settings',
            'natal_chart_api_section'
        );
    }
    
    /**
     * Admin page callback
     */
    public function admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Check if settings were saved
        if (isset($_GET['settings-updated'])) {
            add_settings_error(
                'natal_chart_messages',
                'natal_chart_message',
                __('Settings Saved Successfully!', 'natal-chart-plugin'),
                'updated'
            );
        }
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <?php settings_errors('natal_chart_messages'); ?>
            
            <div class="natal-chart-admin-container">
                <div class="natal-chart-admin-main">
                    <form method="post" action="options.php">
                        <?php
                        settings_fields('natal_chart_settings_group');
                        do_settings_sections('natal-chart-settings');
                        submit_button(__('Save Settings', 'natal-chart-plugin'));
                        ?>
                    </form>
                </div>
                
                <div class="natal-chart-admin-sidebar">
                    <div class="natal-chart-admin-box">
                        <h3><?php _e('Plugin Information', 'natal-chart-plugin'); ?></h3>
                        <p><strong><?php _e('Version:', 'natal-chart-plugin'); ?></strong> <?php echo esc_html(NATAL_CHART_PLUGIN_VERSION); ?></p>
                        <p><strong><?php _e('API Status:', 'natal-chart-plugin'); ?></strong> 
                            <?php echo $this->get_api_status(); ?>
                        </p>
                    </div>
                    
                    <div class="natal-chart-admin-box">
                        <h3><?php _e('Quick Test', 'natal-chart-plugin'); ?></h3>
                        <p><?php _e('Test your API connection with a sample location search.', 'natal-chart-plugin'); ?></p>
                        <button type="button" class="button button-secondary" id="test-api-connection">
                            <?php _e('Test API Connection', 'natal-chart-plugin'); ?>
                        </button>
                        <div id="api-test-result"></div>
                    </div>
                    
                    <div class="natal-chart-admin-box">
                        <h3><?php _e('Shortcode Usage', 'natal-chart-plugin'); ?></h3>
                        <p><code>[natal_chart_form]</code></p>
                        <p><?php _e('Use this shortcode to display the natal chart form on any page or post.', 'natal-chart-plugin'); ?></p>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * API section callback
     */
    public function api_section_callback() {
        echo '<p>' . __('Configure your astrology API settings below. You will need a valid bearer token to use the plugin.', 'natal-chart-plugin') . '</p>';
    }
    
    /**
     * Bearer token field callback
     */
    public function bearer_token_field_callback() {
        $options = get_option('natal_chart_settings');
        $value = isset($options['bearer_token']) ? $options['bearer_token'] : '';
        ?>
        <input type="password" 
               id="bearer_token" 
               name="natal_chart_settings[bearer_token]" 
               value="<?php echo esc_attr($value); ?>" 
               class="regular-text" />
        <p class="description">
            <?php _e('Enter your API bearer token. This token will be used to authenticate all API requests.', 'natal-chart-plugin'); ?>
        </p>
        <button type="button" class="button button-secondary" id="show-hide-token">
            <?php _e('Show/Hide Token', 'natal-chart-plugin'); ?>
        </button>
        <?php
    }
    
    /**
     * API base URL field callback
     */
    public function api_base_url_field_callback() {
        $options = get_option('natal_chart_settings');
        $value = isset($options['api_base_url']) ? $options['api_base_url'] : 'https://resource.astrologycosmic.com/public/api/v1';
        ?>
        <input type="url" 
               id="api_base_url" 
               name="natal_chart_settings[api_base_url]" 
               value="<?php echo esc_url($value); ?>" 
               class="regular-text" />
        <p class="description">
            <?php _e('The base URL for your astrology API service.', 'natal-chart-plugin'); ?>
        </p>
        <?php
    }
    
    /**
     * Enable logging field callback
     */
    public function enable_logging_field_callback() {
        $options = get_option('natal_chart_settings');
        $value = isset($options['enable_logging']) ? $options['enable_logging'] : false;
        ?>
        <label>
            <input type="checkbox" 
                   id="enable_logging" 
                   name="natal_chart_settings[enable_logging]" 
                   value="1" 
                   <?php checked($value, 1); ?> />
            <?php _e('Enable API request logging for debugging purposes', 'natal-chart-plugin'); ?>
        </label>
        <?php
    }
    
    /**
     * Rate limit field callback
     */
    public function rate_limit_field_callback() {
        $options = get_option('natal_chart_settings');
        $value = isset($options['rate_limit']) ? $options['rate_limit'] : 100;
        ?>
        <input type="number" 
               id="rate_limit" 
               name="natal_chart_settings[rate_limit]" 
               value="<?php echo esc_attr($value); ?>" 
               min="1" 
               max="1000" 
               class="small-text" />
        <p class="description">
            <?php _e('Maximum number of API requests allowed per hour per user.', 'natal-chart-plugin'); ?>
        </p>
        <?php
    }
    
    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        if (isset($input['bearer_token'])) {
            $sanitized['bearer_token'] = sanitize_text_field($input['bearer_token']);
        }
        
        if (isset($input['api_base_url'])) {
            $sanitized['api_base_url'] = esc_url_raw($input['api_base_url']);
        }
        
        if (isset($input['enable_logging'])) {
            $sanitized['enable_logging'] = (bool) $input['enable_logging'];
        } else {
            $sanitized['enable_logging'] = false;
        }
        
        if (isset($input['rate_limit'])) {
            $sanitized['rate_limit'] = absint($input['rate_limit']);
            if ($sanitized['rate_limit'] < 1) {
                $sanitized['rate_limit'] = 1;
            }
            if ($sanitized['rate_limit'] > 1000) {
                $sanitized['rate_limit'] = 1000;
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Get API status
     */
    private function get_api_status() {
        $options = get_option('natal_chart_settings');
        $bearer_token = isset($options['bearer_token']) ? $options['bearer_token'] : '';
        
        if (empty($bearer_token)) {
            return '<span style="color: #d63638;">' . __('Not Configured', 'natal-chart-plugin') . '</span>';
        }
        
        return '<span style="color: #00a32a;">' . __('Configured', 'natal-chart-plugin') . '</span>';
    }
    
    /**
     * Admin notices
     */
    public function admin_notices() {
        $options = get_option('natal_chart_settings');
        $bearer_token = isset($options['bearer_token']) ? $options['bearer_token'] : '';
        
        if (empty($bearer_token)) {
            $screen = get_current_screen();
            if ($screen && strpos($screen->id, 'natal-chart') !== false) {
                ?>
                <div class="notice notice-warning is-dismissible">
                    <p>
                        <strong><?php _e('Natal Chart Plugin:', 'natal-chart-plugin'); ?></strong>
                        <?php _e('Please configure your API bearer token in the settings below.', 'natal-chart-plugin'); ?>
                    </p>
                </div>
                <?php
            }
        }
    }
}
