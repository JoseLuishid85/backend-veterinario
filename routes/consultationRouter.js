const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createConsultation,
    getConsultations,
    getConsultationById,
    updateConsultation,
    deleteConsultation
} = require('../controllers/consultationControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createConsultation);
routes.get('/', checkAuth, getConsultations);
routes.get('/:id', checkAuth, getConsultationById);
routes.put('/:id', checkAuth, updateConsultation);
routes.delete('/:id', checkAuth, deleteConsultation);

module.exports = routes;
