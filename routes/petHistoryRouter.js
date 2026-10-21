const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createPetHistory,
    getPetsHistory,
    getPetHistoryById,
    getPetsHistoryByOwnerId,
    updatePetHistory,
    deletePetHistory
} = require('../controllers/petHistoryControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createPetHistory);
routes.get('/', checkAuth, getPetsHistory);
routes.get('/owner/:ownerId', checkAuth, getPetsHistoryByOwnerId);
routes.get('/:id', checkAuth, getPetHistoryById);
routes.put('/:id', checkAuth, updatePetHistory);
routes.delete('/:id', checkAuth, deletePetHistory);

module.exports = routes;
