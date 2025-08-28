/**
 * Natal Chart Form Handler
 * Manages form submission, validation, and results display
 */

class NatalChartForm {
    constructor() {
        console.log('=== NATAL CHART FORM CONSTRUCTOR ===');
        
        this.form = document.getElementById('natal_chart_form');
        console.log('Form element found:', !!this.form);
        
        this.submitButton = document.getElementById('natal_chart_submit');
        console.log('Submit button found:', !!this.submitButton);
        
        this.resultsContainer = document.getElementById('natal_chart-results');
        console.log('Results container found:', !!this.resultsContainer);
        if (this.resultsContainer) {
            console.log('Results container ID:', this.resultsContainer.id);
            console.log('Results container display:', this.resultsContainer.style.display);
        }
        
        this.isSubmitting = false;
        
        if (this.form && this.submitButton) {
            console.log('✅ Form and submit button found, initializing...');
            this.init();
        } else {
            console.error('❌ Form or submit button not found!');
            console.log('Form:', this.form);
            console.log('Submit button:', this.submitButton);
        }
    }

    init() {
        console.log('Initializing NatalChartForm...');
        
        this.form = document.getElementById('natal_chart_form');
        this.submitButton = document.getElementById('natal_chart_submit');
        this.resultsContainer = document.getElementById('natal_chart_results');
        
        console.log('Form element found:', this.form);
        console.log('Submit button found:', this.submitButton);
        console.log('Results container found:', this.resultsContainer);
        
        if (this.form) {
            console.log('Form found, binding events...');
            this.bindEvents();
            this.updateSubmitButton();
            
            // Also update submit button after a short delay to ensure all elements are ready
            setTimeout(() => {
                console.log('Delayed submit button update...');
                this.updateSubmitButton();
            }, 500);
            
            console.log('Form initialization complete');
        } else {
            console.error('Form element not found!');
        }
    }

    bindEvents() {
        console.log('Binding form events...');
        
        // Multiple safeguards against form submission
        this.form.addEventListener('submit', (e) => {
            console.log('Submit event triggered');
            this.handleSubmit(e);
        });
        
        // Additional prevention - prevent any form submission
        this.form.addEventListener('submit', (e) => {
            console.log('Additional submit prevention');
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);
        
        // Prevent form submission on button click as well
        const submitButton = this.submitButton;
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                console.log('=== SUBMIT BUTTON CLICKED ===');
                e.preventDefault();
                e.stopPropagation();
                
                // Check if button is enabled
                if (submitButton.disabled) {
                    console.log('❌ Submit button is disabled, cannot submit form');
                    return false;
                }
                
                console.log('✅ Submit button is enabled, proceeding with form submission...');
                
                // Check if all fields are filled using the simple system
                if (typeof window.enableSubmitButton === 'function') {
                    const canSubmit = window.enableSubmitButton();
                    if (!canSubmit) {
                        console.log('❌ Form validation failed, cannot submit');
                        return false;
                    }
                    console.log('✅ Form validation passed, submitting...');
                }
                
                // Trigger form submission manually
                if (this.form) {
                    console.log('Triggering form submission...');
                    this.handleSubmit(new Event('submit'));
                } else {
                    console.error('❌ Form element not found!');
                }
                
                return false;
            });
        }
        
        // Form field changes for validation
        this.form.addEventListener('input', (e) => {
            console.log('Form input event triggered by:', e.target.id);
            this.updateSubmitButton();
        });
        this.form.addEventListener('change', (e) => {
            console.log('Form change event triggered by:', e.target.id);
            this.updateSubmitButton();
        });
        
        // Specific event listeners for time input fields
        const timeFields = ['natal_chart_birth_hour', 'natal_chart_birth_minute', 'natal_chart_birth_ampm'];
        timeFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                console.log(`Adding event listeners to time field: ${fieldId}`);
                field.addEventListener('input', (e) => {
                    console.log(`Time field ${fieldId} input event triggered, value: "${e.target.value}"`);
                    this.updateSubmitButton();
                });
                field.addEventListener('change', (e) => {
                    console.log(`Time field ${fieldId} change event triggered, value: "${e.target.value}"`);
                    this.updateSubmitButton();
                });
                field.addEventListener('blur', (e) => {
                    console.log(`Time field ${fieldId} blur event triggered, value: "${e.target.value}"`);
                    this.updateSubmitButton();
                });
            } else {
                console.warn(`Time field ${fieldId} not found during event binding`);
            }
        });
        
        // Also add specific listeners for name and date fields
        const otherFields = ['natal_chart_name', 'natal_chart_birth_date'];
        otherFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                console.log(`Adding event listeners to field: ${fieldId}`);
                field.addEventListener('input', (e) => {
                    console.log(`Field ${fieldId} input event triggered, value: "${e.target.value}"`);
                    this.updateSubmitButton();
                });
                field.addEventListener('change', (e) => {
                    console.log(`Field ${fieldId} change event triggered, value: "${e.target.value}"`);
                    this.updateSubmitButton();
                });
            } else {
                console.warn(`Field ${fieldId} not found during event binding`);
            }
        });
        
        // Close results button
        const closeButton = document.getElementById('natal_chart_close_results');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeResults());
        }
        
        console.log('Form events bound successfully');
    }

    async handleSubmit(e) {
        console.log('=== FORM SUBMISSION STARTED ===');
        e.preventDefault();
        
        if (this.isSubmitting) {
            console.log('❌ Form already submitting, returning');
            return;
        }
        
        console.log('✅ Form submission allowed, starting validation...');
        
        if (!this.validateForm()) {
            console.log('❌ Form validation failed, stopping submission');
            return;
        }
        
        console.log('✅ Form validation passed, starting submission process...');
        
        this.isSubmitting = true;
        this.showLoadingState();
        
        try {
            console.log('Collecting form data...');
            const formData = this.getFormData();
            console.log('Form data collected successfully:', formData);
            
            console.log('Submitting form to API...');
            const response = await this.submitForm(formData);
            console.log('API response received:', response);
            
            if (response.success) {
                console.log('✅ API request successful, handling response...');
                this.handleSubmissionSuccess(response);
            } else {
                console.log('❌ API request failed, handling error...');
                this.handleSubmissionError(response);
            }
        } catch (error) {
            console.error('❌ Form submission error:', error);
            this.showErrorMessage(natal_chart_ajax.strings.error);
        } finally {
            console.log('Form submission process completed, resetting state...');
            this.isSubmitting = false;
            this.hideLoadingState();
        }
    }

    validateForm() {
        let isValid = true;
        
        // Clear previous errors
        this.clearErrors();
        
        // Validate required fields
        const requiredFields = [
            'natal_chart_name',
            'natal_chart_birth_date'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.showFieldError(fieldId, natal_chart_ajax.strings.required_field);
                isValid = false;
            }
        });
        
        // Validate birth time fields
        const birthHour = document.getElementById('natal_chart_birth_hour');
        const birthMinute = document.getElementById('natal_chart_birth_minute');
        const birthAmpm = document.getElementById('natal_chart_birth_ampm');
        
        if (!birthHour || !birthHour.value || !birthMinute || !birthMinute.value || !birthAmpm || !birthAmpm.value) {
            this.showFieldError('natal_chart_birth_hour', natal_chart_ajax.strings.required_field);
            isValid = false;
        } else {
            const hour = parseInt(birthHour.value);
            const minute = parseInt(birthMinute.value);
            
            if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
                this.showFieldError('natal_chart_birth_hour', natal_chart_ajax.strings.invalid_time);
                isValid = false;
            }
        }
        
        // Validate date
        const birthDate = document.getElementById('natal_chart_birth_date').value;
        if (birthDate && !this.isValidDate(birthDate)) {
            this.showFieldError('natal_chart_birth_date', natal_chart_ajax.strings.invalid_date);
            isValid = false;
        }
        
        // Validate location selection
        const locationField = document.getElementById('natal_chart_location_search');
        if (locationField && !locationField.classList.contains('natal-chart-location-selected')) {
            this.showFieldError('natal_chart_location_search', natal_chart_ajax.strings.required_field);
            isValid = false;
        }
        
        return isValid;
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) && dateString !== '';
    }

    isValidTime(timeString) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    getFormData() {
        console.log('Collecting form data...');
        
        const formData = new FormData(this.form);
        
        // Get time values from the new time input fields
        const hour = parseInt(document.getElementById('natal_chart_birth_hour').value) || 0;
        const minute = parseInt(document.getElementById('natal_chart_birth_minute').value) || 0;
        const ampm = document.getElementById('natal_chart_birth_ampm').value;
        
        console.log('Time input values:', { hour, minute, ampm });
        
        // Convert 12-hour format to 24-hour format
        let birthTime24 = '';
        if (hour > 0 && minute >= 0) {
            let hour24 = hour;
            if (ampm === 'PM' && hour !== 12) {
                hour24 = hour + 12;
            } else if (ampm === 'AM' && hour === 12) {
                hour24 = 0;
            }
            birthTime24 = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
        
        console.log('Converted birth time (24-hour):', birthTime24);
        
        // Add location data from readonly fields
        const latitude = document.getElementById('natal_chart_latitude').value;
        const longitude = document.getElementById('natal_chart_longitude').value;
        const timezone = document.getElementById('natal_chart_offset_round').value; // Use offset_round as timezone
        const houseSystem = document.getElementById('natal_chart_house_system').value;
        
        // Get location name from the hidden field or search field
        const locationName = document.getElementById('natal_chart_location').value || 
                           document.getElementById('natal_chart_location_search').value;
        
        console.log('Location data:', { latitude, longitude, timezone, houseSystem, locationName });
        
        const data = {
            natal_chart_name: formData.get('natal_chart_name'),
            natal_chart_birth_date: formData.get('natal_chart_birth_date'),
            natal_chart_birth_time: birthTime24,
            natal_chart_timezone: parseFloat(timezone) || 0,
            natal_chart_latitude: parseFloat(latitude) || 0,
            natal_chart_longitude: parseFloat(longitude) || 0,
            natal_chart_house_system: houseSystem,
            natal_chart_location: locationName, // Add location field
            nonce: formData.get('natal_chart_nonce')
        };
        
        console.log('Final form data to be sent:', data);
        return data;
    }

    async submitForm(formData) {
        console.log('=== SUBMITTING FORM TO API ===');
        console.log('API URL:', natal_chart_ajax.ajax_url);
        console.log('Form data to send:', formData);
        
        const requestBody = new URLSearchParams({
            action: 'natal_chart_generate_chart',
            ...formData
        });
        
        console.log('Request body:', requestBody.toString());
        
        try {
            const response = await fetch(natal_chart_ajax.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: requestBody
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const responseData = await response.json();
            console.log('Response data:', responseData);
            
            return responseData;
        } catch (error) {
            console.error('❌ Fetch error:', error);
            throw error;
        }
    }

    handleSubmissionSuccess(response) {
        console.log('=== HANDLING SUBMISSION SUCCESS ===');
        console.log('Full response:', response);
        
        if (response.success && response.data) {
            console.log('✅ Response is successful, data available');
            console.log('Response data:', response.data);
            console.log('Results HTML available:', !!response.data.results_html);
            console.log('Results HTML length:', response.data.results_html ? response.data.results_html.length : 'N/A');
            
            this.showSuccessMessage(response.data.message || 'Natal chart generated successfully!');
            
            document.getElementById('natal_chart_form').style.display='none';

            // Display results directly in the form's results container
            console.log('Calling displayResults...');
            this.displayResults(response.data.results_html);
            
            // Scroll to results
            console.log('Calling scrollToResults...');
            this.scrollToResults();
            
            // Enable the submit button again for new submissions
            console.log('Calling updateSubmitButton...');
            this.updateSubmitButton();
            
            console.log('✅ Success handling completed');
        } else {
            console.log('❌ Response is not successful or missing data');
            console.log('Response success:', response.success);
            console.log('Response data:', response.data);
            this.showErrorMessage(response.data.message || natal_chart_ajax.strings.error);
        }
    }

    handleSubmissionError(response) {
        const message = response.data?.message || natal_chart_ajax.strings.error;
        this.showErrorMessage(message);
    }

    displayResults(resultsHtml) {
        console.log('=== DISPLAYING RESULTS ===');
        console.log('Results HTML length:', resultsHtml.length);
        console.log('Results HTML preview:', resultsHtml.substring(0, 200));
        
        if (this.resultsContainer) {
            console.log('✅ Results container found:', this.resultsContainer);
            console.log('Current display style:', this.resultsContainer.style.display);
            
            this.resultsContainer.innerHTML = `                
                <div class="natal-chart-results-content">
                    ${resultsHtml}
                </div>
            `;
            
            this.resultsContainer.style.display = 'block';
            console.log('✅ Results displayed successfully');
            console.log('New display style:', this.resultsContainer.style.display);
            console.log('New content length:', this.resultsContainer.innerHTML.length);
            
            // Re-bind close button event
            const closeButton = document.getElementById('natal_chart_close_results');
            if (closeButton) {
                closeButton.addEventListener('click', () => this.closeResults());
            }
        } else {
            console.error('❌ Results container NOT found!');
            console.log('this.resultsContainer:', this.resultsContainer);
            
            // Try to find it manually
            const manualResults = document.getElementById('natal_chart-results');
            console.log('Manual search for natal_chart-results:', manualResults);
            
            if (manualResults) {
                console.log('✅ Found results container manually, updating it...');
                manualResults.innerHTML = `                    
                    <div class="natal-chart-results-content">
                        ${resultsHtml}
                    </div>
                `;
                manualResults.style.display = 'block';
                console.log('✅ Results displayed manually');
            }
        }
    }

    closeResults() {
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'none';
        }
    }

    scrollToResults() {
        if (this.resultsContainer && this.resultsContainer.style.display !== 'none') {
            this.resultsContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    showLoadingState() {
        this.form.classList.add('loading');
        this.submitButton.disabled = true;
        
        const submitText = this.submitButton.querySelector('.natal-chart-submit-text');
        const submitLoading = this.submitButton.querySelector('.natal-chart-submit-loading');
        
        if (submitText) submitText.style.display = 'none';
        if (submitLoading) submitLoading.style.display = 'inline-flex';
        
        // Update loading text to use localized string
        const loadingText = submitLoading?.querySelector('span:not(.natal-chart-spinner)');
        if (loadingText && natal_chart_ajax.strings.generating_report) {
            loadingText.textContent = natal_chart_ajax.strings.generating_report;
        }
    }

    hideLoadingState() {
        this.form.classList.remove('loading');
        this.submitButton.disabled = false;
        
        const submitText = this.submitButton.querySelector('.natal-chart-submit-text');
        const submitLoading = this.submitButton.querySelector('.natal-chart-submit-loading');
        
        if (submitText) submitText.style.display = 'inline';
        if (submitLoading) submitLoading.style.display = 'none';
    }

    updateSubmitButton() {
        console.log('=== Update Submit Button Called ===');
        
        if (this.submitButton) {
            console.log('Submit button found, checking form validity...');
            const isFormValid = this.isFormValid();
            console.log('Form validation result:', isFormValid);
            
            // Update button state
            this.submitButton.disabled = !isFormValid;
            console.log('Submit button disabled state:', this.submitButton.disabled);
            
            // Add visual feedback
            if (isFormValid) {
                this.submitButton.classList.add('natal-chart-submit-ready');
                this.submitButton.classList.remove('natal-chart-submit-disabled');
                console.log('✅ Submit button: ENABLED - All fields are filled');
            } else {
                this.submitButton.classList.remove('natal-chart-submit-ready');
                this.submitButton.classList.add('natal-chart-submit-disabled');
                console.log('❌ Submit button: DISABLED - Some fields are missing');
            }
            
            // Update button text to show current state
            const submitText = this.submitButton.querySelector('.natal-chart-submit-text');
            if (submitText) {
                if (isFormValid) {
                    submitText.textContent = 'Generate Report';
                    console.log('Button text updated to: Generate Report');
                } else {
                    submitText.textContent = 'Generate Report';
                    console.log('Button text updated to: Fill All Fields to Generate Report');
                }
            }
        } else {
            console.error('Submit button not found!');
        }
    }

    isFormValid() {
        console.log('=== Form Validation Check ===');
        
        const requiredFields = [
            'natal_chart_name',
            'natal_chart_birth_date',
            'natal_chart_birth_hour',
            'natal_chart_birth_minute',
            'natal_chart_birth_ampm'
        ];
        
        // Check if location is selected (from location autocomplete)
        const locationField = document.getElementById('natal_chart_location_search');
        console.log('Location field found:', !!locationField);
        console.log('Location field element:', locationField);
        
        if (locationField) {
            console.log('Location field classes:', locationField.className);
            console.log('Has natal-chart-location-selected class:', locationField.classList.contains('natal-chart-location-selected'));
        }
        
        if (!locationField || !locationField.classList.contains('natal-chart-location-selected')) {
            console.log('❌ Location validation FAILED');
            return false;
        }
        
        console.log('✅ Location validation PASSED');
        
        // Check other required fields
        let allFieldsValid = true;
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const fieldExists = !!field;
            const fieldValue = field ? field.value : 'N/A';
            const fieldTrimmed = field ? field.value.trim() : '';
            const fieldValid = field && fieldTrimmed !== '';
            
            console.log(`Field ${fieldId}:`, {
                exists: fieldExists,
                value: fieldValue,
                trimmed: fieldTrimmed,
                valid: fieldValid
            });
            
            if (!fieldValid) {
                allFieldsValid = false;
            }
        });
        
        console.log('=== Final Validation Result ===');
        console.log('All fields valid:', allFieldsValid);
        console.log('Form is valid:', allFieldsValid);
        
        return allFieldsValid;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error');
            
            // Create or update error message
            let errorElement = document.getElementById(fieldId + '_error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = fieldId + '_error';
                errorElement.className = 'natal-chart-form-error';
                field.parentNode.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearErrors() {
        // Remove error classes from inputs
        const errorInputs = this.form.querySelectorAll('.natal-chart-form-input.error');
        errorInputs.forEach(input => input.classList.remove('error'));
        
        // Hide error messages
        const errorMessages = this.form.querySelectorAll('.natal-chart-form-error.show');
        errorMessages.forEach(error => error.classList.remove('show'));
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = this.form.querySelector('.natal-chart-form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `natal-chart-form-message natal-chart-form-message-${type}`;
        messageElement.textContent = message;
        
        // Insert before form
        this.form.parentNode.insertBefore(messageElement, this.form);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }

    updateResultsShortcodes(resultsHtml) {
        // Find all results shortcode containers on the page
        const resultsShortcodes = document.querySelectorAll('.natal-chart-results-shortcode');
        
        if (resultsShortcodes.length > 0) {
            resultsShortcodes.forEach(shortcode => {
                // Update the content
                const contentContainer = shortcode.querySelector('.natal-chart-results-content');
                if (contentContainer) {
                    contentContainer.innerHTML = resultsHtml;
                }
                
                // Show the shortcode if it was hidden
                shortcode.style.display = 'block';
                
                // Re-bind action buttons
                this.bindResultsActionButtons(shortcode);
            });
            
            console.log(`Updated ${resultsShortcodes.length} results shortcode(s) on the page`);
        } else {
            console.log('No results shortcodes found on the page');
        }
    }

    bindResultsActionButtons(shortcode) {
        // Bind print button
        const printButton = shortcode.querySelector('.natal-chart-print-results');
        if (printButton) {
            printButton.onclick = () => window.print();
        }
        
        // Bind download button
        const downloadButton = shortcode.querySelector('.natal-chart-download-results');
        if (downloadButton) {
            downloadButton.onclick = () => this.downloadResults();
        }
        
        // Bind new chart button
        const newChartButton = shortcode.querySelector('.natal-chart-new-chart');
        if (newChartButton) {
            newChartButton.onclick = () => this.generateNewChart();
        }
    }

    downloadResults() {
        // Implementation for PDF download
        alert('PDF download functionality would be implemented here.');
    }

    generateNewChart() {
        // Clear results and show form
        const resultsShortcodes = document.querySelectorAll('.natal-chart-results-shortcode');
        resultsShortcodes.forEach(shortcode => {
            shortcode.style.display = 'none';
        });
        
        // Clear the form
        this.clearForm();
        
        // Scroll to form
        const formContainer = document.querySelector('.natal-chart-form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    clearForm() {
        // Reset form fields
        this.form.reset();
        
        // Clear location selection
        const locationField = document.getElementById('natal_chart_location_search');
        if (locationField) {
            locationField.classList.remove('natal-chart-location-selected');
        }
        
        // Clear readonly fields
        const readonlyFields = ['natal_chart_latitude', 'natal_chart_longitude', 'natal_chart_offset_round'];
        readonlyFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        // Reset time input fields to default values
        const birthHour = document.getElementById('natal_chart_birth_hour');
        const birthMinute = document.getElementById('natal_chart_birth_minute');
        const birthAmpm = document.getElementById('natal_chart_birth_ampm');
        
        if (birthHour) birthHour.value = '';
        if (birthMinute) birthMinute.value = '';
        if (birthAmpm) birthAmpm.value = 'AM';
        
        // Clear validation states
        this.clearErrors();
        this.clearValidationStates();
        
        // Update submit button
        this.updateSubmitButton();
    }

    clearValidationStates() {
        // Remove validation classes from inputs
        const inputs = this.form.querySelectorAll('.natal-chart-form-input');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value !== '';
        
        // Remove existing validation classes
        field.classList.remove('valid', 'invalid');
        
        // Special handling for time input fields
        if (field.id === 'natal_chart_birth_hour' || field.id === 'natal_chart_birth_minute' || field.id === 'natal_chart_birth_ampm') {
            const timeGroup = field.closest('.natal-chart-time-input-group');
            if (timeGroup) {
                timeGroup.classList.remove('valid', 'invalid');
                
                // Check if all time fields are filled
                const hour = document.getElementById('natal_chart_birth_hour').value;
                const minute = document.getElementById('natal_chart_birth_minute').value;
                const ampm = document.getElementById('natal_chart_birth_ampm').value;
                
                if (hour && minute && ampm) {
                    // Validate time values
                    const hourNum = parseInt(hour);
                    const minuteNum = parseInt(minute);
                    
                    if (hourNum >= 1 && hourNum <= 12 && minuteNum >= 0 && minuteNum <= 59) {
                        timeGroup.classList.add('valid');
                        timeGroup.classList.remove('invalid');
                    } else {
                        timeGroup.classList.add('invalid');
                        timeGroup.classList.remove('valid');
                    }
                } else {
                    timeGroup.classList.remove('valid', 'invalid');
                }
            }
        } else {
            // Regular field validation
            if (isValid) {
                field.classList.add('valid');
            } else {
                field.classList.add('invalid');
            }
        }
        
        return isValid;
    }

    /**
     * Disable the form when results are shown
     */
    disableForm() {
        // Target the specific form by ID and CSS class
        const form = document.querySelector('#natal_chart_form.natal_chart_form');
        if (form) {
            // Hide the form when results are shown
            form.style.display = 'none';
            
            // Disable all form inputs
            const inputs = form.querySelectorAll('input, select, button:not([onclick*="enableFormAndRefresh"])');
            inputs.forEach(input => {
                input.disabled = true;
                input.classList.add('natal-chart-disabled');
            });
            
            // Disable the submit button
            const submitButton = this.submitButton;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.classList.add('natal-chart-disabled');
            }
            
            // Add visual indication that form is disabled
            form.classList.add('natal-chart-form-disabled');
            
            console.log('✅ Form with ID "natal_chart_form" and class "natal_chart_form" disabled and hidden successfully');
        } else {
            console.error('❌ Form with ID "natal_chart_form" and class "natal_chart_form" not found!');
        }
    }

    /**
     * Re-enable the form when starting fresh
     */
    enableForm() {
        // Target the specific form by ID and CSS class
        const form = document.querySelector('#natal_chart_form.natal_chart_form');
        if (form) {
            // Show the form again
            form.style.display = 'block';
            
            // Enable all form inputs
            const inputs = form.querySelectorAll('input, select, button');
            inputs.forEach(input => {
                input.disabled = false;
                input.classList.remove('natal-chart-disabled');
            });
            
            // Enable the submit button
            const submitButton = this.submitButton;
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove('natal-chart-disabled');
            }
            
            // Remove visual indication that form is disabled
            form.classList.remove('natal-chart-form-disabled');
            
            console.log('✅ Form with ID "natal_chart_form" and class "natal_chart_form" enabled and shown successfully');
        } else {
            console.error('❌ Form with ID "natal_chart_form" and class "natal_chart_form" not found!');
        }
    }
}

// Minimal test function for basic validation logic
window.minimalFormTest = function() {
    console.log('=== MINIMAL FORM TEST ===');
    
    // Basic field existence check
    const requiredFields = [
        'natal_chart_name',
        'natal_chart_birth_date',
        'natal_chart_birth_hour',
        'natal_chart_birth_minute',
        'natal_chart_birth_ampm'
    ];
    
    let allFieldsExist = true;
    let allFieldsHaveValues = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            const hasValue = field.value.trim() !== '';
            console.log(`✅ ${fieldId}: exists, value: "${field.value}", hasValue: ${hasValue}`);
            if (!hasValue) allFieldsHaveValues = false;
        } else {
            console.log(`❌ ${fieldId}: NOT FOUND`);
            allFieldsExist = false;
        }
    });
    
    // Check location field
    const locationField = document.getElementById('natal_chart_location_search');
    if (locationField) {
        const hasSelectedClass = locationField.classList.contains('natal-chart-location-selected');
        console.log(`✅ Location field: exists, hasSelectedClass: ${hasSelectedClass}`);
        
        if (allFieldsExist && allFieldsHaveValues && hasSelectedClass) {
            console.log('🎉 ALL CONDITIONS MET - Button should be enabled!');
            
            // Manually enable button for testing
            const submitButton = document.getElementById('natal_chart_submit');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.add('natal-chart-submit-ready');
                submitButton.classList.remove('natal-chart-submit-disabled');
                console.log('✅ Button manually enabled for testing');
            }
        } else {
            console.log('❌ Some conditions not met:');
            console.log('  - All fields exist:', allFieldsExist);
            console.log('  - All fields have values:', allFieldsHaveValues);
            console.log('  - Location selected:', hasSelectedClass);
        }
    } else {
        console.log('❌ Location field: NOT FOUND');
    }
};

// Simple test function for console debugging
window.simpleFormTest = function() {
    console.log('=== SIMPLE FORM TEST ===');
    
    // Check if form exists
    const form = document.getElementById('natal_chart_form');
    console.log('Form exists:', !!form);
    
    // Check if submit button exists
    const submitButton = document.getElementById('natal_chart_submit');
    console.log('Submit button exists:', !!submitButton);
    
    // Check if NatalChartForm is initialized
    console.log('NatalChartForm exists:', !!window.natalChartForm);
    
    // Check each field
    const fields = ['natal_chart_name', 'natal_chart_birth_date', 'natal_chart_birth_hour', 'natal_chart_birth_minute', 'natal_chart_birth_ampm'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            console.log(`${fieldId}: "${field.value}" (valid: ${field.value.trim() !== ''})`);
        } else {
            console.log(`${fieldId}: NOT FOUND`);
        }
    });
    
    // Check location field
    const locationField = document.getElementById('natal_chart_location_search');
    if (locationField) {
        console.log('Location field:', {
            value: locationField.value,
            hasSelectedClass: locationField.classList.contains('natal-chart-location-selected'),
            classes: locationField.className
        });
    } else {
        console.log('Location field: NOT FOUND');
    }
    
    // Test validation manually
    if (window.natalChartForm && window.natalChartForm.isFormValid) {
        const isValid = window.natalChartForm.isFormValid();
        console.log('Manual validation result:', isValid);
    } else {
        console.log('Cannot run validation - method not available');
    }
};

// Global function to enable form and refresh page
window.enableFormAndRefresh = function() {
    console.log('=== ENABLING FORM AND REFRESHING PAGE ===');
    
    // Re-enable and show the form if it exists
    if (window.natalChartForm) {
        window.natalChartForm.enableForm();
    }
    
    // Refresh the page after a short delay to ensure form is visible
    setTimeout(() => {
        location.reload();
    }, 200);
};

// Global function to manually initialize the form (can be called from shortcode)
window.initializeNatalChartFormManually = function() {
    console.log('Manual initialization requested...');
    return initializeNatalChartForm();
};

// Global function to check if form is ready
window.isNatalChartFormReady = function() {
    return window.natalChartForm && window.natalChartForm.form;
};

// Global function to get form status
window.getNatalChartFormStatus = function() {
    return {
        formExists: !!document.getElementById('natal_chart_form'),
        formHandlerExists: !!window.natalChartForm,
        formInitialized: !!(window.natalChartForm && window.natalChartForm.form),
        locationAutocompleteExists: !!window.natalChartLocationAutocomplete
    };
};

// Simple test function for form submission
window.testFormSubmission = function() {
    console.log('=== TESTING FORM SUBMISSION ===');
    
    // Check if form handler is available
    if (!window.natalChartForm) {
        console.error('❌ NatalChartForm not available!');
        return false;
    }
    
    // Check if form is valid
    if (typeof window.enableSubmitButton === 'function') {
        const isValid = window.enableSubmitButton();
        if (!isValid) {
            console.log('❌ Form is not valid, cannot test submission');
            return false;
        }
        console.log('✅ Form is valid, testing submission...');
    }
    
    // Check if submit button is enabled
    const submitButton = document.getElementById('natal_chart_submit');
    if (submitButton && submitButton.disabled) {
        console.log('❌ Submit button is disabled, cannot test submission');
        return false;
    }
    
    console.log('✅ Submit button is enabled, proceeding with test...');
    
    // Trigger form submission
    try {
        window.natalChartForm.handleSubmit(new Event('submit'));
        console.log('✅ Form submission test triggered successfully');
        return true;
    } catch (error) {
        console.error('❌ Form submission test failed:', error);
        return false;
    }
};

// Test AJAX request directly
window.testAjaxRequest = function() {
    console.log('=== TESTING AJAX REQUEST DIRECTLY ===');
    
    // Check if AJAX URL is available
    if (!window.natal_chart_ajax || !window.natal_chart_ajax.ajax_url) {
        console.error('❌ AJAX URL not available!');
        console.log('natal_chart_ajax:', window.natal_chart_ajax);
        return false;
    }
    
    console.log('✅ AJAX URL available:', window.natal_chart_ajax.ajax_url);
    
    // Test with simple data
    const testData = {
        action: 'natal_chart_generate_chart',
        natal_chart_name: 'Test User',
        natal_chart_birth_date: '1990-01-01',
        natal_chart_birth_time: '12:00',
        natal_chart_timezone: 5.5,
        natal_chart_latitude: 29.92009,
        natal_chart_longitude: 73.87496,
        natal_chart_house_system: 'p',
        natal_chart_location: 'Test City, Test State, Test Country',
        nonce: 'test_nonce'
    };
    
    console.log('Test data:', testData);
    
    // Make the request
    fetch(window.natal_chart_ajax.ajax_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(testData)
    })
    .then(response => {
        console.log('✅ AJAX request sent successfully!');
        console.log('Response status:', response.status);
        return response.text();
    })
    .then(data => {
        console.log('Response data:', data);
    })
    .catch(error => {
        console.error('❌ AJAX request failed:', error);
    });
    
    return true;
};

// Test form data collection
window.testFormDataCollection = function() {
    console.log('=== TESTING FORM DATA COLLECTION ===');
    
    if (!window.natalChartForm) {
        console.error('❌ NatalChartForm not available!');
        return false;
    }
    
    try {
        const formData = window.natalChartForm.getFormData();
        console.log('✅ Form data collected successfully:', formData);
        return formData;
    } catch (error) {
        console.error('❌ Form data collection failed:', error);
        return false;
    }
};

// Simple function to enable submit button when all fields are filled
window.enableSubmitButton = function() {
    console.log('=== ENABLING SUBMIT BUTTON ===');
    
    // Get the submit button
    const submitButton = document.getElementById('natal_chart_submit');
    if (!submitButton) {
        console.error('Submit button not found!');
        return false;
    }
    
    // Check if all required fields are filled
    const requiredFields = [
        'natal_chart_name',
        'natal_chart_birth_date',
        'natal_chart_birth_hour',
        'natal_chart_birth_minute',
        'natal_chart_birth_ampm'
    ];
    
    let allFieldsFilled = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value.trim() !== '') {
            console.log(`✅ ${fieldId}: "${field.value}"`);
        } else {
            console.log(`❌ ${fieldId}: empty or not found`);
            allFieldsFilled = false;
        }
    });
    
    // Check if location is selected
    const locationField = document.getElementById('natal_chart_location_search');
    if (locationField && locationField.classList.contains('natal-chart-location-selected')) {
        console.log('✅ Location: selected');
    } else {
        console.log('❌ Location: not selected');
        allFieldsFilled = false;
    }
    
    // Enable/disable button based on field completion
    if (allFieldsFilled) {
        submitButton.disabled = false;
        submitButton.classList.add('natal-chart-submit-ready');
        submitButton.classList.remove('natal-chart-submit-disabled');
        console.log('🎉 SUBMIT BUTTON ENABLED - All fields are filled!');
        return true;
    } else {
        submitButton.disabled = true;
        submitButton.classList.remove('natal-chart-submit-ready');
        submitButton.classList.add('natal-chart-submit-disabled');
        console.log('❌ Submit button disabled - Some fields are missing');
        return false;
    }
};

// Auto-check button state every time a field changes
function setupAutoButtonCheck() {
    console.log('Setting up auto button check...');
    
    // Get all form fields
    const allFields = [
        'natal_chart_name',
        'natal_chart_birth_date',
        'natal_chart_birth_hour',
        'natal_chart_birth_minute',
        'natal_chart_birth_ampm',
        'natal_chart_location_search'
    ];
    
    // Add event listeners to each field
    allFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            console.log(`Adding auto-check to field: ${fieldId}`);
            
            // For input fields
            if (field.tagName === 'INPUT' || field.tagName === 'SELECT') {
                field.addEventListener('input', enableSubmitButton);
                field.addEventListener('change', enableSubmitButton);
                field.addEventListener('blur', enableSubmitButton);
            }
            
            // For location field (special handling)
            if (fieldId === 'natal_chart_location_search') {
                // Listen for class changes on location field
                const observer = new MutationObserver(() => {
                    enableSubmitButton();
                });
                observer.observe(field, { attributes: true, attributeFilter: ['class'] });
            }
        } else {
            console.warn(`Field ${fieldId} not found for auto-check setup`);
        }
    });
    
    // Initial check
    setTimeout(enableSubmitButton, 100);
    
    console.log('Auto button check setup complete');
}

// Comprehensive status check function
window.checkFormStatus = function() {
    console.log('=== COMPREHENSIVE FORM STATUS CHECK ===');
    
    // Check document state
    console.log('Document readyState:', document.readyState);
    console.log('Document URL:', window.location.href);
    
    // Check for form elements
    const allForms = document.querySelectorAll('form');
    console.log('Total forms on page:', allForms.length);
    
    allForms.forEach((form, index) => {
        console.log(`Form ${index + 1}:`, {
            id: form.id,
            className: form.className,
            action: form.action,
            method: form.method
        });
    });
    
    // Check for our specific form
    const natalChartForm = document.getElementById('natal_chart_form');
    console.log('Natal chart form found:', !!natalChartForm);
    
    if (natalChartForm) {
        console.log('Natal chart form details:', {
            id: natalChartForm.id,
            className: natalChartForm.className,
            action: natalChartForm.action,
            method: natalChartForm.method,
            children: natalChartForm.children.length
        });
        
        // Check for key form elements
        const keyElements = [
            'natal_chart_name',
            'natal_chart_birth_date',
            'natal_chart_birth_hour',
            'natal_chart_birth_minute',
            'natal_chart_birth_ampm',
            'natal_chart_location_search',
            'natal_chart_submit'
        ];
        
        keyElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            console.log(`${elementId}:`, {
                exists: !!element,
                type: element ? element.type : 'N/A',
                value: element ? element.value : 'N/A'
            });
        });
    }
    
    // Check JavaScript objects
    console.log('Window objects:', {
        natalChartForm: !!window.natalChartForm,
        natalChartLocationAutocomplete: !!window.natalChartLocationAutocomplete
    });
    
    // Check if scripts are loaded
    const scripts = document.querySelectorAll('script[src*="natal-chart"]');
    console.log('Natal chart scripts loaded:', scripts.length);
    scripts.forEach((script, index) => {
        console.log(`Script ${index + 1}:`, script.src);
    });
    
    // Check for shortcode content
    const shortcodeContent = document.querySelectorAll('[class*="natal-chart"]');
    console.log('Natal chart CSS classes found:', shortcodeContent.length);
    
    // Try to initialize if not already done
    if (!window.natalChartForm) {
        console.log('Attempting to initialize NatalChartForm...');
        try {
            initializeNatalChartForm();
            console.log('Initialization attempt completed');
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
    
    console.log('=== STATUS CHECK COMPLETE ===');
};

// Robust initialization that waits for the form to appear
function initializeNatalChartForm() {
    console.log('Checking for natal chart form...');
    
    const form = document.getElementById('natal_chart_form');
    if (form) {
        console.log('Form found! Initializing NatalChartForm...');
        if (!window.natalChartForm) {
            try {
                window.natalChartForm = new NatalChartForm();
                console.log('NatalChartForm initialized successfully');
                return true;
            } catch (error) {
                console.error('Error initializing NatalChartForm:', error);
                return false;
            }
        } else {
            console.log('NatalChartForm already exists');
            return true;
        }
    } else {
        console.log('Form not found yet, will retry...');
        return false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting form detection...');
    console.log('Current document readyState:', document.readyState);
    console.log('Current form elements on page:', document.querySelectorAll('form').length);
    console.log('Form with ID natal_chart_form exists:', !!document.getElementById('natal_chart_form'));
    
    // Set up the simple button enable system
    console.log('Setting up simple button enable system...');
    setupAutoButtonCheck();
    
    // Try to initialize immediately
    if (!initializeNatalChartForm()) {
        // If form not found, start polling
        console.log('Starting form detection polling...');
        const formCheckInterval = setInterval(() => {
            console.log('Polling for form... Current form elements:', document.querySelectorAll('form').length);
            console.log('Form with ID natal_chart_form exists:', !!document.getElementById('natal_chart_form'));
            
            if (initializeNatalChartForm()) {
                clearInterval(formCheckInterval);
                console.log('Form detected and initialized, stopping polling');
            }
        }, 500); // Check every 500ms
        
        // Stop polling after 10 seconds to prevent infinite checking
        setTimeout(() => {
            clearInterval(formCheckInterval);
            console.log('Form detection timeout - form may not be present on this page');
            console.log('Final check - Form elements on page:', document.querySelectorAll('form').length);
            console.log('Final check - Form with ID natal_chart_form exists:', !!document.getElementById('natal_chart_form'));
        }, 10000);
    }
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded...');
} else {
    console.log('DOM already loaded, checking for form immediately...');
    console.log('Current form elements on page:', document.querySelectorAll('form').length);
    console.log('Form with ID natal_chart_form exists:', !!document.getElementById('natal_chart_form'));
    initializeNatalChartForm();
}

// More aggressive initialization - check every second for the first 30 seconds
setTimeout(() => {
    console.log('=== AGGRESSIVE INITIALIZATION CHECK ===');
    console.log('Checking for form after 1 second delay...');
    console.log('Form elements on page:', document.querySelectorAll('form').length);
    console.log('Form with ID natal_chart_form exists:', !!document.getElementById('natal_chart_form'));
    
    if (!window.natalChartForm) {
        console.log('NatalChartForm not initialized, attempting initialization...');
        initializeNatalChartForm();
    } else {
        console.log('NatalChartForm already initialized');
    }
}, 1000);

// Check again after 5 seconds
setTimeout(() => {
    console.log('=== 5 SECOND INITIALIZATION CHECK ===');
    console.log('Checking for form after 5 second delay...');
    console.log('Form elements on page:', document.querySelectorAll('form').length);
    console.log('Form with ID natal_chart_form exists:', !!document.getElementById('natal_chart_form'));
    
    if (!window.natalChartForm) {
        console.log('NatalChartForm not initialized, attempting initialization...');
        initializeNatalChartForm();
    } else {
        console.log('NatalChartForm already initialized');
    }
}, 5000);

// Check again after 10 seconds
setTimeout(() => {
    console.log('=== 10 SECOND INITIALIZATION CHECK ===');
    console.log('Checking for form after 10 second delay...');
    console.log('Form elements on page:', document.querySelectorAll('form').length);
    console.log('Form with ID natal_chart_form exists:', !!document.getElementById('natal_chart_form'));
    
    if (!window.natalChartForm) {
        console.log('NatalChartForm not initialized, attempting initialization...');
        initializeNatalChartForm();
    } else {
        console.log('NatalChartForm already initialized');
    }
}, 10000);

// Listen for dynamic content changes (for AJAX-loaded content)
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node contains our form
                        if (node.id === 'natal_chart_form' || node.querySelector('#natal_chart_form')) {
                            console.log('Form detected via MutationObserver');
                            setTimeout(initializeNatalChartForm, 100);
                        }
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('MutationObserver started for dynamic form detection');
}

// Test function to check results shortcode state
window.checkResultsShortcodeState = function() {
    console.log('=== CHECKING RESULTS SHORTCODE STATE ===');
    
    // Check if results shortcodes exist on the page
    const resultsShortcodes = document.querySelectorAll('.natal-chart-results-shortcode');
    console.log(`Found ${resultsShortcodes.length} results shortcode(s) on the page`);
    
    // Check if form has results displayed
    const formResults = document.getElementById('natal-chart-results');
    if (formResults) {
        console.log('Form results container found');
        console.log('Display style:', formResults.style.display);
        console.log('Has content:', formResults.innerHTML.length > 0);
    } else {
        console.log('Form results container NOT found');
    }
    
    resultsShortcodes.forEach((shortcode, index) => {
        console.log(`\n--- Results Shortcode ${index + 1} ---`);
        console.log('Element:', shortcode);
        console.log('Display style:', shortcode.style.display);
        console.log('Visibility:', shortcode.style.visibility);
        
        // Check content
        const contentContainer = shortcode.querySelector('.natal-chart-results-content');
        if (contentContainer) {
            console.log('Content container found');
            console.log('Content HTML length:', contentContainer.innerHTML.length);
            console.log('Content preview:', contentContainer.innerHTML.substring(0, 200));
        } else {
            console.log('Content container NOT found');
        }
        
        // Check if it has the "no results" message
        const noResults = shortcode.querySelector('.natal-chart-no-results');
        if (noResults) {
            console.log('Has "no results" message');
        } else {
            console.log('No "no results" message');
        }
    });
    
    // Check if there are any results displayed in the form
    console.log('\n--- Checking Form Results ---');
    if (formResults && formResults.style.display !== 'none') {
        console.log('✅ Form has results displayed');
        console.log('Results content length:', formResults.innerHTML.length);
    } else {
        console.log('❌ Form has no results displayed');
    }
    
    return resultsShortcodes.length;
};

// Test function to manually update results shortcodes
window.manuallyUpdateResultsShortcodes = function(resultsHtml) {
    console.log('=== MANUALLY UPDATING RESULTS SHORTCODES ===');
    
    if (!window.natalChartForm) {
        console.error('❌ NatalChartForm not available!');
        return false;
    }
    
    try {
        window.natalChartForm.updateResultsShortcodes(resultsHtml);
        console.log('✅ Results shortcodes updated manually');
        return true;
    } catch (error) {
        console.error('❌ Manual update failed:', error);
    }
};

// Simple test function to check form state
window.checkFormState = function() {
    console.log('=== CHECKING FORM STATE ===');
    
    // Check if form handler exists
    if (!window.natalChartForm) {
        console.error('❌ NatalChartForm not available!');
        return false;
    }
    
    console.log('✅ NatalChartForm available');
    console.log('Form element:', window.natalChartForm.form);
    console.log('Submit button:', window.natalChartForm.submitButton);
    console.log('Results container:', window.natalChartForm.resultsContainer);
    
    // Check if results container exists in DOM
    const resultsContainer = document.getElementById('natal_chart-results');
    console.log('Results container in DOM:', resultsContainer);
    
    if (resultsContainer) {
        console.log('Results container display:', resultsContainer.style.display);
        console.log('Results container content length:', resultsContainer.innerHTML.length);
        console.log('Results container HTML:', resultsContainer.innerHTML.substring(0, 200));
    }
    
    // Check if form exists in DOM
    const form = document.getElementById('natal_chart_form');
    console.log('Form in DOM:', form);
    
    return true;
};

// Toggle section functionality for natal chart results
function toggleSection(toggleElement) {
    const content = toggleElement.nextElementSibling;
    const isCollapsed = content.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Expand section
        content.classList.remove('collapsed');
        toggleElement.classList.remove('collapsed');
    } else {
        // Collapse section
        content.classList.add('collapsed');
        toggleElement.classList.add('collapsed');
    }
}

// Initialize all sections as expanded by default
function initializeToggleableSections() {
    const toggles = document.querySelectorAll('.natal-chart-section-toggle');
    toggles.forEach(toggle => {
        toggle.classList.remove('collapsed');
        const content = toggle.nextElementSibling;
        if (content && content.classList.contains('natal-chart-section-content')) {
            content.classList.remove('collapsed');
        }
    });
}

// Make toggleSection function globally available
window.toggleSection = toggleSection;

// Toggle interpretation functionality for planetary aspects
function toggleInterpretation(toggleElement) {
    const interpretationDiv = toggleElement.closest('.natal-chart-interpretation');
    const remainingContent = interpretationDiv.querySelector('.natal-chart-interpretation-remaining');
    const button = toggleElement;
    
    if (remainingContent.style.display === 'none') {
        // Show remaining content
        remainingContent.style.display = 'inline';
        button.textContent = 'Show Less';
    } else {
        // Hide remaining content
        remainingContent.style.display = 'none';
        button.textContent = 'Show More';
    }
}

// Make toggleInterpretation function globally available
window.toggleInterpretation = toggleInterpretation;

// Initialize sections when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeToggleableSections();
});

// Also initialize when results are loaded dynamically
if (typeof window.initializeNatalChartFormManually === 'function') {
    const originalInit = window.initializeNatalChartFormManually;
    window.initializeNatalChartFormManually = function() {
        originalInit();
        // Initialize toggleable sections after form is set up
        setTimeout(initializeToggleableSections, 100);
    };
}
