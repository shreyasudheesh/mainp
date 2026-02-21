import cron from 'node-cron';
import db from '../db.js';
import { sendReminderEmail } from './emailService.js';
import { makeReminderCall } from './phoneService.js';

/**
 * Start the reminder scheduler — runs every minute and checks for due reminders
 */
export function startScheduler() {
    console.log('⏰ Reminder scheduler started');

    // Run every minute
    cron.schedule('* * * * *', () => {
        checkAndSendReminders();
    });
}

function checkAndSendReminders() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    try {
        // Get all active reminders that match the current time
        const dueReminders = db.prepare(`
      SELECT r.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
             m.name as medication_name, m.dosage
      FROM reminders r
      JOIN users u ON r.user_id = u.id
      JOIN medications m ON r.medication_id = m.id
      WHERE r.active = 1
        AND r.remind_time = ?
        AND (r.last_sent IS NULL OR date(r.last_sent) != date('now'))
    `).all(currentTime);

        if (dueReminders.length === 0) return;

        console.log(`📋 Found ${dueReminders.length} due reminder(s) at ${currentTime}`);

        for (const reminder of dueReminders) {
            processReminder(reminder);
        }
    } catch (err) {
        console.error('Scheduler error:', err.message);
    }
}

async function processReminder(reminder) {
    try {
        const { notify_type, user_email, user_phone, user_name, medication_name, dosage, remind_time } = reminder;

        if (notify_type === 'email' || notify_type === 'both') {
            try {
                await sendReminderEmail(user_email, user_name, medication_name, dosage, remind_time);
            } catch (e) {
                console.error(`Failed to send email to ${user_email}:`, e.message);
            }
        }

        if (notify_type === 'phone' || notify_type === 'both') {
            try {
                await makeReminderCall(user_phone, user_name, medication_name, dosage);
            } catch (e) {
                console.error(`Failed to call ${user_phone}:`, e.message);
            }
        }

        // Update last_sent
        db.prepare('UPDATE reminders SET last_sent = datetime(\'now\') WHERE id = ?').run(reminder.id);

    } catch (err) {
        console.error(`Error processing reminder ${reminder.id}:`, err.message);
    }
}
