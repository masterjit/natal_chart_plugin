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
        this.resultsContainer = document.getElementById('natal_chart_location_results');
        
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
                this.displayResults(data.data);
            } else {
                this.showError(data.data.message || natal_chart_ajax.strings.error);
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
        if (!locations || locations.length === 0) {
            this.showNoResults();
            return;
        }
        
        const resultsHTML = locations.map(location => `
            <div class="natal-chart-location-result" data-location='${JSON.stringify(location)}'>
                <div class="city-name">${this.escapeHtml(location.label)}</div>
                <div class="city-details">
                    ${location.country ? location.country : ''}
                    ${location.timezone ? ` • ${location.timezone}` : ''}
                    ${location.population ? ` • Pop: ${this.formatNumber(location.population)}` : ''}
                </div>
            </div>
        `).join('');
        
        this.resultsContainer.innerHTML = resultsHTML;
        this.showResultsContainer();
        this.bindResultEvents();
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
        
        // Populate form fields
        this.populateFormFields(locationData);
        
        // Update UI
        this.searchInput.value = locationData.label;
        this.searchInput.classList.add('natal-chart-location-selected');
        this.hideResultsContainer();
        
        // Trigger form validation update
        this.updateSubmitButton();
        this.clearLocationError();
        
        // Trigger change event for form validation
        this.searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    populateFormFields(location) {
        // Populate hidden fields
        document.getElementById('natal_chart_location').value = location.label;
        document.getElementById('natal_chart_latitude').value = location.latitude || '';
        document.getElementById('natal_chart_longitude').value = location.longitude || '';
        document.getElementById('natal_chart_timezone').value = location.timezone || '';
        document.getElementById('natal_chart_offset').value = location.offset || '';
        document.getElementById('natal_chart_offset_round').value = location.offset_round || '';
    }

    clearSelection() {
        this.selectedLocation = null;
        this.searchInput.classList.remove('natal-chart-location-selected');
        
        // Clear all location-related fields
        document.getElementById('natal_chart_location').value = '';
        document.getElementById('natal_chart_latitude').value = '';
        document.getElementById('natal_chart_longitude').value = '';
        document.getElementById('natal_chart_timezone').value = '';
        document.getElementById('natal_chart_offset').value = '';
        document.getElementById('natal_chart_offset_round').value = '';
        
        this.hideResultsContainer();
        this.updateSubmitButton();
    }

    updateSubmitButton() {
        const submitButton = document.getElementById('natal_chart_submit');
        if (submitButton) {
            const isFormValid = this.isFormValid();
            submitButton.disabled = !isFormValid;
        }
    }

    isFormValid() {
        const requiredFields = [
            'natal_chart_name',
            'natal_chart_birth_date',
            'natal_chart_birth_time'
        ];
        
        // Check if location is selected
        if (!this.selectedLocation) {
            return false;
        }
        
        // Check other required fields
        return requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim() !== '';
        });
    }

    clearLocationError() {
        const errorElement = document.getElementById('natal_chart_location_search_error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    showResultsContainer() {
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'block';
        }
    }

    hideResultsContainer() {
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'none';
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NatalChartLocationAutocomplete();
});
