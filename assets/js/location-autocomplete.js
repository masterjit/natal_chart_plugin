/**
 * Location Autocomplete for Natal Chart Plugin
 * 
 * Handles location search with debouncing and field auto-population
 */

(function($) {
    'use strict';
    
    class NatalChartLocationAutocomplete {
        constructor() {
            this.searchInput = null;
            this.resultsContainer = null;
            this.searchTimeout = null;
            this.isSearching = false;
            this.minSearchLength = 2;
            this.debounceDelay = 300;
            this.selectedLocation = null;
            
            this.init();
        }
        
        init() {
            this.bindEvents();
            this.setupFormValidation();
        }
        
        bindEvents() {
            // Location search input events
            $(document).on('input', '#natal_chart_location_search', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            // Location search input focus
            $(document).on('focus', '#natal_chart_location_search', (e) => {
                this.showResultsContainer();
            });
            
            // Location search input blur
            $(document).on('blur', '#natal_chart_location_search', (e) => {
                // Delay hiding to allow click on results
                setTimeout(() => {
                    this.hideResultsContainer();
                }, 200);
            });
            
            // Location result selection
            $(document).on('click', '.natal-chart-location-result', (e) => {
                e.preventDefault();
                this.selectLocation($(e.currentTarget).data('location'));
            });
            
            // Keyboard navigation
            $(document).on('keydown', '#natal_chart_location_search', (e) => {
                this.handleKeyboardNavigation(e);
            });
            
            // Clear location button
            $(document).on('click', '.natal-chart-clear-location', (e) => {
                e.preventDefault();
                this.clearLocation();
            });
            
            // Form submission
            $(document).on('submit', '#natal_chart_form', (e) => {
                if (!this.validateLocationSelection()) {
                    e.preventDefault();
                    return false;
                }
            });
        }
        
        handleSearchInput(query) {
            const trimmedQuery = query.trim();
            
            // Clear previous timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            // Clear results if query is too short
            if (trimmedQuery.length < this.minSearchLength) {
                this.clearResults();
                this.updateSubmitButton();
                return;
            }
            
            // Set new timeout for debounced search
            this.searchTimeout = setTimeout(() => {
                this.performSearch(trimmedQuery);
            }, this.debounceDelay);
        }
        
        performSearch(query) {
            if (this.isSearching) {
                return;
            }
            
            this.isSearching = true;
            this.showLoadingState();
            
            $.ajax({
                url: natal_chart_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'natal_chart_search_locations',
                    query: query,
                    nonce: natal_chart_ajax.nonce
                },
                success: (response) => {
                    this.handleSearchSuccess(response, query);
                },
                error: (xhr, status, error) => {
                    this.handleSearchError(error);
                },
                complete: () => {
                    this.isSearching = false;
                    this.hideLoadingState();
                }
            });
        }
        
        handleSearchSuccess(response, query) {
            if (response.success && response.data && response.data.results) {
                this.displayResults(response.data.results, query);
            } else {
                this.displayNoResults(query);
            }
        }
        
        handleSearchError(error) {
            console.error('Location search error:', error);
            this.displayError(natal_chart_ajax.strings.error);
        }
        
        displayResults(results, query) {
            if (!results || results.length === 0) {
                this.displayNoResults(query);
                return;
            }
            
            let html = '<div class="natal-chart-location-results-list">';
            
            results.forEach((location) => {
                html += `
                    <div class="natal-chart-location-result" data-location='${JSON.stringify(location)}'>
                        <div class="natal-chart-location-label">${this.escapeHtml(location.label)}</div>
                        <div class="natal-chart-location-details">
                            <span class="natal-chart-location-timezone">${this.escapeHtml(location.timezone)}</span>
                            ${location.population ? `<span class="natal-chart-location-population">${this.formatPopulation(location.population)}</span>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            
            this.resultsContainer.html(html);
            this.showResultsContainer();
        }
        
        displayNoResults(query) {
            const html = `
                <div class="natal-chart-location-no-results">
                    <div class="natal-chart-location-no-results-message">
                        ${natal_chart_ajax.strings.no_results}
                    </div>
                    <div class="natal-chart-location-no-results-query">
                        "${this.escapeHtml(query)}"
                    </div>
                </div>
            `;
            
            this.resultsContainer.html(html);
            this.showResultsContainer();
        }
        
        displayError(message) {
            const html = `
                <div class="natal-chart-location-error">
                    <div class="natal-chart-location-error-message">
                        ${this.escapeHtml(message)}
                    </div>
                </div>
            `;
            
            this.resultsContainer.html(html);
            this.showResultsContainer();
        }
        
        selectLocation(location) {
            this.selectedLocation = location;
            
            // Populate hidden fields
            $('#natal_chart_location').val(location.label);
            $('#natal_chart_latitude').val(location.latitude);
            $('#natal_chart_longitude').val(location.longitude);
            $('#natal_chart_timezone').val(location.timezone);
            $('#natal_chart_offset').val(location.offset);
            $('#natal_chart_offset_round').val(location.offset_round);
            
            // Update search input
            $('#natal_chart_location_search').val(location.label);
            
            // Add selected state styling
            $('#natal_chart_location_search').addClass('natal-chart-location-selected');
            
            // Show clear button
            this.showClearButton();
            
            // Hide results
            this.hideResultsContainer();
            
            // Update submit button state
            this.updateSubmitButton();
            
            // Clear any previous errors
            this.clearLocationError();
            
            // Trigger change event
            $('#natal_chart_location_search').trigger('change');
        }
        
        clearLocation() {
            this.selectedLocation = null;
            
            // Clear hidden fields
            $('#natal_chart_location').val('');
            $('#natal_chart_latitude').val('');
            $('#natal_chart_longitude').val('');
            $('#natal_chart_timezone').val('');
            $('#natal_chart_offset').val('');
            $('#natal_chart_offset_round').val('');
            
            // Clear search input
            $('#natal_chart_location_search').val('');
            
            // Remove selected state styling
            $('#natal_chart_location_search').removeClass('natal-chart-location-selected');
            
            // Hide clear button
            this.hideClearButton();
            
            // Update submit button state
            this.updateSubmitButton();
            
            // Clear results
            this.clearResults();
            
            // Focus on search input
            $('#natal_chart_location_search').focus();
        }
        
        showClearButton() {
            if ($('.natal-chart-clear-location').length === 0) {
                const clearButton = $(`
                    <button type="button" class="natal-chart-clear-location" title="${natal_chart_ajax.strings.clear_location || 'Clear location'}">
                        ×
                    </button>
                `);
                
                $('#natal_chart_location_search').after(clearButton);
            }
        }
        
        hideClearButton() {
            $('.natal-chart-clear-location').remove();
        }
        
        showResultsContainer() {
            if (this.resultsContainer && this.resultsContainer.children().length > 0) {
                this.resultsContainer.show();
            }
        }
        
        hideResultsContainer() {
            if (this.resultsContainer) {
                this.resultsContainer.hide();
            }
        }
        
        clearResults() {
            if (this.resultsContainer) {
                this.resultsContainer.empty().hide();
            }
        }
        
        showLoadingState() {
            if (this.resultsContainer) {
                const loadingHtml = `
                    <div class="natal-chart-location-loading">
                        <div class="natal-chart-spinner"></div>
                        <div class="natal-chart-loading-text">${natal_chart_ajax.strings.searching}</div>
                    </div>
                `;
                
                this.resultsContainer.html(loadingHtml).show();
            }
        }
        
        hideLoadingState() {
            // Loading state is handled by success/error callbacks
        }
        
        handleKeyboardNavigation(e) {
            const results = $('.natal-chart-location-result');
            const currentIndex = results.index('.natal-chart-location-result.selected');
            
            switch (e.keyCode) {
                case 38: // Up arrow
                    e.preventDefault();
                    this.navigateResults(results, currentIndex, -1);
                    break;
                    
                case 40: // Down arrow
                    e.preventDefault();
                    this.navigateResults(results, currentIndex, 1);
                    break;
                    
                case 13: // Enter
                    e.preventDefault();
                    if (results.filter('.selected').length > 0) {
                        const locationData = results.filter('.selected').data('location');
                        this.selectLocation(locationData);
                    }
                    break;
                    
                case 27: // Escape
                    this.hideResultsContainer();
                    $('#natal_chart_location_search').blur();
                    break;
            }
        }
        
        navigateResults(results, currentIndex, direction) {
            if (results.length === 0) return;
            
            results.removeClass('selected');
            
            let newIndex = currentIndex + direction;
            
            if (newIndex < 0) {
                newIndex = results.length - 1;
            } else if (newIndex >= results.length) {
                newIndex = 0;
            }
            
            results.eq(newIndex).addClass('selected');
            
            // Scroll into view if needed
            const selectedResult = results.eq(newIndex);
            if (selectedResult.length > 0) {
                selectedResult[0].scrollIntoView({ block: 'nearest' });
            }
        }
        
        validateLocationSelection() {
            if (!this.selectedLocation) {
                this.showLocationError(natal_chart_ajax.strings.required_field);
                return false;
            }
            
            return true;
        }
        
        showLocationError(message) {
            this.clearLocationError();
            
            const errorHtml = `<div class="natal-chart-form-error">${this.escapeHtml(message)}</div>`;
            $('#natal_chart_location_search_error').html(errorHtml);
            
            // Scroll to error
            $('#natal_chart_location_search_error')[0].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        
        clearLocationError() {
            $('#natal_chart_location_search_error').empty();
        }
        
        updateSubmitButton() {
            const submitButton = $('#natal_chart_submit');
            const hasLocation = this.selectedLocation !== null;
            
            if (hasLocation) {
                submitButton.prop('disabled', false);
            } else {
                submitButton.prop('disabled', true);
            }
        }
        
        setupFormValidation() {
            // Initialize submit button as disabled
            this.updateSubmitButton();
            
            // Get references to DOM elements
            this.searchInput = $('#natal_chart_location_search');
            this.resultsContainer = $('#natal_chart_location_results');
        }
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        formatPopulation(population) {
            if (population >= 1000000) {
                return (population / 1000000).toFixed(1) + 'M';
            } else if (population >= 1000) {
                return (population / 1000).toFixed(1) + 'K';
            }
            return population.toString();
        }
    }
    
    // Initialize when document is ready
    $(document).ready(function() {
        new NatalChartLocationAutocomplete();
    });
    
})(jQuery);
