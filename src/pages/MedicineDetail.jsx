import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import api from '../utils/api';

export default function MedicineDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { speakText, voiceEnabled } = useVoice();

    const [medication, setMedication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [textSize, setTextSize] = useState(22);

    useEffect(() => {
        loadMedication();
    }, [id]);

    const loadMedication = async () => {
        try {
            const res = await api.get(`/medications/${id}`);
            setMedication(res.data.medication);

            if (voiceEnabled) {
                const med = res.data.medication;
                speakText(`Viewing details for ${med.name}. Dosage: ${med.dosage || 'as prescribed'}. Frequency: ${med.frequency}.`);
            }
        } catch (err) {
            console.error('Load error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div> Loading medication details...</div>;
    }

    if (!medication) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-icon">❌</div>
                        <h3>Medication not found</h3>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isExpired = medication.expiry_date && new Date(medication.expiry_date) < new Date();

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: 800 }}>
                <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: 24 }}>
                    ← Back to Dashboard
                </button>

                <div className="card" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <span style={{ fontSize: 56 }}>💊</span>
                        <div>
                            <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>{medication.name}</h1>
                            {medication.dosage && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Dosage: {medication.dosage}</p>}
                        </div>
                    </div>

                    {isExpired && (
                        <div className="alert alert-error">
                            ⚠️ <strong>This medicine is EXPIRED!</strong> Expiry date: {medication.expiry_date}. Please consult your doctor.
                        </div>
                    )}

                    <div className="analysis-grid">
                        <div className="card analysis-item">
                            <div className="item-label">Frequency</div>
                            <div className="item-value">🔄 {medication.frequency}</div>
                        </div>

                        {medication.times?.length > 0 && (
                            <div className="card analysis-item">
                                <div className="item-label">Reminder Times</div>
                                <div className="item-value">
                                    {medication.times.map((t, i) => (
                                        <span key={i} className="med-time-badge" style={{ marginRight: 8 }}>⏰ {t}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {medication.expiry_date && (
                            <div className="card analysis-item">
                                <div className="item-label">Expiry Date</div>
                                <div className="item-value">
                                    {isExpired ? (
                                        <span className="badge badge-danger">⚠️ Expired: {medication.expiry_date}</span>
                                    ) : (
                                        <span className="badge badge-success">✅ Valid: {medication.expiry_date}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {medication.start_date && (
                            <div className="card analysis-item">
                                <div className="item-label">Start Date</div>
                                <div className="item-value">🟢 {medication.start_date}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description with Magnifier */}
                {(medication.description || medication.notes) && (
                    <div className="card magnifier-section" style={{ marginBottom: 24 }}>
                        <h2 style={{ marginBottom: 16 }}>📄 Details & Notes</h2>
                        <div className="magnifier-controls">
                            <label>🔍 Text Size:</label>
                            <input
                                type="range"
                                className="magnifier-slider"
                                min="16"
                                max="60"
                                value={textSize}
                                onChange={(e) => setTextSize(Number(e.target.value))}
                            />
                            <span style={{ fontWeight: 700, minWidth: 50 }}>{textSize}px</span>
                            <button className="btn btn-secondary btn-icon" onClick={() => setTextSize(22)}>Reset</button>
                        </div>
                        <div className="magnified-text" style={{ fontSize: `${textSize}px` }}>
                            {medication.description && <><strong>Purpose:</strong> {medication.description}<br /><br /></>}
                            {medication.notes && <><strong>Notes:</strong> {medication.notes}</>}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {voiceEnabled && (
                        <button
                            className="btn btn-accent btn-lg"
                            onClick={() => {
                                speakText(
                                    `${medication.name}. Dosage: ${medication.dosage || 'as prescribed'}. ` +
                                    `Frequency: ${medication.frequency}. ` +
                                    (medication.description ? `Purpose: ${medication.description}. ` : '') +
                                    (medication.notes ? `Notes: ${medication.notes}. ` : '') +
                                    (isExpired ? 'Warning: This medicine is expired!' : '')
                                );
                            }}
                            style={{ flex: 1 }}
                        >
                            🔊 Read Aloud
                        </button>
                    )}
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate(`/edit-medication/${medication.id}`)}
                        style={{ flex: 1 }}
                    >
                        ✏️ Edit Medication
                    </button>
                </div>
            </div>
        </div>
    );
}
