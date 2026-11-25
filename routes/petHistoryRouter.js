const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createPetHistory,
    getPetsHistory,
    getPetHistoryById,
    getPetsHistoryByOwnerId,
    updatePetHistory,
    deletePetHistory,
    updatePetHistoryPhoto,
    deletePetHistoryPhoto
} = require('../controllers/petHistoryControllers.js');
const { petHistoryPhotoUpload } = require('../middlewares/upload.js');

const routes = express.Router();

// Foto de la mascota
routes.put('/:id/photo', checkAuth, petHistoryPhotoUpload, updatePetHistoryPhoto);
routes.delete('/:id/photo', checkAuth, deletePetHistoryPhoto);

routes.post('/', checkAuth, createPetHistory);
routes.get('/', checkAuth, getPetsHistory);
routes.get('/owner/:ownerId', checkAuth, getPetsHistoryByOwnerId);
routes.get('/:id', checkAuth, getPetHistoryById);
routes.put('/:id', checkAuth, updatePetHistory);
routes.delete('/:id', checkAuth, deletePetHistory);

module.exports = routes;
