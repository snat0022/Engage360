// Email Service with SendGrid Integration
import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key from environment variables
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY
if (SENDGRID_API_KEY && SENDGRID_API_KEY !== 'your_sendgrid_api_key') {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Check if SendGrid is properly configured
const isSendGridConfigured = () => {
  return SENDGRID_API_KEY && 
         SENDGRID_API_KEY !== 'your_sendgrid_api_key' && 
         SENDGRID_API_KEY.length > 0
}

export const emailService = {
  async sendEmail({ to, subject, text, html, attachments = [] }) {
    try {
      // Validate email address
      if (!isValidEmail(to)) {
        throw new Error(`Invalid email address: ${to}`)
      }

      // Check if SendGrid is configured
      if (!isSendGridConfigured()) {
        console.warn('SendGrid not configured. Email would be sent to:', { to, subject })
        console.warn('To enable real email sending:')
        console.warn('1. Create a SendGrid account at https://sendgrid.com/')
        console.warn('2. Get your API key from SendGrid dashboard')
        console.warn('3. Add VITE_SENDGRID_API_KEY=your_actual_api_key to your .env file')
        console.warn('4. Restart the development server')
        
        // Simulate API call delay for demo
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        return {
          success: true,
          messageId: 'demo-message-id-' + Date.now(),
          message: 'Email would be sent (SendGrid not configured)',
          demo: true
        }
      }

      // Send real email using SendGrid
      const msg = {
        to,
        from: 'noreply@engage360.com', // This must be a verified sender in SendGrid
        subject,
        text,
        html,
        attachments
      }

      console.log('Attempting to send email via SendGrid:', { to, subject })
      const response = await sgMail.send(msg)
      console.log('Email sent successfully:', response)
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        message: 'Email sent successfully via SendGrid',
        demo: false
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response
      })
      
      // Handle specific SendGrid errors
      if (error.response) {
        const { status, body } = error.response
        console.error('SendGrid API error:', { status, body })
        
        if (status === 401) {
          throw new Error('SendGrid API key is invalid. Please check your configuration.')
        } else if (status === 403) {
          throw new Error('SendGrid sender email not verified. Please verify noreply@engage360.com in SendGrid.')
        } else if (status === 400) {
          const errorMessage = body?.errors?.[0]?.message || 'Invalid request'
          throw new Error(`SendGrid validation error: ${errorMessage}`)
        } else {
          throw new Error(`SendGrid error: ${status} - ${JSON.stringify(body)}`)
        }
      }
      
      throw new Error(error.message || 'Failed to send email')
    }
  },

  async sendWelcomeEmail(userEmail, userName) {
    if (!isValidEmail(userEmail)) {
      throw new Error(`Invalid email address: ${userEmail}`)
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Engage360!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for registering with Engage360. We're excited to have you on board!</p>
        <p>You can now access all our programs and features.</p>
        <p>Best regards,<br>The Engage360 Team</p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to Engage360!',
      text: `Welcome to Engage360! Hi ${userName}, thank you for registering.`,
      html,
    })
  },

  async sendNotificationEmail(userEmail, subject, message) {
    if (!isValidEmail(userEmail)) {
      throw new Error(`Invalid email address: ${userEmail}`)
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p>${message}</p>
        <p>Best regards,<br>The Engage360 Team</p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      text: message,
      html,
    })
  },

  async sendBulkEmail(campaign, recipients) {
    try {
      const results = {
        success: [],
        failed: [],
        total: recipients.length
      }

      console.log(`Sending bulk email to ${recipients.length} recipients`)

      // Send emails in batches to avoid rate limits
      const batchSize = 10
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize)
        
        await Promise.allSettled(
          batch.map(async (recipient) => {
            try {
              const result = await this.sendEmail({
                to: recipient.email,
                subject: campaign.subject,
                html: campaign.content,
                text: campaign.content.replace(/<[^>]*>/g, '') // Strip HTML for text version
              })
              
              if (result.success) {
                results.success.push(recipient.email)
              } else {
                results.failed.push({ email: recipient.email, error: result.error })
              }
            } catch (error) {
              console.error(`Failed to send email to ${recipient.email}:`, error)
              results.failed.push({ email: recipient.email, error: error.message })
            }
          })
        )

        // Small delay between batches to avoid rate limits
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      console.log(`Bulk email completed: ${results.success.length} sent, ${results.failed.length} failed`)

      return {
        success: true,
        sent: results.success.length,
        failed: results.failed.length,
        results
      }
    } catch (error) {
      console.error('Bulk email error:', error)
      throw error
    }
  },

  async scheduleBulkEmail(campaign, recipients) {
    console.log(`Scheduling bulk email for ${recipients.length} recipients at ${campaign.scheduledTime}`)
    
    // For now, just save the campaign and send it immediately
    // In a production environment, you would use a task scheduler or queue system
    return this.sendBulkEmail(campaign, recipients)
  },

  async resendCampaign(campaign) {
    console.log(`Resending campaign: ${campaign.subject}`)
    
    // This is a placeholder - in production, you would retrieve the original recipients
    // and resend to them
    console.warn('Campaign resend functionality needs to be implemented with recipient retrieval')
    
    return {
      success: false,
      message: 'Campaign resend not yet implemented'
    }
  },

  // Utility functions
  isValidEmail,
  isSendGridConfigured: isSendGridConfigured()
}
