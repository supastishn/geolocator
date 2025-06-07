<script>
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Geobot - AI Location Identification</title>
  <meta name="description" content="Identify locations using AI and satellite imagery" />
</svelte:head>

<!-- Enhanced hero section -->
<div class="hero">
  <div class="hero-content">
    <h1>
      <span class="emoji">🌍</span> GeoBot
      <div class="gradient-text">AI-Powered Location Identification</div>
    </h1>
    <p class="hero-subtitle">Upload any landscape photo and instantly identify its location using satellite imagery and advanced AI</p>
    <div class="cta-buttons">
      <a href="{base}/app" class="cta-button">Try It Now</a>
      <a href="#how-it-works" class="secondary-button">How It Works</a>
    </div>
  </div>
</div>

<section class="how-it-works" id="how-it-works">
  <h2>How Geobot Works</h2>
  <div class="steps">
    <div class="step">
      <div class="step-number">1</div>
      <h3>Upload an Image</h3>
      <p>Provide any landscape or location photo from your camera roll.</p>
    </div>
    <div class="step">
      <div class="step-number">2</div>
      <h3>AI Analysis</h3>
      <p>Our powerful AI analyzes geographical features in the image.</p>
    </div>
    <div class="step">
      <div class="step-number">3</div>
      <h3>Location Found</h3>
      <p>Get precise coordinates and location details on an interactive map.</p>
    </div>
  </div>
</section>

<section class="features">
  <h2>Powered By Cutting-Edge Technology</h2>
  <div class="tech-grid">
    <div class="tech-card">
      <div class="tech-icon">🤖</div>
      <h3>AI Vision</h3>
      <p>Advanced computer vision algorithms identify land features and terrain patterns.</p>
    </div>
    <div class="tech-card">
      <div class="tech-icon">🌐</div>
      <h3>Satellite Integration</h3>
      <p>Compare with satellite imagery for precise location verification.</p>
    </div>
    <div class="tech-card">
      <div class="tech-icon">🗺️</div>
      <h3>Mapping Technology</h3>
      <p>Interactive maps display identified locations with pinpoint accuracy.</p>
    </div>
  </div>
</section>

<div class="call-to-action">
  <h2>Ready to uncover the world?</h2>
  <p>Join thousands of users discovering new places with Geobot</p>
  <a href="{base}/app" class="cta-button large">Get Started Free</a>
</div>

<style>
  .hero {
    background: var(--hero-gradient);
    color: white;
    text-align: center;
    padding: 6rem 1rem 8rem;
    position: relative;
    overflow: hidden;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .hero h1 {
    font-size: 3.2rem;
    margin-bottom: 1.5rem;
    font-weight: 800;
    letter-spacing: -1px;
  }

  .gradient-text {
    background: var(--cta-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 4rem;
    line-height: 1;
    margin-top: 0.5rem;
    font-weight: 800;
  }

  /* Make hero text lighter in light mode */
  :global([data-theme="light"]) .hero h1,
  :global([data-theme="light"]) .hero p,
  :global([data-theme="light"]) .hero .gradient-text {
    color: rgba(255, 255, 255, 0.9) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    font-size: 1.5rem;
    max-width: 42rem;
    margin: 0 auto 2.5rem;
    line-height: 1.6;
    opacity: 0.95;
  }

  .emoji {
    font-size: 3rem;
    vertical-align: middle;
    margin-right: 0.5rem;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .cta-button {
    background: white;
    color: #4361ee;
    border: none;
    padding: 1rem 2.5rem;
    border-radius: var(--border-radius);
    font-weight: 600;
    font-size: 1.1rem;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-lg);
    display: inline-block;
    letter-spacing: 0.5px;
  }

  .cta-button.large {
    padding: 1.2rem 3rem;
    font-size: 1.2rem;
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  .secondary-button {
    background: transparent;
    color: white;
    border: 2px solid white;
    padding: 1rem 2.5rem;
    border-radius: var(--border-radius);
    font-weight: 600;
    font-size: 1.1rem;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-block;
    letter-spacing: 0.5px;
  }

  .secondary-button:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
  }

  section {
    padding: 6rem 2rem;
  }

  .how-it-works {
    background: var(--color-bg-1);
    text-align: center;
  }

  .how-it-works h2 {
    font-size: 2.5rem;
    margin-bottom: 3.5rem;
    color: var(--color-text);
    font-weight: 700;
    position: relative;
  }

  .how-it-works h2:after {
    content: '';
    display: block;
    width: 100px;
    height: 4px;
    background: var(--color-primary);
    margin: 1.2rem auto 0;
    border-radius: 2px;
  }

  .steps {
    display: flex;
    gap: 2.5rem;
    max-width: 1200px;
    margin: 0 auto;
    justify-content: center;
    flex-wrap: wrap;
  }

  .step {
    position: relative;
    overflow: hidden;
    flex: 1;
    min-width: 300px;
    background: rgba(var(--color-surface-rgb), 0.7);
    padding: 2.5rem 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
  }

  .step:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  }

  .step:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
  }

  .step-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--color-primary);
    margin-bottom: 1.5rem;
  }

  .step h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .step p {
    color: var(--color-text-secondary);
    line-height: 1.7;
  }

  .features {
    background: var(--color-surface);
    text-align: center;
  }

  .features h2 {
    font-size: 2.5rem;
    margin-bottom: 3.5rem;
    color: var(--color-text);
    font-weight: 700;
  }

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .tech-card {
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    background: var(--color-surface);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    padding: 2.5rem;
  }

  .tech-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  .tech-icon {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
  }

  .tech-card h3 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .tech-card p {
    color: var(--color-text-secondary);
    line-height: 1.7;
  }

  .call-to-action {
    background: var(--cta-gradient);
    color: white;
    text-align: center;
    padding: 6rem 2rem;
  }

  .call-to-action h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .call-to-action p {
    font-size: 1.2rem;
    max-width: 600px;
    margin: 0 auto 2.5rem;
    opacity: 0.9;
    color: var(--color-text);
  }

  @media (max-width: 768px) {
    .hero {
      padding: 4rem 1.5rem 6rem;
    }
    
    .hero h1 {
      font-size: 2.5rem;
    }
    
    .hero p {
      font-size: 1.2rem;
    }
    
    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }
    
    .step {
      min-width: 100%;
    }
  }
:global(:root) {
  --color-surface-rgb: 255, 255, 255;
  --color-bg-1-rgb: 248, 250, 252;
  --hero-gradient: linear-gradient(130deg, #0066a7, #5d7cff);
  --cta-gradient: var(--color-primary);
}
:global([data-theme="light"]) {
  --color-surface-rgb: 255, 255, 255;
  --color-bg-1-rgb: 248, 250, 252;
  --hero-gradient: linear-gradient(130deg, #0066a7, #5d7cff);
  --cta-gradient: var(--color-primary);
}
:global([data-theme="dark"]) {
  --color-surface-rgb: 30, 41, 59;
  --color-bg-1-rgb: 15, 23, 42;
  --hero-gradient: linear-gradient(130deg, #001f3f, #1e3b8a);
  --cta-gradient: linear-gradient(130deg, #3a0ca3, #4361ee);
}
</style>
