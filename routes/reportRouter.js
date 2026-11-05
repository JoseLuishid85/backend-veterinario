const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const { getClientsByLocation } = require('../controllers/reportControllers.js');

const routes = express.Router();

// Clientes atendidos por municipio / parroquia
//   ?type=month&year=2026&month=11 | ?type=year&year=2026 | ?type=range&from=YYYY-MM-DD&to=YYYY-MM-DD
routes.get('/clients-by-location', checkAuth, getClientsByLocation);

module.exports = routes;
