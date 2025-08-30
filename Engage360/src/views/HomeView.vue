<template>
  <div class="home-view">
    <!-- Hero -->
    <header class="hero" data-reveal data-reveal-delay="0">
      <h1 class="hero-title">
        Empowering Communities Through <span class="grad">Sport & Technology</span>
      </h1>
      <p class="hero-sub">
        Building a modern web platform for a leading Melbourne not-for-profit, championing
        health and well-being through inclusive community sport.
      </p>

      <div class="hero-cta">
        <RouterLink to="/form" class="btn btn-primary btn-lg">Join a Program</RouterLink>
        <a href="#overview" class="btn btn-outline-primary btn-lg">Learn More</a>
      </div>

      <!-- subtle animated wave -->
      <div class="wave" aria-hidden="true"></div>
    </header>

    
    <!-- Stats -->
    <section class="stats container" data-reveal data-reveal-delay="100">
      <div class="stat">
        <div class="num" data-counter="1250">0</div>
        <div class="label">Participants</div>
      </div>
      <div class="stat">
        <div class="num" data-counter="48">0</div>
        <div class="label">Programs</div>
      </div>
      <div class="stat">
        <div class="num" data-counter="320">0</div>
        <div class="label">Volunteers</div>
      </div>
      <div class="stat">
        <div class="num" data-counter="14">0</div>
        <div class="label">Local Partners</div>
      </div>
    </section>

    <!-- Overview -->
    <section id="overview" class="section container" data-reveal data-reveal-delay="0">
      <h2>Project Overview</h2>
      <p>
        Our initiative supports marginalized groups—including migrants, low-income families,
        and older adults—by providing affordable opportunities for physical activity and
        social connection.
      </p>
    </section>

    <!-- Purpose -->
    <section class="section container" data-reveal data-reveal-delay="50">
      <h2>Purpose of the Digital Platform</h2>
      <p>
        The platform is an intuitive, engaging hub to promote sports programs, share
        educational content, and enable easy registration for events and activities. It
        streamlines communication and coordination for staff, volunteers, and participants.
      </p>
    </section>

    <!-- Feature Cards -->
    <section class="features container" data-reveal data-reveal-delay="100">
      <article class="card f-card">
        <div class="icon">🏃‍♀️</div>
        <h3>Inclusive Programs</h3>
        <p>
          Beginner-friendly classes and social sports tailored for all ages and abilities,
          with translators and accessible venues where possible.
        </p>
      </article>
      <article class="card f-card">
        <div class="icon">📣</div>
        <h3>Community Outreach</h3>
        <p>
          Multilingual announcements, event calendars, and SMS/email reminders to reduce
          drop-offs and boost attendance.
        </p>
      </article>
      <article class="card f-card">
        <div class="icon">🤝</div>
        <h3>Volunteer Hub</h3>
        <p>
          Centralised onboarding, role matching, and training modules that make it easy to
          contribute and stay engaged.
        </p>
      </article>
      <article class="card f-card">
        <div class="icon">📊</div>
        <h3>Impact Tracking</h3>
        <p>
          Anonymous participation stats and wellness check-ins to help staff measure outcomes
          and secure funding.
        </p>
      </article>
    </section>

    <!-- Users -->
    <section class="section container" data-reveal data-reveal-delay="0">
      <h2>Target Users & Their Needs</h2>
      <ul class="bullet">
        <li><strong>Community Members:</strong> Accessible ways to improve health and connect socially.</li>
        <li><strong>Volunteers & Coaches:</strong> Onboarding, training, and opportunities to contribute.</li>
        <li><strong>NFP Staff & Health Workers:</strong> Tools for organizing, promoting, and managing programs.</li>
      </ul>
    </section>

    <!-- Objectives (animated list) -->
    <section class="section container" data-reveal data-reveal-delay="50">
      <h2>Core Objectives</h2>
      <ul class="goals">
        <li style="--i:0">Boost participation with simple, mobile-first registration.</li>
        <li style="--i:1">Elevate awareness through multilingual content and outreach.</li>
        <li style="--i:2">Enhance volunteer engagement with training and recognition.</li>
        <li style="--i:3">Deliver a scalable, privacy-conscious, accessible platform.</li>
      </ul>
    </section>

    <!-- Design -->
    <section class="section container" data-reveal data-reveal-delay="100">
      <h2>Design Philosophy</h2>
      <ul class="bullet">
        <li>Seamless navigation & responsive layouts</li>
        <li>Multilingual support & readable content</li>
        <li>Inclusive features for diverse user needs</li>
      </ul>
      <p class="muted">
        By harnessing thoughtful technology, we aim to deepen our positive impact across
        Melbourne’s vulnerable communities.
      </p>
    </section>

    <!-- CTA Footer -->
    <section class="cta container" data-reveal data-reveal-delay="50">
      <h3>Ready to get involved?</h3>
      <p>Register your interest or volunteer to help run local sessions.</p>
      <div class="cta-actions">
        <RouterLink to="/form" class="btn btn-primary btn-lg">Register Now</RouterLink>
        <RouterLink to="/faq" class="btn btn-outline-primary btn-lg">Read the FAQ</RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Simple scroll-reveal + counter animation.
 * Adds 'is-visible' when elements enter the viewport.
 * Respects prefers-reduced-motion where possible.
 */
let observer

const animateCounters = (root) => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  root.querySelectorAll('[data-counter]').forEach((el) => {
    if (el._animated) return
    const target = Number(el.getAttribute('data-counter') || '0')
    if (!Number.isFinite(target)) return
    el._animated = true

    if (prefersReduced) {
      el.textContent = target.toLocaleString()
      return
    }

    const duration = 900
    const start = performance.now()
    const startVal = 0

    const step = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const ease = 1 - Math.pow(1 - p, 3) // easeOutCubic
      const val = Math.round(startVal + (target - startVal) * ease)
      el.textContent = val.toLocaleString()
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

onMounted(() => {
  const items = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window) || items.length === 0) {
    // Fallback: show immediately
    items.forEach((el) => el.classList.add('is-visible'))
    animateCounters(document)
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target
          el.classList.add('is-visible')
          animateCounters(el)
          observer.unobserve(el)
        }
      })
    },
    { threshold: 0.15 }
  )

  items.forEach((el) => observer.observe(el))
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
/* Base */
.home-view {
  --bg: #f7fbff;
  --ink: #1f2430;
  --muted: #566176;
  --primary: #1976d2;
  background: var(--bg);
  color: var(--ink);
  font-family: Inter, system-ui, Arial, sans-serif;
}

/* Hero */
.hero {
  position: relative;
  z-index: 0;            /* ensure base layer */
  /* ...your existing hero styles stay */
}

/* wave sits behind content and won't eat clicks */
.wave {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -1px;
  height: 80px;
  /* ...your existing wave background + animation */
  z-index: 0;            /* lower than stats */
  pointer-events: none;  /* just in case */
  opacity: .45;          /* (optional) slightly softer */
}

/* stats should render above the wave */
.stats {
  position: relative;
  z-index: 2;            /* higher than .wave */
  margin: -3rem auto 2rem; /* keep your overlap */
  /* ...keep the rest of your .stats styles */
}
.grad {
  background: linear-gradient(90deg, #0ea5e9, #6366f1, #22c55e);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-sub {
  max-width: 760px;
  margin: 0 auto 1.5rem;
  font-size: clamp(16px, 2.2vw, 20px);
  color: var(--muted);
}
.hero-cta {
  display: flex;
  gap: .75rem;
  justify-content: center;
}
.wave {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -1px;
  height: 80px;
  background: radial-gradient(60px 30px at 10% 10px, #e3f2fd 30%, transparent 31%) repeat-x,
              radial-gradient(60px 30px at 40% 10px, #e3f2fd 30%, transparent 31%) repeat-x;
  background-size: 160px 80px, 160px 80px;
  background-position: 0 0, 80px 40px;
  opacity: .6;
  animation: wave 6s linear infinite;
}
@keyframes wave { to { background-position: 160px 0, 240px 40px; }}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 1rem;
  margin: -3rem auto 2rem;
  padding: 0 1rem;
  max-width: 950px;
}
@media (min-width: 768px) {
  .stats { grid-template-columns: repeat(4, minmax(0,1fr)); }
}
.stat {
  background: #fff;
  border-radius: 14px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(2, 6, 23, 0.06);
}
.num {
  font-size: clamp(28px, 3.5vw, 40px);
  font-weight: 800;
  color: var(--primary);
}
.label { color: var(--muted); }

/* Sections */
.section {
  max-width: 900px;
  margin: 2.5rem auto;
  padding: 0 1rem;
}
.section h2 {
  color: #1565c0;
  margin-bottom: .5rem;
}
.bullet {
  padding-left: 1.25rem;
}
.muted { color: var(--muted); }

/* Feature Cards */
.features {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(1, minmax(0,1fr));
  margin: 2rem auto;
}
@media (min-width: 768px) {
  .features { grid-template-columns: repeat(4, minmax(0,1fr)); }
}
.card.f-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 1.1rem;
  box-shadow: 0 10px 26px rgba(2, 6, 23, 0.06);
  transition: transform .2s ease, box-shadow .2s ease;
}
.card.f-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(2, 6, 23, 0.10);
}
.icon {
  font-size: 28px;
  line-height: 1;
  margin-bottom: .25rem;
}

/* Goals with staggered reveal */
.goals {
  list-style: none;
  padding: 0;
  margin: .5rem 0 0 0;
}
.goals li {
  position: relative;
  padding-left: 28px;
  margin: .5rem 0;
  opacity: 0;
  transform: translateY(8px);
  animation: pop .5s ease forwards;
  animation-delay: calc(0.1s * var(--i));
}
.goals li::before {
  content: '✔';
  position: absolute;
  left: 0;
  top: 0;
  color: #22c55e;
}
@keyframes pop {
  to { opacity: 1; transform: translateY(0); }
}

/* CTA */
.cta {
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem 1rem;
  margin: 3rem auto;
  box-shadow: 0 12px 34px rgba(2, 6, 23, 0.07);
  max-width: 900px;
}
.cta-actions {
  margin-top: .75rem;
  display: flex;
  gap: .75rem;
  justify-content: center;
}

/* Scroll-reveal */
[data-reveal] {
  opacity: 0;
  transform: translateY(16px) scale(.98);
  transition: opacity .6s ease, transform .6s ease;
  transition-delay: var(--delay, 0ms);
}
[data-reveal].is-visible {
  opacity: 1;
  transform: none;
}
[data-reveal][data-reveal-delay="0"]   { --delay: 0ms; }
[data-reveal][data-reveal-delay="50"]  { --delay: 50ms; }
[data-reveal][data-reveal-delay="100"] { --delay: 100ms; }
</style>
