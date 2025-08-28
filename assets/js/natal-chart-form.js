/**
 * Natal Chart Form Handler
 * Manages form submission, validation, and results display
 */

class NatalChartForm {
    constructor() {
        this.form = document.getElementById('natal_chart_form');
        this.submitButton = document.getElementById('natal_chart_submit');
        this.resultsContainer = document.getElementById('natal_chart-results');
        this.isSubmitting = false;
        
        if (this.form && this.submitButton) {
            this.init();
        }
    }

    init() {
        this.form = document.getElementById('natal_chart_form');
        this.submitButton = document.getElementById('natal_chart_submit');
        this.resultsContainer = document.getElementById('natal_chart_results');
        
        if (this.form) {
            this.bindEvents();
            this.updateSubmitButton();
            
            // Also update submit button after a short delay to ensure all elements are ready
            setTimeout(() => {
                this.updateSubmitButton();
            }, 500);
        }
    }

    bindEvents() {
        
        
        // Multiple safeguards against form submission
        this.form.addEventListener('submit', (e) => {
            
            this.handleSubmit(e);
        });
        
        // Additional prevention - prevent any form submission
        this.form.addEventListener('submit', (e) => {
            
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);
        
        // Prevent form submission on button click as well
        const submitButton = this.submitButton;
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                
                e.preventDefault();
                e.stopPropagation();
                
                // Check if button is enabled
                if (submitButton.disabled) {
                    return false;
                }
                
                // Check if all fields are filled using the simple system
                if (typeof window.enableSubmitButton === 'function') {
                    const canSubmit = window.enableSubmitButton();
                    if (!canSubmit) {
                        return false;
                    }
                }
                
                // Trigger form submission manually
                if (this.form) {
                    this.handleSubmit(new Event('submit'));
                }
                
                return false;
            });
        }
        
        // Form field changes for validation
        this.form.addEventListener('input', (e) => {
            this.updateSubmitButton();
        });
        this.form.addEventListener('change', (e) => {
            this.updateSubmitButton();
        });
        
        // Specific event listeners for time input fields
        const timeFields = ['natal_chart_birth_hour', 'natal_chart_birth_minute', 'natal_chart_birth_ampm'];
        timeFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', (e) => {
                    this.updateSubmitButton();
                });
                field.addEventListener('change', (e) => {
                    this.updateSubmitButton();
                });
                field.addEventListener('blur', (e) => {
                    this.updateSubmitButton();
                });
            }
        });
        
        // Also add specific listeners for name and date fields
        const otherFields = ['natal_chart_name', 'natal_chart_birth_date'];
        otherFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', (e) => {
                    this.updateSubmitButton();
                });
                field.addEventListener('change', (e) => {
                    this.updateSubmitButton();
                });
            }
        });
        
        // Close results button
        const closeButton = document.getElementById('natal_chart_close_results');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeResults());
        }
        

    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }
        
        if (!this.validateForm()) {
            return;
        }
        
        this.isSubmitting = true;
        this.showLoadingState();
        
        try {
            const formData = this.getFormData();
            const response = await this.submitForm(formData);
            
            if (response.success) {
                this.handleSubmissionSuccess(response);
            } else {
                this.handleSubmissionError(response);
            }
        } catch (error) {
            this.showErrorMessage(natal_chart_ajax.strings.error);
        } finally {
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
        const formData = new FormData(this.form);
        
        // Get time values from the new time input fields
        const hour = parseInt(document.getElementById('natal_chart_birth_hour').value) || 0;
        const minute = parseInt(document.getElementById('natal_chart_birth_minute').value) || 0;
        const ampm = document.getElementById('natal_chart_birth_ampm').value;
        
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
        
        // Add location data from readonly fields
        const latitude = document.getElementById('natal_chart_latitude').value;
        const longitude = document.getElementById('natal_chart_longitude').value;
        const timezone = document.getElementById('natal_chart_offset_round').value; // Use offset_round as timezone
        const houseSystem = document.getElementById('natal_chart_house_system').value;
        
        // Get location name from the hidden field or search field
        const locationName = document.getElementById('natal_chart_location').value || 
                           document.getElementById('natal_chart_location_search').value;
        
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
        return data;
    }

    async submitForm(formData) {
        const requestBody = new URLSearchParams({
            action: 'natal_chart_generate_chart',
            ...formData
        });
        
        try {
            const response = await fetch(natal_chart_ajax.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: requestBody
            });
            
            const responseData = await response.json();
            return responseData;
        } catch (error) {
            throw error;
        }
    }

    handleSubmissionSuccess(response) {
        if (response.success && response.data) {
            this.showSuccessMessage(response.data.message || 'Natal chart generated successfully!');
            
            document.getElementById('natal_chart_form').style.display='none';

            // Display results directly in the form's results container
            this.displayResults(response.data.results_html);
            
            // Scroll to results
            this.scrollToResults();
            
            // Enable the submit button again for new submissions
            this.updateSubmitButton();
        } else {
            this.showErrorMessage(response.data.message || natal_chart_ajax.strings.error);
        }
    }

    handleSubmissionError(response) {
        const message = response.data?.message || natal_chart_ajax.strings.error;
        this.showErrorMessage(message);
    }

        displayResults(resultsHtml) {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = `                
                <div class="natal-chart-results-content">
                    ${resultsHtml}
                </div>
            `;
            
            this.resultsContainer.style.display = 'block';
            
            // Re-bind close button event
            const closeButton = document.getElementById('natal_chart_close_results');
            if (closeButton) {
                closeButton.addEventListener('click', () => this.closeResults());
            }
        } else {
            // Try to find it manually
            const manualResults = document.getElementById('natal_chart-results');
            
            if (manualResults) {
                manualResults.innerHTML = `                    
                    <div class="natal-chart-results-content">
                        ${resultsHtml}
                </div>
                `;
                manualResults.style.display = 'block';
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
        
        
        if (this.submitButton) {
            
            const isFormValid = this.isFormValid();
            
            
            // Update button state
            this.submitButton.disabled = !isFormValid;
            
            
            // Add visual feedback
            if (isFormValid) {
                this.submitButton.classList.add('natal-chart-submit-ready');
                this.submitButton.classList.remove('natal-chart-submit-disabled');
            } else {
                this.submitButton.classList.remove('natal-chart-submit-ready');
                this.submitButton.classList.add('natal-chart-submit-disabled');
            }
            
            // Update button text to show current state
            const submitText = this.submitButton.querySelector('.natal-chart-submit-text');
            if (submitText) {
                if (isFormValid) {
                    submitText.textContent = 'Generate Report';
                } else {
                    submitText.textContent = 'Generate Report';
                }
            }
        }
    }

    isFormValid() {
        const requiredFields = [
            'natal_chart_name',
            'natal_chart_birth_date',
            'natal_chart_birth_hour',
            'natal_chart_birth_minute',
            'natal_chart_birth_ampm'
        ];
        
        // Check if location is selected (from location autocomplete)
        const locationField = document.getElementById('natal_chart_location_search');
        
        if (!locationField || !locationField.classList.contains('natal-chart-location-selected')) {
            return false;
        }
        
        // Check other required fields
        let allFieldsValid = true;
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const fieldTrimmed = field ? field.value.trim() : '';
            const fieldValid = field && fieldTrimmed !== '';
            
            if (!fieldValid) {
                allFieldsValid = false;
            }
        });
        
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
            

        } else {
            
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
            
            
        } else {
            console.error('❌ Form with ID "natal_chart_form" and class "natal_chart_form" not found!');
        }
    }
}

// Minimal test function for basic validation logic
window.minimalFormTest = function() {
    
    
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
            
            if (!hasValue) allFieldsHaveValues = false;
        } else {
            
            allFieldsExist = false;
        }
    });
    
    // Check location field
    const locationField = document.getElementById('natal_chart_location_search');
    if (locationField) {
        const hasSelectedClass = locationField.classList.contains('natal-chart-location-selected');
        
        
        if (allFieldsExist && allFieldsHaveValues && hasSelectedClass) {
            
            
            // Manually enable button for testing
            const submitButton = document.getElementById('natal_chart_submit');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.add('natal-chart-submit-ready');
                submitButton.classList.remove('natal-chart-submit-disabled');
                
            }
        } else {
            
            
            
            
        }
    } else {
        
    }
};

// Simple test function for console debugging
window.simpleFormTest = function() {
    
    
    // Check if form exists
    const form = document.getElementById('natal_chart_form');
    
    
    // Check if submit button exists
    const submitButton = document.getElementById('natal_chart_submit');
    
    
    // Check if NatalChartForm is initialized
    
    
    // Check each field
    const fields = ['natal_chart_name', 'natal_chart_birth_date', 'natal_chart_birth_hour', 'natal_chart_birth_minute', 'natal_chart_birth_ampm'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {

        } else {
            
        }
    });
    
    // Check location field
    const locationField = document.getElementById('natal_chart_location_search');
    if (locationField) {

    } else {
        
    }
    
    // Test validation manually
    if (window.natalChartForm && window.natalChartForm.isFormValid) {
        const isValid = window.natalChartForm.isFormValid();
        
    } else {
        
    }
};

// Global function to enable form and refresh page
window.enableFormAndRefresh = function() {
    
    
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
    
    
    // Check if form handler is available
    if (!window.natalChartForm) {
        console.error('❌ NatalChartForm not available!');
        return false;
    }
    
    // Check if form is valid
    if (typeof window.enableSubmitButton === 'function') {
        const isValid = window.enableSubmitButton();
        if (!isValid) {
            
            return false;
        }
        
    }
    
    // Check if submit button is enabled
    const submitButton = document.getElementById('natal_chart_submit');
    if (submitButton && submitButton.disabled) {
        
        return false;
    }
    
    
    
    // Trigger form submission
    try {
        window.natalChartForm.handleSubmit(new Event('submit'));
        
        return true;
    } catch (error) {
        console.error('❌ Form submission test failed:', error);
        return false;
    }
};

// Test AJAX request directly
window.testAjaxRequest = function() {
    
    
    // Check if AJAX URL is available
    if (!window.natal_chart_ajax || !window.natal_chart_ajax.ajax_url) {
        console.error('❌ AJAX URL not available!');
        
        return false;
    }
    
    
    
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
    
    
    
    // Make the request
    fetch(window.natal_chart_ajax.ajax_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(testData)
    })
    .then(response => {
        
        
        return response.text();
    })
    .then(data => {
        
    })
    .catch(error => {
        console.error('❌ AJAX request failed:', error);
    });
    
    return true;
};

// Test form data collection
window.testFormDataCollection = function() {
    
    
    if (!window.natalChartForm) {
        console.error('❌ NatalChartForm not available!');
        return false;
    }
    
    try {
        const formData = window.natalChartForm.getFormData();
        
        return formData;
    } catch (error) {
        console.error('❌ Form data collection failed:', error);
        return false;
    }
};

// Simple function to enable submit button when all fields are filled
window.enableSubmitButton = function() {
    
    
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
            
        } else {
            
            allFieldsFilled = false;
        }
    });
    
    // Check if location is selected
    const locationField = document.getElementById('natal_chart_location_search');
    if (locationField && locationField.classList.contains('natal-chart-location-selected')) {
        
    } else {
        
        allFieldsFilled = false;
    }
    
    // Enable/disable button based on field completion
    if (allFieldsFilled) {
        submitButton.disabled = false;
        submitButton.classList.add('natal-chart-submit-ready');
        submitButton.classList.remove('natal-chart-submit-disabled');
        
        return true;
    } else {
        submitButton.disabled = true;
        submitButton.classList.remove('natal-chart-submit-ready');
        submitButton.classList.add('natal-chart-submit-disabled');
        
        return false;
    }
};

// Auto-check button state every time a field changes
function setupAutoButtonCheck() {
    
    
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
    
    
}

// Comprehensive status check function
window.checkFormStatus = function() {
    
    
    // Check document state
    
    
    
    // Check for form elements
    const allForms = document.querySelectorAll('form');
    
    
    allForms.forEach((form, index) => {

    });
    
    // Check for our specific form
    const natalChartForm = document.getElementById('natal_chart_form');
    
    
    if (natalChartForm) {

        
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

        });
    }
    
    // Check JavaScript objects
    
    
    // Check if scripts are loaded
    const scripts = document.querySelectorAll('script[src*="natal-chart"]');
    
    scripts.forEach((script, index) => {
        
    });
    
    // Check for shortcode content
    const shortcodeContent = document.querySelectorAll('[class*="natal-chart"]');
    
    
    // Try to initialize if not already done
    if (!window.natalChartForm) {
        
        try {
            initializeNatalChartForm();
            
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
    
    
};

// Robust initialization that waits for the form to appear
function initializeNatalChartForm() {
    
    
    const form = document.getElementById('natal_chart_form');
    if (form) {
        
        if (!window.natalChartForm) {
            try {
                window.natalChartForm = new NatalChartForm();
                
                return true;
            } catch (error) {
                console.error('Error initializing NatalChartForm:', error);
                return false;
            }
        } else {
            
            return true;
        }
    } else {
        
        return false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    
    // Set up the simple button enable system
    
    setupAutoButtonCheck();
    
    // Try to initialize immediately
    if (!initializeNatalChartForm()) {
        // If form not found, start polling
        
        const formCheckInterval = setInterval(() => {
            if (initializeNatalChartForm()) {
                clearInterval(formCheckInterval);
            }
        }, 500); // Check every 500ms
        
        // Stop polling after 10 seconds to prevent infinite checking
        setTimeout(() => {
            clearInterval(formCheckInterval);
        }, 10000);
    }
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
    
} else {
    initializeNatalChartForm();
}

// More aggressive initialization - check every second for the first 30 seconds
setTimeout(() => {
    if (!window.natalChartForm) {
        initializeNatalChartForm();
    }
}, 1000);

// Check again after 5 seconds
setTimeout(() => {
    if (!window.natalChartForm) {
        initializeNatalChartForm();
    }
}, 5000);

// Check again after 10 seconds
setTimeout(() => {
    if (!window.natalChartForm) {
        initializeNatalChartForm();
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
    
    
}

// Test function to check results shortcode state
window.checkResultsShortcodeState = function() {
    
    
    // Check if results shortcodes exist on the page
    const resultsShortcodes = document.querySelectorAll('.natal-chart-results-shortcode');
    
    // Check if form has results displayed
    const formResults = document.getElementById('natal-chart-results');
    if (formResults) {
        
        
        
    } else {
        
    }
    
    resultsShortcodes.forEach((shortcode, index) => {
        
        
        
        
        
        // Check content
        const contentContainer = shortcode.querySelector('.natal-chart-results-content');
        if (contentContainer) {
            
        } else {
            
        }
        
        // Check if it has the "no results" message
        const noResults = shortcode.querySelector('.natal-chart-no-results');
        if (noResults) {
            
        } else {
            
        }
    });
    
    // Check if there are any results displayed in the form
    
    if (formResults && formResults.style.display !== 'none') {
        
        
    } else {
        
    }
    
    return resultsShortcodes.length;
};

// Test function to manually update results shortcodes
window.manuallyUpdateResultsShortcodes = function(resultsHtml) {
    
    
    if (!window.natalChartForm) {
        console.error('❌ NatalChartForm not available!');
        return false;
    }
    
    try {
        window.natalChartForm.updateResultsShortcodes(resultsHtml);
        
        return true;
    } catch (error) {
        console.error('❌ Manual update failed:', error);
    }
};

// Simple test function to check form state
window.checkFormState = function() {
    
    
    // Check if form handler exists
    if (!window.natalChartForm) {
        console.error('❌ NatalChartForm not available!');
        return false;
    }
    
    
    
    
    
    
    // Check if results container exists in DOM
    const resultsContainer = document.getElementById('natal_chart-results');
       
    
    
    // Check if form exists in DOM
    const form = document.getElementById('natal_chart_form');
    
    
    return true;
};

// Toggle section functionality for natal chart results
function toggleSection(toggleElement) {
    const content = toggleElement.nextElementSibling;
    
    if (content && content.classList.contains('natal-chart-section-content')) {
        if (toggleElement.classList.contains('collapsed')) {
            // Expand section
            content.style.display = 'block';
            toggleElement.classList.remove('collapsed');
        } else {
            // Collapse section
            content.style.display = 'none';
            toggleElement.classList.add('collapsed');
        }
    }
}

// Initialize all sections as collapsed by default
function initializeToggleableSections() {
    const toggles = document.querySelectorAll('.natal-chart-section-toggle');
    toggles.forEach(toggle => {
        const content = toggle.nextElementSibling;
        if (content && content.classList.contains('natal-chart-section-content')) {
            // Ensure sections start collapsed
            content.style.display = 'none';
            toggle.classList.add('collapsed');
        }
    });
}

// Toggle interpretation functionality for planetary aspects
function toggleInterpretation(toggleElement) {
    const interpretationDiv = toggleElement.closest('.natal-chart-interpretation');
    const remainingContent = interpretationDiv.querySelector('.natal-chart-interpretation-remaining');
    const button = toggleElement;
    
    if (remainingContent.style.display === 'none') {
        // Show remaining content
        remainingContent.style.display = 'inline';
        button.textContent = 'Show Less';
        
        // Hide the triple dots that come before the remaining content
        const tripleDots = interpretationDiv.querySelector('.natal-chart-triple-dots');
        if (tripleDots) {
            tripleDots.style.display = 'none';
        }
    } else {
        // Hide remaining content
        remainingContent.style.display = 'none';
        button.textContent = 'Show More';
        
        // Show the triple dots again
        const tripleDots = interpretationDiv.querySelector('.natal-chart-triple-dots');
        if (tripleDots) {
            tripleDots.style.display = 'inline';
        }
    }
}

// Make toggleInterpretation function globally available
window.toggleInterpretation = toggleInterpretation;

// Make toggleSection function globally available
window.toggleSection = toggleSection;

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

