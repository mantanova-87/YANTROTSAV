import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.error("Gmail environment variables are missing.");

    return res.status(500).json({
      success: false,
      message: "Email service is not configured.",
    });
  }

  try {
    const { name, email, phone, queryType, message } = req.body ?? {};

    // Basic server-side validation.
    // Client-side Zod validation is still used in Contact.tsx,
    // but never trust browser data alone.
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof queryType !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid form data.",
      });
    }

    if (!name.trim() || !email.trim() || !queryType.trim() || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    await transporter.sendMail({
      from: gmailUser,
      to: "priyanshuguptawebdev@gmail.com",
      replyTo: email.trim(),
      subject: `[YANTROTSAV QUERY] ${queryType.trim()}`,

      text: `
YANTROTSAV 2026
------------------------------

New Query Received

Name: ${name.trim()}
Email: ${email.trim()}
Phone / WhatsApp: ${phone?.trim() || "Not provided"}
Query Type: ${queryType.trim()}

Message:
${message.trim()}

------------------------------
This message was submitted through the Yantrotsav website.
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>YANTROTSAV 2026</h2>

          <p><strong>New Query Received</strong></p>

          <hr />

          <p>
            <strong>Name:</strong>
            ${escapeHtml(name.trim())}
          </p>

          <p>
            <strong>Email:</strong>
            ${escapeHtml(email.trim())}
          </p>

          <p>
            <strong>Phone / WhatsApp:</strong>
            ${escapeHtml(phone?.trim() || "Not provided")}
          </p>

          <p>
            <strong>Query Type:</strong>
            ${escapeHtml(queryType.trim())}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <div style="
            padding: 15px;
            background: #f4f4f4;
            border-left: 4px solid #ff6b00;
            white-space: pre-wrap;
          ">
            ${escapeHtml(message.trim())}
          </div>

          <hr />

          <p style="color: #777; font-size: 12px;">
            Submitted through the Yantrotsav website.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Query sent successfully.",
    });
  } catch (error) {
    console.error("Email sending error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send query.",
    });
  }
}

/**
 * Prevent user-provided text from being interpreted as HTML
 * inside the email body.
 */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
