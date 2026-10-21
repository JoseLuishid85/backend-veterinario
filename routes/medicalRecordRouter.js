const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const { getMedicalRecordByPetId } = require('../controllers/medicalRecordControllers.js');

const routes = express.Router();

routes.get('/pet/:petId', checkAuth, getMedicalRecordByPetId);

module.exports = routes;
