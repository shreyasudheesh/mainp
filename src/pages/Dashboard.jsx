import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import MedicationCard from '../components/MedicationCard';
import api from '../utils/api';

export default function Dashboard() {
    const { speakText, voiceEnabled } = useVoice();
    const navigate = useNavigate();

    const [medications, setMedications] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!loading && voiceEnabled) {
            const count = medications.length;
            speakText(
                `Welcome to MedRemind. You have ${count} medication${count !== 1 ? 's' : ''} registered. ` +
                (count === 0 ? 'Click Add Medicine to get started.' : '')
            );
        }
    }, [loading, voiceEnabled]);

    const loadData = async () => {
        try {
            const [medRes, remRes] = await Promise.all([
                api.get('/medications'),
                api.get('/reminders'),
            ]);
            setMedications(medRes.data.medications);
            setReminders(remRes.data.reminders);
        } catch (err) {
            console.error('Load data error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this medication?')) return;
        try {
            await api.delete(`/medications/${id}`);
            setMedications(prev => prev.filter(m => m.id !== id));
            if (voiceEnabled) speakText('Medication deleted successfully.');
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleEdit = (med) => {
        navigate(`/edit-medication/${med.id}`);
    };

    const activeReminders = reminders.filter(r => r.active);

    if (loading) {
        return <div className="loading"><div className="spinner"></div> Loading your medications...</div>;
    }

    return (
        <div className="page">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>💊 MedRemind</h1>
                        <p className="greeting">Your medication overview — never miss a dose!</p>
                    </div>
                    <div className="dashboard-actions">
                        <Link to="/add-medication" className="btn btn-primary">
                            ➕ Add Medicine
                        </Link>
                        <Link to="/scan" className="btn btn-accent">
                            📸 Scan Medicine
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-value">{medications.length}</div>
                        <div className="stat-label">💊 Total Medications</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{activeReminders.length}</div>
                        <div className="stat-label">⏰ Active Reminders</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">
                            {medications.filter(m => m.expiry_date && new Date(m.expiry_date) > new Date()).length}
                        </div>
                        <div className="stat-label">✅ Valid Medicines</div>
                    </div>
                </div>

                {/* Medications */}
                <h2 className="section-title">💊 Your Medications</h2>

                {medications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💊</div>
                        <h3>No medications yet</h3>
                        <p>Add your first medication to get started with reminders</p>
                        <Link to="/add-medication" className="btn btn-primary btn-lg">
                            ➕ Add Your First Medicine
                        </Link>
                    </div>
                ) : (
                    <div className="medication-grid">
                        {medications.map(med => (
                            <MedicationCard
                                key={med.id}
                                medication={med}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}

                {/* Upcoming Reminders */}
                {activeReminders.length > 0 && (
                    <>
                        <h2 className="section-title" style={{ marginTop: 40 }}>⏰ Active Reminders</h2>
                        <div className="medication-grid">
                            {activeReminders.map(rem => (
                                <div key={rem.id} className="card">
                                    <h3>💊 {rem.medication_name}</h3>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        ⏰ {rem.remind_time} · {rem.notify_type === 'email' ? '📧 Email' : rem.notify_type === 'phone' ? '📞 Phone' : '📧📞 Both'}
                                    </p>
                                    {rem.dosage && (
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Dosage: {rem.dosage}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
