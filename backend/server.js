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

// Configuration CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: function (origin, callback) {
        console.log('[DEBUG] Requête Origin:', origin);
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
app.use('/api', fokotanyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', VaccinationRoutes);
app.use('/api/notifications', notificationsRoutes);


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