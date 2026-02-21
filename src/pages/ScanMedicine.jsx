import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import api from '../utils/api';

export default function ScanMedicine() {
    const navigate = useNavigate();
    const { speakText, voiceEnabled } = useVoice();
    const fileInputRef = useRef(null);

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [textSize, setTextSize] = useState(20);

    const handleFile = useCallback((file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        setAnalysis(null);
        setError('');
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setLoading(true);
        setError('');

        if (voiceEnabled) speakText('Analyzing your medicine image. Please wait a moment.');

        try {
            const formData = new FormData();
            formData.append('image', image);

            const res = await api.post('/recognize', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setAnalysis(res.data.analysis);

            if (voiceEnabled && res.data.analysis) {
                const a = res.data.analysis;
                speakText(
                    `Medicine identified: ${a.medicine_name}. ` +
                    `Purpose: ${a.purpose || 'unknown'}. ` +
                    `Dosage: ${a.dosage || 'not specified'}. ` +
                    (a.is_expired === 'true' ? 'Warning: This medicine appears to be expired!' : '') +
                    (a.warnings ? ` Important warnings: ${a.warnings}` : '')
                );
            }
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to analyze image. Please ensure you have a valid Groq API key.';
            setError(msg);
            if (voiceEnabled) speakText('Sorry, analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAsMedication = () => {
        if (!analysis) return;
        navigate('/add-medication', {
            state: {
                prefill: {
                    name: analysis.medicine_name,
                    dosage: analysis.dosage,
                    description: analysis.purpose,
                    expiry_date: analysis.expiry_date !== 'not visible' ? analysis.expiry_date : '',
                    notes: analysis.usage_instructions,
                }
            }
        });
    };

    return (
        <div className="page">
            <div className="container scan-page">
                <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 12, textAlign: 'center' }}>
                    📸 Scan Your Medicine
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 32, fontSize: 'var(--text-sm)' }}>
                    Upload a photo of your medicine and let our AI identify it for you
                </p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {/* Upload Zone */}
                <div
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    <div className="upload-icon">📷</div>
                    <h3>Click or Drag & Drop</h3>
                    <p>Upload a clear photo of your medicine packaging</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 8 }}>
                        Supports: JPG, PNG, GIF, WebP (max 10MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFile(e.target.files[0])}
                    />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Medicine preview" />
                        <div style={{ padding: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAnalyze}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></div> Analyzing...</>
                                ) : (
                                    '🔍 Analyze Medicine'
                                )}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setImage(null); setImagePreview(null); setAnalysis(null); }}
                            >
                                🗑️ Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="card" style={{ textAlign: 'center', padding: 40, marginTop: 24 }}>
                        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>🤖 AI is analyzing your medicine...</p>
                        <p style={{ color: 'var(--text-secondary)' }}>This may take a few seconds</p>
                    </div>
                )}

                {/* Analysis Results */}
                {analysis && (
                    <div className="analysis-result">
                        <h2>🔍 Analysis Results</h2>

                        {/* Expiry Warning */}
                        {analysis.is_expired === 'true' && (
                            <div className="alert alert-error" style={{ marginBottom: 20 }}>
                                ⚠️ <strong>WARNING: This medicine appears to be EXPIRED!</strong> Do not consume expired medication. Consult your doctor or pharmacist.
                            </div>
                        )}

                        <div className="analysis-grid">
                            <div className="card analysis-item">
                                <div className="item-label">Medicine Name</div>
                                <div className="item-value" style={{ fontSize: 'var(--text-lg)' }}>💊 {analysis.medicine_name}</div>
                            </div>

                            {analysis.manufacturer && analysis.manufacturer !== 'not visible' && (
                                <div className="card analysis-item">
                                    <div className="item-label">Manufacturer</div>
                                    <div className="item-value">🏭 {analysis.manufacturer}</div>
                                </div>
                            )}

                            <div className="card analysis-item">
                                <div className="item-label">Purpose / Usage</div>
                                <div className="item-value">🎯 {analysis.purpose || 'Unknown'}</div>
                            </div>

                            <div className="card analysis-item">
                                <div className="item-label">Dosage</div>
                                <div className="item-value">💉 {analysis.dosage || 'Not specified'}</div>
                            </div>

                            <div className="card analysis-item">
                                <div className="item-label">Form</div>
                                <div className="item-value">💊 {analysis.form || 'Unknown'}</div>
                            </div>

                            <div className="card analysis-item">
                                <div className="item-label">Expiry Date</div>
                                <div className="item-value">
                                    {analysis.is_expired === 'true' ? (
                                        <span className="badge badge-danger">⚠️ Expired: {analysis.expiry_date}</span>
                                    ) : analysis.expiry_date && analysis.expiry_date !== 'not visible' ? (
                                        <span className="badge badge-success">✅ {analysis.expiry_date}</span>
                                    ) : (
                                        <span className="badge badge-warning">Not visible</span>
                                    )}
                                </div>
                            </div>

                            <div className="card analysis-item">
                                <div className="item-label">Confidence</div>
                                <div className="item-value">
                                    {analysis.confidence === 'high' ? (
                                        <span className="badge badge-success">🟢 High</span>
                                    ) : analysis.confidence === 'medium' ? (
                                        <span className="badge badge-warning">🟡 Medium</span>
                                    ) : (
                                        <span className="badge badge-danger">🔴 Low</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Usage Instructions */}
                        {analysis.usage_instructions && (
                            <div className="card" style={{ marginTop: 20 }}>
                                <h3 style={{ marginBottom: 8 }}>📋 Usage Instructions</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{analysis.usage_instructions}</p>
                            </div>
                        )}

                        {/* Warnings */}
                        {analysis.warnings && (
                            <div className="card" style={{ marginTop: 20, borderColor: 'var(--warning)' }}>
                                <h3 style={{ marginBottom: 8, color: 'var(--danger)' }}>⚠️ Warnings</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{analysis.warnings}</p>
                            </div>
                        )}

                        {/* Side Effects */}
                        {analysis.side_effects && (
                            <div className="card" style={{ marginTop: 20 }}>
                                <h3 style={{ marginBottom: 8 }}>💡 Side Effects</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{analysis.side_effects}</p>
                            </div>
                        )}

                        {/* Text Magnifier */}
                        {analysis.extracted_text && (
                            <div className="magnifier-section">
                                <h2 style={{ marginBottom: 16 }}>🔍 Extracted Text (Magnifier)</h2>
                                <div className="magnifier-controls">
                                    <label>Text Size:</label>
                                    <input
                                        type="range"
                                        className="magnifier-slider"
                                        min="16"
                                        max="60"
                                        value={textSize}
                                        onChange={(e) => setTextSize(Number(e.target.value))}
                                    />
                                    <span style={{ fontWeight: 700, minWidth: 50 }}>{textSize}px</span>
                                    <button className="btn btn-secondary btn-icon" onClick={() => setTextSize(20)}>Reset</button>
                                </div>
                                <div className="magnified-text" style={{ fontSize: `${textSize}px` }}>
                                    {analysis.extracted_text}
                                </div>
                            </div>
                        )}

                        {/* Voice Read */}
                        {voiceEnabled && (
                            <button
                                className="btn btn-accent btn-lg"
                                style={{ marginTop: 24, width: '100%' }}
                                onClick={() => {
                                    const a = analysis;
                                    speakText(
                                        `Medicine: ${a.medicine_name}. Purpose: ${a.purpose}. Dosage: ${a.dosage}. ` +
                                        (a.usage_instructions ? `Instructions: ${a.usage_instructions}. ` : '') +
                                        (a.warnings ? `Warnings: ${a.warnings}` : '')
                                    );
                                }}
                            >
                                🔊 Read Analysis Aloud
                            </button>
                        )}

                        {/* Save as Medication */}
                        <button
                            className="btn btn-primary btn-lg"
                            style={{ marginTop: 16, width: '100%' }}
                            onClick={handleSaveAsMedication}
                        >
                            💾 Save as Medication & Set Reminders
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
