const express = require('express');
const cors = require('cors');
const app = express();
const enfantRoutes = require('./routes/enfantRoutes');
const vaccinRoutes = require('./routes/vaccinRoutes');
const fokotanyRoutes = require('./routes/fokotanyRoutes');
const hameauRoutes = require('./routes/hameauRoutes');
const vaccinationsRoutes = require('./routes/vaccinationsRoutes');
const authRoutes = require('./routes/authRoutes'); // Import des routes d'authentification
const childHistoryRoutes = require('./routes/childHistoryRoutes'); // Import des routes d'historique
const deletedChildrenLogRoutes = require('./routes/deletedChildrenLogRoutes'); // Import des routes pour les logs de suppression
const notificationsRoutes = require('./routes/notificationsRoutes'); // Import des routes de notifications

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

const PORT = 3000;

// Configuration CORS pour permettre les requêtes depuis n'importe quelle origine
app.use(cors({
  origin: '*', // Permet à toutes les origines d'accéder à l'API
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware pour parser le JSON (doit être avant les routes)
app.use(express.json());

// Endpoint pour récupérer l'IP du serveur
app.get('/api/server-info', (req, res) => {
    res.json({
        ip: ipAddress,
        port: PORT
    });
});

app.use('/api', enfantRoutes);
app.use('/api', vaccinRoutes);
app.use('/api', fokotanyRoutes);
app.use('/api', hameauRoutes);
app.use('/api', vaccinationsRoutes);
app.use('/api/auth', authRoutes); // Utilisation des routes d'authentification
app.use('/api/history', childHistoryRoutes); // Utilisation des routes d'historique
app.use('/api/deleted-children', deletedChildrenLogRoutes); // Utilisation des routes pour les logs de suppression
app.use('/api/notifications', notificationsRoutes); // Utilisation des routes de notifications

app.get('/' , (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://${ipAddress}:${PORT}`);
    console.log(`API accessible at http://${ipAddress}:${PORT}/api`);
});

module.exports = app;
