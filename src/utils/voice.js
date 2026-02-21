import api from './api';

let currentAudio = null;

/**
 * Speak text using the ElevenLabs TTS API via our backend
 * Falls back to browser TTS if API fails
 */
export async function speak(text) {
    // Stop any currently playing audio
    stopSpeaking();

    if (!text || text.trim().length === 0) return;

    try {
        const response = await api.post('/tts', { text }, {
            responseType: 'blob',
        });

        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        currentAudio = new Audio(audioUrl);
        currentAudio.playbackRate = 0.9; // Slightly slower for elderly

        currentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
        };

        await currentAudio.play();
    } catch (err) {
        console.warn('ElevenLabs TTS failed, falling back to browser TTS:', err.message);
        // Fallback to browser's built-in TTS
        browserSpeak(text);
    }
}

/**
 * Fallback: Use browser's built-in speech synthesis
 */
export function browserSpeak(text) {
    stopSpeaking();

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Slower for elderly
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to use a clear, friendly voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v =>
            v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Microsoft')
        );
        if (preferred) utterance.voice = preferred;

        window.speechSynthesis.speak(utterance);
    }
}

/**
 * Stop any currently playing speech
 */
export function stopSpeaking() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

/**
 * Check if currently speaking
 */
export function isSpeaking() {
    return (currentAudio && !currentAudio.paused) ||
        ('speechSynthesis' in window && window.speechSynthesis.speaking);
}
