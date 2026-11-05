const express = require('express');
const { crearDB } = require('../controllers/dataControllers.js');

const routes = express.Router();

// Crea / actualiza tablas segun los modelos. Normalmente esta ruta va comentada en app.js
routes.get('/', crearDB);

module.exports = routes;
