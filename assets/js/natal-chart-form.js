/**
 * Natal Chart Form Handler
 * Manages form submission, validation, and results display
 */

class NatalChartForm {
    constructor() {
        this.form = null;
        this.submitButton = null;
        this.resultsContainer = null;
        this.isSubmitting = false;
        
        this.init();
    }

    init() {
        this.form = document.getElementById('natal_chart_form');
        this.submitButton = document.getElementById('natal_chart_submit');
        this.resultsContainer = document.getElementById('natal_chart_results');
        
        if (this.form) {
            this.bindEvents();
            this.updateSubmitButton();
        }
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Form field changes for validation
        this.form.addEventListener('input', () => this.updateSubmitButton());
        this.form.addEventListener('change', () => this.updateSubmitButton());
        
        // Close results button
        const closeButton = document.getElementById('natal_chart_close_results');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeResults());
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
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
            console.error('Form submission error:', error);
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
            'natal_chart_birth_date',
            'natal_chart_birth_time',
            'natal_chart_location_search'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.showFieldError(fieldId, natal_chart_ajax.strings.required_field);
                isValid = false;
            }
        });
        
        // Validate date
        const birthDate = document.getElementById('natal_chart_birth_date').value;
        if (birthDate && !this.isValidDate(birthDate)) {
            this.showFieldError('natal_chart_birth_date', natal_chart_ajax.strings.invalid_date);
            isValid = false;
        }
        
        // Validate time
        const birthTime = document.getElementById('natal_chart_birth_time').value;
        if (birthTime && !this.isValidTime(birthTime)) {
            this.showFieldError('natal_chart_birth_time', natal_chart_ajax.strings.invalid_time);
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
        
        // Add location data from readonly fields
        const latitude = document.getElementById('natal_chart_latitude').value;
        const longitude = document.getElementById('natal_chart_longitude').value;
        const timezone = document.getElementById('natal_chart_timezone').value;
        const offset = document.getElementById('natal_chart_offset').value;
        const offsetRound = document.getElementById('natal_chart_offset_round').value;
        
        return {
            name: formData.get('natal_chart_name'),
            birth_date: formData.get('natal_chart_birth_date'),
            birth_time: formData.get('natal_chart_birth_time'),
            location: formData.get('natal_chart_location'),
            latitude: latitude,
            longitude: longitude,
            timezone: timezone,
            offset: offset,
            offset_round: offsetRound,
            nonce: formData.get('natal_chart_nonce')
        };
    }

    async submitForm(formData) {
        const response = await fetch(natal_chart_ajax.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'natal_chart_generate_chart',
                ...formData
            })
        });
        
        return await response.json();
    }

    handleSubmissionSuccess(response) {
        if (response.success && response.data) {
            this.showSuccessMessage(response.data.message || 'Natal chart generated successfully!');
            this.displayResults(response.data.results_html);
            this.scrollToResults();
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
                <div class="natal-chart-results-header">
                    <h3>Your Natal Chart Report</h3>
                    <button type="button" class="natal-chart-close-results" id="natal_chart_close_results">
                        Close
                    </button>
                </div>
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
            this.submitButton.disabled = !isFormValid;
        }
    }

    isFormValid() {
        const requiredFields = [
            'natal_chart_name',
            'natal_chart_birth_date',
            'natal_chart_birth_time'
        ];
        
        // Check if location is selected
        const locationField = document.getElementById('natal_chart_location_search');
        if (!locationField || !locationField.classList.contains('natal-chart-location-selected')) {
            return false;
        }
        
        // Check other required fields
        return requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim() !== '';
        });
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NatalChartForm();
});
