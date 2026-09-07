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
              let safeAction = actionUrl || 'https://yantrotsavv10.vercel.app/dashboard'
              if (safeAction.includes('localhost')) {
                const queryString = safeAction.includes('?') ? safeAction.substring(safeAction.indexOf('?')) : ''
                safeAction = `https://yantrotsavv10.vercel.app/dashboard${queryString}`
              }

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

        if (req.method === 'POST' && req.url === '/api/contact') {
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
                    message: 'Email service is not configured (Gmail credentials missing in .env).',
                  }),
                )
                return
              }

              const { name, email, phone, queryType, message } = JSON.parse(body || '{}')

              if (!name?.trim() || !email?.trim() || !queryType?.trim() || !message?.trim()) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    success: false,
                    message: 'Please fill in all required fields.',
                  }),
                )
                return
              }

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

              const escapeHtml = (value: string) =>
                value
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;')

              await transporter.sendMail({
                from: `"YANTROTSAV Contact Desk" <${gmailUser}>`,
                to: 'priyanshuguptawebdev@gmail.com',
                replyTo: email.trim(),
                subject: `[YANTROTSAV QUERY] ${queryType.trim()} - ${name.trim()}`,
                text: `
YANTROTSAV 2026
------------------------------
New Query Received

Name: ${name.trim()}
Email: ${email.trim()}
Phone / WhatsApp: ${phone?.trim() || 'Not provided'}
Query Type: ${queryType.trim()}

Message:
${message.trim()}

------------------------------
This message was submitted through the Yantrotsav website.
                `.trim(),
                html: `
                  <div style="background-color:#080A0F;color:#ffffff;padding:24px;border:1px solid #1e293b;border-top:3px solid #FF6B00;font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="text-align:center;padding-bottom:16px;border-bottom:1px solid #1e293b;">
                      <h2 style="margin:0;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">YANTROTSAV <span style="color:#FF6B00;">2026</span></h2>
                      <p style="margin:4px 0 0;font-family:monospace;font-size:11px;color:#00E5FF;letter-spacing:1px;">QUERY DISPATCH PROTOCOL</p>
                    </div>
                    <div style="padding:20px 0;">
                      <p style="font-size:14px;color:#cbd5e1;">A new student query has been submitted via the web portal:</p>
                      <table style="width:100%;font-size:13px;color:#cbd5e1;margin-bottom:16px;border-collapse:collapse;">
                        <tr><td style="padding:6px 0;color:#94a3b8;width:120px;">Name:</td><td style="font-weight:bold;color:#fff;">${escapeHtml(name.trim())}</td></tr>
                        <tr><td style="padding:6px 0;color:#94a3b8;">Email:</td><td><a href="mailto:${escapeHtml(email.trim())}" style="color:#00E5FF;">${escapeHtml(email.trim())}</a></td></tr>
                        <tr><td style="padding:6px 0;color:#94a3b8;">Phone:</td><td style="color:#fff;">${escapeHtml(phone?.trim() || 'Not provided')}</td></tr>
                        <tr><td style="padding:6px 0;color:#94a3b8;">Query Type:</td><td><span style="background:#FF6B00;color:#fff;padding:2px 8px;font-size:11px;font-weight:bold;">${escapeHtml(queryType.trim())}</span></td></tr>
                      </table>
                      <div style="background:#0d121f;border-left:3px solid #FF6B00;padding:14px;margin:16px 0;">
                        <div style="font-family:monospace;font-size:11px;color:#00E5FF;margin-bottom:6px;">[MESSAGE]</div>
                        <div style="font-size:13px;color:#ffffff;white-space:pre-wrap;line-height:1.5;">${escapeHtml(message.trim())}</div>
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
              res.end(JSON.stringify({ success: true, message: 'Query sent successfully.' }))
            } catch (err: any) {
              console.error('Dev contact dispatch error:', err)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, message: err.message || 'Failed to dispatch email' }))
            }
          })
          return
        }

        if (req.method === 'POST' && req.url === '/api/admin/delete-user') {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const env = loadEnv('', process.cwd(), '')
              const endpoint = env.VITE_APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
              const projectId = env.VITE_APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '6a9be53300040e6fd485'
              const databaseId = env.VITE_APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || '6a9be599001bf72a4855'
              const apiKey = env.APPWRITE_API_KEY || process.env.APPWRITE_API_KEY || env.VITE_APPWRITE_API_KEY

              const { userId, docId, email } = JSON.parse(body || '{}')

              let authDeleted = false
              let tableDeleted = false
              const errors: string[] = []

              if (apiKey) {
                try {
                  let targetAuthId = userId
                  if (email) {
                    try {
                      const listRes = await fetch(`${endpoint}/users?search=${encodeURIComponent(email)}`, {
                        headers: {
                          'X-Appwrite-Project': projectId,
                          'X-Appwrite-Key': apiKey,
                        },
                      })
                      if (listRes.ok) {
                        const listData = (await listRes.json()) as any
                        const matched = listData.users?.find(
                          (u: any) => u.email?.toLowerCase() === email.toLowerCase(),
                        )
                        if (matched) {
                          targetAuthId = matched.$id
                        }
                      }
                    } catch (e: any) {
                      console.warn('Dev search user by email error:', e.message)
                    }
                  }

                  if (targetAuthId) {
                    const delAuthRes = await fetch(`${endpoint}/users/${targetAuthId}`, {
                      method: 'DELETE',
                      headers: {
                        'X-Appwrite-Project': projectId,
                        'X-Appwrite-Key': apiKey,
                      },
                    })
                    if (delAuthRes.ok || delAuthRes.status === 404) {
                      authDeleted = true
                    } else {
                      const errText = await delAuthRes.text()
                      errors.push(`Auth delete status: ${delAuthRes.status} ${errText}`)
                    }
                  }

                  const targetDocId = docId || userId
                  if (targetDocId) {
                    const delDocRes = await fetch(
                      `${endpoint}/databases/${databaseId}/collections/users/documents/${targetDocId}`,
                      {
                        method: 'DELETE',
                        headers: {
                          'X-Appwrite-Project': projectId,
                          'X-Appwrite-Key': apiKey,
                        },
                      },
                    )
                    if (delDocRes.ok || delDocRes.status === 404) {
                      tableDeleted = true
                    } else {
                      const errText = await delDocRes.text()
                      errors.push(`Table delete status: ${delDocRes.status} ${errText}`)
                    }
                  }
                } catch (err: any) {
                  errors.push(`Server API error: ${err.message}`)
                }
              } else {
                errors.push('APPWRITE_API_KEY is not configured in environment. Auth deletion skipped.')
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  success: true,
                  authDeleted,
                  tableDeleted,
                  warnings: errors.length > 0 ? errors : undefined,
                }),
              )
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, message: err.message }))
            }
          })
          return
        }

        if (req.method === 'POST' && req.url === '/api/admin/delete-file') {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const env = loadEnv('', process.cwd(), '')
              const endpoint = env.VITE_APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
              const projectId = env.VITE_APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '6a9be53300040e6fd485'
              const apiKey = env.APPWRITE_API_KEY || process.env.APPWRITE_API_KEY || env.VITE_APPWRITE_API_KEY
              const { fileId, bucketId } = JSON.parse(body || '{}')

              if (!fileId) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, message: 'Missing fileId parameter' }))
                return
              }

              const targetBucket = bucketId || env.VITE_APPWRITE_STORAGE_BUCKET_ID || process.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'event_banners'

              if (apiKey) {
                const delRes = await fetch(`${endpoint}/storage/buckets/${targetBucket}/files/${fileId}`, {
                  method: 'DELETE',
                  headers: {
                    'X-Appwrite-Project': projectId,
                    'X-Appwrite-Key': apiKey,
                  },
                })
                if (delRes.ok || delRes.status === 204 || delRes.status === 404) {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ success: true, message: `File ${fileId} deleted successfully.` }))
                  return
                }
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, message: 'APPWRITE_API_KEY is not configured in local environment.' }))
            } catch (err: any) {
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