<template>
  <div class="rating">
    <div v-if="!user">
      <p class="text-muted">Login to leave a rating ⭐</p>
    </div>

    <div v-else>
      <div class="stars">
        <span
          v-for="n in 5"
          :key="n"
          class="star"
          :class="{ active: n <= current }"
          @click="setRating(n)"
        >★</span>
      </div>
      <p class="mt-2">
        Your rating: <strong>{{ current || "Not rated" }}</strong>
      </p>
    </div>

    <p class="mt-2 text-primary">
      Average rating: <strong>{{ average }}</strong> ({{ count }} votes)
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { authStore } from "@/stores/auth"; // existing store

import { ratingStore } from "@/stores/ratingStore";


const props = defineProps({
  itemId: { type: String, required: true }
});

const user = authStore.currentUser;
const current = ref(0);

const average = computed(() => ratingStore.getAverage(props.itemId));
const count = computed(() => ratingStore.ratings.filter(r => r.itemId === props.itemId).length);

function setRating(score) {
  if (!user) return;
  current.value = score;
  ratingStore.addRating({
    itemId: props.itemId,
    userEmail: user.email,
    score
  });
}

onMounted(() => {
  if (user) {
    current.value = ratingStore.getUserRating(props.itemId, user.email);
  }
});
</script>

<style scoped>
.stars {
  font-size: 1.5rem;
  cursor: pointer;
}
.star {
  color: #ddd;
  margin-right: 4px;
}
.star.active {
  color: gold;
}
</style>
