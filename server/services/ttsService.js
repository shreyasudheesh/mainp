import axios from 'axios';

/**
 * Synthesize text to speech using ElevenLabs API
 * @param {string} text - Text to convert to speech
 * @returns {Buffer} Audio buffer (mp3)
 */
export async function synthesizeSpeech(text) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah

    if (!apiKey) {
        throw new Error('ElevenLabs API key not configured');
    }

    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.75,
                    similarity_boost: 0.75,
                    style: 0.2,
                    use_speaker_boost: true,
                },
            },
            {
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                responseType: 'arraybuffer',
            }
        );

        return Buffer.from(response.data);
    } catch (err) {
        console.error('ElevenLabs API error:', err.response?.data ? Buffer.from(err.response.data).toString() : err.message);
        throw new Error('ElevenLabs TTS failed: ' + (err.response?.status || err.message));
    }
}
