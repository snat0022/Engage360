<template>
  <div class="genai-assistant">
    <!-- Header -->
    <div class="assistant-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h3><i class="fas fa-robot"></i> AI Assistant</h3>
          <p class="text-white-75">Powered by Gemini AI - Get personalized recommendations and insights</p>
        </div>
        <div class="status-indicator">
          <span :class="statusClass" class="badge">
            <i :class="statusIcon"></i>
            {{ statusText }}
          </span>
        </div>
      </div>
    </div>

    <!-- Chat Interface -->
    <div class="chat-container">
      <div class="chat-messages" ref="chatMessages">
        <div v-for="message in messages" :key="message.id" :class="['message', message.type]">
          <div class="message-avatar">
            <i :class="message.type === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
          </div>
          <div class="message-content">
            <div class="message-header">
              <strong>{{ message.type === 'user' ? 'You' : 'AI Assistant' }}</strong>
              <small class="text-muted">{{ formatTime(message.timestamp) }}</small>
            </div>
            <div class="message-body" v-html="formatMessage(message.content)"></div>
          </div>
        </div>
        
        <!-- Typing indicator -->
        <div v-if="isTyping" class="message ai">
          <div class="message-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions" v-if="messages.length === 0">
        <h5>Quick Actions</h5>
        <div class="row g-2">
          <div class="col-md-6">
            <button @click="askQuestion('recommend')" class="btn btn-outline-primary w-100">
              <i class="fas fa-star"></i> Get Program Recommendations
            </button>
          </div>
          <div class="col-md-6">
            <button @click="askQuestion('fitness')" class="btn btn-outline-success w-100">
              <i class="fas fa-dumbbell"></i> Fitness Tips
            </button>
          </div>
          <div class="col-md-6">
            <button @click="askQuestion('nutrition')" class="btn btn-outline-warning w-100">
              <i class="fas fa-apple-alt"></i> Nutrition Advice
            </button>
          </div>
          <div class="col-md-6">
            <button @click="askQuestion('motivation')" class="btn btn-outline-info w-100">
              <i class="fas fa-heart"></i> Motivation Tips
            </button>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input">
        <div class="input-group">
          <input
            v-model="currentMessage"
            @keypress.enter="sendMessage"
            type="text"
            class="form-control"
            placeholder="Ask me anything about fitness, programs, or health..."
            :disabled="isTyping"
            ref="messageInput"
          />
          <button
            @click="sendMessage"
            class="btn btn-primary"
            :disabled="!currentMessage.trim() || isTyping"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="input-suggestions">
          <small class="text-muted">
            Try: "What programs are best for beginners?" or "Give me nutrition tips"
          </small>
        </div>
      </div>
    </div>

    <!-- Features Panel -->
    <div class="features-panel mt-4">
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-magic"></i> AI Features</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="feature-item">
                <div class="feature-icon bg-primary">
                  <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="feature-content">
                  <h6>Program Recommendations</h6>
                  <p>Get personalized program suggestions based on your profile and goals</p>
                  <button @click="askQuestion('recommend')" class="btn btn-sm btn-outline-primary">
                    Try Now
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-item">
                <div class="feature-icon bg-success">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="feature-content">
                  <h6>Analytics Insights</h6>
                  <p>Get AI-powered insights from your activity and program data</p>
                  <button @click="askQuestion('analytics')" class="btn btn-sm btn-outline-success">
                    Analyze Data
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-item">
                <div class="feature-icon bg-warning">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="feature-content">
                  <h6>Email Generation</h6>
                  <p>Generate personalized emails for campaigns and communications</p>
                  <button @click="askQuestion('email')" class="btn btn-sm btn-outline-warning">
                    Generate Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <div class="settings-panel mt-4">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5><i class="fas fa-cog me-2"></i> AI Settings</h5>
          <button @click="toggleSettings" class="btn btn-outline-secondary btn-sm">
            <i :class="showSettings ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </button>
        </div>
        <div v-if="showSettings" class="card-body">
          <div class="row g-4">
            <div class="col-md-6">
              <div class="setting-group">
                <label for="temperature" class="form-label setting-label">
                  <i class="fas fa-lightbulb me-2"></i>Creativity Level
                </label>
                <div class="slider-container">
                  <div class="d-flex align-items-center gap-3">
                    <input
                      id="temperature"
                      v-model.number="settings.temperature"
                      type="range"
                      class="form-range creativity-slider"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                    />
                    <div class="value-display">
                      <span class="badge bg-primary fs-6 px-3 py-2">{{ settings.temperature }}</span>
                    </div>
                  </div>
                  <div class="slider-labels">
                    <small class="text-muted">Conservative</small>
                    <small class="text-muted">Very Creative</small>
                  </div>
                </div>
                <div class="setting-description">
                  <i class="fas fa-info-circle me-1"></i>
                  <strong>{{ creativityLabel }}:</strong> {{ creativityDescription }}
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="setting-group">
                <label for="maxTokens" class="form-label setting-label">
                  <i class="fas fa-text-width me-2"></i>Response Length
                </label>
                <select id="maxTokens" v-model.number="settings.maxTokens" class="form-select response-select">
                  <option value="512">Short</option>
                  <option value="1024">Medium</option>
                  <option value="2048">Long</option>
                  <option value="4096">Very Long</option>
                </select>
                <div class="setting-description">
                  <i class="fas fa-info-circle me-1"></i>
                  Controls how detailed and comprehensive AI responses will be
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-actions mt-4">
            <div class="d-flex gap-2 flex-wrap">
              <button @click="clearChat" class="btn btn-outline-danger">
                <i class="fas fa-trash me-1"></i> Clear Chat History
              </button>
              <button @click="exportChat" class="btn btn-outline-info">
                <i class="fas fa-download me-1"></i> Export Chat
              </button>
              <button @click="resetSettings" class="btn btn-outline-secondary">
                <i class="fas fa-undo me-1"></i> Reset Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { geminiAIService } from '@/services/geminiAIService'
import { firestoreService } from '@/services/firestoreService'
import { firebaseAuthStore } from '@/stores/firebaseAuth'

// Reactive data
const messages = ref([])
const currentMessage = ref('')
const isTyping = ref(false)
const showSettings = ref(false)
const chatMessages = ref(null)
const messageInput = ref(null)

// Settings
const settings = ref({
  temperature: 0.7,
  maxTokens: 1024
})

// Computed properties
const statusClass = computed(() => {
  return geminiAIService.isInitialized ? 'bg-success' : 'bg-warning'
})

const statusText = computed(() => {
  return geminiAIService.isInitialized ? 'AI Ready' : 'AI Limited'
})

const statusIcon = computed(() => {
  return geminiAIService.isInitialized ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'
})

const creativityLabel = computed(() => {
  if (settings.value.temperature <= 0.3) return 'Conservative'
  if (settings.value.temperature <= 0.6) return 'Balanced'
  if (settings.value.temperature <= 0.8) return 'Creative'
  return 'Very Creative'
})

const creativityDescription = computed(() => {
  if (settings.value.temperature <= 0.3) return 'More predictable, focused responses'
  if (settings.value.temperature <= 0.6) return 'Balanced creativity and consistency'
  if (settings.value.temperature <= 0.8) return 'More creative and varied responses'
  return 'Highly creative, experimental responses'
})

// Methods
const sendMessage = async () => {
  if (!currentMessage.value.trim() || isTyping.value) return

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: currentMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const message = currentMessage.value
  currentMessage.value = ''
  isTyping.value = true

  await nextTick()
  scrollToBottom()

  try {
    const response = await processUserMessage(message)
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: response,
      timestamp: new Date()
    }

    messages.value.push(aiMessage)
  } catch (error) {
    console.error('Error processing message:', error)
    
    const errorMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: `I apologize, but I encountered an error: ${error.message}. Please try again or contact support if the issue persists.`,
      timestamp: new Date()
    }

    messages.value.push(errorMessage)
  } finally {
    isTyping.value = false
    await nextTick()
    scrollToBottom()
  }
}

const processUserMessage = async (message) => {
  const lowerMessage = message.toLowerCase()

  // Program recommendations
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return await generateProgramRecommendations()
  }

  // Fitness tips
  if (lowerMessage.includes('fitness') || lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
    return await generateFitnessTips()
  }

  // Nutrition advice
  if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food')) {
    return await generateNutritionAdvice()
  }

  // Motivation tips
  if (lowerMessage.includes('motivation') || lowerMessage.includes('motivate') || lowerMessage.includes('encourage')) {
    return await generateMotivationTips()
  }

  // Analytics insights
  if (lowerMessage.includes('analytics') || lowerMessage.includes('insights') || lowerMessage.includes('data')) {
    return await generateAnalyticsInsights()
  }

  // Email generation
  if (lowerMessage.includes('email') || lowerMessage.includes('campaign')) {
    return await generateEmailContent()
  }

  // General AI response
  return await generateGeneralResponse(message)
}

const generateProgramRecommendations = async () => {
  try {
    const user = firebaseAuthStore.currentUser
    const programs = await firestoreService.getAllPrograms()
    
    const userProfile = {
      age: user?.age || 'Not specified',
      interests: user?.interests || ['General fitness'],
      fitnessLevel: user?.fitnessLevel || 'Beginner',
      goals: user?.goals || ['Improve health'],
      previousPrograms: user?.enrolledPrograms || [],
      availability: user?.availability || 'Flexible'
    }

    const result = await geminiAIService.generateProgramRecommendations(userProfile, programs)
    
    if (result.success) {
      return formatRecommendations(result.recommendations)
    } else {
      return "I'd be happy to recommend programs for you! Based on your profile, I suggest checking out our beginner-friendly programs like 'Fitness Fundamentals' or 'Wellness Basics'. Would you like me to provide more specific recommendations?"
    }
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return "I'd be happy to recommend programs for you! Please visit our Programs page to see all available options, or tell me more about your fitness goals and I can provide personalized suggestions."
  }
}

const generateFitnessTips = async () => {
  try {
    const user = firebaseAuthStore.currentUser
    const programs = await firestoreService.getAllPrograms()
    const userProgram = programs.find(p => user?.enrolledPrograms?.includes(p.id)) || programs[0]

    const userProfile = {
      age: user?.age || 'Not specified',
      fitnessLevel: user?.fitnessLevel || 'Beginner',
      goals: user?.goals || ['General fitness'],
      currentProgram: userProgram?.name || 'General fitness'
    }

    const result = await geminiAIService.generateFitnessTips(userProfile, userProgram || {})
    
    if (result.success) {
      return formatFitnessTips(result.tips)
    } else {
      return "Here are some general fitness tips: 1) Start slowly and gradually increase intensity, 2) Focus on proper form over heavy weights, 3) Include both cardio and strength training, 4) Stay hydrated throughout your workouts, 5) Get adequate rest between sessions. Would you like more specific advice for your current program?"
    }
  } catch (error) {
    console.error('Error generating fitness tips:', error)
    return "Here are some essential fitness tips: 1) Consistency is key - aim for regular, manageable workouts, 2) Listen to your body and don't push through pain, 3) Warm up before and cool down after exercise, 4) Set realistic goals and celebrate small victories, 5) Find activities you enjoy to maintain motivation."
  }
}

const generateNutritionAdvice = async () => {
  try {
    const prompt = "Provide personalized nutrition advice for someone participating in health and fitness programs. Include tips for pre/post workout nutrition, hydration, and general healthy eating habits."
    
    const result = await geminiAIService.generateContent(prompt, {
      temperature: settings.value.temperature,
      maxTokens: settings.value.maxTokens
    })
    
    if (result.success) {
      return result.content
    } else {
      return "Here's some general nutrition advice: 1) Eat a balanced diet with plenty of fruits and vegetables, 2) Stay hydrated by drinking water throughout the day, 3) Include lean proteins for muscle recovery, 4) Choose whole grains for sustained energy, 5) Limit processed foods and added sugars. Would you like more specific nutrition guidance?"
    }
  } catch (error) {
    console.error('Error generating nutrition advice:', error)
    return "Here are some key nutrition tips: 1) Eat regular meals and snacks to maintain energy, 2) Include protein in each meal for muscle support, 3) Choose colorful fruits and vegetables for vitamins and minerals, 4) Stay hydrated with water, especially during workouts, 5) Plan meals ahead to make healthy choices easier."
  }
}

const generateMotivationTips = async () => {
  try {
    const prompt = "Provide motivational tips and encouragement for someone on their fitness journey. Include advice on staying consistent, overcoming obstacles, and maintaining a positive mindset."
    
    const result = await geminiAIService.generateContent(prompt, {
      temperature: settings.value.temperature,
      maxTokens: settings.value.maxTokens
    })
    
    if (result.success) {
      return result.content
    } else {
      return "Here are some motivation tips: 1) Set small, achievable goals and celebrate progress, 2) Find a workout buddy or join a community, 3) Track your progress to see improvements, 4) Remember that every workout counts, even short ones, 5) Focus on how exercise makes you feel, not just how you look. You've got this!"
    }
  } catch (error) {
    console.error('Error generating motivation tips:', error)
    return "Here's some motivation for your fitness journey: 1) Every expert was once a beginner - progress takes time, 2) Your only competition is yourself from yesterday, 3) Small consistent actions lead to big results, 4) Rest and recovery are part of the process, 5) Believe in yourself and your ability to improve. Keep going!"
  }
}

const generateAnalyticsInsights = async () => {
  try {
    const user = firebaseAuthStore.currentUser
    const bookings = await firestoreService.getUserBookings(user?.uid)
    const programs = await firestoreService.getAllPrograms()
    
    const analyticsData = {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      enrolledPrograms: user?.enrolledPrograms?.length || 0,
      programCategories: programs.map(p => p.category),
      recentActivity: bookings.slice(0, 5).map(b => ({
        program: programs.find(p => p.id === b.programId)?.name,
        date: b.date,
        status: b.status
      }))
    }

    const result = await geminiAIService.generateAnalyticsInsights(analyticsData)
    
    if (result.success) {
      return formatAnalyticsInsights(result.insights)
    } else {
      return "Based on your activity, I can see you're actively participating in our programs! You have " + analyticsData.totalBookings + " bookings with " + analyticsData.confirmedBookings + " confirmed sessions. Keep up the great work!"
    }
  } catch (error) {
    console.error('Error generating analytics insights:', error)
    return "I'd love to provide insights about your fitness journey! Based on your participation in our programs, you're making great progress. Keep attending sessions and exploring new programs to maximize your health benefits."
  }
}

const generateEmailContent = async () => {
  try {
    const user = firebaseAuthStore.currentUser
    const userData = {
      name: user?.displayName || user?.email || 'Valued Member',
      role: user?.role || 'member',
      enrolledPrograms: user?.enrolledPrograms || [],
      lastActivity: 'Recent',
      preferences: 'Health and fitness'
    }

    const result = await geminiAIService.generatePersonalizedEmail(userData, 'newsletter', {
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear()
    })
    
    if (result.success) {
      return formatEmailContent(result.email)
    } else {
      return "I can help generate personalized email content! Here's a sample: Subject: 'Your Health Journey Update' - Hi there! We hope you're enjoying your fitness journey with us. This month, we have exciting new programs and tips to share. Keep up the great work!"
    }
  } catch (error) {
    console.error('Error generating email content:', error)
    return "I can help create personalized email content for your communications! Here's a sample newsletter subject: 'Your Monthly Health Update' with content about program highlights, member achievements, and upcoming events."
  }
}

const generateGeneralResponse = async (message) => {
  try {
    const prompt = `You are a helpful AI assistant for a health and fitness charity organization called Engage360. A user has asked: "${message}". 

Provide a specific, detailed, and helpful response related to health, fitness, programs, or general wellness. Be conversational, supportive, and give actionable advice. If the question is about specific programs, mention actual program names and details. If it's about fitness, give specific exercises or routines. If it's about nutrition, provide specific meal suggestions or dietary advice.

Make your response personalized and relevant to their specific question rather than generic advice.`
    
    const result = await geminiAIService.generateContent(prompt, {
      temperature: settings.value.temperature,
      maxTokens: settings.value.maxTokens
    })
    
    if (result.success) {
      return result.content
    } else {
      return "I'd be happy to help with your health and fitness questions! I can provide information about our programs, give fitness tips, nutrition advice, and motivation. What would you like to know?"
    }
  } catch (error) {
    console.error('Error generating general response:', error)
    return "I'm here to help with your health and fitness questions! I can provide information about our programs, give fitness tips, nutrition advice, and motivation. What would you like to know?"
  }
}

const askQuestion = (type) => {
  const questions = {
    recommend: "Can you recommend programs that would be good for me?",
    fitness: "What are some good fitness tips for beginners?",
    nutrition: "Can you give me some nutrition advice?",
    motivation: "I need some motivation tips for my fitness journey",
    analytics: "Can you analyze my activity and give me insights?",
    email: "Help me generate a personalized email for our members"
  }
  
  currentMessage.value = questions[type] || "Hello, how can you help me?"
  sendMessage()
}

const formatRecommendations = (recommendations) => {
  if (!recommendations.recommendations) return "I'd be happy to recommend programs for you!"
  
  let response = "Here are my personalized program recommendations for you:\n\n"
  
  recommendations.recommendations.forEach((rec, index) => {
    response += `**${index + 1}. ${rec.programName}**\n`
    response += `*Why:* ${rec.reason}\n`
    response += `*Suitability:* ${rec.suitability}\n`
    if (rec.tips) response += `*Tips:* ${rec.tips}\n`
    response += "\n"
  })
  
  if (recommendations.additionalSuggestions) {
    response += `**Additional Suggestions:**\n${recommendations.additionalSuggestions}\n\n`
  }
  
  if (recommendations.overallAssessment) {
    response += `**Overall Assessment:**\n${recommendations.overallAssessment}`
  }
  
  return response
}

const formatFitnessTips = (tips) => {
  if (!tips.fitnessTips) return "Here are some general fitness tips for you!"
  
  let response = "Here are personalized fitness tips for you:\n\n"
  
  if (tips.fitnessTips) {
    response += "**Fitness Tips:**\n"
    tips.fitnessTips.forEach((tip, index) => {
      response += `${index + 1}. ${tip}\n`
    })
    response += "\n"
  }
  
  if (tips.nutritionAdvice) {
    response += `**Nutrition Advice:**\n${tips.nutritionAdvice}\n\n`
  }
  
  if (tips.recoveryTips) {
    response += `**Recovery Tips:**\n${tips.recoveryTips}\n\n`
  }
  
  if (tips.motivationTips) {
    response += `**Motivation Tips:**\n${tips.motivationTips}\n\n`
  }
  
  if (tips.commonMistakes) {
    response += `**Common Mistakes to Avoid:**\n${tips.commonMistakes}`
  }
  
  return response
}

const formatAnalyticsInsights = (insights) => {
  if (!insights.keyInsights) return "Here are some insights about your activity!"
  
  let response = "Here's my analysis of your fitness journey:\n\n"
  
  if (insights.keyInsights) {
    response += "**Key Insights:**\n"
    insights.keyInsights.forEach((insight, index) => {
      response += `${index + 1}. ${insight}\n`
    })
    response += "\n"
  }
  
  if (insights.successAreas) {
    response += "**Areas of Success:**\n"
    insights.successAreas.forEach((area, index) => {
      response += `${index + 1}. ${area}\n`
    })
    response += "\n"
  }
  
  if (insights.recommendations) {
    response += "**Recommendations:**\n"
    insights.recommendations.forEach((rec, index) => {
      response += `${index + 1}. ${rec}\n`
    })
    response += "\n"
  }
  
  if (insights.engagementAnalysis) {
    response += `**Engagement Analysis:**\n${insights.engagementAnalysis}\n\n`
  }
  
  if (insights.programInsights) {
    response += `**Program Insights:**\n${insights.programInsights}`
  }
  
  return response
}

const formatEmailContent = (email) => {
  if (!email.subject) return "I can help generate email content for you!"
  
  let response = "Here's a personalized email I generated for you:\n\n"
  response += `**Subject:** ${email.subject}\n\n`
  response += `**Content:**\n${email.content}\n\n`
  
  if (email.callToAction) {
    response += `**Call to Action:** ${email.callToAction}\n\n`
  }
  
  if (email.personalization) {
    response += `**Personalization Notes:** ${email.personalization}`
  }
  
  return response
}

const formatMessage = (content) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const scrollToBottom = () => {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

const clearChat = () => {
  if (confirm('Are you sure you want to clear the chat history?')) {
    messages.value = []
  }
}

const exportChat = () => {
  const chatData = {
    timestamp: new Date().toISOString(),
    messages: messages.value,
    settings: settings.value
  }
  
  const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to default?')) {
    settings.value = {
      temperature: 0.7,
      maxTokens: 1024
    }
  }
}

// Lifecycle
onMounted(async () => {
  // Add welcome message
  const welcomeMessage = {
    id: Date.now(),
    type: 'ai',
    content: "Hello! I'm your AI assistant powered by Gemini AI. I can help you with program recommendations, fitness tips, nutrition advice, motivation, and more. How can I assist you today?",
    timestamp: new Date()
  }
  
  messages.value.push(welcomeMessage)
  
  // Focus on input
  await nextTick()
  if (messageInput.value) {
    messageInput.value.focus()
  }
})

// Watch for new messages to auto-scroll
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })
</script>

<style scoped>
.genai-assistant {
  max-width: 1000px;
  margin: 0 auto;
}

.assistant-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.status-indicator .badge {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.chat-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f8f9fa;
}

.message {
  display: flex;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.75rem;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #007bff;
  color: white;
}

.message.ai .message-avatar {
  background: #28a745;
  color: white;
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.user .message-content {
  background: #007bff;
  color: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.message-body {
  line-height: 1.5;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.quick-actions {
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.quick-actions h5 {
  margin-bottom: 1rem;
  color: #495057;
}

.chat-input {
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #dee2e6;
}

.input-suggestions {
  margin-top: 0.5rem;
}

.features-panel .feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  height: 100%;
}

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.feature-content h6 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.feature-content p {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

/* Responsive design */
@media (max-width: 768px) {
  .assistant-header {
    padding: 1.5rem;
  }
  
  .chat-messages {
    height: 300px;
    padding: 1rem;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .features-panel .feature-item {
    flex-direction: column;
    text-align: center;
  }
}

/* Custom slider styling for better visibility */
.creativity-slider {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;
}

.creativity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.creativity-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

/* Text visibility improvements */
.text-white-75 {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 500;
}

/* Settings panel improvements */
.settings-panel .card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #dee2e6;
}

.settings-panel .form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
}

.settings-panel .text-muted {
  color: #6c757d !important;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Alert improvements */
.alert-sm {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

/* Mobile slider improvements */
@media (max-width: 768px) {
  .creativity-slider {
    height: 10px;
  }
  
  .creativity-slider::-webkit-slider-thumb {
    width: 28px;
    height: 28px;
  }
  
  .creativity-slider::-moz-range-thumb {
    width: 28px;
    height: 28px;
  }
}

/* Enhanced settings styling */
.setting-group {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  height: 100%;
}

.setting-label {
  font-weight: 700;
  color: #495057;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.slider-container {
  margin-bottom: 1rem;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.value-display {
  min-width: 60px;
  text-align: center;
}

.setting-description {
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  font-size: 0.9rem;
  color: #495057;
  line-height: 1.4;
}

.response-select {
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  padding: 0.75rem;
  font-size: 1rem;
}

.response-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.settings-actions {
  border-top: 1px solid #dee2e6;
  padding-top: 1.5rem;
}

.settings-actions .btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
}
</style>
