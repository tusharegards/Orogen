import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create Nodemailer Transporter
const createTransporter = () => {
  // Use configured SMTP credentials
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  }

  // Gmail direct service fallback
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  }

  return null
}

export const sendOtpEmail = async (toEmail, otpCode, userName = 'User') => {
  const transporter = createTransporter()
  const fromAddress = process.env.SMTP_FROM || `Orogen Verification <${process.env.SMTP_USER || 'no-reply@orogen.com'}>`

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #38bdf8; margin: 0; font-size: 24px;">Orogen Account Verification</h2>
      </div>
      <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">Thank you for registering with Orogen. To complete your account verification and activate your profile, please enter the 6-digit OTP code below:</p>
      
      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background-color: #1e293b; padding: 14px 28px; border-radius: 12px; border: 1px solid #334155;">
          ${otpCode}
        </div>
      </div>
      
      <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; text-align: center;">This verification code is valid for <strong>10 minutes</strong>. If you did not request this email, please ignore it.</p>
      <hr style="border: none; border-top: 1px solid #334155; margin: 28px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Orogen. All rights reserved.</p>
    </div>
  `

  if (!transporter) {
    console.log(`\n==================================================`)
    console.log(`📧 [EMAIL VERIFICATION OTP]`)
    console.log(`To: ${toEmail}`)
    console.log(`OTP Code: ${otpCode}`)
    console.log(`⚠️ SMTP credentials not set in .env.`)
    console.log(`==================================================\n`)
    return { sent: false, simulated: true }
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `${otpCode} is your Orogen verification code`,
      html: htmlContent,
    })

    console.log(`✅ [EMAIL SENT SUCCESSFULLY] Message ID: ${info.messageId} to ${toEmail}`)
    return { sent: true }
  } catch (err) {
    console.error(`❌ [EMAIL SEND ERROR] Failed to send email to ${toEmail}:`, err.message)
    console.log(`\n==================================================`)
    console.log(`🔑 [BACKUP OTP CODE] For ${toEmail}: ${otpCode}`)
    console.log(`⚠️ SMTP Reason: ${err.message}`)
    console.log(`==================================================\n`)
    return { sent: false, error: err.message, otpCode }
  }
}
