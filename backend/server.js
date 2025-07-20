const express = require('express');
const db = require('./config/db');
const cors = require('cors');
const enfantsRoutes = require('./routes/enfantRoutes');
const vaccinsRoutes = require('./routes/vaccinRoutes');
const hameauRoutes = require('./routes/hameauRoutes'); 
const fokotanyRoutes = require('./routes/fokotanyRoutes');
const userRoutes = require('./routes/usersRoutes')
const authRoutes = require('./routes/authRoutes');
const VaccinationRoutes = require('./routes/vaccinationsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Obtenir l'adresse IP de la machine
const os = require('os');
const networkInterfaces = os.networkInterfaces();
let ipAddress = '0.0.0.0';

// Trouver une adresse IPv4 non-interne
Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(iface => {
        if (!iface.internal && iface.family === 'IPv4') {
            ipAddress = iface.address;
        }
    });
});

//Middleware
app.use(cors({
    origin: '*', // Permet à toutes les origines d'accéder à l'API
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint pour récupérer l'IP du serveur
app.get('/api/server-info', (req, res) => {
    res.json({
        ip: ipAddress,
        port: PORT
    });
});

// Utilisation du routes
app.use('/api', enfantsRoutes);
app.use('/api', vaccinsRoutes);
app.use('/api', hameauRoutes);
app.use('/api' , fokotanyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', VaccinationRoutes);
app.use('/api/notifications', notificationsRoutes);


// L'adresse IP est déjà détectée en haut du fichier

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://${ipAddress}:${PORT}`);
    console.log(`API accessible at http://${ipAddress}:${PORT}/api`);
});