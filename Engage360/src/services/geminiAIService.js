// Gemini AI Integration Service
// This service integrates Google's Gemini AI for various features

class GeminiAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta'
    this.model = 'gemini-pro'
    this.isInitialized = false
  }

  // Initialize the service
  async initialize() {
    if (!this.apiKey) {
      console.warn('Gemini API key not found. AI features will be limited.')
      return false
    }

    try {
      // Test API connection
      await this.testConnection()
      this.isInitialized = true
      console.log('Gemini AI Service initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Gemini AI Service:', error)
      return false
    }
  }

  // Test API connection
  async testConnection() {
    const response = await fetch(`${this.baseURL}/models/${this.model}?key=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`API connection failed: ${response.status}`)
    }
    return response.json()
  }

  // Generate content using Gemini AI
  async generateContent(prompt, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Gemini AI Service not initialized')
    }

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxTokens || 1024,
          stopSequences: options.stopSequences || []
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }

      const response = await fetch(`${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return {
          success: true,
          content: data.candidates[0].content.parts[0].text,
          usage: data.usageMetadata || null
        }
      } else {
        throw new Error('Invalid response format from Gemini API')
      }

    } catch (error) {
      console.error('Error generating content with Gemini AI:', error)
      return {
        success: false,
        error: error.message,
        content: null
      }
    }
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.isInitialized,
      apiKeyPresent: !!this.apiKey,
      model: this.model,
      baseURL: this.baseURL
    }
  }
  async generateProgramRecommendations(userProfile, availablePrograms) {
    const prompt = `
    Based on the following user profile and available programs, provide personalized recommendations:

    User Profile:
    - Age: ${userProfile.age || 'Not specified'}
    - Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
    - Fitness Level: ${userProfile.fitnessLevel || 'Not specified'}
    - Goals: ${userProfile.goals?.join(', ') || 'Not specified'}
    - Previous Programs: ${userProfile.previousPrograms?.join(', ') || 'None'}
    - Availability: ${userProfile.availability || 'Not specified'}

    Available Programs:
    ${availablePrograms.map(program => `
    - ${program.name}: ${program.description}
      Duration: ${program.duration}
      Schedule: ${program.schedule}
      Category: ${program.category}
      Difficulty: ${program.difficulty || 'Not specified'}
    `).join('\n')}

    Please provide:
    1. Top 3 program recommendations with explanations
    2. Why each program is suitable for this user
    3. Any additional suggestions or considerations
    4. Potential challenges and how to overcome them

    Format your response as a structured JSON object with the following structure:
    {
      "recommendations": [
        {
          "programName": "Program Name",
          "reason": "Why this program is recommended",
          "suitability": "How well it matches the user's profile",
          "challenges": "Potential challenges",
          "tips": "Tips for success"
        }
      ],
      "additionalSuggestions": "Additional recommendations",
      "overallAssessment": "Overall assessment of user's fitness journey"
    }
    `

    const result = await this.generateContent(prompt, {
      temperature: 0.8,
      maxTokens: 2048
    })

    if (result.success) {
      try {
        // Try to parse JSON response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            success: true,
            recommendations: parsed
          }
        } else {
          // Fallback to text parsing
          return {
            success: true,
            recommendations: this.parseTextRecommendations(result.content)
          }
        }
      } catch (error) {
        console.error('Error parsing AI recommendations:', error)
        return {
          success: true,
          recommendations: this.parseTextRecommendations(result.content)
        }
      }
    }

    return result
  }

  // Generate personalized email content
  async generatePersonalizedEmail(userData, emailType, context = {}) {
    const prompt = `
    Generate a personalized email for a health charity organization. Here are the details:

    User Information:
    - Name: ${userData.name || 'Valued Member'}
    - Role: ${userData.role || 'Member'}
    - Programs Enrolled: ${userData.enrolledPrograms?.join(', ') || 'None'}
    - Last Activity: ${userData.lastActivity || 'Not specified'}
    - Preferences: ${userData.preferences || 'Not specified'}

    Email Type: ${emailType}
    Context: ${JSON.stringify(context)}

    Email Types and Requirements:
    - welcome: Welcome new members with program information
    - reminder: Remind users about upcoming sessions or deadlines
    - newsletter: Monthly newsletter with updates and tips
    - promotion: Promote new programs or special offers
    - feedback: Request feedback on programs or services
    - achievement: Congratulate users on milestones
    - re-engagement: Encourage inactive users to return

    Please generate:
    1. A compelling subject line
    2. Personalized email content (friendly, encouraging tone)
    3. Call-to-action suggestions
    4. Additional personalization suggestions

    Format as JSON:
    {
      "subject": "Email subject line",
      "content": "Email body content",
      "callToAction": "Suggested call-to-action",
      "personalization": "Additional personalization notes"
    }
    `

    const result = await this.generateContent(prompt, {
      temperature: 0.9,
      maxTokens: 1536
    })

    if (result.success) {
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            success: true,
            email: parsed
          }
        }
      } catch (error) {
        console.error('Error parsing AI email:', error)
      }
    }

    return result
  }

  // Generate fitness tips and advice
  async generateFitnessTips(userProfile, programData) {
    const prompt = `
    Generate personalized fitness tips and advice for a user participating in health programs.

    User Profile:
    - Age: ${userProfile.age || 'Not specified'}
    - Fitness Level: ${userProfile.fitnessLevel || 'Not specified'}
    - Goals: ${userProfile.goals?.join(', ') || 'General fitness'}
    - Current Program: ${programData.name || 'Not specified'}
    - Program Description: ${programData.description || 'Not specified'}

    Please provide:
    1. 5 personalized fitness tips
    2. Nutrition advice relevant to their program
    3. Recovery and rest recommendations
    4. Motivation and mindset tips
    5. Common mistakes to avoid

    Format as JSON:
    {
      "fitnessTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
      "nutritionAdvice": "Nutrition recommendations",
      "recoveryTips": "Recovery and rest advice",
      "motivationTips": "Motivation and mindset advice",
      "commonMistakes": "Common mistakes to avoid"
    }
    `

    const result = await this.generateContent(prompt, {
      temperature: 0.8,
      maxTokens: 1536
    })

    if (result.success) {
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            success: true,
            tips: parsed
          }
        }
      } catch (error) {
        console.error('Error parsing AI tips:', error)
      }
    }

    return result
  }

  // Generate program descriptions and content
  async generateProgramContent(programData) {
    const prompt = `
    Generate engaging content for a health and fitness program. Here are the program details:

    Program Information:
    - Name: ${programData.name}
    - Category: ${programData.category}
    - Duration: ${programData.duration}
    - Schedule: ${programData.schedule}
    - Description: ${programData.description || 'Not provided'}

    Please generate:
    1. An engaging program description (2-3 paragraphs)
    2. Key benefits and outcomes
    3. Who this program is suitable for
    4. What participants will learn
    5. Prerequisites or requirements
    6. Success tips for participants

    Format as JSON:
    {
      "description": "Engaging program description",
      "benefits": ["benefit1", "benefit2", "benefit3"],
      "suitableFor": "Who this program is suitable for",
      "learningOutcomes": ["outcome1", "outcome2", "outcome3"],
      "prerequisites": "Prerequisites or requirements",
      "successTips": ["tip1", "tip2", "tip3"]
    }
    `

    const result = await this.generateContent(prompt, {
      temperature: 0.8,
      maxTokens: 1536
    })

    if (result.success) {
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            success: true,
            content: parsed
          }
        }
      } catch (error) {
        console.error('Error parsing AI program content:', error)
      }
    }

    return result
  }

  // Generate analytics insights
  async generateAnalyticsInsights(analyticsData) {
    const prompt = `
    Analyze the following health charity organization analytics data and provide insights:

    Analytics Data:
    ${JSON.stringify(analyticsData, null, 2)}

    Please provide:
    1. Key insights and trends
    2. Areas of success
    3. Areas for improvement
    4. Recommendations for growth
    5. User engagement analysis
    6. Program performance insights

    Format as JSON:
    {
      "keyInsights": ["insight1", "insight2", "insight3"],
      "successAreas": ["area1", "area2", "area3"],
      "improvementAreas": ["area1", "area2", "area3"],
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
      "engagementAnalysis": "Analysis of user engagement",
      "programInsights": "Program performance insights"
    }
    `

    const result = await this.generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 2048
    })

    if (result.success) {
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            success: true,
            insights: parsed
          }
        }
      } catch (error) {
        console.error('Error parsing AI insights:', error)
      }
    }

    return result
  }

  // Parse text-based recommendations (fallback)
  parseTextRecommendations(content) {
    const lines = content.split('\n').filter(line => line.trim())
    const recommendations = []
    
    let currentRecommendation = {}
    let currentSection = ''
    
    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        if (currentRecommendation.programName) {
          recommendations.push(currentRecommendation)
        }
        currentRecommendation = {
          programName: line.replace(/^\d+\.\s*/, ''),
          reason: '',
          suitability: '',
          challenges: '',
          tips: ''
        }
      } else if (line.toLowerCase().includes('reason') || line.toLowerCase().includes('why')) {
        currentSection = 'reason'
      } else if (line.toLowerCase().includes('suitable') || line.toLowerCase().includes('match')) {
        currentSection = 'suitability'
      } else if (line.toLowerCase().includes('challenge') || line.toLowerCase().includes('difficult')) {
        currentSection = 'challenges'
      } else if (line.toLowerCase().includes('tip') || line.toLowerCase().includes('suggestion')) {
        currentSection = 'tips'
      } else if (line.trim()) {
        if (currentSection && currentRecommendation[currentSection] !== undefined) {
          currentRecommendation[currentSection] += (currentRecommendation[currentSection] ? ' ' : '') + line.trim()
        }
      }
    }
    
    if (currentRecommendation.programName) {
      recommendations.push(currentRecommendation)
    }
    
    return {
      recommendations: recommendations.slice(0, 3),
      additionalSuggestions: 'Generated by AI based on your profile',
      overallAssessment: 'AI-generated assessment based on your preferences and goals'
    }
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.isInitialized,
      apiKeyPresent: !!this.apiKey,
      model: this.model,
      baseURL: this.baseURL
    }
  }
}

// Export singleton instance
export const geminiAIService = new GeminiAIService()
export default geminiAIService
