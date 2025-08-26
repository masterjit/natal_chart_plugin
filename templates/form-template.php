<?php
/**
 * Template for testing the complete natal chart flow
 * This demonstrates both the form and results shortcodes working together
 */

get_header(); ?>

<div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
    <h1 style="text-align: center; margin-bottom: 40px; color: #333;">
        Natal Chart Generator - Complete Demo
    </h1>
    
    <div class="natal-chart-demo-container">
        <!-- Form Section -->
        <div class="natal-chart-form-section">
            <h2 style="margin-bottom: 20px; color: #555;">Step 1: Enter Your Birth Details</h2>
            <?php echo do_shortcode('[natal_chart_form]'); ?>
        </div>
        
        <!-- Results Section -->
        <div class="natal-chart-results-section" style="margin-top: 40px;">
            <h2 style="margin-bottom: 20px; color: #555;">Step 2: Your Natal Chart Results</h2>
            <?php echo do_shortcode('[natal_chart_results]'); ?>
        </div>
    </div>
    
    <div class="natal-chart-instructions" style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="color: #333; margin-bottom: 15px;">How It Works:</h3>
        <ol style="color: #555; line-height: 1.6;">
            <li><strong>Fill out the form</strong> - Enter your name, birth date, birth time, and select your birth location</li>
            <li><strong>Click "Generate Report"</strong> - The button will only be enabled when all fields are filled</li>
            <li><strong>View results instantly</strong> - Results appear below without refreshing the page</li>
            <li><strong>Use action buttons</strong> - Print, download, or generate a new chart</li>
        </ol>
        
        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 6px; border-left: 4px solid #2196f3;">
            <strong>Note:</strong> The results will appear in the [natal_chart_results] shortcode below the form. 
            You can place this shortcode anywhere on your page and it will automatically update when a new chart is generated.
        </div>
    </div>
</div>

<style>
.natal-chart-demo-container {
    display: grid;
    gap: 30px;
}

.natal-chart-form-section,
.natal-chart-results-section {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .natal-chart-form-section,
    .natal-chart-results-section {
        padding: 20px;
    }
}
</style>

<?php get_footer(); ?>
