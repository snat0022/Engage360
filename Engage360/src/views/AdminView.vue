<template>
  <div class="container py-4">
    <h1 class="mb-4">Admin Dashboard</h1>

    <!-- Stats Panel -->
    <div class="row mb-4">
      <div class="col-md-3" v-for="(stat, key) in stats" :key="key">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ stat.label }}</h5>
            <p class="display-6 fw-bold">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- User Table -->
    <h5 class="mb-3">User Management</h5>
    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-primary" @click="createDummyUser">Create User</button>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="users.length === 0">
          <td colspan="5" class="text-center">No users found.</td>
        </tr>
        <tr v-for="(user, index) in users" :key="index">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <span :class="user.status === 'active' ? 'text-success' : 'text-danger'">
              {{ user.status }}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger me-1" @click="deleteUser(index)">
              Delete
            </button>
            <button class="btn btn-sm btn-outline-secondary me-1" @click="toggleStatus(index)">
              {{ user.status === 'active' ? 'Suspend' : 'Activate' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Content Control -->
    <h5 class="mt-5 mb-3">Content Control</h5>
    <div class="alert alert-info">
      Here you could add/edit/remove pages, posts, or manage media uploads.
      <br />
      (Placeholder – extend later as needed.)
    </div>

    <!-- Ratings Management -->
    <h5 class="mt-5 mb-3">Ratings Management</h5>
    <table class="table table-striped align-middle">
      <thead>
        <tr>
          <th>ID</th>
          <th>User Email</th>
          <th>Item</th>
          <th>Rating</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="ratings.length === 0">
          <td colspan="5" class="text-center text-muted">No ratings found.</td>
        </tr>
        <tr v-for="r in ratings" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ r.userEmail }}</td>
          <td>{{ r.itemId }}</td>
          <td>
            <span class="badge bg-warning text-dark">{{ r.score }}</span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger" @click="deleteRating(r.id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- System & Security -->
    <h5 class="mt-5 mb-3">System & Security</h5>
    <div class="alert alert-info">
      Monitor login attempts, apply restrictions, and manage security settings.
      <br />
      (Placeholder – here we’ll implement BR C.4 like XSS protection, validation logs, etc.)
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ratingStore } from "@/stores/ratingStore";

const users = ref([]);

const loadUsers = () => {
  const stored = localStorage.getItem("vue-auth-users");
  users.value = stored ? JSON.parse(stored) : [];
};

const saveUsers = () => {
  localStorage.setItem("vue-auth-users", JSON.stringify(users.value));
};

const deleteUser = (index) => {
  if (confirm("Are you sure you want to delete this user?")) {
    users.value.splice(index, 1);
    saveUsers();
  }
};

const toggleStatus = (index) => {
  const user = users.value[index];
  user.status = user.status === "active" ? "suspended" : "active";
  saveUsers();
};

const createDummyUser = () => {
  const newUser = {
    name: "New User",
    email: `user${users.value.length + 1}@mail.com`,
    password: "123456",
    role: "user",
    status: "active",
  };
  users.value.push(newUser);
  saveUsers();
};

const stats = computed(() => {
  return {
    total: { label: "Total Users", value: users.value.length },
    admins: { label: "Admins", value: users.value.filter((u) => u.role === "admin").length },
    active: { label: "Active Users", value: users.value.filter((u) => u.status === "active").length },
    suspended: { label: "Suspended Users", value: users.value.filter((u) => u.status === "suspended").length },
  };
});

// Ratings from store
const ratings = computed(() => ratingStore.ratings);

function deleteRating(id) {
  ratingStore.removeRating(id);
}

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.card-title {
  font-size: 1rem;
}
.display-6 {
  font-size: 2rem;
}
.table td,
.table th {
  vertical-align: middle;
}
</style>
