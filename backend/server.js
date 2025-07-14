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

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utilisation du routes
app.use('/api', enfantsRoutes);
app.use('/api', vaccinsRoutes);
app.use('/api', hameauRoutes);
app.use('/api' , fokotanyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', VaccinationRoutes);
app.use('/api/notifications', notificationsRoutes);


app.listen( PORT , () => {
    console.log('Server is runing on http://localhost');
});