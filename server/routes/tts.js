import express from 'express';
import { synthesizeSpeech } from '../services/ttsService.js';

const router = express.Router();

// POST /api/tts — convert text to speech via ElevenLabs
router.post('/', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Limit text length to prevent abuse
        const truncated = text.substring(0, 5000);

        const audioBuffer = await synthesizeSpeech(truncated);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });
        res.send(audioBuffer);
    } catch (err) {
        console.error('TTS error:', err);
        res.status(500).json({ error: 'Text-to-speech failed: ' + err.message });
    }
});

export default router;
