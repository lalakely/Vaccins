const express = require('express');
const db = require('./config/db');
const cors = require('cors');
const enfantsRoutes = require('./routes/enfantRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());


// Utilisation du routes
app.use('/api', enfantsRoutes);

app.listen( PORT , () => {
    console.log('Server is runing on http://localhost');
});