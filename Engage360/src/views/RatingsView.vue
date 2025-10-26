<template>
  <div class="container py-4">
    <h1 class="mb-4">Program Ratings</h1>

    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Add New Rating</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="addRating">
              <div class="mb-3">
                <label for="program" class="form-label">Program *</label>
                <select id="program" v-model="newRating.program" class="form-select" required>
                  <option value="">Select a program</option>
                  <option value="Fitness Bootcamp">Fitness Bootcamp</option>
                  <option value="Yoga Classes">Yoga Classes</option>
                  <option value="Nutrition Workshop">Nutrition Workshop</option>
                  <option value="Swimming Lessons">Swimming Lessons</option>
                  <option value="Personal Training">Personal Training</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="rating" class="form-label">Rating *</label>
                <select id="rating" v-model="newRating.rating" class="form-select" required>
                  <option value="">Select rating</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="comment" class="form-label">Comment</label>
                <textarea
                  id="comment"
                  v-model="newRating.comment"
                  class="form-control"
                  rows="3"
                  placeholder="Share your experience..."
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary">Add Rating</button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Rating Statistics</h5>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-6">
                <h3 class="text-primary">{{ averageRating }}</h3>
                <p class="mb-0">Average Rating</p>
              </div>
              <div class="col-6">
                <h3 class="text-success">{{ totalRatings }}</h3>
                <p class="mb-0">Total Ratings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Ratings Table -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">All Ratings</h5>
          </div>
          <div class="card-body">
            <InteractiveTable
              :data="ratings"
              :columns="ratingColumns"
              title="Program Ratings"
              :searchable-fields="['program', 'comment', 'user']"
            >
              <template #rating="{ value }">
                <div class="d-flex align-items-center">
                  <span class="me-2">{{ value }}/5</span>
                  <div class="rating-stars">
                    <span
                      v-for="star in 5"
                      :key="star"
                      :class="star <= value ? 'text-warning' : 'text-muted'"
                    >
                      ★
                    </span>
                  </div>
                </div>
              </template>
              <template #date="{ value }">
                {{ formatDate(value) }}
              </template>
            </InteractiveTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import InteractiveTable from '@/components/InteractiveTable.vue'

const ratings = ref([])
const newRating = ref({
  program: '',
  rating: '',
  comment: '',
  user: 'Anonymous User',
  date: new Date().toISOString(),
})

const ratingColumns = [
  { key: 'program', label: 'Program', sortable: true },
  { key: 'rating', label: 'Rating', sortable: true },
  { key: 'comment', label: 'Comment', sortable: false },
  { key: 'user', label: 'User', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
]

const averageRating = computed(() => {
  if (ratings.value.length === 0) return '0.0'
  const sum = ratings.value.reduce((acc, rating) => acc + parseInt(rating.rating), 0)
  return (sum / ratings.value.length).toFixed(1)
})

const totalRatings = computed(() => ratings.value.length)

function addRating() {
  if (newRating.value.program && newRating.value.rating) {
    ratings.value.unshift({
      ...newRating.value,
      id: Date.now(),
    })

    // Reset form
    newRating.value = {
      program: '',
      rating: '',
      comment: '',
      user: 'Anonymous User',
      date: new Date().toISOString(),
    }

    // Save to localStorage
    localStorage.setItem('program-ratings', JSON.stringify(ratings.value))
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

function loadRatings() {
  const stored = localStorage.getItem('program-ratings')
  if (stored) {
    ratings.value = JSON.parse(stored)
  } else {
    // Add some sample data
    ratings.value = [
      {
        id: 1,
        program: 'Fitness Bootcamp',
        rating: '5',
        comment: 'Amazing workout! Really pushed me to my limits.',
        user: 'John Doe',
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 2,
        program: 'Yoga Classes',
        rating: '4',
        comment: 'Very relaxing and well-structured classes.',
        user: 'Jane Smith',
        date: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 3,
        program: 'Nutrition Workshop',
        rating: '5',
        comment: 'Learned so much about healthy eating habits.',
        user: 'Mike Johnson',
        date: new Date(Date.now() - 259200000).toISOString(),
      },
    ]
    localStorage.setItem('program-ratings', JSON.stringify(ratings.value))
  }
}

onMounted(() => {
  loadRatings()
})
</script>

<style scoped>
.rating-stars {
  font-size: 1.2em;
}
</style>
