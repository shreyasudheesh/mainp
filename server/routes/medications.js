import express from 'express';
import db from '../db.js';

const router = express.Router();
const DEFAULT_USER_ID = 1;

// GET /api/medications — list all medications
router.get('/', (req, res) => {
    try {
        const medications = db.prepare(
            'SELECT * FROM medications WHERE user_id = ? ORDER BY created_at DESC'
        ).all(DEFAULT_USER_ID);

        // Parse times JSON
        const parsed = medications.map(med => ({
            ...med,
            times: JSON.parse(med.times || '[]')
        }));

        res.json({ medications: parsed });
    } catch (err) {
        console.error('Get medications error:', err);
        res.status(500).json({ error: 'Failed to fetch medications' });
    }
});

// GET /api/medications/:id
router.get('/:id', (req, res) => {
    try {
        const med = db.prepare(
            'SELECT * FROM medications WHERE id = ? AND user_id = ?'
        ).get(req.params.id, DEFAULT_USER_ID);

        if (!med) return res.status(404).json({ error: 'Medication not found' });

        res.json({ medication: { ...med, times: JSON.parse(med.times || '[]') } });
    } catch (err) {
        console.error('Get medication error:', err);
        res.status(500).json({ error: 'Failed to fetch medication' });
    }
});

// POST /api/medications
router.post('/', (req, res) => {
    try {
        const { name, dosage, frequency, times, start_date, end_date, notes, expiry_date, description } = req.body;

        if (!name) return res.status(400).json({ error: 'Medication name is required' });

        const result = db.prepare(`
      INSERT INTO medications (user_id, name, dosage, frequency, times, start_date, end_date, notes, expiry_date, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            DEFAULT_USER_ID, name,
            dosage || null,
            frequency || 'daily',
            JSON.stringify(times || []),
            start_date || null,
            end_date || null,
            notes || null,
            expiry_date || null,
            description || null
        );

        // Auto-create reminders for each time
        if (times && times.length > 0) {
            const insertReminder = db.prepare(
                'INSERT INTO reminders (medication_id, user_id, remind_time, notify_type) VALUES (?, ?, ?, ?)'
            );
            for (const time of times) {
                insertReminder.run(result.lastInsertRowid, DEFAULT_USER_ID, time, 'email');
            }
        }

        const med = db.prepare('SELECT * FROM medications WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ medication: { ...med, times: JSON.parse(med.times || '[]') } });
    } catch (err) {
        console.error('Create medication error:', err);
        res.status(500).json({ error: 'Failed to create medication' });
    }
});

// PUT /api/medications/:id
router.put('/:id', (req, res) => {
    try {
        const existing = db.prepare(
            'SELECT * FROM medications WHERE id = ? AND user_id = ?'
        ).get(req.params.id, DEFAULT_USER_ID);

        if (!existing) return res.status(404).json({ error: 'Medication not found' });

        const { name, dosage, frequency, times, start_date, end_date, notes, expiry_date, description } = req.body;

        db.prepare(`
      UPDATE medications SET
        name = ?, dosage = ?, frequency = ?, times = ?,
        start_date = ?, end_date = ?, notes = ?,
        expiry_date = ?, description = ?
      WHERE id = ? AND user_id = ?
    `).run(
            name || existing.name,
            dosage !== undefined ? dosage : existing.dosage,
            frequency || existing.frequency,
            times ? JSON.stringify(times) : existing.times,
            start_date !== undefined ? start_date : existing.start_date,
            end_date !== undefined ? end_date : existing.end_date,
            notes !== undefined ? notes : existing.notes,
            expiry_date !== undefined ? expiry_date : existing.expiry_date,
            description !== undefined ? description : existing.description,
            req.params.id, DEFAULT_USER_ID
        );

        const updated = db.prepare('SELECT * FROM medications WHERE id = ?').get(req.params.id);
        res.json({ medication: { ...updated, times: JSON.parse(updated.times || '[]') } });
    } catch (err) {
        console.error('Update medication error:', err);
        res.status(500).json({ error: 'Failed to update medication' });
    }
});

// DELETE /api/medications/:id
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare(
            'DELETE FROM medications WHERE id = ? AND user_id = ?'
        ).run(req.params.id, DEFAULT_USER_ID);

        if (result.changes === 0) return res.status(404).json({ error: 'Medication not found' });

        res.json({ message: 'Medication deleted' });
    } catch (err) {
        console.error('Delete medication error:', err);
        res.status(500).json({ error: 'Failed to delete medication' });
    }
});

export default router;
