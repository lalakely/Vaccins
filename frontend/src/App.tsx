import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Child from './pages/Child';
import Vaccine from './pages/Vaccine';
import Fokotany from './pages/Fokotany';
import Hameau from './pages/Hameau';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './contexts/ProtectedRoute';
import DashboardPage from "./pages/DashboardPage";

function App() {
    return (
        <AuthProvider>
            <Router>
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
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
