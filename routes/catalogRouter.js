const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const { organs, complementaryTests, products } = require('../controllers/catalogControllers.js');

const routes = express.Router();

// Organos y Sistemas (?all=true para incluir los inactivos)
routes.get('/organs', checkAuth, organs.getAll);
routes.post('/organs', checkAuth, organs.create);
routes.put('/organs/:id', checkAuth, organs.update);
routes.delete('/organs/:id', checkAuth, organs.remove);

// Pruebas Diagnosticas Complementarias (?all=true para incluir las inactivas)
routes.get('/complementary-tests', checkAuth, complementaryTests.getAll);
routes.post('/complementary-tests', checkAuth, complementaryTests.create);
routes.put('/complementary-tests/:id', checkAuth, complementaryTests.update);
routes.delete('/complementary-tests/:id', checkAuth, complementaryTests.remove);

// Productos base del Tratamiento Asignado (?all=true para incluir los inactivos)
routes.get('/products', checkAuth, products.getAll);
routes.post('/products', checkAuth, products.create);
routes.put('/products/:id', checkAuth, products.update);
routes.delete('/products/:id', checkAuth, products.remove);

module.exports = routes;
