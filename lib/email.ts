import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Arambh <noreply@arambh.com>'
const APP = process.env.NEXT_PUBLIC_APP_URL

const baseStyle = `
  font-family: Inter, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #1C1917;
`

export async function sendWelcomeEmail(
  to: string,
  name: string,
  orgName: string,
  tempPassword?: string,
) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Welcome to ${orgName} Training 🎉`,
      html: `<div style="${baseStyle}">
        <div style="background:linear-gradient(135deg,#FF6B35,#E85520);
          border-radius:16px;padding:32px;text-align:center;
          margin-bottom:24px;">
          <h1 style="color:white;margin:0;">Welcome to Arambh! 🚀</h1>
          <p style="color:rgba(255,255,255,0.8);margin-top:8px;">
            Your training journey starts today
          </p>
        </div>
        <p>Hi <strong>${name}</strong>,</p>
        <p style="color:#6B7280;">
          You've been added to <strong>${orgName}</strong>.
        </p>
        ${tempPassword ? `
          <div style="background:#FAF9F7;border-radius:12px;
            padding:16px;border-left:4px solid #FF6B35;
            margin:16px 0;">
            <strong>Login credentials:</strong><br/>
            Email: ${to}<br/>
            Password: <strong>${tempPassword}</strong><br/>
            <small style="color:#9CA3AF;">
              Please change password after first login.
            </small>
          </div>` : ''}
        <a href="${APP}/login" style="display:inline-block;
          background:linear-gradient(135deg,#FF6B35,#E85520);
          color:white;padding:12px 24px;border-radius:12px;
          text-decoration:none;font-weight:600;margin-top:16px;">
          Start Learning →
        </a>
      </div>`,
    })
  } catch (e) {
    console.error('Welcome email:', e)
  }
}

export async function sendCertEmail(
  to: string,
  name: string,
  course: string,
  score: number,
  certId: string,
) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `🏆 Certificate: ${course}`,
      html: `<div style="${baseStyle}">
        <div style="background:linear-gradient(135deg,#C8A96E,#B8941E);
          border-radius:16px;padding:32px;text-align:center;">
          <div style="font-size:48px;">🏆</div>
          <h1 style="color:white;margin:8px 0;">
            Congratulations ${name}!
          </h1>
          <p style="color:rgba(255,255,255,0.9);">
            ${course} — Score: ${score}%
          </p>
        </div>
        <div style="text-align:center;margin-top:24px;">
          <a href="${APP}/learn/certificates/${certId}"
            style="display:inline-block;background:#FF6B35;
            color:white;padding:12px 24px;border-radius:12px;
            text-decoration:none;font-weight:600;">
            View Certificate →
          </a>
        </div>
      </div>`,
    })
  } catch (e) {
    console.error('Cert email:', e)
  }
}

export async function sendStreakEmail(to: string, name: string, streak: number) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `🔥 Keep your ${streak}-day streak alive!`,
      html: `<div style="${baseStyle}">
        <h2>Hey ${name}, don't lose your streak! 🔥</h2>
        <p style="color:#6B7280;">
          You're on a <strong>${streak}-day streak</strong>.
          Complete one lesson today!
        </p>
        <a href="${APP}/learn"
          style="display:inline-block;background:#FF6B35;
          color:white;padding:12px 24px;border-radius:12px;
          text-decoration:none;font-weight:600;">
          Continue Learning →
        </a>
      </div>`,
    })
  } catch (e) {
    console.error('Streak email:', e)
  }
}

