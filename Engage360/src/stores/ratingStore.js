import { reactive } from "vue";

const RATING_KEY = "vue-ratings";

export const ratingStore = reactive({
  ratings: JSON.parse(localStorage.getItem(RATING_KEY)) || [],

  addRating({ itemId, userEmail, score }) {
    const existing = this.ratings.find(
      r => r.itemId === itemId && r.userEmail === userEmail
    );
    if (existing) {
      existing.score = score;
    } else {
      this.ratings.push({ id: Date.now(), itemId, userEmail, score });
    }
    localStorage.setItem(RATING_KEY, JSON.stringify(this.ratings));
  },

  getAverage(itemId) {
    const filtered = this.ratings.filter(r => r.itemId === itemId);
    if (filtered.length === 0) return 0;
    const total = filtered.reduce((sum, r) => sum + r.score, 0);
    return (total / filtered.length).toFixed(1);
  },

  getUserRating(itemId, userEmail) {
    return (
      this.ratings.find(
        r => r.itemId === itemId && r.userEmail === userEmail
      )?.score || null
    );
  },

  removeRating(id) {
    this.ratings = this.ratings.filter(r => r.id !== id);
    localStorage.setItem(RATING_KEY, JSON.stringify(this.ratings));
  }
});
