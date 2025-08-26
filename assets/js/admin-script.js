/**
 * Admin Scripts for Natal Chart Plugin
 * 
 * Handles admin interface functionality and interactions
 */

(function($) {
    'use strict';
    
    class NatalChartAdmin {
        constructor() {
            this.init();
        }
        
        init() {
            this.bindEvents();
            this.setupTokenVisibility();
        }
        
        bindEvents() {
            // Test API connection
            $(document).on('click', '#test-api-connection', (e) => {
                e.preventDefault();
                this.testApiConnection();
            });
            
            // Show/hide token
            $(document).on('click', '#show-hide-token', (e) => {
                e.preventDefault();
                this.toggleTokenVisibility();
            });
            
            // Form submission
            $(document).on('submit', 'form', (e) => {
                this.handleFormSubmission(e);
            });
            
            // Settings changes
            $(document).on('change', 'input, select, textarea', (e) => {
                this.handleSettingChange(e);
            });
            
            // Reset settings confirmation
            $(document).on('click', '.button-link-delete', (e) => {
                if (!this.confirmReset()) {
                    e.preventDefault();
                }
            });
        }
        
        /**
         * Test API connection
         */
        testApiConnection() {
            const button = $('#test-api-connection');
            const resultContainer = $('#api-test-result');
            
            // Show loading state
            button.prop('disabled', true).text(natal_chart_admin.strings.saving);
            resultContainer.removeClass('success error').hide();
            
            // Make AJAX request
            $.ajax({
                url: natal_chart_admin.ajax_url,
                type: 'POST',
                data: {
                    action: 'natal_chart_test_api',
                    nonce: natal_chart_admin.nonce
                },
                success: (response) => {
                    this.handleApiTestSuccess(response, resultContainer);
                },
                error: (xhr, status, error) => {
                    this.handleApiTestError(xhr, status, error, resultContainer);
                },
                complete: () => {
                    // Reset button state
                    button.prop('disabled', false).text('Test API Connection');
                }
            });
        }
        
        /**
         * Handle successful API test
         */
        handleApiTestSuccess(response, resultContainer) {
            if (response.success && response.data) {
                const data = response.data;
                
                let resultHtml = `
                    <div class="api-test-success">
                        <strong>✓ ${data.message}</strong>
                    </div>
                `;
                
                // Add sample data if available
                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    const sampleLocation = data.data[0];
                    resultHtml += `
                        <div class="api-test-sample">
                            <p><strong>Sample Location Data:</strong></p>
                            <ul>
                                <li><strong>City:</strong> ${this.escapeHtml(sampleLocation.city || 'N/A')}</li>
                                <li><strong>Country:</strong> ${this.escapeHtml(sampleLocation.country || 'N/A')}</li>
                                <li><strong>Timezone:</strong> ${this.escapeHtml(sampleLocation.timezone || 'N/A')}</li>
                                <li><strong>Coordinates:</strong> ${sampleLocation.latitude || 'N/A'}, ${sampleLocation.longitude || 'N/A'}</li>
                            </ul>
                        </div>
                    `;
                }
                
                resultContainer.html(resultHtml).addClass('success').show();
                
                // Show success notification
                this.showAdminNotice('API connection test successful!', 'success');
                
            } else {
                this.handleApiTestError(null, null, 'Invalid response format', resultContainer);
            }
        }
        
        /**
         * Handle API test error
         */
        handleApiTestError(xhr, status, error, resultContainer) {
            let errorMessage = natal_chart_admin.strings.error;
            
            if (xhr && xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                errorMessage = xhr.responseJSON.data.message;
            } else if (error) {
                errorMessage = error;
            }
            
            const resultHtml = `
                <div class="api-test-error">
                    <strong>✗ ${this.escapeHtml(errorMessage)}</strong>
                </div>
                <div class="api-test-troubleshoot">
                    <p><strong>Troubleshooting:</strong></p>
                    <ul>
                        <li>Verify your bearer token is correct</li>
                        <li>Check if the API service is accessible</li>
                        <li>Ensure your server can make external HTTP requests</li>
                        <li>Check the browser console for detailed error information</li>
                    </ul>
                </div>
            `;
            
            resultContainer.html(resultHtml).addClass('error').show();
            
            // Show error notification
            this.showAdminNotice('API connection test failed. Please check your settings.', 'error');
        }
        
        /**
         * Toggle token visibility
         */
        toggleTokenVisibility() {
            const tokenInput = $('#bearer_token');
            const toggleButton = $('#show-hide-token');
            
            if (tokenInput.attr('type') === 'password') {
                tokenInput.attr('type', 'text');
                toggleButton.text('Hide Token');
            } else {
                tokenInput.attr('type', 'password');
                toggleButton.text('Show Token');
            }
        }
        
        /**
         * Setup token visibility toggle
         */
        setupTokenVisibility() {
            const tokenInput = $('#bearer_token');
            const toggleButton = $('#show-hide-token');
            
            if (tokenInput.length > 0 && toggleButton.length > 0) {
                // Set initial state
                if (tokenInput.val()) {
                    toggleButton.text('Show Token');
                } else {
                    toggleButton.text('Show Token');
                }
            }
        }
        
        /**
         * Handle form submission
         */
        handleFormSubmission(e) {
            const form = $(e.target);
            const submitButton = form.find('input[type="submit"], button[type="submit"]');
            
            // Show loading state
            submitButton.prop('disabled', true);
            
            // Add loading class to form
            form.addClass('loading');
            
            // Store original button text
            const originalText = submitButton.text();
            submitButton.text(natal_chart_admin.strings.saving);
            
            // Re-enable after a delay to allow form processing
            setTimeout(() => {
                submitButton.prop('disabled', false).text(originalText);
                form.removeClass('loading');
            }, 2000);
        }
        
        /**
         * Handle setting changes
         */
        handleSettingChange(e) {
            const field = $(e.target);
            const fieldName = field.attr('name');
            
            // Add visual feedback for changed fields
            if (fieldName) {
                field.addClass('setting-changed');
                
                // Remove class after a delay
                setTimeout(() => {
                    field.removeClass('setting-changed');
                }, 2000);
            }
        }
        
        /**
         * Confirm settings reset
         */
        confirmReset() {
            return confirm(natal_chart_admin.strings.confirm_reset);
        }
        
        /**
         * Show admin notice
         */
        showAdminNotice(message, type = 'info') {
            const noticeClass = `notice notice-${type}`;
            const noticeHtml = `
                <div class="${noticeClass} is-dismissible">
                    <p>${this.escapeHtml(message)}</p>
                    <button type="button" class="notice-dismiss">
                        <span class="screen-reader-text">Dismiss this notice.</span>
                    </button>
                </div>
            `;
            
            // Add notice to the top of the page
            $('.wrap h1').after(noticeHtml);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                $(`.${noticeClass}`).fadeOut(500, function() {
                    $(this).remove();
                });
            }, 5000);
        }
        
        /**
         * Validate settings before save
         */
        validateSettings() {
            const errors = [];
            
            // Check bearer token
            const bearerToken = $('#bearer_token').val();
            if (!bearerToken || bearerToken.trim() === '') {
                errors.push('Bearer token is required');
            }
            
            // Check API base URL
            const apiBaseUrl = $('#api_base_url').val();
            if (!apiBaseUrl || !this.isValidUrl(apiBaseUrl)) {
                errors.push('Please enter a valid API base URL');
            }
            
            // Check rate limit
            const rateLimit = $('#rate_limit').val();
            if (rateLimit < 1 || rateLimit > 1000) {
                errors.push('Rate limit must be between 1 and 1000');
            }
            
            return errors;
        }
        
        /**
         * Validate URL format
         */
        isValidUrl(string) {
            try {
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        }
        
        /**
         * Escape HTML
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        /**
         * Format API response data
         */
        formatApiData(data) {
            if (typeof data === 'object') {
                return JSON.stringify(data, null, 2);
            }
            return String(data);
        }
        
        /**
         * Copy to clipboard
         */
        copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    this.showAdminNotice('Copied to clipboard!', 'success');
                }).catch(() => {
                    this.fallbackCopyToClipboard(text);
                });
            } else {
                this.fallbackCopyToClipboard(text);
            }
        }
        
        /**
         * Fallback copy to clipboard
         */
        fallbackCopyToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showAdminNotice('Copied to clipboard!', 'success');
            } catch (err) {
                this.showAdminNotice('Failed to copy to clipboard', 'error');
            }
            
            document.body.removeChild(textArea);
        }
        
        /**
         * Export settings
         */
        exportSettings() {
            const settings = {};
            
            // Collect all form values
            $('form input, form select, form textarea').each(function() {
                const field = $(this);
                const name = field.attr('name');
                const value = field.val();
                
                if (name && value !== undefined) {
                    if (field.attr('type') === 'checkbox') {
                        settings[name] = field.is(':checked');
                    } else {
                        settings[name] = value;
                    }
                }
            });
            
            // Create and download file
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'natal-chart-settings.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showAdminNotice('Settings exported successfully!', 'success');
        }
        
        /**
         * Import settings
         */
        importSettings(file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    this.populateSettings(settings);
                    this.showAdminNotice('Settings imported successfully!', 'success');
                } catch (error) {
                    this.showAdminNotice('Invalid settings file format', 'error');
                }
            };
            
            reader.readAsText(file);
        }
        
        /**
         * Populate settings form
         */
        populateSettings(settings) {
            Object.keys(settings).forEach(key => {
                const field = $(`[name="${key}"]`);
                
                if (field.length > 0) {
                    if (field.attr('type') === 'checkbox') {
                        field.prop('checked', settings[key]);
                    } else {
                        field.val(settings[key]);
                    }
                }
            });
        }
        
        /**
         * Reset settings to defaults
         */
        resetToDefaults() {
            if (this.confirmReset()) {
                const defaultSettings = {
                    'natal_chart_settings[bearer_token]': '',
                    'natal_chart_settings[api_base_url]': 'https://resource.astrologycosmic.com/public/api/v1',
                    'natal_chart_settings[enable_logging]': false,
                    'natal_chart_settings[rate_limit]': 100
                };
                
                this.populateSettings(defaultSettings);
                this.showAdminNotice('Settings reset to defaults', 'info');
            }
        }
        
        /**
         * Check for unsaved changes
         */
        checkUnsavedChanges() {
            const form = $('form');
            const originalData = form.serialize();
            
            $(window).on('beforeunload', (e) => {
                if (form.serialize() !== originalData) {
                    e.preventDefault();
                    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                    return 'You have unsaved changes. Are you sure you want to leave?';
                }
            });
        }
        
        /**
         * Initialize tooltips
         */
        initTooltips() {
            $('[title]').tooltip({
                position: { my: 'left+5 center', at: 'right center' },
                show: { duration: 200 },
                hide: { duration: 200 }
            });
        }
        
        /**
         * Initialize color pickers
         */
        initColorPickers() {
            if ($.fn.wpColorPicker) {
                $('.wp-color-picker').wpColorPicker();
            }
        }
        
        /**
         * Initialize date pickers
         */
        initDatePickers() {
            if ($.fn.datepicker) {
                $('.date-picker').datepicker({
                    dateFormat: 'yy-mm-dd',
                    changeMonth: true,
                    changeYear: true,
                    yearRange: '-100:+0'
                });
            }
        }
    }
    
    // Initialize when document is ready
    $(document).ready(function() {
        new NatalChartAdmin();
    });
    
})(jQuery);
