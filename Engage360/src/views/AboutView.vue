<template>
  <section class="about-section py-5 bg-light text-dark">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="display-5 fw-bold">About Engage360</h2>
        <p class="lead mx-auto" style="max-width: 700px;">
          Engage360 is a non-profit organization empowering communities through accessible and inclusive sports programs.
          Our mission is to improve physical and mental wellbeing, foster connection, and break down social barriers.
        </p>
      </div>

      <div class="row g-4">
        <div class="col-md-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body text-center">
              <div class="display-6 mb-3">🤝</div>
              <h5 class="card-title fw-bold">Community First</h5>
              <p class="card-text">
                We collaborate with local partners to make sure our programs reflect real community needs and priorities.
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body text-center">
              <div class="display-6 mb-3">🌱</div>
              <h5 class="card-title fw-bold">Growth & Wellbeing</h5>
              <p class="card-text">
                We support holistic development — physical health, mental wellbeing, confidence, and connection.
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body text-center">
              <div class="display-6 mb-3">🎯</div>
              <h5 class="card-title fw-bold">Accessible for All</h5>
              <p class="card-text">
                We work to eliminate barriers to participation, including cost, location, language, and ability.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ⭐ Rating Section -->
      <div class="text-center mt-5">
        <h3 class="mb-3">Rate Our Mission</h3>
        <Rating itemId="about" />
      </div>
    </div>
  </section>
</template>

<script setup>
import Rating from "@/components/Rating.vue";
</script>

<style scoped>
.about-section {
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}
</style>
