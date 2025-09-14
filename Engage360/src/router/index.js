import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Form from "../views/Form.vue";
import FAQ from "../views/FAQ.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import AboutView from "../views/AboutView.vue";
import AdminView from "../views/AdminView.vue";
import { useAuthStore } from "@/stores/auth";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/form", name: "Form", component: Form },
  { path: "/faq", name: "FAQ", component: FAQ },
  { path: "/about", name: "About", component: AboutView },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/admin", name: "Admin", component: AdminView, meta: { requiresRole: "admin" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useAuthStore();
  if (!store.user) store.loadFromStorage();

  if (to.meta.requiresRole && to.meta.requiresRole !== store.role) {
    return next("/login");
  }
  next();
});

export default router;
