<?php
/**
 * Plugin Name: Natal Chart Generator
 * Plugin URI: https://yourwebsite.com/natal-chart-plugin
 * Description: Generate natal charts using external astrology API services with location autocomplete and form handling.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: natal-chart-plugin
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('NATAL_CHART_PLUGIN_VERSION', '1.0.0');
define('NATAL_CHART_PLUGIN_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('NATAL_CHART_PLUGIN_PLUGIN_URL', plugin_dir_url(__FILE__));
define('NATAL_CHART_PLUGIN_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Natal Chart Plugin Class
 */
class Natal_Chart_Plugin {
    
    /**
     * Plugin instance
     */
    private static $instance = null;
    
    /**
     * Get plugin instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
        $this->load_dependencies();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Plugin initialization
        add_action('plugins_loaded', array($this, 'init'));
        
        // Load text domain for internationalization
        add_action('init', array($this, 'load_textdomain'));
    }
    
    /**
     * Load plugin dependencies
     */
    private function load_dependencies() {
        // Include required files
        require_once NATAL_CHART_PLUGIN_PLUGIN_DIR . 'includes/class-natal-chart-admin.php';
        require_once NATAL_CHART_PLUGIN_PLUGIN_DIR . 'includes/class-natal-chart-api.php';
        require_once NATAL_CHART_PLUGIN_PLUGIN_DIR . 'includes/class-natal-chart-form.php';
        require_once NATAL_CHART_PLUGIN_PLUGIN_DIR . 'includes/class-natal-chart-shortcode.php';
        require_once NATAL_CHART_PLUGIN_PLUGIN_DIR . 'includes/class-natal-chart-ajax.php';
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Initialize admin functionality
        if (is_admin()) {
            new Natal_Chart_Admin();
        }
        
        // Initialize frontend functionality
        new Natal_Chart_Form();
        new Natal_Chart_Shortcode();
        new Natal_Chart_Ajax();
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    }
    
    /**
     * Load text domain for internationalization
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'natal-chart-plugin',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts() {
        // Only enqueue on pages with shortcodes or specific templates
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'natal_chart_form')) {
            wp_enqueue_style(
                'natal-chart-form',
                NATAL_CHART_PLUGIN_PLUGIN_URL . 'assets/css/natal-chart-form.css',
                array(),
                NATAL_CHART_PLUGIN_VERSION
            );
            
            wp_enqueue_script(
                'natal-chart-form',
                NATAL_CHART_PLUGIN_PLUGIN_URL . 'assets/js/natal-chart-form.js',
                array('jquery'),
                NATAL_CHART_PLUGIN_VERSION,
                true
            );
            
            wp_enqueue_script(
                'natal-chart-location-autocomplete',
                NATAL_CHART_PLUGIN_PLUGIN_URL . 'assets/js/location-autocomplete.js',
                array('jquery'),
                NATAL_CHART_PLUGIN_VERSION,
                true
            );
            
            // Localize script with AJAX URL and nonce
            wp_localize_script('natal-chart-form', 'natal_chart_ajax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('natal_chart_nonce'),
                'strings' => array(
                    'loading' => __('Loading...', 'natal-chart-plugin'),
                    'error' => __('An error occurred. Please try again.', 'natal-chart-plugin'),
                    'required_field' => __('This field is required.', 'natal-chart-plugin'),
                    'invalid_date' => __('Please enter a valid date.', 'natal-chart-plugin'),
                    'invalid_time' => __('Please enter a valid time.', 'natal-chart-plugin'),
                    'searching' => __('Searching locations...', 'natal-chart-plugin'),
                    'no_results' => __('No locations found.', 'natal-chart-plugin'),
                )
            ));
        }
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function admin_enqueue_scripts($hook) {
        // Only enqueue on plugin admin pages
        if (strpos($hook, 'natal-chart') !== false) {
            wp_enqueue_style(
                'natal-chart-admin',
                NATAL_CHART_PLUGIN_PLUGIN_URL . 'assets/css/admin-style.css',
                array(),
                NATAL_CHART_PLUGIN_VERSION
            );
            
            wp_enqueue_script(
                'natal-chart-admin',
                NATAL_CHART_PLUGIN_PLUGIN_URL . 'assets/js/admin-script.js',
                array('jquery'),
                NATAL_CHART_PLUGIN_VERSION,
                true
            );
            
            wp_localize_script('natal-chart-admin', 'natal_chart_admin', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('natal_chart_admin_nonce'),
                'strings' => array(
                    'saving' => __('Saving...', 'natal-chart-plugin'),
                    'saved' => __('Settings saved successfully!', 'natal-chart-plugin'),
                    'error' => __('An error occurred while saving.', 'natal-chart-plugin'),
                    'confirm_reset' => __('Are you sure you want to reset all settings?', 'natal-chart-plugin'),
                )
            ));
        }
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options
        $default_options = array(
            'bearer_token' => '',
            'api_base_url' => 'https://resource.astrologycosmic.com/public/api/v1',
            'enable_logging' => false,
            'rate_limit' => 100, // requests per hour
        );
        
        add_option('natal_chart_settings', $default_options);
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clear any scheduled events
        wp_clear_scheduled_hook('natal_chart_cleanup');
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}

// Initialize the plugin
Natal_Chart_Plugin::get_instance();
