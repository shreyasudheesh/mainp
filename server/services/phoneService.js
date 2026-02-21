import twilio from 'twilio';

let client = null;

function getClient() {
    if (!client) {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        if (!sid || !token) {
            throw new Error('Twilio credentials not configured');
        }
        client = twilio(sid, token);
    }
    return client;
}

/**
 * Make a phone call reminder using Twilio
 * @param {string} to - Phone number in E.164 format (e.g., +1234567890)
 * @param {string} userName - User's name
 * @param {string} medicationName - Medication name
 * @param {string} dosage - Dosage info
 */
export async function makeReminderCall(to, userName, medicationName, dosage) {
    if (!to) {
        console.warn('No phone number provided for call reminder');
        return;
    }

    const twiml = `
    <Response>
      <Say voice="alice" language="en-US">
        Hello ${userName}. This is your medication reminder from Med Remind.
        It is time to take your medication: ${medicationName}.
        ${dosage ? `The dosage is ${dosage}.` : ''}
        Please take your medication as prescribed by your doctor.
        Take care and stay healthy!
      </Say>
      <Pause length="1"/>
      <Say voice="alice" language="en-US">
        If you need to hear this again, please stay on the line.
      </Say>
      <Pause length="2"/>
      <Say voice="alice" language="en-US">
        Reminder: Take ${medicationName}. ${dosage ? `Dosage: ${dosage}.` : ''}
        Goodbye and take care!
      </Say>
    </Response>
  `;

    try {
        const twilioClient = getClient();
        const call = await twilioClient.calls.create({
            twiml,
            to,
            from: process.env.TWILIO_PHONE_NUMBER,
        });
        console.log(`📞 Phone reminder call initiated to ${to} for ${medicationName} (SID: ${call.sid})`);
        return call.sid;
    } catch (err) {
        console.error('Twilio call error:', err.message);
        throw err;
    }
}
