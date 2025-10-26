<script setup>
import { onMounted } from 'vue'
import Bheader from './components/Bheader.vue'
import RegistrationModal from './components/RegistrationModal.vue'
import { accessibilityService } from './services/accessibilityService'

// Initialize accessibility features when app mounts
onMounted(() => {
  // Add skip links
  accessibilityService.setupSkipLinks()
  
  // Announce page load
  accessibilityService.announce('Engage360 application loaded')
})
</script>

<template>
  <!-- Skip Links Container -->
  <div id="skip-links" role="region" aria-label="Skip navigation links">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <a href="#navigation" class="skip-link">Skip to navigation</a>
  </div>

  <div class="main-container">
    <!-- Header with proper ARIA landmark -->
    <header id="banner" role="banner" aria-label="Site header">
      <Bheader />
    </header>

    <!-- Navigation with proper ARIA landmark -->
    <nav id="navigation" role="navigation" aria-label="Main navigation">
      <!-- Navigation content will be here if needed -->
    </nav>

    <!-- Main content area with proper ARIA landmark -->
    <main id="main-content" role="main" aria-label="Main content" tabindex="-1">
      <!-- Route components render here -->
      <RouterView />
    </main>
    
    <!-- Registration Modal - Available on all pages -->
    <RegistrationModal />
    
    <!-- Footer with proper ARIA landmark -->
    <footer role="contentinfo" aria-label="Site footer">
      <!-- Footer content -->
    </footer>
    
    <!-- Accessibility Announcements -->
    <div id="accessibility-announcer" aria-live="polite" aria-atomic="true" class="sr-only"></div>
    <div id="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
    <div id="alerts" aria-live="assertive" aria-atomic="true" class="sr-only"></div>
    <div id="log" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  </div>
</template>

<style scoped>
.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

/* Ensure proper focus management */
.main-container:focus-within {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .main-container {
    border: 1px solid #000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
  .logo {
    margin: 0 2rem 0 0;
  }
  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
