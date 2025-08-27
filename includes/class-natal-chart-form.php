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
            <form id="natal_chart_form" class="natal-chart-form" action="javascript:void(0)">
                <?php wp_nonce_field('natal_chart_nonce', 'natal_chart_nonce'); ?>
                
                <!-- Birth Location Section (First) -->
                <div class="natal-chart-form-group">
                    <label for="natal_chart_location_search" class="natal-chart-form-label">
                        <?php _e('Birth Location', 'natal-chart-plugin'); ?> <span class="required">*</span>
                    </label>
                    
                    <!-- Location Search Container -->
                    <div class="natal-chart-location-search-container">
                        <input type="text" 
                               id="natal_chart_location_search" 
                               name="natal_chart_location_search" 
                               class="natal-chart-form-input natal-chart-location-search" 
                               placeholder="<?php esc_attr_e('Start typing to search for a city...', 'natal-chart-plugin'); ?>" 
                               required />
                        <div class="natal-chart-location-results" id="natal-chart-location-results"></div>
                    </div>
                    
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
                    <div class="natal-chart-time-input-group">
                        <input type="number" 
                               id="natal_chart_birth_hour" 
                               name="natal_chart_birth_hour" 
                               class="natal-chart-form-input natal-chart-time-input" 
                               min="1" 
                               max="12" 
                               placeholder="12" 
                               required />
                        <span class="natal-chart-time-separator">:</span>
                        <input type="number" 
                               id="natal_chart_birth_minute" 
                               name="natal_chart_birth_minute" 
                               class="natal-chart-form-input natal-chart-time-input" 
                               min="0" 
                               max="59" 
                               placeholder="00" 
                               required />
                        <select id="natal_chart_birth_ampm" 
                                name="natal_chart_birth_ampm" 
                                class="natal-chart-form-input natal-chart-ampm-select">
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                        </select>
                    </div>
                </div>

                <!-- Hidden fields for location data -->
                <input type="hidden" id="natal_chart_location" name="natal_chart_location" />
                <input type="hidden" id="natal_chart_timezone" name="natal_chart_timezone" />
                <input type="hidden" id="natal_chart_offset" name="natal_chart_offset" />
                <input type="hidden" id="natal_chart_house_system" name="natal_chart_house_system" value="p" />

                <div class="natal-chart-form-group">
                    <button type="submit" id="natal_chart_submit" class="natal-chart-form-submit" disabled>
                        <span class="natal-chart-submit-text"><?php echo esc_html($atts['button_text']); ?></span>
                        <span class="natal-chart-submit-loading" style="display: none;">
                            <span class="natal-chart-spinner"></span>
                            <?php _e('Generating Report...', 'natal-chart-plugin'); ?>
                        </span>
                    </button>
                    
                    <!-- Test Button for AJAX Debugging -->
                    <button type="button" id="natal_chart_test_ajax" class="natal-chart-form-test" style="margin-left: 10px; background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        Test AJAX
                    </button>
                </div>
                
                <!-- Debug Test Button -->
                <div class="natal-chart-form-group" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px; border: 1px dashed #dee2e6;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                        <strong>Debug:</strong> Click this button to test form validation
                    </p>
                    <button type="button" onclick="testFormValidation()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Test Form Validation
                    </button>
                </div>
            </form>

            <!-- Results Container - Always show for form functionality -->
            <div id="natal_chart-results" class="natal-chart-results" style="display: none;"></div>
        </div>
        
        <script>
        // Ensure form is initialized after rendering
        (function() {
            console.log('Form shortcode rendered, checking initialization...');
            
            // Wait a bit for DOM to settle
            setTimeout(function() {
                // Initialize form handler
                if (typeof window.initializeNatalChartFormManually === 'function') {
                    console.log('Calling manual form initialization...');
                    window.initializeNatalChartFormManually();
                } else {
                    console.log('Manual form initialization function not available yet, will retry...');
                    // Retry after a longer delay
                    setTimeout(function() {
                        if (typeof window.initializeNatalChartFormManually === 'function') {
                            window.initializeNatalChartFormManually();
                        }
                    }, 1000);
                }
                
                // Initialize location autocomplete
                if (typeof window.initializeLocationAutocompleteManually === 'function') {
                    console.log('Calling manual location autocomplete initialization...');
                    window.initializeLocationAutocompleteManually();
                } else {
                    console.log('Manual location autocomplete initialization function not available yet, will retry...');
                    // Retry after a longer delay
                    setTimeout(function() {
                        if (typeof window.initializeLocationAutocompleteManually === 'function') {
                            window.initializeLocationAutocompleteManually();
                        }
                    }, 1000);
                }
            }, 100);
        })();
        </script>
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
        
        // Validate birth time (already converted to 24-hour format in JavaScript)
        if (empty($data['natal_chart_birth_time'])) {
            $errors['natal_chart_birth_time'] = __('Birth time is required.', 'natal-chart-plugin');
        } else {
            $birth_time = sanitize_text_field($data['natal_chart_birth_time']);
            if (!$this->is_valid_time_24($birth_time)) {
                $errors['natal_chart_birth_time'] = __('Please enter a valid birth time.', 'natal-chart-plugin');
            } else {
                $validated['birth_time'] = $birth_time;
            }
        }
        
        // Validate timezone (offset_round value)
        if (!isset($data['natal_chart_timezone']) || $data['natal_chart_timezone'] === '') {
            $errors['natal_chart_timezone'] = __('Timezone is required.', 'natal-chart-plugin');
        } else {
            $validated['timezone'] = floatval($data['natal_chart_timezone']);
        }
        
        // Validate latitude
        if (!isset($data['natal_chart_latitude']) || $data['natal_chart_latitude'] === '') {
            $errors['natal_chart_latitude'] = __('Latitude is required.', 'natal-chart-plugin');
        } else {
            $validated['latitude'] = floatval($data['natal_chart_latitude']);
        }
        
        // Validate longitude
        if (!isset($data['natal_chart_longitude']) || $data['natal_chart_longitude'] === '') {
            $errors['natal_chart_longitude'] = __('Longitude is required.', 'natal-chart-plugin');
        } else {
            $validated['longitude'] = floatval($data['natal_chart_longitude']);
        }
        
        // Validate location
        if (empty($data['natal_chart_location'])) {
            $errors['natal_chart_location'] = __('Location is required.', 'natal-chart-plugin');
        } else {
            $validated['location'] = sanitize_text_field($data['natal_chart_location']);
        }
        
        // Validate house system (default to 'p' if not provided)
        $validated['house_system'] = sanitize_text_field($data['natal_chart_house_system'] ?? 'p');
        
        // If there are errors, return them
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
     * Check if time is valid in 24-hour format
     * 
     * @param string $time Time string in 24-hour format
     * @return bool True if valid, false otherwise
     */
    private function is_valid_time_24($time) {
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
                        <strong><?php _e('Latitude:', 'natal-chart-plugin'); ?></strong>
                        <span><?php echo esc_html($form_data['latitude']); ?></span>
                    </div>
                    <div class="natal-chart-info-item">
                        <strong><?php _e('Longitude:', 'natal-chart-plugin'); ?></strong>
                        <span><?php echo esc_html($form_data['longitude']); ?></span>
                    </div>
                    <div class="natal-chart-info-item">
                        <strong><?php _e('Timezone Offset:', 'natal-chart-plugin'); ?></strong>
                        <span><?php echo esc_html($form_data['timezone']); ?></span>
                    </div>
                    <div class="natal-chart-info-item">
                        <strong><?php _e('House System:', 'natal-chart-plugin'); ?></strong>
                        <span><?php echo esc_html($form_data['house_system']); ?></span>
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
