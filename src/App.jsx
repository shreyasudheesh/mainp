import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VoiceProvider } from './context/VoiceContext';
import Navbar from './components/Navbar';
import VoiceButton from './components/VoiceButton';
import Dashboard from './pages/Dashboard';
import AddMedication from './pages/AddMedication';
import ScanMedicine from './pages/ScanMedicine';
import MedicineDetail from './pages/MedicineDetail';

function AppRoutes() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-medication" element={<AddMedication />} />
                <Route path="/edit-medication/:id" element={<AddMedication />} />
                <Route path="/scan" element={<ScanMedicine />} />
                <Route path="/medicine/:id" element={<MedicineDetail />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <VoiceButton />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <VoiceProvider>
                <AppRoutes />
            </VoiceProvider>
        </BrowserRouter>
    );
}
