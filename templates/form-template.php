<?php
/**
 * Natal Chart Form Template
 * 
 * Example template for displaying the natal chart form
 * Copy this file to your theme directory and customize as needed
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

get_header(); ?>

<div class="natal-chart-page">
    <div class="natal-chart-hero">
        <div class="container">
            <h1 class="natal-chart-hero-title">Discover Your Astrological Blueprint</h1>
            <p class="natal-chart-hero-description">
                Generate your personalized natal chart to uncover the cosmic influences that shape your personality, 
                strengths, and life path. Enter your birth details below to begin your astrological journey.
            </p>
        </div>
    </div>

    <div class="container">
        <div class="natal-chart-content">
            <!-- Main Form -->
            <div class="natal-chart-form-section">
                <?php echo do_shortcode('[natal_chart_form]'); ?>
            </div>

            <!-- Information Section -->
            <div class="natal-chart-info-section">
                <div class="natal-chart-info-grid">
                    <div class="natal-chart-info-card">
                        <div class="natal-chart-info-icon">🌟</div>
                        <h3>What is a Natal Chart?</h3>
                        <p>
                            A natal chart, also called a birth chart, is a snapshot of the sky at the exact moment 
                            of your birth. It reveals the positions of the Sun, Moon, and planets in relation to the 
                            zodiac signs and houses.
                        </p>
                    </div>

                    <div class="natal-chart-info-card">
                        <div class="natal-chart-info-icon">🔮</div>
                        <h3>How It Works</h3>
                        <p>
                            By analyzing the planetary positions and their relationships, astrologers can interpret 
                            your personality traits, life patterns, strengths, challenges, and potential.
                        </p>
                    </div>

                    <div class="natal-chart-info-card">
                        <div class="natal-chart-info-icon">📊</div>
                        <h3>What You'll Learn</h3>
                        <p>
                            Discover your Sun sign, Moon sign, rising sign, planetary placements, and how they 
                            influence your character, relationships, career, and life purpose.
                        </p>
                    </div>
                </div>
            </div>

            <!-- FAQ Section -->
            <div class="natal-chart-faq-section">
                <h2>Frequently Asked Questions</h2>
                
                <div class="natal-chart-faq-list">
                    <div class="natal-chart-faq-item">
                        <h3>What information do I need?</h3>
                        <p>
                            You'll need your exact birth date, birth time (as precise as possible), and birth location. 
                            The more accurate this information is, the more precise your natal chart will be.
                        </p>
                    </div>

                    <div class="natal-chart-faq-item">
                        <h3>How accurate does my birth time need to be?</h3>
                        <p>
                            Birth time accuracy is crucial for determining your rising sign and house placements. 
                            Even a few minutes difference can significantly impact these calculations.
                        </p>
                    </div>

                    <div class="natal-chart-faq-item">
                        <h3>What if I don't know my exact birth time?</h3>
                        <p>
                            If you don't know your exact birth time, you can still generate a chart, but some 
                            elements like your rising sign and house placements may not be accurate.
                        </p>
                    </div>

                    <div class="natal-chart-faq-item">
                        <h3>Can I generate charts for other people?</h3>
                        <p>
                            Yes, you can generate natal charts for anyone as long as you have their birth information. 
                            This is useful for family members, friends, or clients.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="natal-chart-cta">
                <h2>Ready to Discover Your Cosmic Blueprint?</h2>
                <p>
                    Your natal chart is waiting to reveal the secrets of your soul. 
                    Enter your birth details above and unlock the mysteries of your astrological profile.
                </p>
                <a href="#natal-chart-form-container" class="natal-chart-cta-button">Generate Your Chart Now</a>
            </div>
        </div>
    </div>
</div>

<style>
/* Custom styling for the natal chart page */
.natal-chart-page {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
}

.natal-chart-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
    margin-bottom: 60px;
}

.natal-chart-hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin: 0 0 20px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.natal-chart-hero-description {
    font-size: 1.3rem;
    margin: 0;
    opacity: 0.9;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.natal-chart-content {
    padding-bottom: 80px;
}

.natal-chart-form-section {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    margin-bottom: 60px;
    overflow: hidden;
}

.natal-chart-info-section {
    margin-bottom: 60px;
}

.natal-chart-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.natal-chart-info-card {
    background: white;
    padding: 40px 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.natal-chart-info-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.natal-chart-info-icon {
    font-size: 3rem;
    margin-bottom: 20px;
    display: block;
}

.natal-chart-info-card h3 {
    color: #2d3748;
    font-size: 1.4rem;
    margin: 0 0 15px 0;
    font-weight: 600;
}

.natal-chart-info-card p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
}

.natal-chart-faq-section {
    background: white;
    padding: 60px 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    margin-bottom: 60px;
}

.natal-chart-faq-section h2 {
    text-align: center;
    color: #2d3748;
    font-size: 2.5rem;
    margin: 0 0 40px 0;
    font-weight: 700;
}

.natal-chart-faq-list {
    max-width: 800px;
    margin: 0 auto;
}

.natal-chart-faq-item {
    margin-bottom: 30px;
    padding-bottom: 30px;
    border-bottom: 1px solid #e2e8f0;
}

.natal-chart-faq-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.natal-chart-faq-item h3 {
    color: #2d3748;
    font-size: 1.3rem;
    margin: 0 0 15px 0;
    font-weight: 600;
}

.natal-chart-faq-item p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
}

.natal-chart-cta {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    text-align: center;
    padding: 60px 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(72, 187, 120, 0.3);
}

.natal-chart-cta h2 {
    font-size: 2.5rem;
    margin: 0 0 20px 0;
    font-weight: 700;
}

.natal-chart-cta p {
    font-size: 1.2rem;
    margin: 0 0 30px 0;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto 30px auto;
    line-height: 1.6;
}

.natal-chart-cta-button {
    display: inline-block;
    background: white;
    color: #38a169;
    padding: 18px 36px;
    border-radius: 50px;
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.natal-chart-cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    color: #38a169;
}

/* Responsive Design */
@media (max-width: 768px) {
    .natal-chart-hero {
        padding: 60px 0;
        margin-bottom: 40px;
    }
    
    .natal-chart-hero-title {
        font-size: 2.5rem;
    }
    
    .natal-chart-hero-description {
        font-size: 1.1rem;
        padding: 0 20px;
    }
    
    .natal-chart-info-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .natal-chart-info-card {
        padding: 30px 20px;
    }
    
    .natal-chart-faq-section {
        padding: 40px 20px;
    }
    
    .natal-chart-faq-section h2 {
        font-size: 2rem;
    }
    
    .natal-chart-cta {
        padding: 40px 20px;
    }
    
    .natal-chart-cta h2 {
        font-size: 2rem;
    }
    
    .natal-chart-cta p {
        font-size: 1.1rem;
        padding: 0 20px;
    }
}

@media (max-width: 480px) {
    .natal-chart-hero-title {
        font-size: 2rem;
    }
    
    .natal-chart-hero-description {
        font-size: 1rem;
    }
    
    .natal-chart-info-card {
        padding: 25px 15px;
    }
    
    .natal-chart-faq-section h2 {
        font-size: 1.8rem;
    }
    
    .natal-chart-cta h2 {
        font-size: 1.8rem;
    }
}
</style>

<script>
// Smooth scroll to form when CTA button is clicked
document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.natal-chart-cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const formContainer = document.getElementById('natal-chart-form-container');
            if (formContainer) {
                formContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
});
</script>

<?php get_footer(); ?>
