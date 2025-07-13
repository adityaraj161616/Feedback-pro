import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // Use `true` for port 465, `false` for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP environment variables are not set. Skipping email sending.")
    return
  }

  try {
    await transporter.sendMail({
      from: `"FeedbackPro" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to} with subject: ${subject}`)
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error)
    throw error // Re-throw to be caught by the caller if needed
  }
}

export function generateFeedbackReceivedEmail(
  userName: string,
  formTitle: string,
  feedbackContent: string,
  sentimentLabel: string,
  sentimentScore: number,
  feedbackLink: string,
) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #4A90E2;">New Feedback Received!</h2>
      <p>Hello ${userName},</p>
      <p>You've received new feedback for your form: <strong>"${formTitle}"</strong>.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4A90E2; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">Feedback Content:</h3>
        <p>${feedbackContent || "No specific text feedback provided."}</p>
        <p><strong>Sentiment:</strong> <span style="color: ${
          sentimentLabel === "Positive" ? "#28a745" : sentimentLabel === "Negative" ? "#dc3545" : "#ffc107"
        }; font-weight: bold;">${sentimentLabel}</span> (Score: ${Math.round(sentimentScore * 100)}%)</p>
      </div>
      <p>You can view all feedback and analytics for this form by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${feedbackLink}" style="display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: #ffffff; text-decoration: none; border-radius: 5px;">View Feedback Dashboard</a>
      </p>
      <p>Thank you for using FeedbackPro!</p>
      <p>Best regards,<br>The FeedbackPro Team</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 0.8em; color: #999; text-align: center;">This is an automated email, please do not reply.</p>
    </div>
  `
}

export function generateUserAcknowledgementEmail(formTitle: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #28a745;">Thank You for Your Feedback!</h2>
      <p>Dear Valued User,</p>
      <p>We've successfully received your feedback for <strong>"${formTitle}"</strong>.</p>
      <p>Your input is incredibly valuable to us and helps us improve. We appreciate you taking the time to share your thoughts.</p>
      <p>If you have any further questions or need assistance, please don't hesitate to reach out.</p>
      <p>Best regards,<br>The FeedbackPro Team</p>
      <hr style="border: 0; border-top: 1px solid 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 0.8em; color: #999; text-align: center;">This is an automated email, please do not reply.</p>
    </div>
  `
}

export function generateWelcomeEmail(userName: string, loginLink: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #6f42c1;">Welcome to FeedbackPro!</h2>
      <p>Hello ${userName},</p>
      <p>Thank you for signing up for FeedbackPro! We're excited to have you on board.</p>
      <p>FeedbackPro helps you easily collect, analyze, and act on user feedback to improve your products and services.</p>
      <p>Get started by logging in and creating your first feedback form:</p>
      <p style="text-align: center;">
        <a href="${loginLink}" style="display: inline-block; padding: 10px 20px; background-color: #6f42c1; color: #ffffff; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      </p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy feedback collecting!</p>
      <p>Best regards,<br>The FeedbackPro Team</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 0.8em; color: #999; text-align: center;">This is an automated email, please do not reply.</p>
    </div>
  `
}
