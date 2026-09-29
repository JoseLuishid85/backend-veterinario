const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const upload = require('../middlewares/upload.js');
const {
    createPet,
    getPets,
    getPetById,
    getPetByQrCode,
    getPetsByOwner,
    updatePet,
    deletePet
} = require('../controllers/petControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, upload.single('photo'), createPet);
routes.get('/', checkAuth, getPets);
routes.get('/search/qr/:code', getPetByQrCode);
routes.get('/owner/:ownerId', checkAuth, getPetsByOwner);
routes.get('/:id', checkAuth, getPetById);
routes.put('/:id', checkAuth, upload.single('photo'), updatePet);
routes.delete('/:id', checkAuth, deletePet);

module.exports = routes;
