import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP configuration at module load to get early, clear diagnostics.
transporter.verify()
  .then(() => {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log("[Email] SMTP connection verified");
    } else {
      console.log("[Email] SMTP configured but credentials missing or empty");
    }
  })
  .catch((err) => {
    console.error("[Email] SMTP verify failed:", err && err.message ? err.message : err);
  });

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  // Skip if SMTP not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email] SMTP not configured. Would send to: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Property CRM" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    return false;
  }
}
