import { useVoice } from '../context/VoiceContext';

export default function MedicationCard({ medication, onDelete, onEdit }) {
    const { speakText, voiceEnabled } = useVoice();

    const handleSpeak = () => {
        const text = `${medication.name}. Dosage: ${medication.dosage || 'as prescribed'}. Frequency: ${medication.frequency}. Times: ${medication.times?.join(', ') || 'not set'}.`;
        speakText(text);
    };

    return (
        <div className="card med-card">
            <div className="med-icon">💊</div>
            <h3>{medication.name}</h3>
            {medication.dosage && (
                <div className="med-dosage">💉 Dosage: {medication.dosage}</div>
            )}
            <div className="med-dosage">🔄 {medication.frequency}</div>
            {medication.times && medication.times.length > 0 && (
                <div className="med-times">
                    {medication.times.map((time, i) => (
                        <span key={i} className="med-time-badge">⏰ {time}</span>
                    ))}
                </div>
            )}
            {medication.expiry_date && (
                <div style={{ marginBottom: '12px' }}>
                    {new Date(medication.expiry_date) < new Date() ? (
                        <span className="badge badge-danger">⚠️ Expired: {medication.expiry_date}</span>
                    ) : (
                        <span className="badge badge-success">✅ Expires: {medication.expiry_date}</span>
                    )}
                </div>
            )}
            <div className="med-actions">
                {voiceEnabled && (
                    <button className="btn btn-secondary btn-icon" onClick={handleSpeak} title="Read aloud">
                        🔊
                    </button>
                )}
                {onEdit && (
                    <button className="btn btn-secondary btn-icon" onClick={() => onEdit(medication)} title="Edit">
                        ✏️
                    </button>
                )}
                {onDelete && (
                    <button className="btn btn-danger btn-icon" onClick={() => onDelete(medication.id)} title="Delete">
                        🗑️
                    </button>
                )}
            </div>
        </div>
    );
}
