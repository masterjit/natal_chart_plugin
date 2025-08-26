/**
 * Natal Chart Form Handler
 * 
 * Handles form submission, validation, and result display
 */

(function($) {
    'use strict';
    
    class NatalChartForm {
        constructor() {
            this.form = null;
            this.submitButton = null;
            this.resultsContainer = null;
            this.isSubmitting = false;
            
            this.init();
        }
        
        init() {
            this.bindEvents();
            this.setupFormValidation();
        }
        
        bindEvents() {
            // Form submission
            $(document).on('submit', '#natal_chart_form', (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            });
            
            // Form field changes
            $(document).on('input change', '#natal_chart_form input, #natal_chart_form select', (e) => {
                this.validateField($(e.target));
                this.updateSubmitButton();
            });
            
            // Close results
            $(document).on('click', '#natal_chart-close-results', (e) => {
                e.preventDefault();
                this.hideResults();
            });
            
            // Print chart
            $(document).on('click', '#natal-chart-print', (e) => {
                e.preventDefault();
                this.printChart();
            });
            
            // Download data
            $(document).on('click', '#natal-chart-download', (e) => {
                e.preventDefault();
                this.downloadData();
            });
            
            // Generate new chart
            $(document).on('click', '#natal-chart-new-chart', (e) => {
                e.preventDefault();
                this.generateNewChart();
            });
            
            // Clear form
            $(document).on('click', '.natal-chart-clear-form', (e) => {
                e.preventDefault();
                this.clearForm();
            });
        }
        
        handleFormSubmission() {
            if (this.isSubmitting) {
                return;
            }
            
            // Validate form
            if (!this.validateForm()) {
                return;
            }
            
            this.isSubmitting = true;
            this.showSubmittingState();
            this.clearFormMessages();
            
            // Get form data
            const formData = this.getFormData();
            
            // Submit form via AJAX
            $.ajax({
                url: natal_chart_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'natal_chart_generate_chart',
                    ...formData,
                    nonce: natal_chart_ajax.nonce
                },
                success: (response) => {
                    this.handleSubmissionSuccess(response);
                },
                error: (xhr, status, error) => {
                    this.handleSubmissionError(xhr, status, error);
                },
                complete: () => {
                    this.isSubmitting = false;
                    this.hideSubmittingState();
                }
            });
        }
        
        handleSubmissionSuccess(response) {
            if (response.success && response.data) {
                this.showSuccessMessage(response.data.message);
                this.displayResults(response.data.results_html);
                this.scrollToResults();
            } else {
                this.showErrorMessage(response.data.message || natal_chart_ajax.strings.error);
            }
        }
        
        handleSubmissionError(xhr, status, error) {
            console.error('Form submission error:', { xhr, status, error });
            
            let errorMessage = natal_chart_ajax.strings.error;
            
            if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                errorMessage = xhr.responseJSON.data.message;
            }
            
            this.showErrorMessage(errorMessage);
            
            // Show field-specific errors if available
            if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.errors) {
                this.showFieldErrors(xhr.responseJSON.data.errors);
            }
        }
        
        validateForm() {
            let isValid = true;
            
            // Validate required fields
            $('#natal_chart_form [required]').each((index, field) => {
                const $field = $(field);
                if (!this.validateField($field)) {
                    isValid = false;
                }
            });
            
            // Validate location selection
            if (!$('#natal_chart_location').val()) {
                this.showFieldError('#natal_chart_location_search', natal_chart_ajax.strings.required_field);
                isValid = false;
            }
            
            return isValid;
        }
        
        validateField($field) {
            const fieldId = $field.attr('id');
            const fieldValue = $field.val().trim();
            const isRequired = $field.prop('required');
            
            // Clear previous error
            this.clearFieldError($field);
            
            // Check if required field is empty
            if (isRequired && !fieldValue) {
                this.showFieldError($field, natal_chart_ajax.strings.required_field);
                return false;
            }
            
            // Field-specific validation
            if (fieldValue) {
                switch (fieldId) {
                    case 'natal_chart_birth_date':
                        if (!this.isValidDate(fieldValue)) {
                            this.showFieldError($field, natal_chart_ajax.strings.invalid_date);
                            return false;
                        }
                        break;
                        
                    case 'natal_chart_birth_time':
                        if (!this.isValidTime(fieldValue)) {
                            this.showFieldError($field, natal_chart_ajax.strings.invalid_time);
                            return false;
                        }
                        break;
                        
                    case 'natal_chart_name':
                        if (fieldValue.length < 2) {
                            this.showFieldError($field, __('Name must be at least 2 characters long.', 'natal-chart-plugin'));
                            return false;
                        }
                        break;
                }
            }
            
            return true;
        }
        
        isValidDate(dateString) {
            const date = new Date(dateString);
            return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
        }
        
        isValidTime(timeString) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            return timeRegex.test(timeString);
        }
        
        showFieldError($field, message) {
            const fieldId = $field.attr('id');
            const errorContainer = $(`#${fieldId}_error`);
            
            if (errorContainer.length > 0) {
                errorContainer.html(`<div class="natal-chart-form-error">${this.escapeHtml(message)}</div>`);
                $field.addClass('natal-chart-form-error-field');
            }
        }
        
        clearFieldError($field) {
            const fieldId = $field.attr('id');
            const errorContainer = $(`#${fieldId}_error`);
            
            if (errorContainer.length > 0) {
                errorContainer.empty();
                $field.removeClass('natal-chart-form-error-field');
            }
        }
        
        showFieldErrors(errors) {
            if (typeof errors === 'object') {
                Object.keys(errors).forEach(fieldName => {
                    const $field = $(`#${fieldName}`);
                    if ($field.length > 0) {
                        this.showFieldError($field, errors[fieldName]);
                    }
                });
            }
        }
        
        getFormData() {
            const formData = {};
            
            $('#natal_chart_form').serializeArray().forEach(item => {
                formData[item.name] = item.value;
            });
            
            return formData;
        }
        
        showSubmittingState() {
            this.submitButton.prop('disabled', true);
            $('.natal-chart-submit-text').hide();
            $('.natal-chart-submit-loading').show();
        }
        
        hideSubmittingState() {
            this.submitButton.prop('disabled', false);
            $('.natal-chart-submit-text').show();
            $('.natal-chart-submit-loading').hide();
        }
        
        showSuccessMessage(message) {
            this.showFormMessage(message, 'success');
        }
        
        showErrorMessage(message) {
            this.showFormMessage(message, 'error');
        }
        
        showFormMessage(message, type) {
            const messageHtml = `
                <div class="natal-chart-form-message natal-chart-form-message-${type}">
                    ${this.escapeHtml(message)}
                </div>
            `;
            
            $('#natal_chart-form-messages').html(messageHtml);
        }
        
        clearFormMessages() {
            $('#natal_chart-form-messages').empty();
        }
        
        displayResults(resultsHtml) {
            if (this.resultsContainer) {
                this.resultsContainer.html(resultsHtml).show();
            }
        }
        
        hideResults() {
            if (this.resultsContainer) {
                this.resultsContainer.hide();
            }
        }
        
        scrollToResults() {
            if (this.resultsContainer && this.resultsContainer.is(':visible')) {
                this.resultsContainer[0].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
        
        printChart() {
            const printWindow = window.open('', '_blank');
            const printContent = this.resultsContainer.html();
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Natal Chart - ${document.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .natal-chart-results-content { max-width: 800px; margin: 0 auto; }
                        .natal-chart-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
                        .natal-chart-info-item { padding: 10px; border: 1px solid #ddd; }
                        .natal-chart-json-data { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
                        @media print { .natal-chart-actions { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="natal-chart-results-content">
                        ${printContent}
                    </div>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
        
        downloadData() {
            // Get chart data from results
            const chartData = this.getChartDataFromResults();
            
            if (!chartData) {
                this.showErrorMessage('No chart data available for download.');
                return;
            }
            
            // Create download link
            const dataStr = JSON.stringify(chartData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `natal-chart-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        
        getChartDataFromResults() {
            // Try to get data from the results container
            const chartDataElement = this.resultsContainer.find('.natal-chart-json-data');
            if (chartDataElement.length > 0) {
                try {
                    return JSON.parse(chartDataElement.text());
                } catch (e) {
                    console.error('Error parsing chart data:', e);
                }
            }
            
            return null;
        }
        
        generateNewChart() {
            this.hideResults();
            this.clearForm();
            this.scrollToForm();
        }
        
        clearForm() {
            $('#natal_chart_form')[0].reset();
            this.clearFormMessages();
            this.clearAllFieldErrors();
            this.updateSubmitButton();
            
            // Clear location selection
            if (window.natalChartLocationAutocomplete) {
                window.natalChartLocationAutocomplete.clearLocation();
            }
        }
        
        clearAllFieldErrors() {
            $('#natal_chart_form .natal-chart-form-error').empty();
            $('#natal_chart_form .natal-chart-form-error-field').removeClass('natal-chart-form-error-field');
        }
        
        scrollToForm() {
            $('#natal_chart_form')[0].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        
        updateSubmitButton() {
            const requiredFields = $('#natal_chart_form [required]');
            let allFieldsValid = true;
            
            requiredFields.each((index, field) => {
                const $field = $(field);
                const fieldValue = $field.val().trim();
                
                if (!$field.val() || $field.hasClass('natal-chart-form-error-field')) {
                    allFieldsValid = false;
                    return false; // Break loop
                }
            });
            
            // Check if location is selected
            if (!$('#natal_chart_location').val()) {
                allFieldsValid = false;
            }
            
            this.submitButton.prop('disabled', !allFieldsValid);
        }
        
        setupFormValidation() {
            this.form = $('#natal_chart_form');
            this.submitButton = $('#natal_chart_submit');
            this.resultsContainer = $('#natal_chart-results');
            
            // Initialize submit button as disabled
            this.updateSubmitButton();
        }
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }
    
    // Initialize when document is ready
    $(document).ready(function() {
        new NatalChartForm();
    });
    
})(jQuery);
