<template>
  <div class="container py-5">
    <h1 class="text-center mb-5">Our Programs</h1>
    
    <div class="row g-4">
      <div 
        v-for="program in programs" 
        :key="program.id" 
        class="col-md-6 col-lg-4"
      >
        <div class="card h-100">
          <img :src="program.image" class="card-img-top" :alt="program.name" style="height: 200px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ program.name }}</h5>
            <p class="card-text flex-grow-1">{{ program.description }}</p>
            <div class="mt-auto">
              <p class="text-muted mb-2">
                <strong>Duration:</strong> {{ program.duration }}<br>
                <strong>Schedule:</strong> {{ program.schedule }}<br>
                <strong>Price:</strong> {{ program.price }}
              </p>
              <div class="d-grid gap-2">
                <a href="/form" class="btn btn-primary text-decoration-none">
                  Join {{ program.name }}
                </a>
                <RouterLink :to="`/book?program=${program.id}`" class="btn btn-outline-success text-decoration-none">
                  <i class="fas fa-calendar-check me-1"></i>Book Appointment
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const programs = ref([
  {
    id: 1,
    name: 'Basketball for Beginners',
    description: 'Learn the fundamentals of basketball in a supportive environment.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
    duration: '8 weeks',
    schedule: 'Mon & Wed 6-7 PM',
    price: 'Free'
  },
  {
    id: 2,
    name: 'Community Soccer',
    description: 'Join our inclusive soccer program designed for all skill levels.',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop',
    duration: '12 weeks',
    schedule: 'Sat 10-11:30 AM',
    price: '$20/month'
  },
  {
    id: 3,
    name: 'Swimming Lessons',
    description: 'Learn to swim or improve your technique with certified instructors.',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop',
    duration: '10 weeks',
    schedule: 'Tue & Thu 7-8 PM',
    price: '$30/month'
  },
  {
    id: 4,
    name: 'Tennis Fundamentals',
    description: 'Master the basics of tennis with our experienced coaches.',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
    duration: '6 weeks',
    schedule: 'Sun 2-3:30 PM',
    price: '$25/month'
  },
  {
    id: 5,
    name: 'Volleyball League',
    description: 'Join our recreational volleyball league for teamwork and fun.',
    image: 'https://images.unsplash.com/photo-1612872087724-b8760a8a4b8e?w=400&h=300&fit=crop',
    duration: '8 weeks',
    schedule: 'Fri 6-8 PM',
    price: '$15/month'
  },
  {
    id: 6,
    name: 'Fitness Classes',
    description: 'High-energy fitness classes for strength and endurance.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    duration: 'Ongoing',
    schedule: 'Mon, Wed, Fri 6-7 AM',
    price: '$35/month'
  },
  {
    id: 7,
    name: 'Walking Groups',
    description: 'Join our community walking groups for gentle exercise.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    duration: 'Ongoing',
    schedule: 'Daily 8-9 AM',
    price: 'Free'
  },
  {
    id: 8,
    name: 'Yoga Sessions',
    description: 'Relax and strengthen your body and mind with yoga.',
    image: 'https://images.unsplash.com/photo-1506629905607-4b0b4a0b4a0b?w=400&h=300&fit=crop',
    duration: 'Ongoing',
    schedule: 'Tue & Thu 7-8 PM',
    price: '$20/month'
  },
  {
    id: 9,
    name: 'Dancing Classes',
    description: 'Learn various dance styles while having fun and staying active.',
    image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop',
    duration: '6 weeks',
    schedule: 'Sat 3-4:30 PM',
    price: '$25/month'
  },
  {
    id: 10,
    name: 'Cycling Groups',
    description: 'Explore Melbourne on two wheels with our guided cycling groups.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    duration: 'Ongoing',
    schedule: 'Sun 9-11 AM',
    price: '$30/month'
  }
])
</script>

<style scoped>
.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
