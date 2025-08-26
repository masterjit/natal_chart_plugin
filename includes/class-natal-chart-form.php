<?php
/**
 * Form Handling Class for Natal Chart Plugin
 * 
 * Handles form rendering, validation, and processing
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Natal_Chart_Form {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_form_assets'));
    }
    
    /**
     * Enqueue form-specific assets
     */
    public function enqueue_form_assets() {
        // This is handled by the main plugin class
    }
    
    /**
     * Render the natal chart form
     * 
     * @param array $atts Shortcode attributes
     * @return string Form HTML
     */
    public function render_natal_chart_form($atts = array()) {
        $atts = shortcode_atts(array(
            'title' => __('Natal Chart Generator', 'natal-chart-plugin'),
            'button_text' => __('Generate Report', 'natal-chart-plugin'),
            'show_results' => 'true'
        ), $atts);

        ob_start();
        ?>
        <div class="natal-chart-form-container">
            <form id="natal-chart-form" class="natal-chart-form" method="post">
                <?php wp_nonce_field('natal_chart_nonce', 'natal_chart_nonce'); ?>
                
                <!-- Birth Location Section (First) -->
                <div class="natal-chart-form-group">
                    <label for="natal_chart_location_search" class="natal-chart-form-label">
                        <?php _e('Birth Location', 'natal-chart-plugin'); ?> <span class="required">*</span>
                    </label>
                    <input type="text" 
                           id="natal_chart_location_search" 
                           name="natal_chart_location_search" 
                           class="natal-chart-form-input natal-chart-location-search" 
                           placeholder="<?php esc_attr_e('Start typing to search for a city...', 'natal-chart-plugin'); ?>" 
                           required />
                    <div class="natal-chart-location-results" id="natal-chart-location-results"></div>
                    
                    <!-- Readonly Location Data Fields -->
                    <div class="natal-chart-location-data">
                        <div class="natal-chart-form-row">
                            <div class="natal-chart-form-col">
                                <label for="natal_chart_latitude" class="natal-chart-form-label">
                                    <?php _e('Latitude', 'natal-chart-plugin'); ?>
                                </label>
                                <input type="text" 
                                       id="natal_chart_latitude" 
                                       name="natal_chart_latitude" 
                                       class="natal-chart-form-input" 
                                       readonly />
                            </div>
                            <div class="natal-chart-form-col">
                                <label for="natal_chart_longitude" class="natal-chart-form-label">
                                    <?php _e('Longitude', 'natal-chart-plugin'); ?>
                                </label>
                                <input type="text" 
                                       id="natal_chart_longitude" 
                                       name="natal_chart_longitude" 
                                       class="natal-chart-form-input" 
                                       readonly />
                            </div>
                            <div class="natal-chart-form-col">
                                <label for="natal_chart_offset_round" class="natal-chart-form-label">
                                    <?php _e('Timezone Offset', 'natal-chart-plugin'); ?>
                                </label>
                                <input type="text" 
                                       id="natal_chart_offset_round" 
                                       name="natal_chart_offset_round" 
                                       class="natal-chart-form-input" 
                                       readonly />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Other Form Fields -->
                <div class="natal-chart-form-group">
                    <label for="natal_chart_name" class="natal-chart-form-label">
                        <?php _e('Full Name', 'natal-chart-plugin'); ?> <span class="required">*</span>
                    </label>
                    <input type="text" 
                           id="natal_chart_name" 
                           name="natal_chart_name" 
                           class="natal-chart-form-input" 
                           placeholder="<?php esc_attr_e('Enter your full name', 'natal-chart-plugin'); ?>" 
                           required />
                </div>

                <div class="natal-chart-form-group">
                    <label for="natal_chart_birth_date" class="natal-chart-form-label">
                        <?php _e('Birth Date', 'natal-chart-plugin'); ?> <span class="required">*</span>
                    </label>
                    <input type="date" 
                           id="natal_chart_birth_date" 
                           name="natal_chart_birth_date" 
                           class="natal-chart-form-input" 
                           required />
                </div>

                <div class="natal-chart-form-group">
                    <label for="natal_chart_birth_time" class="natal-chart-form-label">
                        <?php _e('Birth Time', 'natal-chart-plugin'); ?> <span class="required">*</span>
                    </label>
                    <input type="time" 
                           id="natal_chart_birth_time" 
                           name="natal_chart_birth_time" 
                           class="natal-chart-form-input" 
                           required />
                </div>

                <!-- Hidden fields for location data -->
                <input type="hidden" id="natal_chart_location" name="natal_chart_location" />
                <input type="hidden" id="natal_chart_timezone" name="natal_chart_timezone" />
                <input type="hidden" id="natal_chart_offset" name="natal_chart_offset" />

                <div class="natal-chart-form-group">
                    <button type="submit" id="natal_chart_submit" class="natal-chart-form-submit" disabled>
                        <span class="natal-chart-submit-text"><?php echo esc_html($atts['button_text']); ?></span>
                        <span class="natal-chart-submit-loading" style="display: none;">
                            <span class="natal-chart-spinner"></span>
                            <?php _e('Generating Report...', 'natal-chart-plugin'); ?>
                        </span>
                    </button>
                </div>
            </form>

            <!-- Results Container -->
            <?php if ($atts['show_results'] === 'true'): ?>
            <div id="natal-chart-results" class="natal-chart-results" style="display: none;"></div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Validate form data
     * 
     * @param array $data Form data
     * @return array|WP_Error Validated data or error
     */
    public function validate_form_data($data) {
        $errors = array();
        $validated = array();
        
        // Validate name
        if (empty($data['natal_chart_name'])) {
            $errors['natal_chart_name'] = __('Name is required.', 'natal-chart-plugin');
        } else {
            $validated['name'] = sanitize_text_field($data['natal_chart_name']);
        }
        
        // Validate birth date
        if (empty($data['natal_chart_birth_date'])) {
            $errors['natal_chart_birth_date'] = __('Birth date is required.', 'natal-chart-plugin');
        } else {
            $birth_date = sanitize_text_field($data['natal_chart_birth_date']);
            if (!$this->is_valid_date($birth_date)) {
                $errors['natal_chart_birth_date'] = __('Please enter a valid birth date.', 'natal-chart-plugin');
            } else {
                $validated['birth_date'] = $birth_date;
            }
        }
        
        // Validate birth time
        if (empty($data['natal_chart_birth_time'])) {
            $errors['natal_chart_birth_time'] = __('Birth time is required.', 'natal-chart-plugin');
        } else {
            $birth_time = sanitize_text_field($data['natal_chart_birth_time']);
            if (!$this->is_valid_time($birth_time)) {
                $errors['natal_chart_birth_time'] = __('Please enter a valid birth time.', 'natal-chart-plugin');
            } else {
                $validated['birth_time'] = $birth_time;
            }
        }
        
        // Validate location data
        if (empty($data['natal_chart_location'])) {
            $errors['natal_chart_location'] = __('Please select a location from the search results.', 'natal-chart-plugin');
        } else {
            $validated['location'] = sanitize_text_field($data['natal_chart_location']);
        }
        
        if (empty($data['natal_chart_latitude']) || empty($data['natal_chart_longitude'])) {
            $errors['natal_chart_location'] = __('Location coordinates are required. Please select a location from the search results.', 'natal-chart-plugin');
        } else {
            $validated['latitude'] = floatval($data['natal_chart_latitude']);
            $validated['longitude'] = floatval($data['natal_chart_longitude']);
        }
        
        if (empty($data['natal_chart_timezone'])) {
            $errors['natal_chart_timezone'] = __('Timezone is required. Please select a location from the search results.', 'natal-chart-plugin');
        } else {
            $validated['timezone'] = sanitize_text_field($data['natal_chart_timezone']);
        }
        
        // Return errors if any
        if (!empty($errors)) {
            return new WP_Error('validation_failed', __('Please correct the errors below.', 'natal-chart-plugin'), $errors);
        }
        
        return $validated;
    }
    
    /**
     * Check if date is valid
     * 
     * @param string $date Date string
     * @return bool True if valid, false otherwise
     */
    private function is_valid_date($date) {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
    
    /**
     * Check if time is valid
     * 
     * @param string $time Time string
     * @return bool True if valid, false otherwise
     */
    private function is_valid_time($time) {
        $t = DateTime::createFromFormat('H:i', $time);
        return $t && $t->format('H:i') === $time;
    }
    
    /**
     * Process form submission
     * 
     * @param array $data Form data
     * @return array|WP_Error Processing result or error
     */
    public function process_form($data) {
        // Validate form data
        $validated_data = $this->validate_form_data($data);
        
        if (is_wp_error($validated_data)) {
            return $validated_data;
        }
        
        // Initialize API class
        $api = new Natal_Chart_API();
        
        // Generate natal chart
        $result = $api->generate_natal_chart($validated_data);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return array(
            'success' => true,
            'data' => $result,
            'form_data' => $validated_data
        );
    }
    
    /**
     * Render natal chart results
     * 
     * @param array $chart_data Chart data from API
     * @param array $form_data Original form data
     * @return string Results HTML
     */
    public function render_results($chart_data, $form_data) {
        ob_start();
        ?>
        <div class="natal-chart-results-content">
            <div class="natal-chart-personal-info">
                <h4><?php _e('Personal Information', 'natal-chart-plugin'); ?></h4>
                <div class="natal-chart-info-grid">
                    <div class="natal-chart-info-item">
                        <strong><?php _e('Name:', 'natal-chart-plugin'); ?></strong>
                        <span><?php echo esc_html($form_data['name']); ?></span>
                    </div>
                    <div class="natal-chart-info-item">
                        <strong><?php _e('Birth Date:', 'natal-chart-plugin'); ?></strong>
                        <span><?php echo esc_html($form_data['birth_date']); ?></span>
                    </div>
                    <div class="natal-chart-info-item">
                        <strong><?php _e('Birth Time:', 'natal-chart-plugin'); ?></strong>
                        <span><?php echo esc_html($form_data['birth_time']); ?></span>
                    </div>
                    <div class="natal-chart-info-item">
                        <strong><?php _e('Location:', 'natal-chart-plugin'); ?></strong>
                        <span><?php echo esc_html($form_data['location']); ?></span>
                    </div>
                    <div class="natal-chart-info-item">
                        <strong><?php _e('Timezone:', 'natal-chart-plugin'); ?></strong>
                        <span><?php echo esc_html($form_data['timezone']); ?></span>
                    </div>
                </div>
            </div>
            
            <div class="natal-chart-chart-data">
                <h4><?php _e('Natal Chart Data', 'natal-chart-plugin'); ?></h4>
                <div class="natal-chart-data-content">
                    <?php if (is_array($chart_data) && !empty($chart_data)): ?>
                        <pre class="natal-chart-json-data"><?php echo esc_html(json_encode($chart_data, JSON_PRETTY_PRINT)); ?></pre>
                    <?php else: ?>
                        <p><?php _e('Chart data received successfully.', 'natal-chart-plugin'); ?></p>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="natal-chart-actions">
                <button type="button" class="button button-secondary" id="natal-chart-print">
                    <?php _e('Print Chart', 'natal-chart-plugin'); ?>
                </button>
                <button type="button" class="button button-secondary" id="natal-chart-download">
                    <?php _e('Download Data', 'natal-chart-plugin'); ?>
                </button>
                <button type="button" class="button button-primary" id="natal-chart-new-chart">
                    <?php _e('Generate New Chart', 'natal-chart-plugin'); ?>
                </button>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get form field value
     * 
     * @param string $field_name Field name
     * @param mixed $default Default value
     * @return mixed Field value
     */
    public function get_field_value($field_name, $default = '') {
        if (isset($_POST[$field_name])) {
            return sanitize_text_field($_POST[$field_name]);
        }
        return $default;
    }
    
    /**
     * Get form field error
     * 
     * @param string $field_name Field name
     * @param array $errors Error array
     * @return string Error message
     */
    public function get_field_error($field_name, $errors) {
        if (isset($errors[$field_name])) {
            return esc_html($errors[$field_name]);
        }
        return '';
    }
}
