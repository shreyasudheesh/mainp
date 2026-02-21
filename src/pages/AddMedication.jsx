import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import api from '../utils/api';

export default function AddMedication() {
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const { speakText, voiceEnabled } = useVoice();
    const isEdit = !!id;

    const [form, setForm] = useState({
        name: '',
        dosage: '',
        frequency: 'daily',
        times: [],
        start_date: '',
        end_date: '',
        notes: '',
        expiry_date: '',
        description: '',
        notify_type: 'email',
    });
    const [newTime, setNewTime] = useState('08:00');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) loadMedication();
    }, [id]);

    useEffect(() => {
        if (voiceEnabled) {
            speakText(isEdit ? 'Edit your medication details.' : 'Add a new medication. Fill in the name, dosage, and set reminder times.');
        }
    }, [voiceEnabled]);

    const loadMedication = async () => {
        try {
            const res = await api.get(`/medications/${id}`);
            const med = res.data.medication;
            setForm({
                name: med.name || '',
                dosage: med.dosage || '',
                frequency: med.frequency || 'daily',
                times: med.times || [],
                start_date: med.start_date || '',
                end_date: med.end_date || '',
                notes: med.notes || '',
                expiry_date: med.expiry_date || '',
                description: med.description || '',
                notify_type: 'email',
            });
        } catch (err) {
            setError('Failed to load medication');
        }
    };

    const updateField = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const addTime = () => {
        if (newTime && !form.times.includes(newTime)) {
            setForm(prev => ({ ...prev, times: [...prev.times, newTime].sort() }));
        }
    };

    const removeTime = (time) => {
        setForm(prev => ({ ...prev, times: prev.times.filter(t => t !== time) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Medicine name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isEdit) {
                await api.put(`/medications/${id}`, form);
                if (voiceEnabled) speakText('Medication updated successfully.');
            } else {
                await api.post('/medications', form);
                if (voiceEnabled) speakText(`${form.name} has been added to your medications.`);
            }
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to save medication';
            setError(msg);
            if (voiceEnabled) speakText(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container add-med-page">
                <h1>{isEdit ? '✏️ Edit Medication' : '➕ Add New Medication'}</h1>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h2 className="card-title" style={{ marginBottom: 20 }}>💊 Medicine Details</h2>

                        <div className="form-group">
                            <label className="form-label" htmlFor="med-name">Medicine Name *</label>
                            <input
                                id="med-name"
                                type="text"
                                className="form-input"
                                placeholder="e.g., Aspirin, Metformin, Lisinopril"
                                value={form.name}
                                onChange={updateField('name')}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="dosage">💉 Dosage</label>
                            <input
                                id="dosage"
                                type="text"
                                className="form-input"
                                placeholder="e.g., 500mg, 1 tablet, 5ml"
                                value={form.dosage}
                                onChange={updateField('dosage')}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="frequency">🔄 Frequency</label>
                            <select
                                id="frequency"
                                className="form-select"
                                value={form.frequency}
                                onChange={updateField('frequency')}
                            >
                                <option value="daily">Daily</option>
                                <option value="twice_daily">Twice Daily</option>
                                <option value="three_times_daily">Three Times Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="as_needed">As Needed</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">📝 Notes / Instructions</label>
                            <textarea
                                className="form-textarea"
                                placeholder="e.g., Take with food, avoid dairy products..."
                                value={form.notes}
                                onChange={updateField('notes')}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="expiry">📅 Expiry Date</label>
                                <input
                                    id="expiry"
                                    type="date"
                                    className="form-input"
                                    value={form.expiry_date}
                                    onChange={updateField('expiry_date')}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="start">🟢 Start Date</label>
                                <input
                                    id="start"
                                    type="date"
                                    className="form-input"
                                    value={form.start_date}
                                    onChange={updateField('start_date')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 24 }}>
                        <h2 className="card-title" style={{ marginBottom: 20 }}>⏰ Reminder Times</h2>

                        <div className="form-group">
                            <label className="form-label">Add Reminder Times</label>
                            <div className="time-inputs">
                                <input
                                    type="time"
                                    className="form-input"
                                    style={{ width: '180px' }}
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                />
                                <button type="button" className="btn btn-secondary" onClick={addTime}>
                                    ➕ Add Time
                                </button>
                            </div>
                        </div>

                        {form.times.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                                {form.times.map(time => (
                                    <div key={time} className="time-chip">
                                        ⏰ {time}
                                        <button type="button" onClick={() => removeTime(time)}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="form-group" style={{ marginTop: 24 }}>
                            <label className="form-label">🔔 Notification Type</label>
                            <div className="notify-options">
                                {['email', 'phone', 'both'].map(type => (
                                    <label
                                        key={type}
                                        className={`notify-option ${form.notify_type === type ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="notify_type"
                                            value={type}
                                            checked={form.notify_type === type}
                                            onChange={updateField('notify_type')}
                                        />
                                        {type === 'email' ? '📧 Email' : type === 'phone' ? '📞 Phone Call' : '📧📞 Both'}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                            {loading ? (
                                <><div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></div> Saving...</>
                            ) : (
                                isEdit ? '✅ Update Medication' : '✅ Save Medication'
                            )}
                        </button>
                        <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
