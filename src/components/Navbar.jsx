import { Link, useLocation } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';

export default function Navbar() {
    const { voiceEnabled, toggleVoice } = useVoice();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">💊</span>
                    <span>MedRemind</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className={isActive('/')}>
                        <span className="nav-icon">🏠</span>
                        <span className="nav-text">Home</span>
                    </Link>
                    <Link to="/add-medication" className={isActive('/add-medication')}>
                        <span className="nav-icon">➕</span>
                        <span className="nav-text">Add Medicine</span>
                    </Link>
                    <Link to="/scan" className={isActive('/scan')}>
                        <span className="nav-icon">📸</span>
                        <span className="nav-text">Scan</span>
                    </Link>
                    <button onClick={toggleVoice} title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}>
                        <span className="nav-icon">{voiceEnabled ? '🔊' : '🔇'}</span>
                        <span className="nav-text">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
