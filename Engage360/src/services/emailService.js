// Email Service with SendGrid Integration
// Note: This is a demo implementation. For production, replace with actual SendGrid API key

export const emailService = {
  async sendEmail({ to, subject, text, html, attachments = [] }) {
    try {
      // Demo implementation - replace with actual SendGrid
      console.log('Email would be sent:', { to, subject, text, html, attachments })

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return {
        success: true,
        messageId: 'demo-message-id-' + Date.now(),
        message: 'Email sent successfully (demo mode)',
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error: error.message }
    }
  },

  async sendWelcomeEmail(userEmail, userName) {
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
}
