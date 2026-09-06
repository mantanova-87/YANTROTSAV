import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import nodemailer from 'nodemailer'

function devApiPlugin() {
  return {
    name: 'dev-api-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.method === 'POST' && req.url === '/api/send-invite') {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const env = loadEnv('', process.cwd(), '')
              const gmailUser = env.GMAIL_USER || process.env.GMAIL_USER
              const gmailAppPassword = env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD

              if (!gmailUser || !gmailAppPassword) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    success: false,
                    message: 'Gmail SMTP credentials missing in .env',
                  }),
                )
                return
              }

              const { toEmail, inviteeName, teamName, eventTitle, actionUrl } = JSON.parse(
                body || '{}',
              )

              if (!toEmail) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, message: 'Missing toEmail' }))
                return
              }

              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: gmailUser,
                  pass: gmailAppPassword,
                },
              })

              const safeInvitee = inviteeName || 'Student'
              const safeTeam = teamName || 'Team'
              const safeEvent = eventTitle || 'Event'
              const safeAction = actionUrl || 'http://localhost:5173/dashboard'

              await transporter.sendMail({
                from: `"YANTROTSAV 2026" <${gmailUser}>`,
                to: toEmail,
                subject: `[YANTROTSAV 2026] Team Invitation: ${safeTeam} for ${safeEvent}`,
                html: `
                  <div style="background-color:#080A0F;color:#ffffff;padding:24px;border:1px solid #1e293b;border-top:3px solid #00E5FF;font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="text-align:center;padding-bottom:16px;border-bottom:1px solid #1e293b;">
                      <h2 style="margin:0;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">YANTROTSAV <span style="color:#FF6B00;">2026</span></h2>
                      <p style="margin:4px 0 0;font-family:monospace;font-size:11px;color:#00E5FF;letter-spacing:1px;">NATIONAL TECH FEST // INVITATION PROTOCOL</p>
                    </div>
                    <div style="padding:20px 0;">
                      <p style="font-size:14px;color:#cbd5e1;">Greetings <strong>${safeInvitee}</strong>,</p>
                      <p style="font-size:13px;color:#94a3b8;">You have been officially invited to join team <strong>${safeTeam}</strong> for <strong>${safeEvent}</strong>.</p>
                      <div style="background:#0d121f;border-left:3px solid #FF6B00;padding:14px;margin:16px 0;">
                        <div style="font-family:monospace;font-size:11px;color:#00E5FF;">[TEAM DETAILS]</div>
                        <div style="font-size:16px;font-weight:bold;color:#ffffff;margin-top:4px;">${safeTeam}</div>
                        <div style="font-size:12px;color:#94a3b8;margin-top:2px;">Event: <strong style="color:#fff;">${safeEvent}</strong></div>
                      </div>
                      <div style="text-align:center;margin:24px 0;">
                        <a href="${safeAction}" style="background:#FF6B00;color:#ffffff;padding:12px 28px;text-decoration:none;font-weight:bold;font-size:12px;text-transform:uppercase;letter-spacing:1px;display:inline-block;">View & Accept Invitation</a>
                      </div>
                    </div>
                    <div style="border-top:1px solid #1e293b;padding-top:14px;font-size:11px;color:#64748b;text-align:center;">
                      Central University of Jammu • Department of Computer Science & Engineering
                    </div>
                  </div>
                `,
              })

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Invitation email dispatched successfully.' }))
            } catch (err: any) {
              console.error('Dev email dispatch error:', err)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, message: err.message }))
            }
          })
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiPlugin()],
})