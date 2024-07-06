var express = require('express');
var mongoose = require('mongoose');
const authRoutes = require('./api/auth/routes');
const userRoutes = require('./api/users/routes');
const codigoemailrouter = require ('./api/email/verificacionUsuario/router')
const flatRoutes = require('./api/flats/router');
const favoriteFlatRoutes = require('./api/favoriteFlats/router');
const messageRoutes = require('./api/message/router');
require('dotenv').config();

var app = express();
app.use(express.json());

const key = process.env.MONGO_URI;

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/email', codigoemailrouter);
app.use('/api/v1/flats', flatRoutes);
app.use('/api/v1/favoriteFlats', favoriteFlatRoutes);
app.use('/api/v1/messages', messageRoutes);


// Conectar a la base de datos sin las opciones de configuración deprecadas
mongoose.connect(key)
    .then(() => {
        console.log('Connected to the database');
    })
    .catch(err => {
        console.error('Failed to connect to the database:', err);
    });

var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server running on port ' + port);
});
