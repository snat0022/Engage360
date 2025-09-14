<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const email = ref("")
const password = ref("")
const error = ref("")
const router = useRouter()
const auth = useAuthStore()

async function handleLogin() {
  error.value = ""
  try {
    await auth.login(email.value, password.value)
    router.push("/")
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  }
}
</script>
