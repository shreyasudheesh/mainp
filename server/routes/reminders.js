import express from 'express';
import db from '../db.js';

const router = express.Router();
const DEFAULT_USER_ID = 1;

// GET /api/reminders
router.get('/', (req, res) => {
    try {
        const reminders = db.prepare(`
      SELECT r.*, m.name as medication_name, m.dosage
      FROM reminders r
      JOIN medications m ON r.medication_id = m.id
      WHERE r.user_id = ?
      ORDER BY r.remind_time ASC
    `).all(DEFAULT_USER_ID);

        res.json({ reminders });
    } catch (err) {
        console.error('Get reminders error:', err);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

// POST /api/reminders
router.post('/', (req, res) => {
    try {
        const { medication_id, remind_time, notify_type } = req.body;

        if (!medication_id || !remind_time) {
            return res.status(400).json({ error: 'Medication ID and reminder time are required' });
        }

        // Verify medication exists
        const med = db.prepare(
            'SELECT id FROM medications WHERE id = ? AND user_id = ?'
        ).get(medication_id, DEFAULT_USER_ID);
        if (!med) return res.status(404).json({ error: 'Medication not found' });

        const result = db.prepare(
            'INSERT INTO reminders (medication_id, user_id, remind_time, notify_type) VALUES (?, ?, ?, ?)'
        ).run(medication_id, DEFAULT_USER_ID, remind_time, notify_type || 'email');

        const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ reminder });
    } catch (err) {
        console.error('Create reminder error:', err);
        res.status(500).json({ error: 'Failed to create reminder' });
    }
});

// PUT /api/reminders/:id
router.put('/:id', (req, res) => {
    try {
        const existing = db.prepare(
            'SELECT * FROM reminders WHERE id = ? AND user_id = ?'
        ).get(req.params.id, DEFAULT_USER_ID);

        if (!existing) return res.status(404).json({ error: 'Reminder not found' });

        const { remind_time, notify_type, active } = req.body;

        db.prepare(`
      UPDATE reminders SET
        remind_time = ?, notify_type = ?, active = ?
      WHERE id = ? AND user_id = ?
    `).run(
            remind_time || existing.remind_time,
            notify_type || existing.notify_type,
            active !== undefined ? (active ? 1 : 0) : existing.active,
            req.params.id, DEFAULT_USER_ID
        );

        const updated = db.prepare('SELECT * FROM reminders WHERE id = ?').get(req.params.id);
        res.json({ reminder: updated });
    } catch (err) {
        console.error('Update reminder error:', err);
        res.status(500).json({ error: 'Failed to update reminder' });
    }
});

// DELETE /api/reminders/:id
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare(
            'DELETE FROM reminders WHERE id = ? AND user_id = ?'
        ).run(req.params.id, DEFAULT_USER_ID);

        if (result.changes === 0) return res.status(404).json({ error: 'Reminder not found' });

        res.json({ message: 'Reminder deleted' });
    } catch (err) {
        console.error('Delete reminder error:', err);
        res.status(500).json({ error: 'Failed to delete reminder' });
    }
});

export default router;
