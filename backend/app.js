const express = require('express');
const app = express();
const enfantRoutes = require('./routes/enfantRoutes');


const PORT = 3000;

app.use(express.json());
app.use('/api',enfantRoutes);

app.get('/' , (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log('Server is runing on http://localhost');
});

app.use(express.json());
module.exports = app;
