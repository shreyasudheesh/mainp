import { useVoice } from '../context/VoiceContext';

export default function VoiceButton() {
    const { voiceEnabled, toggleVoice, isSpeaking } = useVoice();

    return (
        <button
            className={`voice-fab ${voiceEnabled ? 'active' : ''}`}
            onClick={toggleVoice}
            title={voiceEnabled ? 'Voice Assistant: ON — Click to disable' : 'Voice Assistant: OFF — Click to enable'}
            aria-label="Toggle voice assistance"
        >
            {isSpeaking ? '🗣️' : voiceEnabled ? '🔊' : '🔇'}
        </button>
    );
}
