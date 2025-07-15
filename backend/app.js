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

const PORT = 3000;

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware pour parser le JSON (doit être avant les routes)
app.use(express.json());
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
