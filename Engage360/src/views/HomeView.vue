<template>
  <div class="home">

    <!-- Hero -->
    <section class="hero-section position-relative overflow-hidden">
      <div class="hero-bg"></div>

      <div class="container position-relative py-5 py-lg-6 text-center">
        <h1 class="display-5 fw-bold text-white mb-3 lh-tight">
          Empowering Communities
          <span class="d-block text-gradient">Through Sport</span>
        </h1>

        <p class="lead text-white-50 mb-4 mx-auto hero-sub">
          Join Melbourne's leading not-for-profit organization dedicated to bringing health,
          connection, and opportunity to marginalized communities through inclusive sports programs.
        </p>

        <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <RouterLink to="/programs" class="btn btn-lg btn-light text-primary shadow-hero">
            View Programs <span class="ms-2">→</span>
          </RouterLink>
          <RouterLink to="/form" class="btn btn-lg btn-outline-light">
            Join Our Community
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="py-5 bg-muted">
      <div class="container">
        <div class="row g-4 text-center">
          <div v-for="(s, i) in stats" :key="i" class="col-6 col-md-3">
            <div class="fs-2 fw-bold text-primary mb-1">{{ s.number }}</div>
            <div class="text-muted">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why We Matter -->
    <section id="why" class="py-5">
      <div class="container">
        <div class="text-center mb-4 mb-md-5">
          <h2 class="fw-bold mb-2 fs-2">Why Sports Matter for Our Community</h2>
          <p class="lead text-muted mx-auto" style="max-width: 48rem;">
            We believe that sport is a powerful tool for building stronger, healthier, and more
            connected communities. Here's how we make a difference.
          </p>
        </div>

        <div class="row g-4">
          <div
            v-for="(f, i) in features"
            :key="i"
            class="col-12 col-md-6 col-lg-3"
          >
            <article class="card border-0 gradient-card h-100 p-4 text-center hover-card">
              <div class="icon-circle mx-auto mb-3">
                <span aria-hidden="true" class="icon-emoji">{{ f.icon }}</span>
              </div>
              <h3 class="h5 fw-semibold mb-2">{{ f.title }}</h3>
              <p class="text-muted mb-0">{{ f.description }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- How We Help -->
    <section class="py-5 bg-muted">
      <div class="container">
        <div class="row g-5 align-items-center">
          <div class="col-lg-7">
            <h2 class="fw-bold mb-3 fs-2">How We Help Your Journey</h2>

            <div class="d-flex align-items-start gap-3 mb-4">
              <div class="dot dot-primary mt-1"></div>
              <div>
                <h3 class="h6 fw-semibold mb-1">Free Assessment &amp; Guidance</h3>
                <p class="text-muted mb-0">
                  We start with understanding your needs, fitness level, and goals to recommend the perfect programs for you.
                </p>
              </div>
            </div>

            <div class="d-flex align-items-start gap-3 mb-4">
              <div class="dot dot-secondary mt-1"></div>
              <div>
                <h3 class="h6 fw-semibold mb-1">Flexible &amp; Affordable Programs</h3>
                <p class="text-muted mb-0">
                  Our programs fit your schedule and budget, with scholarships available for those who need them.
                </p>
              </div>
            </div>

            <div class="d-flex align-items-start gap-3">
              <div class="dot dot-accent mt-1"></div>
              <div>
                <h3 class="h6 fw-semibold mb-1">Ongoing Support &amp; Community</h3>
                <p class="text-muted mb-0">
                  Join a welcoming community with ongoing support from trained volunteers and health professionals.
                </p>
              </div>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="p-4 p-md-5 rounded-4 shadow-card bg-gradient-card h-100">
              <h3 class="h4 fw-bold mb-2">Start Your Journey Today</h3>
              <p class="text-muted mb-4">
                Registration takes just 5 minutes, and our team will contact you within 24 hours to discuss the best programs for your needs.
              </p>
              <RouterLink to="/programs" class="btn btn-primary w-100">
                View Programs <span class="ms-2">→</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-5 bg-gradient-hero text-center text-white">
      <div class="container">
        <h2 class="fw-bold mb-3 fs-2">Ready to Join Our Community?</h2>
        <p class="lead text-white-75 mb-4">
          Take the first step towards better health, new friendships, and a stronger community.
        </p>
        <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <RouterLink to="/programs" class="btn btn-lg btn-light text-primary">View Programs</RouterLink>
          <RouterLink to="/form" class="btn btn-lg btn-outline-light">Register Today</RouterLink>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'

/**
 * NOTE: no external UI libs used.
 * Icons are emoji for portability (swap for SVGs or lucide-vue if desired).
 */

const features = ref([
  {
    icon: '👥',
    title: 'Inclusive Community',
    description:
      'Supporting migrants, low-income families, and older adults through accessible sports programs.'
  },
  {
    icon: '❤️',
    title: 'Health & Wellbeing',
    description:
      'Promoting physical activity and mental health through engaging community sports activities.'
  },
  {
    icon: '🎯',
    title: 'Easy Access',
    description:
      'Simple registration process and affordable programs designed for everyone to participate.'
  },
  {
    icon: '🏆',
    title: 'Expert Support',
    description:
      'Trained volunteers and health workers dedicated to creating safe, supportive environments.'
  }
])

const stats = ref([
  { number: '2,500+', label: 'Community Members' },
  { number: '150+', label: 'Volunteers' },
  { number: '25+', label: 'Programs' },
  { number: '8', label: 'Years Serving' }
])
</script>

<style scoped>
/* ---------- Tokens ---------- */
:root {
  --primary: #0d6efd;
  --muted-bg: #f6f9fc;
}
/* Bootstrap-like muted bg token */
.bg-muted { background: var(--muted-bg); }

/* ---------- Hero ---------- */
.hero-section {
  background: linear-gradient(180deg, #0b5ed7 0%, #1d4ed8 60%, #2563eb 100%);
}
.hero-bg {
  position: absolute; inset: 0;
  background: url('/hero-community-sports.jpg') center/cover no-repeat;
  opacity: .2;
}
.text-gradient {
  background: linear-gradient(90deg, #60a5fa, #34d399);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.shadow-hero { box-shadow: 0 10px 26px rgba(0,0,0,.18); }
.hero-sub { max-width: 50rem; }

/* ---------- Cards / Icons ---------- */
.gradient-card {
  background: linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #f8fbff 100%);
  border-radius: 1rem;
}
.hover-card { transition: transform .2s ease, box-shadow .2s ease; }
.hover-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(2,6,23,.12); }

.icon-circle {
  width: 64px; height: 64px;
  display: grid; place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #60a5fa, #6366f1);
  box-shadow: 0 8px 24px rgba(2,6,23,.12);
}
.icon-emoji { font-size: 28px; line-height: 1; }

/* ---------- Dots ---------- */
.dot { width: 12px; height: 12px; border-radius: 999px; }
.dot-primary { background: var(--primary); }
.dot-secondary { background: #10b981; }
.dot-accent { background: #f59e0b; }

/* ---------- Gradient blocks ---------- */
.bg-gradient-card {
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}
.bg-gradient-hero {
  background: linear-gradient(180deg, #1d4ed8 0%, #2563eb 100%);
}

/* ---------- Responsiveness per rubric ---------- */
@media (max-width: 575.98px) {
  .hero-section { padding: 2.5rem 0 3rem; }
}
@media (min-width: 576px) and (max-width: 767.98px) {
  .hero-section { padding: 3rem 0 3.5rem; }
}
@media (min-width: 992px) and (max-width: 1199.98px) {
  .hero-sub { max-width: 44rem; }
}
@media (min-width: 1400px) {
  .hero-sub { max-width: 56rem; }
}
</style>
