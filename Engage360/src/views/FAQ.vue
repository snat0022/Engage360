<template>
  <div class="faq-view py-4 py-md-5">
    <div class="container">
      <!-- Header -->
      <div class="text-center mb-4 mb-md-5">
        <h1 class="fw-bold mb-2">Frequently Asked Questions</h1>
        <p class="lead text-muted mx-auto" style="max-width: 48rem;">
          Everything you need to know about joining our community sports programs.
          Can't find what you're looking for? We're here to help!
        </p>
      </div>

      <!-- FAQ Accordion -->
      <div class="card shadow-card mb-5">
        <div class="card-body p-4 p-md-5">
          <h2 class="h4 fw-bold mb-1">Common Questions</h2>
          <p class="text-muted mb-4">
            Get answers to the most frequently asked questions about our programs and services.
          </p>

          <div class="accordion-vue">
            <article
              v-for="(faq, i) in faqs"
              :key="i"
              class="faq-item"
            >
              <button
                type="button"
                class="faq-trigger"
                :aria-expanded="openIndex === i ? 'true' : 'false'"
                :aria-controls="'ans-' + i"
                :id="'q-' + i"
                @click="toggle(i)"
              >
                <span class="text">{{ faq.question }}</span>
                <span class="chev" :class="{ open: openIndex === i }" aria-hidden="true">▾</span>
              </button>

              <div
                :id="'ans-' + i"
                class="faq-panel"
                role="region"
                :aria-labelledby="'q-' + i"
                :class="{ open: openIndex === i }"
              >
                <p class="mb-0 text-muted">{{ faq.answer }}</p>
              </div>
            </article>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="mb-5">
        <h2 class="h4 text-center fw-bold mb-4">Still Have Questions?</h2>
        <div class="row g-3 g-md-4">
          <div
            v-for="(m, idx) in contactMethods"
            :key="idx"
            class="col-12 col-md-6 col-lg-3"
          >
            <div class="card border-0 gradient-card h-100 p-4 text-center hover-card">
              <div class="display-6 mb-2">{{ m.icon }}</div>
              <h3 class="h6 fw-semibold mb-1">{{ m.title }}</h3>
              <p class="mb-0 fw-medium">{{ m.info }}</p>
              <p class="small text-muted mb-0">{{ m.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Start Guide -->
      <div class="card border-0 bg-gradient-card mb-5">
        <div class="card-body p-4 p-md-5">
          <h2 class="h4 fw-bold mb-1">Ready to Get Started?</h2>
          <p class="text-muted mb-4">Here's how easy it is to join our community</p>

          <div class="row g-4">
            <div class="col-12 col-md-4 text-center">
              <div class="step-circle bg-primary text-white">1</div>
              <h3 class="h6 fw-semibold">Register Online</h3>
              <p class="small text-muted">
                Fill out our quick registration form with your basic information and interests.
              </p>
            </div>
            <div class="col-12 col-md-4 text-center">
              <div class="step-circle bg-success text-white">2</div>
              <h3 class="h6 fw-semibold">We'll Contact You</h3>
              <p class="small text-muted">
                Our team will reach out within 24 hours to discuss programs that fit your needs.
              </p>
            </div>
            <div class="col-12 col-md-4 text-center">
              <div class="step-circle bg-warning text-dark">3</div>
              <h3 class="h6 fw-semibold">Start Playing!</h3>
              <p class="small text-muted">
                Join your first session and start enjoying the benefits of community sports.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <h3 class="h4 fw-bold mb-2">Your Community is Waiting</h3>
        <p class="text-muted mx-auto mb-3" style="max-width: 36rem;">
          Join thousands of community members who have discovered better health,
          lasting friendships, and the joy of being active together.
        </p>
        <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <RouterLink to="/form" class="btn btn-primary btn-lg">Register Now</RouterLink>
          <RouterLink to="/" class="btn btn-outline-secondary btn-lg">Learn More</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/* FAQ items (1:1 content with your React example) */
const faqs = ref([
  {
    question: 'Who can join your programs?',
    answer:
      'Our programs are open to everyone, but we especially focus on supporting marginalized communities including migrants, low-income families, older adults, and anyone facing barriers to accessing sports and physical activity. We welcome people of all fitness levels and backgrounds.'
  },
  {
    question: 'Are your programs really free or affordable?',
    answer:
      'Yes! We offer a range of free programs and very affordable options. We also have scholarships and payment plans available for those who need them. Our goal is to ensure cost is never a barrier to participation. Contact us to discuss options that work for your situation.'
  },
  {
    question: 'What sports and activities do you offer?',
    answer:
      'We offer a wide variety of activities including basketball, soccer, swimming, tennis, volleyball, fitness classes, walking groups, yoga, dancing, and cycling. We regularly add new programs based on community interest and needs.'
  },
  {
    question: 'Do I need to be fit to join?',
    answer:
      'Absolutely not! Our programs cater to all fitness levels, from complete beginners to experienced athletes. We have gentle activities for those starting their fitness journey and more challenging options for those ready to push themselves. Our trained staff will help you find the right fit.'
  },
  {
    question: 'What if I have health conditions or mobility limitations?',
    answer:
      'We welcome participants with health conditions and mobility limitations. Our trained staff and volunteers work with you to adapt activities to your needs. We have experience supporting people with diabetes, arthritis, mental health conditions, and various physical limitations. Please share your needs during registration so we can provide appropriate support.'
  },
  {
    question: 'How do I register and what happens next?',
    answer:
      'Simply fill out our online registration form - it takes about 5 minutes. Within 24 hours, one of our friendly team members will contact you to discuss program options that match your interests and needs. We\'ll arrange a time for you to visit, meet the team, and try out activities.'
  },
  {
    question: 'What languages do you support?',
    answer:
      'We have staff and volunteers who speak multiple languages including Arabic, Mandarin, Vietnamese, Spanish, and Greek. We also work with interpreters when needed. Language should never be a barrier to participation - please let us know what language support you need.'
  },
  {
    question: 'Can I volunteer or get involved in other ways?',
    answer:
      'Yes! We\'re always looking for volunteers, coaches, and community champions. Whether you have sports experience or just want to help create a welcoming environment, there\'s a role for you. We provide training and ongoing support for all volunteers.'
  },
  {
    question: 'Where are your programs located?',
    answer:
      'We run programs across Melbourne at various community centers, schools, and sports facilities. Most programs are easily accessible by public transport, and we try to offer options in different areas to serve our diverse community.'
  },
  {
    question: 'What safety measures do you have in place?',
    answer:
      'Safety is our top priority. All staff and volunteers have current Working with Children Checks and first aid training. We maintain comprehensive insurance, follow strict safety protocols, and always have trained supervisors present. We also work with health professionals to ensure activities are appropriate for participants.'
  },
  {
    question: 'Can family members join together?',
    answer:
      'Absolutely! We love when families participate together. We have family-friendly programs and can often accommodate different family members in age-appropriate activities at the same time and location.'
  },
  {
    question: "What if I'm not sure which program is right for me?",
    answer:
      "Don't worry! That's exactly why we have our consultation process. After you register, we'll talk with you about your interests, goals, and any concerns. You can also try different programs to see what you enjoy most. There's no pressure to commit to anything long-term initially."
  }
])

/* Contact cards */
const contactMethods = ref([
  { icon: '📞', title: 'Call Us', info: '(03) 9xxx-xxxx', description: 'Mon–Fri, 9am–5pm' },
  { icon: '✉️', title: 'Email Us', info: 'hello@sportscommunity.org.au', description: 'We respond within 24 hours' },
  { icon: '📍', title: 'Visit Us', info: '123 Community St, Melbourne VIC', description: 'Drop-in consultations available' },
  { icon: '💬', title: 'Live Chat', info: 'Available on our website', description: 'Quick answers to simple questions' }
])

/* Single-open accordion behavior */
const openIndex = ref(-1)
function toggle(i) {
  openIndex.value = openIndex.value === i ? -1 : i
}
</script>

<style scoped>
.faq-view { min-height: 100vh; }

/* Cards / Gradients */
.gradient-card {
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  border-radius: 1rem;
}
.bg-gradient-card {
  background: linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
  border-radius: 1rem;
}
.shadow-card { box-shadow: 0 12px 34px rgba(2, 6, 23, 0.08); }
.hover-card { transition: transform .18s ease, box-shadow .18s ease; }
.hover-card:hover { transform: translateY(-3px); box-shadow: 0 16px 38px rgba(2, 6, 23, 0.12); }

/* Steps */
.step-circle {
  width: 3rem; height: 3rem; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto .75rem; font-weight: 700;
}

/* Accordion */
.accordion-vue { border-radius: 12px; }
.faq-item + .faq-item { border-top: 1px solid #e9eef5; }

.faq-trigger {
  width: 100%;
  text-align: left;
  background: transparent;
  border: 0;
  padding: .85rem 0;
  font-weight: 600;
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer;
}
.faq-trigger:focus { outline: 2px solid #93c5fd; outline-offset: 2px; border-radius: 8px; }
.chev { transition: transform .2s ease; }
.chev.open { transform: rotate(180deg); }

.faq-panel {
  overflow: hidden;
  max-height: 0;
  transition: max-height .28s ease;
}
.faq-panel.open { max-height: 800px; } /* large enough for content */
.faq-panel p { padding: 0 0 .75rem 0; }

/* Responsive tweaks */
@media (max-width: 575.98px) {
  .faq-view .card-body { padding: 1rem; }
}
</style>
