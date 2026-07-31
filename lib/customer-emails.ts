import { sendEmail } from '@/lib/email'

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

function wrapper(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B3A2D; padding: 24px; text-align: center;">
        <h1 style="color: #00B896; margin: 0; font-size: 24px;">Blue Hole Jamaica</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1B3A2D; margin-top: 0;">${title}</h2>
        ${bodyHtml}
      </div>
    </div>
  `
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${getSiteUrl()}/account/verify-email/${token}`
  try {
    await sendEmail({
      to: email,
      subject: 'Verify your email | Blue Hole Jamaica',
      html: wrapper(
        `Welcome, ${name}!`,
        `
          <p style="color: #555;">Please confirm your email address to activate your account.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${link}" style="background: #00B896; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 10px; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #999; font-size: 12px;">If the button doesn't work, copy this link: ${link}</p>
        `
      ),
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${getSiteUrl()}/account/reset-password/${token}`
  try {
    await sendEmail({
      to: email,
      subject: 'Reset your password | Blue Hole Jamaica',
      html: wrapper(
        `Hi ${name},`,
        `
          <p style="color: #555;">We received a request to reset your password. This link expires in 1 hour.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${link}" style="background: #00B896; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 10px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        `
      ),
    })
  } catch (error) {
    console.error('Failed to send password reset email:', error)
  }
}
