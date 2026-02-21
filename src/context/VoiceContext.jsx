import { createContext, useContext, useState, useCallback } from 'react';
import { speak, stopSpeaking } from '../utils/voice';

const VoiceContext = createContext(null);

export function VoiceProvider({ children }) {
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const toggleVoice = useCallback(() => {
        setVoiceEnabled(prev => {
            if (prev) {
                stopSpeaking();
                setIsSpeaking(false);
            }
            return !prev;
        });
    }, []);

    const speakText = useCallback(async (text) => {
        if (!voiceEnabled || !text) return;

        setIsSpeaking(true);
        try {
            await speak(text);
        } catch (err) {
            console.error('Speech error:', err);
        } finally {
            setIsSpeaking(false);
        }
    }, [voiceEnabled]);

    const stop = useCallback(() => {
        stopSpeaking();
        setIsSpeaking(false);
    }, []);

    return (
        <VoiceContext.Provider value={{ voiceEnabled, toggleVoice, speakText, stop, isSpeaking }}>
            {children}
        </VoiceContext.Provider>
    );
}

export function useVoice() {
    const ctx = useContext(VoiceContext);
    if (!ctx) throw new Error('useVoice must be used within VoiceProvider');
    return ctx;
}

export default VoiceContext;
