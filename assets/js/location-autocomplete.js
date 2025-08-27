/**
 * Location Autocomplete for Natal Chart Form
 * Handles location search and selection with debouncing
 */

class NatalChartLocationAutocomplete {
    constructor() {
        this.searchInput = null;
        this.resultsContainer = null;
        this.selectedLocation = null;
        this.searchTimeout = null;
        this.isSearching = false;
        
        this.init();
    }

    init() {
        this.searchInput = document.getElementById('natal_chart_location_search');
        this.resultsContainer = document.getElementById('natal-chart-location-results');
        
        // Validate that both required elements exist
        if (!this.searchInput) {
            console.error('Natal Chart: Location search input not found');
            return;
        }
        
        if (!this.resultsContainer) {
            console.error('Natal Chart: Location results container not found');
            return;
        }
        
        console.log('Natal Chart: Location autocomplete initialized successfully');
        this.bindEvents();
    }

    bindEvents() {
        // Search input events
        this.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        this.searchInput.addEventListener('focus', () => this.handleSearchFocus());
        this.searchInput.addEventListener('blur', () => this.handleSearchBlur());
        this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
        
        // Click outside to close results
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        
        // Add form validation events
        this.bindFormValidationEvents();
    }

    bindFormValidationEvents() {
        // Get all required form fields
        const requiredFields = [
            'natal_chart_name',
            'natal_chart_birth_date',
            'natal_chart_birth_hour',
            'natal_chart_birth_minute',
            'natal_chart_birth_ampm'
        ];
        
        // Add input event listeners to all required fields
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.validateField(field);
                    // Let the main form handler manage the submit button
                    if (window.natalChartForm && typeof window.natalChartForm.updateSubmitButton === 'function') {
                        window.natalChartForm.updateSubmitButton();
                    }
                });
                field.addEventListener('change', () => {
                    this.validateField(field);
                    if (window.natalChartForm && typeof window.natalChartForm.updateSubmitButton === 'function') {
                        window.natalChartForm.updateSubmitButton();
                    }
                });
                field.addEventListener('blur', () => {
                    this.validateField(field);
                    if (window.natalChartForm && typeof window.natalChartForm.updateSubmitButton === 'function') {
                        window.natalChartForm.updateSubmitButton();
                    }
                });
            }
        });
        
        // Initial field validation
        this.validateAllFields();
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value !== '';
        
        // Remove existing validation classes
        field.classList.remove('valid', 'invalid');
        
        // Add appropriate validation class
        if (isValid) {
            field.classList.add('valid');
        } else {
            field.classList.add('invalid');
        }
        
        return isValid;
    }

    validateAllFields() {
        const requiredFields = [
            'natal_chart_name',
            'natal_chart_birth_date',
            'natal_chart_birth_hour',
            'natal_chart_birth_minute',
            'natal_chart_birth_ampm'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                this.validateField(field);
            }
        });
    }

    handleSearchInput(e) {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Clear selected location if input is cleared
        if (!query) {
            this.clearSelection();
            return;
        }
        
        // Debounce search
        this.searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                this.searchLocations(query);
            } else {
                this.hideResultsContainer();
            }
        }, 300);
    }

    handleSearchFocus() {
        if (this.searchInput.value.trim().length >= 2 && !this.selectedLocation) {
            this.showResultsContainer();
        }
    }

    handleSearchBlur() {
        // Safety check
        if (!this.resultsContainer) return;
        
        // Delay hiding to allow for clicks on results
        setTimeout(() => {
            if (this.resultsContainer && !this.resultsContainer.matches(':hover')) {
                this.hideResultsContainer();
            }
        }, 150);
    }

    handleSearchKeydown(e) {
        // Safety check
        if (!this.resultsContainer) return;
        
        const results = this.resultsContainer.querySelectorAll('.natal-chart-location-result');
        const currentIndex = Array.from(results).findIndex(result => result.classList.contains('selected'));
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateResults(results, currentIndex, 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateResults(results, currentIndex, -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0) {
                    this.selectLocation(results[currentIndex]);
                }
                break;
            case 'Escape':
                this.hideResultsContainer();
                this.searchInput.blur();
                break;
        }
    }

    handleClickOutside(e) {
        // Safety check
        if (!this.resultsContainer) return;
        
        if (!this.searchInput.contains(e.target) && !this.resultsContainer.contains(e.target)) {
            this.hideResultsContainer();
        }
    }

    navigateResults(results, currentIndex, direction) {
        if (results.length === 0) return;
        
        // Remove current selection
        if (currentIndex >= 0) {
            results[currentIndex].classList.remove('selected');
        }
        
        // Calculate new index
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = results.length - 1;
        if (newIndex >= results.length) newIndex = 0;
        
        // Add new selection
        results[newIndex].classList.add('selected');
        results[newIndex].scrollIntoView({ block: 'nearest' });
    }

    async searchLocations(query) {
        if (this.isSearching) return;
        
        this.isSearching = true;
        this.showSearchingState();
        
        try {
            console.log('Searching for locations with query:', query);
            console.log('AJAX URL:', natal_chart_ajax.ajax_url);
            console.log('Nonce:', natal_chart_ajax.nonce);
            
            const response = await fetch(natal_chart_ajax.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'natal_chart_search_locations',
                    nonce: natal_chart_ajax.nonce,
                    query: query
                })
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const data = await response.json();
            console.log('Full response data:', data);
            console.log('Data structure:', {
                success: data.success,
                hasData: !!data.data,
                dataType: typeof data.data,
                dataKeys: data.data ? Object.keys(data.data) : 'No data object',
                hasResults: data.data && data.data.results,
                resultsType: data.data && data.data.results ? typeof data.data.results : 'No results',
                isResultsArray: data.data && data.data.results ? Array.isArray(data.data.results) : 'No results'
            });
            
            if (data.success) {
                console.log('Success response, data structure:', data.data);
                if (data.data && data.data.results) {
                    console.log('Results found:', data.data.results);
                    this.displayResults(data.data.results);
                } else {
                    console.error('No results data found in response');
                    this.showError('No location data received from server');
                }
            } else {
                console.error('API returned error:', data);
                const errorMessage = data.data && data.data.message ? data.data.message : natal_chart_ajax.strings.error;
                this.showError(errorMessage);
            }
        } catch (error) {
            console.error('Location search error:', error);
            this.showError(natal_chart_ajax.strings.error);
        } finally {
            this.isSearching = false;
        }
    }

    showSearchingState() {
        this.resultsContainer.innerHTML = `
            <div class="natal-chart-location-loading">
                <span class="natal-chart-spinner"></span>
                <span class="natal-chart-loading-text">${natal_chart_ajax.strings.searching}</span>
            </div>
        `;
        this.showResultsContainer();
    }

    displayResults(locations) {
        // Add better data validation and debugging
        console.log('Display results called with:', locations);
        console.log('Type of locations:', typeof locations);
        console.log('Is Array?', Array.isArray(locations));
        
        // Ensure locations is an array
        if (!locations) {
            console.error('Locations data is null or undefined');
            this.showNoResults();
            return;
        }
        
        if (!Array.isArray(locations)) {
            console.error('Locations data is not an array:', locations);
            this.showError('Invalid data format received from server');
            return;
        }
        
        if (locations.length === 0) {
            this.showNoResults();
            return;
        }
        
        try {
            const resultsHTML = locations.map(location => `
                <div class="natal-chart-location-result" data-location='${JSON.stringify(location)}'>
                    <div class="city-name">${this.escapeHtml(location.label || location.name || 'Unknown')}</div>
                    <div class="city-details">
                        ${location.country ? location.country : ''}
                        ${location.timezone ? ` • ${location.timezone}` : ''}
                    </div>
                </div>
            `).join('');
            
            this.resultsContainer.innerHTML = resultsHTML;
            this.showResultsContainer();
            this.bindResultEvents();
        } catch (error) {
            console.error('Error processing location results:', error);
            this.showError('Error processing location results');
        }
    }

    showNoResults() {
        this.resultsContainer.innerHTML = `
            <div class="natal-chart-location-no-results">
                <div class="natal-chart-location-no-results-message">${natal_chart_ajax.strings.no_results}</div>
            </div>
        `;
        this.showResultsContainer();
    }

    showError(message) {
        this.resultsContainer.innerHTML = `
            <div class="natal-chart-location-error">
                <div class="natal-chart-location-error-message">${this.escapeHtml(message)}</div>
            </div>
        `;
        this.showResultsContainer();
    }

    bindResultEvents() {
        const results = this.resultsContainer.querySelectorAll('.natal-chart-location-result');
        
        results.forEach(result => {
            result.addEventListener('click', () => this.selectLocation(result));
            result.addEventListener('mouseenter', () => {
                results.forEach(r => r.classList.remove('selected'));
                result.classList.add('selected');
            });
        });
    }

    selectLocation(resultElement) {
        const locationData = JSON.parse(resultElement.dataset.location);
        this.selectedLocation = locationData;
        
        console.log('Location selected:', locationData.label);
        console.log('Checking if main form handler is available...');
        console.log('window.natalChartForm exists:', !!window.natalChartForm);
        
        if (window.natalChartForm) {
            console.log('Main form handler found, checking methods...');
            console.log('updateSubmitButton method exists:', typeof window.natalChartForm.updateSubmitButton === 'function');
            console.log('isFormValid method exists:', typeof window.natalChartForm.isFormValid === 'function');
        }
        
        // Populate form fields
        this.populateFormFields(locationData);
        
        // Update UI
        this.searchInput.value = locationData.label;
        this.searchInput.classList.add('natal-chart-location-selected');
        this.hideResultsContainer();
        
        // Use the simple enableSubmitButton function
        if (typeof window.enableSubmitButton === 'function') {
            console.log('Calling simple enableSubmitButton function...');
            window.enableSubmitButton();
        } else {
            console.log('Simple enableSubmitButton function not available, trying main form handler...');
            // Fallback to main form handler
            if (window.natalChartForm && typeof window.natalChartForm.updateSubmitButton === 'function') {
                console.log('Calling main form handler updateSubmitButton...');
                try {
                    window.natalChartForm.updateSubmitButton();
                    console.log('✅ Successfully called updateSubmitButton');
                } catch (error) {
                    console.error('❌ Error calling updateSubmitButton:', error);
                }
            } else {
                console.warn('❌ No submit button update method available');
            }
        }
        
        // Trigger change event for form validation
        this.searchInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Clear any location errors
        this.clearLocationError();
    }

    populateFormFields(location) {
        // Populate hidden fields
        document.getElementById('natal_chart_location').value = location.label;
        document.getElementById('natal_chart_latitude').value = location.latitude || '';
        document.getElementById('natal_chart_longitude').value = location.longitude || '';
        document.getElementById('natal_chart_timezone').value = location.timezone || '';
        document.getElementById('natal_chart_offset').value = location.offset || '';
        
        // Ensure decimal precision for timezone offset
        const offsetRound = location.offset_round;
        console.log('🔍 Original offset_round value:', offsetRound, 'Type:', typeof offsetRound);
        
        if (offsetRound !== undefined && offsetRound !== null) {
            // Convert to number and preserve exact decimal places
            const offsetValue = parseFloat(offsetRound);
            console.log('🔍 Parsed offset value:', offsetValue, 'Type:', typeof offsetValue);
            
            if (!isNaN(offsetValue)) {
                // Don't use toFixed() to avoid rounding, preserve exact value
                const formattedValue = offsetValue.toString();
                console.log('🔍 Formatted value to set:', formattedValue);
                
                // Set the value directly without formatting
                document.getElementById('natal_chart_offset_round').value = offsetValue;
                
                // Verify the value was set correctly
                const actualValue = document.getElementById('natal_chart_offset_round').value;
                console.log('🔍 Actual value in field after setting:', actualValue);
                
                // Force the display to show the exact value
                const inputField = document.getElementById('natal_chart_offset_round');
                inputField.setAttribute('value', offsetValue);
                inputField.value = offsetValue;
                
                // Double-check the final value
                console.log('🔍 Final value after force set:', inputField.value);
                
                // Test: Manually verify decimal display
                setTimeout(() => {
                    const testValue = inputField.value;
                    console.log('🔍 Test after 100ms delay:', testValue);
                    console.log('🔍 Test value type:', typeof testValue);
                    console.log('🔍 Test value length:', testValue.length);
                    console.log('🔍 Test value includes decimal:', testValue.includes('.'));
                }, 100);
            } else {
                console.log('🔍 Invalid offset value, setting empty');
                document.getElementById('natal_chart_offset_round').value = '';
            }
        } else {
            console.log('🔍 No offset_round value, setting empty');
            document.getElementById('natal_chart_offset_round').value = '';
        }
    }

    clearSelection() {
        this.selectedLocation = null;
        this.searchInput.classList.remove('natal-chart-location-selected');
        
        console.log('Location selection cleared');
        
        // Clear all location-related fields
        document.getElementById('natal_chart_location').value = '';
        document.getElementById('natal_chart_latitude').value = '';
        document.getElementById('natal_chart_longitude').value = '';
        document.getElementById('natal_chart_timezone').value = '';
        document.getElementById('natal_chart_offset').value = '';
        document.getElementById('natal_chart_offset_round').value = '';
        
        this.hideResultsContainer();
        
        // Use the simple enableSubmitButton function
        if (typeof window.enableSubmitButton === 'function') {
            console.log('Calling simple enableSubmitButton function after clearing selection...');
            window.enableSubmitButton();
        } else {
            console.log('Simple enableSubmitButton function not available, trying main form handler...');
            // Fallback to main form handler
            if (window.natalChartForm && typeof window.natalChartForm.updateSubmitButton === 'function') {
                console.log('Calling main form handler updateSubmitButton after clearing selection...');
                try {
                    window.natalChartForm.updateSubmitButton();
                    console.log('✅ Successfully called updateSubmitButton');
                } catch (error) {
                    console.error('❌ Error calling updateSubmitButton:', error);
                }
            } else {
                console.warn('❌ No submit button update method available');
            }
        }
    }

    updateSubmitButton() {
        // This function is now handled by the main form handler
    }

    isFormValid() {
        // This function is now handled by the main form handler
        return true; // Placeholder, as this logic is moved to natal-chart-form.js
    }

    clearLocationError() {
        const errorElement = document.getElementById('natal_chart_location_search_error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    showResultsContainer() {
        if (this.resultsContainer) {
            this.resultsContainer.classList.add('show');
        }
    }

    hideResultsContainer() {
        if (this.resultsContainer) {
            this.resultsContainer.classList.remove('show');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Global function to manually initialize location autocomplete
window.initializeLocationAutocompleteManually = function() {
    console.log('Manual location autocomplete initialization requested...');
    return initializeLocationAutocomplete();
};

// Global function to check if location autocomplete is ready
window.isLocationAutocompleteReady = function() {
    return window.natalChartLocationAutocomplete && 
           window.natalChartLocationAutocomplete.searchInput;
};

// Global function to get location autocomplete status
window.getLocationAutocompleteStatus = function() {
    return {
        searchInputExists: !!document.getElementById('natal_chart_location_search'),
        resultsContainerExists: !!document.getElementById('natal_chart-location-results'),
        autocompleteHandlerExists: !!window.natalChartLocationAutocomplete,
        autocompleteInitialized: !!(window.natalChartLocationAutocomplete && 
                                   window.natalChartLocationAutocomplete.searchInput)
    };
};

// Robust initialization that waits for the form to appear
function initializeLocationAutocomplete() {
    console.log('Checking for location autocomplete elements...');
    
    const searchInput = document.getElementById('natal_chart_location_search');
    const resultsContainer = document.getElementById('natal-chart-location-results');
    
    if (searchInput && resultsContainer) {
        console.log('Location autocomplete elements found! Initializing...');
        
        // Check if already initialized
        if (window.natalChartLocationAutocomplete) {
            console.log('Location autocomplete already exists');
            return true;
        }
        
        try {
            window.natalChartLocationAutocomplete = new NatalChartLocationAutocomplete();
            console.log('Location autocomplete initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing location autocomplete:', error);
            return false;
        }
    } else {
        console.log('Location autocomplete elements not found yet, will retry...');
        return false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting location autocomplete detection...');
    
    // Try to initialize immediately
    if (!initializeLocationAutocomplete()) {
        // If elements not found, start polling
        console.log('Starting location autocomplete detection polling...');
        const autocompleteCheckInterval = setInterval(() => {
            if (initializeLocationAutocomplete()) {
                clearInterval(autocompleteCheckInterval);
                console.log('Location autocomplete detected and initialized, stopping polling');
            }
        }, 500); // Check every 500ms
        
        // Stop polling after 10 seconds
        setTimeout(() => {
            clearInterval(autocompleteCheckInterval);
            console.log('Location autocomplete detection timeout - elements may not be present on this page');
        }, 10000);
    }
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded...');
} else {
    console.log('DOM already loaded, checking for location autocomplete elements immediately...');
    initializeLocationAutocomplete();
}

// Listen for dynamic content changes
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node contains our elements
                        if (node.id === 'natal_chart_location_search' || 
                            node.querySelector('#natal_chart_location_search') ||
                            node.id === 'natal_chart-location-results' ||
                            node.querySelector('#natal_chart-location-results')) {
                            console.log('Location autocomplete elements detected via MutationObserver');
                            setTimeout(initializeLocationAutocomplete, 100);
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
    
    console.log('MutationObserver started for dynamic location autocomplete detection');
}
