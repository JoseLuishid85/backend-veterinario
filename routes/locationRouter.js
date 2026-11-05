const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    getCities,
    createCity,
    updateCity,
    deleteCity,
    getMunicipalities,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality,
    getParishes,
    createParish,
    updateParish,
    deleteParish
} = require('../controllers/locationControllers.js');

const routes = express.Router();

// Ciudades
routes.get('/cities', checkAuth, getCities);
routes.post('/cities', checkAuth, createCity);
routes.put('/cities/:id', checkAuth, updateCity);
routes.delete('/cities/:id', checkAuth, deleteCity);

// Municipios (?cityId=)
routes.get('/municipalities', checkAuth, getMunicipalities);
routes.post('/municipalities', checkAuth, createMunicipality);
routes.put('/municipalities/:id', checkAuth, updateMunicipality);
routes.delete('/municipalities/:id', checkAuth, deleteMunicipality);

// Parroquias (?municipalityId=)
routes.get('/parishes', checkAuth, getParishes);
routes.post('/parishes', checkAuth, createParish);
routes.put('/parishes/:id', checkAuth, updateParish);
routes.delete('/parishes/:id', checkAuth, deleteParish);

module.exports = routes;
