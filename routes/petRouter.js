const express = require('express');
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

routes.post('/', upload.single('photo'), createPet);
routes.get('/', getPets);
routes.get('/search/qr/:code', getPetByQrCode);
routes.get('/owner/:ownerId', getPetsByOwner);
routes.get('/:id', getPetById);
routes.put('/:id', upload.single('photo'), updatePet);
routes.delete('/:id', deletePet);

module.exports = routes;
