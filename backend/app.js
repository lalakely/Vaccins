const express = require('express');
const cors = require('cors');
const app = express();
const enfantRoutes = require('./routes/enfantRoutes');
const vaccinRoutes = require('./routes/vaccinRoutes');
const fokotanyRoutes = require('./routes/fokotanyRoutes');
const hameauRoutes = require('./routes/hameauRoutes');
const vaccinationsRoutes = require('./routes/vaccinationsRoutes');
const authRoutes = require('./routes/authRoutes'); // Import des routes d'authentification
const userRoutes = require('./routes/usersRoutes'); // Import des routes utilisateur
const childHistoryRoutes = require('./routes/childHistoryRoutes'); // Import des routes d'historique
const deletedChildrenLogRoutes = require('./routes/deletedChildrenLogRoutes'); // Import des routes pour les logs de suppression
const notificationsRoutes = require('./routes/notificationsRoutes'); // Import des routes de notifications
const db = require('./config/db'); // Import de la configuration de la base de données

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

const PORT = process.env.PORT || 3000;

// Configuration CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: function (origin, callback) {
        console.log('[DEBUG] Requête Origin:', origin);
        // En phase de debug, on autorise tout si ALLOWED_ORIGINS contient '*'
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('[CORS ERROR] Origine non autorisée:', origin);
            console.error('[CORS DEBUG] Origines autorisées:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware pour les préflight requests OPTIONS
app.options('*', cors());

// Middleware pour déboguer les requêtes entrantes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

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
app.use('/api/users', userRoutes); // Utilisation des routes utilisateur
app.use('/api/history', childHistoryRoutes); // Utilisation des routes d'historique
app.use('/api/deleted-children', deletedChildrenLogRoutes); // Utilisation des routes pour les logs de suppression
app.use('/api/notifications', notificationsRoutes); // Utilisation des routes de notifications

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server is running on http://${ipAddress}:${PORT}`);
    console.log(`API accessible at http://${ipAddress}:${PORT}/api`);

    // Test de connexion à la base de données
    try {
        await db.query('SELECT 1');
        console.log('Connexion à la base de données réussie.');
    } catch (err) {
        console.error('ERREUR CRITIQUE: Impossible de se connecter à la base de données:', err.message);
    }
});

module.exports = app;
