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
            <form id="natal_chart_form" class="natal_chart_form" action="javascript:void(0)">
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
                                <input type="number" 
                                       id="natal_chart_offset_round" 
                                       name="natal_chart_offset_round" 
                                       class="natal-chart-form-input" 
                                       step="0.1"
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
                        <select id="natal_chart_birth_hour" 
                                name="natal_chart_birth_hour" 
                                class="natal-chart-form-input natal-chart-time-input" 
                                required>
                            <option value="12" selected>12</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                        </select>
                        <span class="natal-chart-time-separator">:</span>
                        <select id="natal_chart_birth_minute" 
                                name="natal_chart_birth_minute" 
                                class="natal-chart-form-input natal-chart-time-input" 
                                required>
                            <option value="00" selected>00</option>
                            <option value="01">01</option>
                            <option value="02">02</option>
                            <option value="03">03</option>
                            <option value="04">04</option>
                            <option value="05">05</option>
                            <option value="06">06</option>
                            <option value="07">07</option>
                            <option value="08">08</option>
                            <option value="09">09</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="13">13</option>
                            <option value="14">14</option>
                            <option value="15">15</option>
                            <option value="16">16</option>
                            <option value="17">17</option>
                            <option value="18">18</option>
                            <option value="19">19</option>
                            <option value="20">20</option>
                            <option value="21">21</option>
                            <option value="22">22</option>
                            <option value="23">23</option>
                            <option value="24">24</option>
                            <option value="25">25</option>
                            <option value="26">26</option>
                            <option value="27">27</option>
                            <option value="28">28</option>
                            <option value="29">29</option>
                            <option value="30">30</option>
                            <option value="31">31</option>
                            <option value="32">32</option>
                            <option value="33">33</option>
                            <option value="34">34</option>
                            <option value="35">35</option>
                            <option value="36">36</option>
                            <option value="37">37</option>
                            <option value="38">38</option>
                            <option value="39">39</option>
                            <option value="40">40</option>
                            <option value="41">41</option>
                            <option value="42">42</option>
                            <option value="43">43</option>
                            <option value="44">44</option>
                            <option value="45">45</option>
                            <option value="46">46</option>
                            <option value="47">47</option>
                            <option value="48">48</option>
                            <option value="49">49</option>
                            <option value="50">50</option>
                            <option value="51">51</option>
                            <option value="52">52</option>
                            <option value="53">53</option>
                            <option value="54">54</option>
                            <option value="55">55</option>
                            <option value="56">56</option>
                            <option value="57">57</option>
                            <option value="58">58</option>
                            <option value="59">59</option>
                        </select>
                        <select id="natal_chart_birth_ampm" 
                                name="natal_chart_birth_ampm" 
                                class="natal-chart-form-input natal-chart-ampm-select">
                            <option value="AM" selected>AM</option>
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
                        <?php echo $this->format_natal_chart_data($chart_data); ?>
                    <?php else: ?>
                        <p><?php _e('Chart data received successfully.', 'natal-chart-plugin'); ?></p>
                    <?php endif; ?>
                </div>
            </div>
            
                    <div class="natal-chart-actions">
            <button type="button" class="button button-primary" onclick="enableFormAndRefresh()">
                <?php _e('Generate New Chart', 'natal-chart-plugin'); ?>
            </button>
        </div>
    </div>
    
    <?php
    return ob_get_clean();
}

    /**
     * Format natal chart data into beautiful HTML
     * 
     * @param array $chart_data Chart data from API
     * @return string Formatted HTML
     */
    private function format_natal_chart_data($chart_data) {
        $html = '';
        
        // Handle different data structures
        if (isset($chart_data['planets']) || isset($chart_data['houses']) || isset($chart_data['aspects'])) {
            $html .= $this->format_astrological_data($chart_data);
        } elseif (isset($chart_data['chart']) || isset($chart_data['data'])) {
            $html .= $this->format_nested_data($chart_data);
        } else {
            $html .= $this->format_generic_data($chart_data);
        }
        
        return $html;
    }

    /**
     * Format astrological data (planets, houses, aspects)
     * 
     * @param array $data Astrological data
     * @return string Formatted HTML
     */
    private function format_astrological_data($data) {
        $html = '<div class="natal-chart-astrological-data">';
        
        // Chart Image Section
        if (isset($data['chart_url']) && !empty($data['chart_url'])) {
            $html .= $this->format_chart_image_section($data['chart_url']);
        }
        
        // Planets Section
        if (isset($data['planets']) && is_array($data['planets'])) {
            $html .= $this->format_planets_section($data['planets']);
        }
        
        // Houses Section
        if (isset($data['houses']) && is_array($data['houses'])) {
            $html .= $this->format_houses_section($data['houses']);
        }
        
        // Aspects Section (Major Aspects)
        if (isset($data['aspects']) && is_array($data['aspects'])) {
            $html .= $this->format_aspects_section($data['aspects']);
        }
        
        // Planetary Aspects Section (Detailed Interpretations)
        if (isset($data['interpretations']['planetary_aspects']) && is_array($data['interpretations']['planetary_aspects'])) {
            $html .= $this->format_planetary_aspects_section($data['interpretations']['planetary_aspects']);
        }
        
        // Planets Section (Detailed Interpretations)
        if (isset($data['interpretations']['planets']) && is_array($data['interpretations']['planets'])) {
            $html .= $this->format_planets_interpretations_section($data['interpretations']['planets']);
        }
        
        // Houses Section (Detailed Interpretations)
        if (isset($data['interpretations']['houses']) && is_array($data['interpretations']['houses'])) {
            $html .= $this->format_houses_interpretations_section($data['interpretations']['houses']);
        }
        
        // Additional astrological data
        if (isset($data['angles'])) {
            $html .= $this->format_angles_section($data['angles']);
        }
        
        if (isset($data['lunar_nodes'])) {
            $html .= $this->format_lunar_nodes_section($data['lunar_nodes']);
        }
        
        $html .= '</div>';
        return $html;
    }

    /**
     * Format chart image section
     * 
     * @param string $chart_url Chart image URL
     * @return string Formatted HTML
     */
    private function format_chart_image_section($chart_url) {
        $html = '<div class="natal-chart-section">';
        $html .= '<h5 class="natal-chart-section-title">' . __('Natal Chart', 'natal-chart-plugin') . '</h5>';
        $html .= '<div class="natal-chart-image-container">';
        $html .= '<img src="' . esc_url($chart_url) . '" alt="' . __('Natal Chart', 'natal-chart-plugin') . '" class="natal-chart-image" />';
        $html .= '</div>';
        $html .= '</div>';
        return $html;
    }

    /**
     * Format planets section
     * 
     * @param array $planets Planets data
     * @return string Formatted HTML
     */
    private function format_planets_section($planets) {
        $html = '<div class="natal-chart-section">';
        $html .= '<h5 class="natal-chart-section-title">' . __('Planetary Positions', 'natal-chart-plugin') . '</h5>';
        $html .= '<div class="natal-chart-planets-grid">';
        
        foreach ($planets as $planet) {
            // Skip P. of Fortune and Vertex
            $planet_name = strtolower(trim($planet['name'] ?? ''));
            if (in_array($planet_name, ['p. of fortune', 'part of fortune', 'vertex'])) {
                continue;
            }
            
            $html .= '<div class="natal-chart-planet-item">';
            
            // Planet header with name and symbol
            $html .= '<div class="natal-chart-planet-header">';
            $html .= '<span class="natal-chart-planet-symbol">' . $this->get_planet_symbol($planet['name'] ?? '') . '</span>';
            $html .= '<span class="natal-chart-planet-name">' . esc_html($planet['name'] ?? '') . '</span>';
            $html .= '</div>';
            
            // Planet details
            $html .= '<div class="natal-chart-planet-details">';
            
            // Sign with symbol
            if (isset($planet['sign'])) {
                $html .= '<div class="natal-chart-planet-sign-info">';
                $html .= '<span class="natal-chart-planet-sign-symbol">' . $this->get_zodiac_symbol($planet['sign']) . '</span>';
                $html .= '<span class="natal-chart-planet-sign-name">' . esc_html($planet['sign']) . '</span>';
                $html .= '</div>';
            }
            
            // Longitude
            if (isset($planet['longitude'])) {
                $html .= '<div class="natal-chart-planet-longitude">';
                $html .= '<span class="natal-chart-longitude-label">' . __('Position', 'natal-chart-plugin') . ':</span> ';
                $html .= '<span class="natal-chart-longitude-value">' . $this->format_planet_longitude($planet['longitude']) . '</span>';
                $html .= '</div>';
            }
            
            // House position
            if (isset($planet['house_position'])) {
                $html .= '<div class="natal-chart-planet-house">';
                $html .= '<span class="natal-chart-house-label">' . __('House', 'natal-chart-plugin') . ':</span> ';
                $html .= '<span class="natal-chart-house-number">' . esc_html($planet['house_position']) . '</span>';
                $html .= '</div>';
            }
            
            // Retrograde indicator
            if (isset($planet['retrograde']) && $planet['retrograde']) {
                $html .= '<div class="natal-chart-planet-retrograde">℞ ' . __('Retrograde', 'natal-chart-plugin') . '</div>';
            }
            
            $html .= '</div>';
            $html .= '</div>';
        }
        
        $html .= '</div></div>';
        return $html;
    }

    /**
     * Format houses section
     * 
     * @param array $houses Houses data
     * @return string Formatted HTML
     */
    private function format_houses_section($houses) {
        $html = '<div class="natal-chart-section natal-chart-houses">';
        $html .= '<div class="natal-chart-section-toggle collapsed" onclick="toggleSection(this)">';
        $html .= '<span>' . __('House Cusps', 'natal-chart-plugin') . '</span>';
        $html .= '</div>';
        $html .= '<div class="natal-chart-section-content" style="display: none;">';
        $html .= '<div class="natal-chart-houses-grid">';
        
        foreach ($houses as $house) {
            $html .= '<div class="natal-chart-house-item">';
            $html .= '<div class="natal-chart-house-header">';            
            $html .= '<span class="natal-chart-house-name">' . esc_html($this->get_house_name($house['house'] ?? $house['number'] ?? '')) . '</span>';
            $html .= '</div>';
            
            if (isset($house['sign'])) {
                $html .= '<div class="natal-chart-house-sign">';
                $html .= '<span class="natal-chart-sign-symbol">' . $this->get_zodiac_symbol($house['sign']) . '</span>';
                $html .= '<span class="natal-chart-sign-name">' . esc_html($house['sign']) . '</span>';
                $html .= '</div>';
            }
            
            if (isset($house['longitude'])) {
                $html .= '<div class="natal-chart-house-longitude">';
                $html .= '<span class="natal-chart-longitude-label">' . __('Position', 'natal-chart-plugin') . ':</span> ';
                $html .= '<span class="natal-chart-longitude-value">' . $this->format_longitude($house['longitude']) . '</span>';
                $html .= '</div>';
            }
            
            $html .= '</div>';
        }
        
        $html .= '</div>';
        $html .= '</div></div>';
        return $html;
    }

    /**
     * Format aspects section
     * 
     * @param array $aspects Aspects data
     * @return string Formatted HTML
     */
    private function format_aspects_section($aspects) {
        $html = '<div class="natal-chart-section natal-chart-aspects">';
        $html .= '<div class="natal-chart-section-toggle collapsed" onclick="toggleSection(this)">';
        $html .= '<span>' . __('Major Aspects', 'natal-chart-plugin') . '</span>';
        $html .= '</div>';
        $html .= '<div class="natal-chart-section-content" style="display: none;">';
        $html .= '<div class="natal-chart-aspects-table">';
        $html .= '<table class="natal-chart-table">';
        $html .= '<thead><tr>';
        $html .= '<th class="natal-chart-table-header">' . __('Planet 1', 'natal-chart-plugin') . '</th>';
        $html .= '<th class="natal-chart-table-header">' . __('Aspect', 'natal-chart-plugin') . '</th>';
        $html .= '<th class="natal-chart-table-header">' . __('Planet 2', 'natal-chart-plugin') . '</th>';
        $html .= '<th class="natal-chart-table-header">' . __('Orb', 'natal-chart-plugin') . '</th>';
        $html .= '</tr></thead><tbody>';
        
        foreach ($aspects as $aspect) {
            $html .= '<tr class="natal-chart-aspect-row natal-chart-aspect-' . strtolower($aspect['aspect'] ?? '') . '">';
            $html .= '<td data-label="' . __('Planet 1', 'natal-chart-plugin') . '">' . esc_html($aspect['planet1'] ?? '') . '</td>';
            $html .= '<td data-label="' . __('Aspect', 'natal-chart-plugin') . '"><span class="natal-chart-aspect-type">' . $this->get_aspect_symbol($aspect['aspect'] ?? '') . ' ' . esc_html($aspect['aspect'] ?? '') . '</span></td>';
            $html .= '<td data-label="' . __('Planet 2', 'natal-chart-plugin') . '">' . esc_html($aspect['planet2'] ?? '') . '</td>';
            $html .= '<td data-label="' . __('Orb', 'natal-chart-plugin') . '">' . esc_html($aspect['orb'] ?? '') . '°</td>';
            $html .= '</tr>';
        }
        
        $html .= '</tbody></table></div>';
        $html .= '</div></div>';
        return $html;
    }

    /**
     * Format planetary aspects section
     * 
     * @param array $planetary_aspects Planetary aspects data
     * @return string Formatted HTML
     */
    private function format_planetary_aspects_section($planetary_aspects) {
        if (empty($planetary_aspects) || !isset($planetary_aspects['aspects']) || !is_array($planetary_aspects['aspects'])) {
            return '<div style="background: #ffebee; padding: 10px; margin: 10px 0; border: 1px solid #f44336; color: #c62828;">Debug: No planetary aspects data found. Data: ' . print_r($planetary_aspects, true) . '</div>';
        }

        $html = '<div class="natal-chart-section natal-chart-planetary-aspects">';
        $html .= '<div class="natal-chart-section-toggle collapsed" onclick="toggleSection(this)">';
        $html .= '<span>' . __('PLANETARY ASPECTS', 'natal-chart-plugin') . '</span>';
        $html .= '</div>';
        
        $html .= '<div class="natal-chart-section-content" style="display: none;">';
        
        // Header description
        if (!empty($planetary_aspects['header'])) {
            $html .= '<div class="natal-chart-section-description">';
            $html .= wp_kses_post(nl2br($planetary_aspects['header']));
            $html .= '</div>';
        }
        
        $html .= '<div class="natal-chart-planetary-aspects-list">';
        
        foreach ($planetary_aspects['aspects'] as $aspect) {
            $html .= '<div class="natal-chart-planetary-aspect-item natal-chart-planetary-aspect-' . strtolower($aspect['aspect'] ?? '') . '">';
            
            // Header section with Planet 1, Aspect, Planet 2, and Orb
            $html .= '<div class="natal-chart-planetary-aspect-header">';
            $html .= '<div class="natal-chart-planetary-aspect-planets">';
            $html .= '<span class="natal-chart-planet1">' . esc_html($aspect['planet1'] ?? '') . '</span>';
            $html .= '<span class="natal-chart-aspect-symbol">' . $this->get_aspect_symbol($aspect['aspect'] ?? '') . '</span>';
            $html .= '<span class="natal-chart-planet2">' . esc_html($aspect['planet2'] ?? '') . '</span>';
            if (isset($aspect['orb'])) {
                $html .= '<span class="natal-chart-aspect-orb-inline"> (Orb: ' . number_format($aspect['orb'], 2) . '°)</span>';
            }
            $html .= '</div>';
            $html .= '</div>';
            
            // Content section with Interpretation
            $html .= '<div class="natal-chart-planetary-aspect-content">';
            
            // Interpretation with continuation logic
            $interpretation = $aspect['interpretation'] ?? '';
            if (!empty($interpretation)) {
                // Show first 300 characters initially (longer preview)
                $initial_length = 300;
                $initial_content = substr($interpretation, 0, $initial_length);
                $remaining_content = substr($interpretation, $initial_length);
                
                $html .= '<div class="natal-chart-interpretation">';
                $html .= wp_kses_post($initial_content);
                
                // If there's remaining content, add it in a hidden div
                if (!empty($remaining_content)) {
                    $html .= '<span class="natal-chart-triple-dots">...</span>'; // Add triple dots to indicate more content
                    $html .= '<span class="natal-chart-interpretation-remaining" style="display: none;">';
                    $html .= wp_kses_post($remaining_content);
                    $html .= '</span>';
                    
                    $html .= '<div class="natal-chart-interpretation-toggle">';
                    $html .= '<button type="button" class="natal-chart-show-more" onclick="toggleInterpretation(this)">';
                    $html .= __('Show More', 'natal-chart-plugin');
                    $html .= '</button>';
                    $html .= '</div>';
                }
                
                $html .= '</div>';
            }
            
            $html .= '</div>';
            $html .= '</div>';
        }
        
        $html .= '</div>';
        $html .= '</div>';
        $html .= '</div>';
        
        return $html;
    }

    /**
     * Format planets interpretations section
     * 
     * @param array $planets_interpretations Planets interpretations data
     * @return string Formatted HTML
     */
    private function format_planets_interpretations_section($planets_interpretations) {
        if (empty($planets_interpretations) || !is_array($planets_interpretations)) {
            return '';
        }

        $html = '<div class="natal-chart-section natal-chart-planets-interpretations">';
        $html .= '<div class="natal-chart-section-toggle collapsed" onclick="toggleSection(this)">';
        $html .= '<span>' . __('PLANETS INTERPRETATIONS', 'natal-chart-plugin') . '</span>';
        $html .= '</div>';
        
        $html .= '<div class="natal-chart-section-content" style="display: none;">';
       
        
        // Header description
        if (!empty($planets_interpretations['header'])) {
            $html .= '<div class="natal-chart-section-description">';
            $html .= wp_kses_post(nl2br($planets_interpretations['header']));
            $html .= '</div>';
        }
        
        $html .= '<div class="natal-chart-planets-interpretations-list">';
        
        foreach ($planets_interpretations as $planet_name => $planet_data) {
            // Skip if it's not a planet or doesn't have sign data
            if ($planet_name === 'header' || !isset($planet_data['sign'])) {
                continue;
            }
            
            $html .= '<div class="natal-chart-planet-interpretation-item">';           
            
            // Content section with Interpretation
            $html .= '<div class="natal-chart-planet-interpretation-content">';
            
            // Interpretation with continuation logic
            $interpretation = $planet_data['sign'] ?? '';
            if (!empty($interpretation)) {
                // Show first 300 characters initially (longer preview)
                $initial_length = 300;
                $initial_content = substr($interpretation, 0, $initial_length);
                $remaining_content = substr($interpretation, $initial_length);
                
                $html .= '<div class="natal-chart-interpretation">';
                $html .= wp_kses_post($initial_content);
                
                // If there's remaining content, add it in a hidden div
                if (!empty($remaining_content)) {
                    $html .= '<span class="natal-chart-triple-dots">...</span>'; // Add triple dots to indicate more content
                    $html .= '<span class="natal-chart-interpretation-remaining" style="display: none;">';
                    $html .= wp_kses_post($remaining_content);
                    $html .= '</span>';
                    
                    $html .= '<div class="natal-chart-interpretation-toggle">';
                    $html .= '<button type="button" class="natal-chart-show-more" onclick="toggleInterpretation(this)">';
                    $html .= __('Show More', 'natal-chart-plugin');
                    $html .= '</button>';
                    $html .= '</div>';
                }
                
                $html .= '</div>';
            }
            
            $html .= '</div>';
            $html .= '</div>';
        }
        
        $html .= '</div>';
        $html .= '</div>';
        $html .= '</div>';
        
        return $html;
    }

    /**
     * Format houses interpretations section
     * 
     * @param array $houses_interpretations Houses interpretations data
     * @return string Formatted HTML
     */
    private function format_houses_interpretations_section($houses_interpretations) {
        if (empty($houses_interpretations) || !is_array($houses_interpretations)) {
            return '';
        }

        $html = '<div class="natal-chart-section natal-chart-houses-interpretations">';
        $html .= '<div class="natal-chart-section-toggle collapsed" onclick="toggleSection(this)">';
        $html .= '<span>' . __('HOUSE INTERPRETATIONS', 'natal-chart-plugin') . '</span>';
        $html .= '</div>';
        
        $html .= '<div class="natal-chart-section-content" style="display: none;">';
        
        // Header description
        if (!empty($houses_interpretations['header'])) {
            $html .= '<div class="natal-chart-section-description">';
            $html .= wp_kses_post(nl2br($houses_interpretations['header']));
            $html .= '</div>';
        }
        
        $html .= '<div class="natal-chart-houses-interpretations-list">';
        
        foreach ($houses_interpretations as $house_key => $house_data) {
            // Skip if it's not a house or doesn't have planet data
            if ($house_key === 'header' || !is_array($house_data)) {
                continue;
            }
            
            // Extract house number from key (e.g., "house_4" -> "4th House")
            $house_number = str_replace('house_', '', $house_key);
            $house_label = $this->get_house_label($house_number);
            
            $html .= '<div class="natal-chart-house-interpretation-item">';
            
            // Header section with House Number
            $html .= '<div class="natal-chart-house-interpretation-header">';
            $html .= '<span class="natal-chart-house-number">' . esc_html($house_label) . '</span>';
            $html .= '</div>';
            
            // Content section with Planet Interpretations
            $html .= '<div class="natal-chart-house-interpretation-content">';
            
            foreach ($house_data as $planet_data) {
                $planet_name = $planet_data['planet'] ?? '';
                $interpretation = $planet_data['interpretation'] ?? '';
                
                if (!empty($planet_name) && !empty($interpretation)) {
                    $html .= '<div class="natal-chart-house-planet-item">';
                    $html .= '<div class="natal-chart-house-planet-header">';
                    $html .= '<span class="natal-chart-planet-symbol">' . $this->get_planet_symbol($planet_name) . '</span>';
                    $html .= '<span class="natal-chart-planet-name">' . esc_html($planet_name) . '</span>';
                    $html .= '</div>';
                    
                    // Interpretation with continuation logic
                    $initial_length = 300;
                    $initial_content = substr($interpretation, 0, $initial_length);
                    $remaining_content = substr($interpretation, $initial_length);
                    
                    $html .= '<div class="natal-chart-interpretation">';
                    $html .= wp_kses_post($initial_content);
                    
                    // If there's remaining content, add it in a hidden div
                    if (!empty($remaining_content)) {
                        $html .= '<span class="natal-chart-triple-dots">...</span>';
                        $html .= '<span class="natal-chart-interpretation-remaining" style="display: none;">';
                        $html .= wp_kses_post($remaining_content);
                        $html .= '</span>';
                        
                        $html .= '<div class="natal-chart-interpretation-toggle">';
                        $html .= '<button type="button" class="natal-chart-show-more" onclick="toggleInterpretation(this)">';
                        $html .= __('Show More', 'natal-chart-plugin');
                        $html .= '</button>';
                        $html .= '</div>';
                    }
                    
                    $html .= '</div>';
                    $html .= '</div>';
                }
            }
            
            $html .= '</div>';
            $html .= '</div>';
        }
        
        $html .= '</div>';
        $html .= '</div>';
        $html .= '</div>';
        
        return $html;
    }

    /**
     * Format angles section
     * 
     * @param array $angles Angles data
     * @return string Formatted HTML
     */
    private function format_angles_section($angles) {
        $html = '<div class="natal-chart-section">';
        $html .= '<div class="natal-chart-section-toggle" onclick="toggleSection(this)">';
        $html .= '<span>' . __('Angular Points', 'natal-chart-plugin') . '</span>';
        $html .= '</div>';
        $html .= '<div class="natal-chart-section-content">';
        $html .= '<div class="natal-chart-angles-grid">';
        
        $angle_types = [
            'asc' => __('Ascendant', 'natal-chart-plugin'),
            'mc' => __('Midheaven', 'natal-chart-plugin'),
            'desc' => __('Descendant', 'natal-chart-plugin'),
            'ic' => __('Imum Coeli', 'natal-chart-plugin')
        ];
        
        foreach ($angle_types as $key => $label) {
            if (isset($angles[$key])) {
                $angle = $angles[$key];
                $html .= '<div class="natal-chart-angle-item">';
                $html .= '<div class="natal-chart-angle-name">' . $label . '</div>';
                $html .= '<div class="natal-chart-angle-details">';
                $html .= '<span class="natal-chart-angle-sign">' . esc_html($angle['sign'] ?? '') . '</span>';
                if (isset($angle['degree'])) {
                    $html .= '<span class="natal-chart-angle-degree">' . esc_html($angle['degree']) . '°</span>';
                }
                $html .= '</div></div>';
            }
        }
        
        $html .= '</div>';
        $html .= '</div></div>';
        return $html;
    }

    /**
     * Format lunar nodes section
     * 
     * @param array $nodes Lunar nodes data
     * @return string Formatted HTML
     */
    private function format_lunar_nodes_section($nodes) {
        $html = '<div class="natal-chart-section">';
        $html .= '<div class="natal-chart-section-toggle" onclick="toggleSection(this)">';
        $html .= '<span>' . __('Lunar Nodes', 'natal-chart-plugin') . '</span>';
        $html .= '</div>';
        $html .= '<div class="natal-chart-section-content">';
        $html .= '<div class="natal-chart-nodes-grid">';
        
        if (isset($nodes['north'])) {
            $html .= '<div class="natal-chart-node-item">';
            $html .= '<div class="natal-chart-node-name">' . __('North Node', 'natal-chart-plugin') . '</div>';
            $html .= '<div class="natal-chart-node-details">';
            $html .= '<span class="natal-chart-node-sign">' . esc_html($nodes['north']['sign'] ?? '') . '</span>';
            if (isset($nodes['north']['degree'])) {
                $html .= '<span class="natal-chart-node-degree">' . esc_html($nodes['north']['degree']) . '°</span>';
            }
            $html .= '</div></div>';
        }
        
        if (isset($nodes['south'])) {
            $html .= '<div class="natal-chart-node-item">';
            $html .= '<div class="natal-chart-node-name">' . __('South Node', 'natal-chart-plugin') . '</div>';
            $html .= '<div class="natal-chart-node-details">';
            $html .= '<span class="natal-chart-node-sign">' . esc_html($nodes['south']['sign'] ?? '') . '</span>';
            if (isset($nodes['south']['degree'])) {
                $html .= '<span class="natal-chart-node-degree">' . esc_html($nodes['south']['degree']) . '°</span>';
            }
            $html .= '</div></div>';
        }
        
        $html .= '</div>';
        $html .= '</div></div>';
        return $html;
    }

    /**
     * Format nested data structure
     * 
     * @param array $data Nested data
     * @return string Formatted HTML
     */
    private function format_nested_data($data) {
        $html = '';
        
        if (isset($data['chart'])) {
            $html .= $this->format_astrological_data($data['chart']);
        } elseif (isset($data['data'])) {
            $html .= $this->format_astrological_data($data['data']);
        } else {
            $html .= $this->format_generic_data($data);
        }
        
        return $html;
    }

    /**
     * Format generic data structure
     * 
     * @param array $data Generic data
     * @return string Formatted HTML
     */
    private function format_generic_data($data) {
        $html = '<div class="natal-chart-generic-data">';
        $html .= '<div class="natal-chart-data-summary">';
        $html .= '<p>' . __('Chart data received successfully. The data contains:', 'natal-chart-plugin') . '</p>';
        $html .= '<ul class="natal-chart-data-keys">';
        
        foreach (array_keys($data) as $key) {
            $html .= '<li><strong>' . esc_html(ucfirst(str_replace('_', ' ', $key))) . ':</strong> ';
            if (is_array($data[$key])) {
                $html .= count($data[$key]) . ' ' . __('items', 'natal-chart-plugin');
            } else {
                $html .= esc_html($data[$key]);
            }
            $html .= '</li>';
        }
        
        $html .= '</ul></div>';
        
        // Show raw data in collapsible section for developers
        $html .= '<details class="natal-chart-raw-data">';
        $html .= '<summary>' . __('View Raw Data (for developers)', 'natal-chart-plugin') . '</summary>';
        $html .= '<pre class="natal-chart-json-data">' . esc_html(json_encode($data, JSON_PRETTY_PRINT)) . '</pre>';
        $html .= '</details>';
        
        $html .= '</div>';
        return $html;
    }

    /**
     * Get zodiac symbol
     * 
     * @param string $sign_name Sign name
     * @return string Zodiac symbol
     */
    private function get_zodiac_symbol($sign_name) {
        $symbols = [
            'aries' => '♈',
            'taurus' => '♉',
            'gemini' => '♊',
            'cancer' => '♋',
            'leo' => '♌',
            'virgo' => '♍',
            'libra' => '♎',
            'scorpio' => '♏',
            'sagittarius' => '♐',
            'capricorn' => '♑',
            'aquarius' => '♒',
            'pisces' => '♓'
        ];
        
        $key = strtolower(trim($sign_name));
        return isset($symbols[$key]) ? $symbols[$key] : '';
    }

    /**
     * Get house name
     * 
     * @param string $house_number House number
     * @return string House name
     */
    private function get_house_name($house_number) {
        $names = [
            '1' => __('1st House - Self & Identity', 'natal-chart-plugin'),
            '2' => __('2nd House - Values & Resources', 'natal-chart-plugin'),
            '3' => __('3rd House - Communication & Siblings', 'natal-chart-plugin'),
            '4' => __('4th House - Home & Family', 'natal-chart-plugin'),
            '5' => __('5th House - Creativity & Romance', 'natal-chart-plugin'),
            '6' => __('6th House - Work & Health', 'natal-chart-plugin'),
            '7' => __('7th House - Partnerships', 'natal-chart-plugin'),
            '8' => __('8th House - Transformation & Shared Resources', 'natal-chart-plugin'),
            '9' => __('9th House - Philosophy & Higher Learning', 'natal-chart-plugin'),
            '10' => __('10th House - Career & Public Image', 'natal-chart-plugin'),
            '11' => __('11th House - Friends & Groups', 'natal-chart-plugin'),
            '12' => __('12th House - Spirituality & Hidden Matters', 'natal-chart-plugin')
        ];
        
        return isset($names[$house_number]) ? $names[$house_number] : $house_number;
    }

    /**
     * Get house label (e.g., "1st House" -> "1st House")
     * 
     * @param string $house_number House number
     * @return string House label
     */
    private function get_house_label($house_number) {
        $labels = [
            '1' => __('1st House', 'natal-chart-plugin'),
            '2' => __('2nd House', 'natal-chart-plugin'),
            '3' => __('3rd House', 'natal-chart-plugin'),
            '4' => __('4th House', 'natal-chart-plugin'),
            '5' => __('5th House', 'natal-chart-plugin'),
            '6' => __('6th House', 'natal-chart-plugin'),
            '7' => __('7th House', 'natal-chart-plugin'),
            '8' => __('8th House', 'natal-chart-plugin'),
            '9' => __('9th House', 'natal-chart-plugin'),
            '10' => __('10th House', 'natal-chart-plugin'),
            '11' => __('11th House', 'natal-chart-plugin'),
            '12' => __('12th House', 'natal-chart-plugin')
        ];
        return isset($labels[$house_number]) ? $labels[$house_number] : $house_number;
    }

    /**
     * Get aspect symbol
     * 
     * @param string $aspect_type Aspect type
     * @return string Aspect symbol
     */
    private function get_aspect_symbol($aspect_type) {
        $symbols = [
            'conjunction' => '☌',
            'opposition' => '☍',
            'trine' => '△',
            'square' => '□',
            'sextile' => '⚹',
            'quincunx' => '⚻',
            'semi-square' => '∠',
            'sesquiquadrate' => '⚼'
        ];
        
        $key = strtolower(trim($aspect_type));
        return isset($symbols[$key]) ? $symbols[$key] : '';
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

    /**
     * Get interpretation preview text
     * @param string $interpretation Full interpretation text
     * @return string Preview text (first 100 characters)
     */
    private function get_interpretation_preview($interpretation) {
        // Remove HTML tags for preview
        $clean_text = strip_tags($interpretation);
        // Get first 100 characters
        $preview = substr($clean_text, 0, 100);
        if (strlen($clean_text) > 100) {
            $preview .= '...';
        }
        return esc_html($preview);
    }

    /**
     * Format longitude to user-friendly format
     * 
     * @param string $longitude Longitude string (e.g., "22 Sco 33' 44\"")
     * @return string Formatted longitude (e.g., "22° 33' 44\"")
     */
    private function format_longitude($longitude) {
        // Remove zodiac sign and format as degrees, minutes, seconds
        $longitude = trim($longitude);
        
        // Extract degrees, minutes, seconds from format like "22 Sco 33' 44\""
        if (preg_match('/(\d+)\s+[A-Za-z]+\s+(\d+)\'?\s*(\d+)\"?/', $longitude, $matches)) {
            $degrees = $matches[1];
            $minutes = $matches[2];
            $seconds = $matches[3];
            
            return $degrees . '° ' . $minutes . "' " . $seconds . '"';
        }
        
        // If it's already in a different format, try to extract just the numbers
        if (preg_match('/(\d+)\s*[°\s]*(\d+)\s*[\'\s]*(\d+)\s*["\s]*/', $longitude, $matches)) {
            $degrees = $matches[1];
            $minutes = $matches[2];
            $seconds = $matches[3];
            
            return $degrees . '° ' . $minutes . "' " . $seconds . '"';
        }
        
        // Fallback: return as is if we can't parse it
        return esc_html($longitude);
    }

    /**
     * Format planet longitude to user-friendly format
     * 
     * @param string $longitude Longitude string (e.g., "29 Pis 00' 30\"")
     * @return string Formatted longitude (e.g., "29° 00' 30\"")
     */
    private function format_planet_longitude($longitude) {
        // Extract degrees, minutes, seconds from format like "29 Pis 00' 30\""
        if (preg_match('/(\d+)\s+[A-Za-z]+\s+(\d+)\'?\s*(\d+)\"?/', $longitude, $matches)) {
            $degrees = $matches[1];
            $minutes = $matches[2];
            $seconds = $matches[3];
            
            return $degrees . '° ' . $minutes . "' " . $seconds . '"';
        }
        
        // If it's already in a different format, try to extract just the numbers
        if (preg_match('/(\d+)\s*[°\s]*(\d+)\s*[\'\s]*(\d+)\s*["\s]*/', $longitude, $matches)) {
            $degrees = $matches[1];
            $minutes = $matches[2];
            $seconds = $matches[3];
            
            return $degrees . '° ' . $minutes . "' " . $seconds . '"';
        }
        
        // Fallback: return as is if we can't parse it
        return esc_html($longitude);
    }

    /**
     * Get planet symbol
     * 
     * @param string $planet_name Planet name
     * @return string Planet symbol
     */
    private function get_planet_symbol($planet_name) {
        $symbols = [
            'sun' => '☉',
            'moon' => '☽',
            'mercury' => '☿',
            'venus' => '♀',
            'mars' => '♂',
            'jupiter' => '♃',
            'saturn' => '♄',
            'uranus' => '♅',
            'neptune' => '♆',
            'pluto' => '♇',
            'chiron' => '⚷',
            'lilith' => '⚸',
            'node' => '☊',
            'north node' => '☊',
            'south node' => '☋',
            'p. of fortune' => '⊗',
            'part of fortune' => '⊗',
            'vertex' => '⚸'
        ];
        
        $key = strtolower(trim($planet_name));
        return isset($symbols[$key]) ? $symbols[$key] : '';
    }
}
