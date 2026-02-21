import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { recognizeMedicine } from '../services/groqService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

const router = express.Router();

// POST /api/recognize — upload medicine image for AI recognition
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const imagePath = req.file.path;

        // Read image and convert to base64
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype;

        // Send to Groq for recognition
        const result = await recognizeMedicine(base64Image, mimeType);

        res.json({
            success: true,
            imagePath: `/uploads/${req.file.filename}`,
            analysis: result
        });
    } catch (err) {
        console.error('Recognition error:', err);
        res.status(500).json({ error: 'Failed to analyze medicine image: ' + err.message });
    }
});

// POST /api/recognize/base64 — recognize from base64 image
router.post('/base64', async (req, res) => {
    try {
        const { image, mimeType } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        const result = await recognizeMedicine(image, mimeType || 'image/jpeg');

        res.json({
            success: true,
            analysis: result
        });
    } catch (err) {
        console.error('Recognition error:', err);
        res.status(500).json({ error: 'Failed to analyze medicine image: ' + err.message });
    }
});

export default router;
