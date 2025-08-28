/**
 * Location Autocomplete for Natal Chart Form
 * Handles location search and selection with enhanced debouncing
 */

class NatalChartLocationAutocomplete {
    constructor() {
        this.searchInput = null;
        this.resultsContainer = null;
        this.selectedLocation = null;
        this.searchTimeout = null;
        this.isSearching = false;
        this.lastQuery = '';
        this.debounceDelay = 400; // Increased debounce delay for better performance
        this.minQueryLength = 2;
        
        this.init();
    }

    init() {
        this.searchInput = document.getElementById('natal_chart_location_search');
        this.resultsContainer = document.getElementById('natal-chart-location-results');
        
        // Validate that both required elements exist
        if (!this.searchInput) {
            return;
        }
        
        if (!this.resultsContainer) {
            return;
        }
        
        this.bindEvents();
    }

    bindEvents() {
        // Search input events with enhanced debouncing
        this.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        this.searchInput.addEventListener('focus', () => this.handleSearchFocus());
        this.searchInput.addEventListener('blur', () => this.handleSearchBlur());
        this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
        
        // Click outside to close results
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        
        // Add form validation events
        this.bindFormValidationEvents();
    }

    // Enhanced debounce function
    debounce(func, delay) {
        return (...args) => {
            // Clear previous timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            // Set new timeout
            this.searchTimeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Debounced search function - fixed method definition
    debouncedSearch(query) {
        if (query.length >= this.minQueryLength) {
            this.searchLocations(query);
        } else {
            this.hideResultsContainer();
        }
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
            this.hideResultsContainer();
            this.removeSearchStates();
            return;
        }
        
        // Don't search if query is too short
        if (query.length < this.minQueryLength) {
            this.hideResultsContainer();
            this.removeSearchStates();
            return;
        }
        
        // Don't search if query hasn't changed
        if (query === this.lastQuery) {
            return;
        }
        
        // Update last query
        this.lastQuery = query;
        
        // Show debouncing state
        this.showDebouncingState();
        
        // Use debounced search with timeout
        this.searchTimeout = setTimeout(() => {
            this.debouncedSearch(query);
        }, this.debounceDelay);
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
        if (this.isSearching) {
            return;
        }
        
        // Rate limiting: don't search if we just searched for this query
        if (this.lastQuery === query && this.isSearching) {
            return;
        }
        
        // Check if natal_chart_ajax is available
        if (!window.natal_chart_ajax || !natal_chart_ajax.ajax_url) {
            this.showError('Search functionality not available');
            return;
        }
        
        this.isSearching = true;
        this.showSearchingState();
        
        try {
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
            
            const data = await response.json();
            
            if (data.success) {
                if (data.data && data.data.results) {
                    this.displayResults(data.data.results);
                } else {
                    this.showNoResults();
                }
            } else {
                const errorMessage = data.data && data.data.message ? data.data.message : 'Search failed';
                this.showError(errorMessage);
            }
        } catch (error) {
            this.showError('Search failed. Please try again.');
        } finally {
            this.isSearching = false;
        }
    }

    showSearchingState() {
        if (!this.resultsContainer) return;
        
        // Get strings with fallbacks
        const searchingText = (window.natal_chart_ajax && natal_chart_ajax.strings && natal_chart_ajax.strings.searching) 
            ? natal_chart_ajax.strings.searching 
            : 'Searching...';
        
        this.resultsContainer.innerHTML = `
            <div class="natal-chart-location-loading">
                <span class="natal-chart-spinner"></span>
                <span class="natal-chart-loading-text">${searchingText}</span>
            </div>
        `;
        this.showResultsContainer();
    }

    // Show debouncing state
    showDebouncingState() {
        if (this.searchInput) {
            this.searchInput.classList.add('debouncing');
            this.searchInput.classList.remove('searching');
        }
    }

    // Remove all search states
    removeSearchStates() {
        if (this.searchInput) {
            this.searchInput.classList.remove('debouncing', 'searching');
        }
    }

    // Add method to cancel ongoing searches
    cancelSearch() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
        this.isSearching = false;
    }

    // Add method to reset search state
    resetSearchState() {
        this.lastQuery = '';
        this.cancelSearch();
        this.hideResultsContainer();
    }

    displayResults(locations) {
        // Ensure locations is an array
        if (!locations) {
            this.showNoResults();
            return;
        }
        
        if (!Array.isArray(locations)) {
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
            this.showError('Error processing location results');
        }
    }

    showNoResults() {
        const noResultsText = (window.natal_chart_ajax && natal_chart_ajax.strings && natal_chart_ajax.strings.no_results) 
            ? natal_chart_ajax.strings.no_results 
            : 'No results found';
            
        this.resultsContainer.innerHTML = `
            <div class="natal-chart-location-no-results">
                <div class="natal-chart-location-no-results-message">${noResultsText}</div>
            </div>
        `;
        this.showResultsContainer();
    }

    showError(message) {
        const errorText = message || 
            ((window.natal_chart_ajax && natal_chart_ajax.strings && natal_chart_ajax.strings.error) 
                ? natal_chart_ajax.strings.error 
                : 'An error occurred');
                
        this.resultsContainer.innerHTML = `
            <div class="natal-chart-location-error">
                <div class="natal-chart-location-error-message">${this.escapeHtml(errorText)}</div>
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
        
        // Populate form fields
        this.populateFormFields(locationData);
        
        // Update UI
        this.searchInput.value = locationData.label;
        this.searchInput.classList.add('natal-chart-location-selected');
        this.hideResultsContainer();
        
        // Use the simple enableSubmitButton function
        if (typeof window.enableSubmitButton === 'function') {
            window.enableSubmitButton();
        } else {
            // Fallback to main form handler
            if (window.natalChartForm && typeof window.natalChartForm.updateSubmitButton === 'function') {
                try {
                    window.natalChartForm.updateSubmitButton();
                } catch (error) {
                    // Silent error handling
                }
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
        
        if (offsetRound !== undefined && offsetRound !== null) {
            // Convert to number and preserve exact decimal places
            const offsetValue = parseFloat(offsetRound);
            
            if (!isNaN(offsetValue)) {
                // Set the value directly without formatting
                document.getElementById('natal_chart_offset_round').value = offsetValue;
                
                // Force the display to show the exact value
                const inputField = document.getElementById('natal_chart_offset_round');
                inputField.setAttribute('value', offsetValue);
                inputField.value = offsetValue;
            } else {
                document.getElementById('natal_chart_offset_round').value = '';
            }
        } else {
            document.getElementById('natal_chart_offset_round').value = '';
        }
    }

    clearSelection() {
        this.selectedLocation = null;
        this.searchInput.classList.remove('natal-chart-location-selected');
        this.removeSearchStates();
        
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
            window.enableSubmitButton();
        } else {
            // Fallback to main form handler
            if (window.natalChartForm && typeof window.natalChartForm.updateSubmitButton === 'function') {
                try {
                    window.natalChartForm.updateSubmitButton();
                } catch (error) {
                    // Silent error handling
                }
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

    
    const searchInput = document.getElementById('natal_chart_location_search');
    const resultsContainer = document.getElementById('natal-chart-location-results');
    
    if (searchInput && resultsContainer) {

        
        // Check if already initialized
        if (window.natalChartLocationAutocomplete) {

            return true;
        }
        
        try {
            window.natalChartLocationAutocomplete = new NatalChartLocationAutocomplete();

            return true;
        } catch (error) {

            return false;
        }
    } else {

        return false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Try to initialize immediately
    if (!initializeLocationAutocomplete()) {
        // If elements not found, start polling
        const autocompleteCheckInterval = setInterval(() => {
            if (initializeLocationAutocomplete()) {
                clearInterval(autocompleteCheckInterval);
            }
        }, 500); // Check every 500ms
        
        // Stop polling after 10 seconds
        setTimeout(() => {
            clearInterval(autocompleteCheckInterval);
        }, 10000);
    }
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM still loading, waiting for DOMContentLoaded...
} else {
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
}

// Global function to test autocomplete functionality
window.testLocationAutocomplete = function() {
    // Check if elements exist
    const searchInput = document.getElementById('natal_chart_location_search');
    const resultsContainer = document.getElementById('natal_chart-location-results');
    
    // Check if autocomplete is initialized
    if (window.natalChartLocationAutocomplete) {
        // Autocomplete is available
    }
    
    // Check if natal_chart_ajax is available
    if (window.natal_chart_ajax) {
        // AJAX is available
    }
    
    // Test event binding
    if (searchInput) {
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
};

// Also expose the initialization function globally for manual testing
window.initializeLocationAutocomplete = initializeLocationAutocomplete;
