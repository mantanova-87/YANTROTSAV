import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'

const gmailUser = process.env.GMAIL_USER
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  if (!gmailUser || !gmailAppPassword) {
    console.warn('Gmail SMTP credentials not configured in environment.')
    return res.status(500).json({
      success: false,
      message: 'Email service is not configured.',
    })
  }

  try {
    const { toEmail, inviteeName, teamName, eventTitle, actionUrl } = req.body ?? {}

    if (!toEmail || typeof toEmail !== 'string' || !teamName || !eventTitle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required invitation fields (toEmail, teamName, eventTitle).',
      })
    }

    const safeToEmail = toEmail.trim()
    const safeInvitee = (inviteeName ? String(inviteeName).trim() : '') || 'Student'
    const safeTeam = String(teamName).trim()
    const safeEvent = String(eventTitle).trim()
    const safeActionUrl = (actionUrl ? String(actionUrl).trim() : '') || 'https://yantrotsav.com'

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })

    const subject = `[YANTROTSAV 2026] Team Invitation: ${safeTeam} for ${safeEvent}`

    const textContent = `
YANTROTSAV 2026 - INVITATION PROTOCOL
=============================================
Hello ${safeInvitee},

You have been officially invited to join "${safeTeam}" for "${safeEvent}" at YANTROTSAV 2026!

To accept or review your invitation, access your student portal here:
${safeActionUrl}

If you did not expect this invitation, you may ignore this transmission.
=============================================
Department of Computer Science & Engineering
Central University of Jammu
    `.trim()

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background-color: #050816; font-family: 'Segoe UI', Arial, sans-serif; color: #ffffff; }
    .container { max-width: 600px; margin: 20px auto; background-color: #080A0F; border: 1px solid #1e293b; border-top: 3px solid #00E5FF; }
    .header { padding: 30px; text-align: center; border-bottom: 1px solid #1e293b; }
    .title { font-size: 22px; font-weight: 900; letter-spacing: 0.15em; color: #ffffff; margin: 0; text-transform: uppercase; }
    .accent-dot { display: inline-block; width: 6px; height: 6px; background-color: #FF6B00; margin-left: 4px; }
    .subhead { font-family: monospace; font-size: 11px; letter-spacing: 0.2em; color: #00E5FF; margin-top: 8px; text-transform: uppercase; }
    .content { padding: 30px; }
    .box { background-color: #0d121f; border-left: 3px solid #FF6B00; padding: 18px; margin: 20px 0; }
    .btn-container { text-align: center; margin: 30px 0; }
    .btn { background: #FF6B00; color: #ffffff !important; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; display: inline-block; border-radius: 2px; }
    .footer { padding: 20px 30px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">YANTROTSAV<span class="accent-dot"></span></div>
      <div class="subhead">National Tech Fest / 2026</div>
    </div>
    <div class="content">
      <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
        Greetings <strong>${escapeHtml(safeInvitee)}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
        You have received an official nomination to unite forces for <strong>YANTROTSAV 2026</strong>.
      </p>

      <div class="box">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-family: monospace; color: #00E5FF; text-transform: uppercase;">
          [TEAM SPECIFICATION]
        </p>
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #ffffff;">
          ${escapeHtml(safeTeam)}
        </p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">
          Target Event: <strong style="color: #ffffff;">${escapeHtml(safeEvent)}</strong>
        </p>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
        Log into your dashboard to confirm your spot on the roster before the registration deadline.
      </p>

      <div class="btn-container">
        <a href="${escapeHtml(safeActionUrl)}" class="btn">View & Accept Invitation</a>
      </div>
    </div>
    <div class="footer">
      Central University of Jammu • Department of Computer Science & Engineering<br />
      If you did not request this invitation, no further action is required.
    </div>
  </div>
</body>
</html>
    `.trim()

    await transporter.sendMail({
      from: `"YANTROTSAV 2026" <${gmailUser}>`,
      to: safeToEmail,
      subject,
      text: textContent,
      html: htmlContent,
    })

    return res.status(200).json({
      success: true,
      message: 'Invitation email dispatched successfully.',
    })
  } catch (error: any) {
    console.error('Send invite email error:', error)
    // Fallback: If Gmail daily limit or temporary network socket fails,
    // gracefully return 200 so team creation in Appwrite database is never blocked
    return res.status(200).json({
      success: true,
      emailQueued: false,
      warning: 'Invitation recorded in system; email notification deferred due to provider limits.',
    })
  }
}
