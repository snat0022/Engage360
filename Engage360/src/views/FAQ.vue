<template>
  <div class="faq container py-4">
    <header class="mb-4">
      <h1 class="mb-2">Frequently Asked Questions</h1>
      <p class="text-muted">Search or filter by category. Click a question to expand.</p>

      <div class="row g-2 align-items-center">
        <div class="col-12 col-md-6">
          <input
            v-model.trim="q"
            type="search"
            class="form-control"
            placeholder="Search FAQs (e.g., registration, password, support)…"
            aria-label="Search FAQs"
          />
        </div>

        <div class="col-8 col-md-3">
          <select v-model="category" class="form-select" aria-label="Filter by category">
            <option value="">All categories</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="col-4 col-md-3 d-flex gap-2 justify-content-end">
          <button class="btn btn-outline-secondary btn-sm" @click="collapseAll">Collapse</button>
          <button class="btn btn-primary btn-sm" @click="expandAll">Expand</button>
        </div>
      </div>
    </header>

    <section v-if="filtered.length" class="accordion-list">
      <article
        v-for="(item, i) in filtered"
        :key="item.id"
        class="faq-item"
      >
        <button
          class="faq-q"
          :aria-expanded="item.open ? 'true' : 'false'"
          :aria-controls="`ans-${item.id}`"
          :id="`q-${item.id}`"
          @click="toggle(i)"
          @keyup.enter.space.prevent="toggle(i)"
        >
          <span class="q-text">{{ item.question }}</span>
          <span class="chev" :class="{ open: item.open }" aria-hidden="true">▾</span>
        </button>

        <div
          :id="`ans-${item.id}`"
          class="faq-a-wrapper"
          role="region"
          :aria-labelledby="`q-${item.id}`"
          :style="{ maxHeight: item.open ? item._height + 'px' : 0 }"
          ref="answerBlocks"
        >
          <div class="faq-a">
            <p class="mb-2">{{ item.answer }}</p>

            <!-- Optional contextual links -->
            <div class="small text-muted" v-if="item.linkTo">
              Related: <RouterLink :to="item.linkTo.to">{{ item.linkTo.label }}</RouterLink>
            </div>
          </div>

          <div class="faq-meta small text-muted">
            <span class="badge bg-light text-dark">{{ item.category }}</span>
          </div>
        </div>
      </article>
    </section>

    <div v-else class="alert alert-info mt-4">
      No results. Try a different search term or category.
    </div>

    <!-- Helpful footer CTA -->
    <footer class="mt-5 text-center">
      <p class="mb-2">Still need help?</p>
      <div class="d-flex gap-2 justify-content-center">
        <RouterLink to="/form" class="btn btn-primary">Register Now</RouterLink>
        <a class="btn btn-outline-secondary" href="#top" @click.prevent="scrollToTop">Back to top</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'

/** FAQ data (could be fetched later). */
const baseFaqs = [
  {
    id: 1,
    category: 'General',
    question: 'What is Engage360?',
    answer:
      'Engage360 is a community platform that helps residents join sport programs, stay informed, and connect with volunteers and staff.',
    linkTo: { to: '/', label: 'Home' },
    open: false
  },
  {
    id: 2,
    category: 'Registration',
    question: 'How do I register for a program?',
    answer:
      'Go to the Registration Form, fill in your details, and submit. You will receive on-screen confirmation.',
    linkTo: { to: '/form', label: 'Open the Registration Form' },
    open: false
  },
  {
    id: 3,
    category: 'Account',
    question: 'How do I reset my password?',
    answer:
      'Use the “Forgot Password” option on the sign-in screen. Follow the email instructions to create a new password.',
    open: false
  },
  {
    id: 4,
    category: 'Programs',
    question: 'Are programs suitable for beginners?',
    answer:
      'Yes. Many activities are beginner-friendly and inclusive. Check each program card for level and location details.',
    linkTo: { to: '/', label: 'See Featured Programs' },
    open: false
  },
  {
    id: 5,
    category: 'Support',
    question: 'Who can I contact for support?',
    answer:
      'Reach out via the Contact/Help link in your dashboard or speak to staff at your local session.',
    open: false
  },
  {
    id: 6,
    category: 'Privacy',
    question: 'How is my data protected?',
    answer:
      'We only collect data necessary to run programs and we apply role-based access. See our privacy policy for details.',
    open: false
  }
]

/** Local reactive copy so we can mutate `open` and cache heights. */
const faqs = reactive(baseFaqs.map(f => ({ ...f, _height: 0 })))

const q = ref('')
const category = ref('')
const categories = computed(() =>
  Array.from(new Set(faqs.map(f => f.category))).sort()
)

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return faqs.filter(f => {
    const catOk = category.value ? f.category === category.value : true
    const text = (f.question + ' ' + f.answer).toLowerCase()
    const termOk = term ? text.includes(term) : true
    return catOk && termOk
  })
})

/** Refs to answer blocks so we can measure heights for CSS transitions */
const answerBlocks = ref([])

/** Toggle one item (and recalc height for smooth animation). */
const toggle = async (idxInFiltered) => {
  const item = filtered.value[idxInFiltered]
  if (!item) return
  item.open = !item.open
  await nextTick()
  measureHeights()
}

/** Expand/collapse all in current filtered list. */
const expandAll = async () => {
  filtered.value.forEach(f => (f.open = true))
  await nextTick()
  measureHeights()
}
const collapseAll = () => {
  filtered.value.forEach(f => (f.open = false))
}

/** Measure inner content height for each open item (used for max-height animation). */
const measureHeights = () => {
  // Map by id for fast assignment
  const map = new Map(answerBlocks.value.map(el => [Number(el?.id?.replace('ans-', '')), el]))
  faqs.forEach(f => {
    const el = map.get(f.id)
    if (!el) return
    // inner content is first child (.faq-a + meta)
    f._height = f.open ? el.scrollHeight : 0
  })
}

/** Back to top with smooth scroll (if supported). */
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  // Initial measurement to set heights for already-open items (if any)
  measureHeights()
})
</script>

<style scoped>
/* Layout */
.faq { max-width: 920px; }

/* Items */
.faq-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: .25rem;
  margin-bottom: .75rem;
  box-shadow: 0 6px 18px rgba(2,6,23,0.05);
}

/* Question button */
.faq-q {
  width: 100%;
  background: transparent;
  border: 0;
  text-align: left;
  padding: .85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
}
.faq-q:focus { outline: 2px solid #93c5fd; outline-offset: 2px; }
.q-text { padding-right: .75rem; }
.chev { transition: transform .2s ease; }
.chev.open { transform: rotate(180deg); }

/* Answer wrapper (animated) */
.faq-a-wrapper {
  overflow: hidden;
  transition: max-height .28s ease;
  will-change: max-height;
  border-top: 1px dashed #e5e7eb;
  margin: 0 .25rem .25rem;
  border-radius: 0 0 12px 12px;
}
.faq-a { padding: .75rem 1rem .5rem; }
.faq-meta { padding: 0 1rem 1rem; }

/* Responsive per rubric */
@media (max-width: 575.98px) {
  .faq { padding-left: .5rem; padding-right: .5rem; }
  .faq-q { padding: .75rem .85rem; }
}
@media (min-width: 576px) and (max-width: 767.98px) {
  .faq-q { padding: .8rem 1rem; }
}
@media (min-width: 992px) and (max-width: 1199.98px) {
  .faq { max-width: 980px; }
}
@media (min-width: 1400px) {
  .faq { max-width: 1080px; }
}
</style>
