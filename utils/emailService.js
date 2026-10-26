import nodemailer from 'nodemailer'
import { ConfidentialClientApplication } from '@azure/msal-node'
import dotenv from 'dotenv'

dotenv.config()

const SMTP_HOST = 'smtp.office365.com'
const SMTP_PORT = 587
const SMTP_SCOPE = 'https://outlook.office365.com/.default'

let msalClient

const getMicrosoftConfig = () => {
  const config = {
    tenantId: process.env.MICROSOFT_TENANT_ID,
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    email: process.env.MICROSOFT_EMAIL,
  }
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => `MICROSOFT_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`)

  if (missing.length) {
    throw new Error(`Missing Microsoft OAuth configuration: ${missing.join(', ')}`)
  }

  return config
}

const getMsalClient = () => {
  if (msalClient) return msalClient

  const { tenantId, clientId, clientSecret } = getMicrosoftConfig()
  console.log('[EMAIL DEBUG] Initializing Microsoft MSAL confidential client.')
  msalClient = new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}`,
      clientSecret,
    },
  })
  return msalClient
}

const logSmtpTokenClaims = (accessToken) => {
  try {
    const [, payload] = accessToken.split('.')
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    console.log('[EMAIL DEBUG] SMTP token claims:', {
      audience: claims.aud,
      roles: claims.roles || [],
      expiresAt: claims.exp ? new Date(claims.exp * 1000).toISOString() : undefined,
    })
  } catch {
    console.warn('[EMAIL DEBUG] Could not decode diagnostic token claims; token value omitted.')
  }
}

const createTransporter = async (email) => {
  console.log(`[EMAIL DEBUG] Requesting Microsoft access token for SMTP scope: ${SMTP_SCOPE}`)
  const tokenResponse = await getMsalClient().acquireTokenByClientCredential({ scopes: [SMTP_SCOPE] })
  if (!tokenResponse?.accessToken) {
    console.error('[EMAIL DEBUG] Microsoft token request completed without an access token.')
    throw new Error('Microsoft identity platform did not return an access token.')
  }
  console.log(`[EMAIL DEBUG] Microsoft access token acquired${tokenResponse.expiresOn ? `; expires at ${tokenResponse.expiresOn.toISOString()}` : ''}. Token value omitted.`)
  logSmtpTokenClaims(tokenResponse.accessToken)

  console.log(`[EMAIL DEBUG] Creating SMTP transport for ${SMTP_HOST}:${SMTP_PORT} using OAuth2.`)
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      type: 'OAuth2',
      user: email,
      accessToken: tokenResponse.accessToken,
    },
  })
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character])

export const sendOtpEmail = async (toEmail, otpCode, userName = 'User') => {
  try {
    const { email } = getMicrosoftConfig()
    const transporter = await createTransporter(email)
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #38bdf8; margin: 0; font-size: 24px;">Orogen Account Verification</h2>
        </div>
        <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">Hello <strong>${escapeHtml(userName)}</strong>,</p>
        <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">Thank you for registering with Orogen. To complete your account verification and activate your profile, please enter the 6-digit OTP code below:</p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background-color: #1e293b; padding: 14px 28px; border-radius: 12px; border: 1px solid #334155;">${escapeHtml(otpCode)}</div>
        </div>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; text-align: center;">This verification code is valid for <strong>10 minutes</strong>. If you did not request this email, please ignore it.</p>
        <hr style="border: none; border-top: 1px solid #1e293b; margin: 28px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Orogen. All rights reserved.</p>
      </div>
    `

    const fromAddress = process.env.SMTP_FROM || `Orogen Verification <${email}>`
    console.log('[EMAIL DEBUG] Verifying SMTP connection and OAuth authentication.')
    await transporter.verify()
    console.log('[EMAIL DEBUG] SMTP connection and OAuth authentication verified.')

    console.log(`[EMAIL DEBUG] Submitting verification email to ${toEmail}.`)
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `${otpCode} is your Orogen verification code`,
      html: htmlContent,
    })

    console.log(`✅ [EMAIL SENT] Message ID: ${info.messageId} to ${toEmail}`)
    return { sent: true }
  } catch (err) {
    // Never log the OTP, access token, client secret, or OAuth response body.
    console.error(`❌ [EMAIL SEND ERROR] Failed to send email to ${toEmail}: ${err.message}`)
    if (err.code || err.responseCode || err.command) {
      console.error('[EMAIL DEBUG] Failure details:', {
        code: err.code,
        responseCode: err.responseCode,
        command: err.command,
      })
    }
    return { sent: false, error: err.message }
  }
}
