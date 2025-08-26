=== Natal Chart Generator ===
Contributors: yourname
Tags: astrology, natal chart, birth chart, horoscope, api
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Generate personalized natal charts using external astrology API services with location autocomplete and beautiful form interface.

== Description ==

The Natal Chart Generator plugin allows users to generate personalized natal charts by entering their birth details. The plugin integrates with external astrology API services to provide accurate astrological calculations.

**Key Features:**

* **Location Autocomplete**: Search and select cities with automatic field population
* **Comprehensive Form**: Collect birth date, time, and location information
* **API Integration**: Seamless integration with astrology API services
* **Beautiful UI**: Modern, responsive design with smooth animations
* **Shortcode Support**: Easy embedding on any page or post
* **Admin Management**: Complete settings management and API configuration
* **Security**: Nonce verification and input sanitization
* **Rate Limiting**: Configurable API request limits
* **Error Handling**: Comprehensive error handling and user feedback

**How It Works:**

1. Users fill out a form with their birth details
2. Location search provides autocomplete functionality
3. Form data is validated and sent to the astrology API
4. Natal chart data is returned and displayed beautifully
5. Results can be printed, downloaded, or shared

**Perfect For:**

* Astrology websites
* Personal development sites
* Wellness and spirituality blogs
* Professional astrologers
* Educational institutions

== Installation ==

1. Upload the `natal-chart-plugin` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to 'Natal Chart' > 'Settings' in the admin menu
4. Configure your API bearer token and settings
5. Use the shortcode `[natal_chart_form]` on any page or post

== Frequently Asked Questions ==

= What is a natal chart? =

A natal chart (also called a birth chart) is an astrological chart that shows the positions of the planets at the exact time and location of a person's birth. It's used to understand personality traits, life patterns, and potential.

= Do I need an API key? =

Yes, you'll need a bearer token from an astrology API service. The plugin is configured to work with astrologycosmic.com, but you can modify the API endpoint in the settings.

= Can I customize the form appearance? =

Yes! The plugin includes extensive CSS classes and supports custom styling. You can also use shortcode attributes to customize titles, descriptions, and button text.

= Is the plugin mobile-friendly? =

Absolutely! The plugin is fully responsive and works perfectly on all devices including mobile phones and tablets.

= Can I limit how many charts users can generate? =

Yes, the plugin includes configurable rate limiting to prevent API abuse. You can set limits per hour per user.

= What happens if the API is down? =

The plugin includes comprehensive error handling and will display user-friendly error messages if the API service is unavailable.

= Can I export/import settings? =

Yes, the admin interface includes options to export and import plugin settings for easy migration between sites.

== Screenshots ==

1. Frontend form with location autocomplete
2. Admin settings page with API configuration
3. Natal chart results display
4. Mobile responsive design

== Changelog ==

= 1.0.0 =
* Initial release
* Location autocomplete functionality
* Natal chart generation
* Admin settings management
* Shortcode support
* Responsive design
* Security features

== Upgrade Notice ==

= 1.0.0 =
Initial release of the Natal Chart Generator plugin.

== Usage ==

**Basic Shortcode:**
```
[natal_chart_form]
```

**Customized Shortcode:**
```
[natal_chart_form title="Your Birth Chart" description="Enter your details to generate your natal chart" button_text="Generate Now"]
```

**Results Display:**
```
[natal_chart_results]
```

**Shortcode Attributes:**

* `title` - Custom form title
* `description` - Custom description text
* `button_text` - Custom submit button text
* `show_results` - Whether to show results (true/false)
* `form_id` - Custom form ID for styling
* `class` - Additional CSS classes
* `style` - Inline CSS styles

**Example Page Template:**
```php
<?php
/*
Template Name: Natal Chart Page
*/

get_header(); ?>

<div class="natal-chart-page">
    <h1>Generate Your Natal Chart</h1>
    <p>Discover your astrological profile by entering your birth details below.</p>
    
    <?php echo do_shortcode('[natal_chart_form]'); ?>
    
    <div class="natal-chart-info">
        <h2>About Natal Charts</h2>
        <p>A natal chart reveals the cosmic blueprint of your personality, strengths, and life path...</p>
    </div>
</div>

<?php get_footer(); ?>
```

**Custom Styling:**
```css
/* Custom form styling */
.natal-chart-form-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px;
    border-radius: 20px;
}

.natal-chart-form-title {
    color: white;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* Custom button styling */
.natal-chart-form-submit {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    border-radius: 25px;
    font-size: 1.2rem;
    padding: 18px 30px;
}
```

== API Configuration ==

The plugin requires configuration of the following API settings:

1. **Bearer Token**: Your authentication token from the astrology API service
2. **API Base URL**: The base URL for the API service (default: https://resource.astrologycosmic.com/public/api/v1)
3. **Rate Limiting**: Maximum API requests per hour per user
4. **Logging**: Enable/disable API request logging

**API Endpoints Used:**
- `GET /cities?name={query}` - Location search
- `POST /natal-chart/generate` - Natal chart generation

**Required Form Fields:**
- Full Name
- Birth Date
- Birth Time
- Birth Location (with coordinates and timezone)

== Security Features ==

* **Nonce Verification**: All forms include WordPress nonces
* **Input Sanitization**: All user input is properly sanitized
* **Capability Checks**: Admin functions require proper permissions
* **Rate Limiting**: Prevents API abuse
* **Error Sanitization**: API errors are sanitized before display

== Performance Features ==

* **Caching**: Location search results are cached for 1 hour
* **Lazy Loading**: Assets only load when needed
* **Minification**: CSS and JavaScript are optimized
* **Transients**: Uses WordPress transient API for caching

== Browser Support ==

* Chrome 80+
* Firefox 75+
* Safari 13+
* Edge 80+
* Mobile browsers (iOS Safari, Chrome Mobile)

== Accessibility ==

* **Keyboard Navigation**: Full keyboard support for location search
* **Screen Reader Support**: Proper ARIA labels and semantic HTML
* **High Contrast**: Supports high contrast mode
* **Reduced Motion**: Respects user motion preferences
* **Focus Management**: Clear focus indicators

== Support ==

For support, feature requests, or bug reports, please contact us:

* **Website**: [Your Website]
* **Email**: support@yourwebsite.com
* **Documentation**: [Documentation URL]

== Development ==

**GitHub Repository**: [Repository URL]

**Contributing**: We welcome contributions! Please see our contributing guidelines.

**Requirements for Development:**
* WordPress 5.0+
* PHP 7.4+
* MySQL 5.6+
* Modern web browser

**Building from Source:**
1. Clone the repository
2. Install dependencies: `npm install`
3. Build assets: `npm run build`
4. Activate the plugin in WordPress

== License ==

This plugin is licensed under the GPL v2 or later.

== Credits ==

* Built with WordPress
* Uses modern CSS Grid and Flexbox
* jQuery for enhanced functionality
* Font Awesome for icons (if used)

== Roadmap ==

**Future Versions:**
* Multiple chart types support
* User account integration
* Chart history and storage
* Advanced customization options
* Multi-language support
* WooCommerce integration
* Email marketing integration
* Social media sharing
* Calendar integration

---

Thank you for using the Natal Chart Generator plugin!
