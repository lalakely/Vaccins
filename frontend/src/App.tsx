import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Child from './pages/Child';
import Vaccine from './pages/Vaccine';
import Fokotany from './pages/Fokotany';
import Hameau from './pages/Hameau';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Settings from './pages/Settings';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/notifications/ToastContainer';
import VaccinNotificationManager from './components/Notifications/VaccinNotificationManager';
import ProtectedRoute from './contexts/ProtectedRoute';
import DashboardPage from "./pages/DashboardPage";
import ChildHistoryPage from "./pages/ChildHistoryPage";

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <ToastContainer />
                    <VaccinNotificationManager />
                    <Routes>
                    {/* Routes publiques */}
                    <Route path="/" element={<Connexion />} />
                    <Route path="/Inscription" element={<Inscription />} />

                    {/* Routes protégées */}
                    <Route
                        path="/Personnes"
                        element={
                            <ProtectedRoute>
                                <Child />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/Vaccins"
                        element={
                            <ProtectedRoute>
                                <Vaccine />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/Fokotany"
                        element={
                            <ProtectedRoute>
                                <Fokotany />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/Hameau"
                        element={
                            <ProtectedRoute>
                                <Hameau />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                 <DashboardPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/historique-enfants" 
                        element={
                            <ProtectedRoute>
                                 <ChildHistoryPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
