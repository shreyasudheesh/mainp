import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
}

/**
 * Send a medication reminder email
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @param {string} medicationName - Medication name
 * @param {string} dosage - Dosage info
 * @param {string} time - Reminder time
 */
export async function sendReminderEmail(to, userName, medicationName, dosage, time) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f0f4f8; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .pill-icon { font-size: 48px; }
        h1 { color: #1e3a5f; font-size: 28px; margin: 10px 0; }
        .reminder-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .med-name { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
        .dosage { font-size: 18px; opacity: 0.9; }
        .time-text { font-size: 20px; color: #4a5568; text-align: center; margin: 20px 0; }
        .footer { text-align: center; color: #a0aec0; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="pill-icon">💊</div>
          <h1>Medication Reminder</h1>
        </div>
        <p style="font-size: 18px; color: #4a5568;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 18px; color: #4a5568;">It's time to take your medication:</p>
        <div class="reminder-box">
          <div class="med-name">${medicationName}</div>
          <div class="dosage">${dosage || 'As prescribed'}</div>
        </div>
        <div class="time-text">⏰ Scheduled for: <strong>${time}</strong></div>
        <p style="font-size: 16px; color: #718096;">Please take your medication as prescribed by your doctor. Stay healthy! 🌟</p>
        <div class="footer">
          <p>Sent with ❤️ by MedRemind</p>
        </div>
      </div>
    </body>
    </html>
  `;

    try {
        const mail = getTransporter();
        await mail.sendMail({
            from: `"MedRemind 💊" <${process.env.SMTP_USER}>`,
            to,
            subject: `💊 Medication Reminder: ${medicationName}`,
            html,
        });
        console.log(`📧 Email reminder sent to ${to} for ${medicationName}`);
    } catch (err) {
        console.error('Email send error:', err.message);
        throw err;
    }
}
