const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createOwner,
    getOwners,
    getOwnerById,
    updateOwner,
    deleteOwner
} = require('../controllers/ownerControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createOwner);
routes.get('/', checkAuth, getOwners);
routes.get('/:id', checkAuth, getOwnerById);
routes.put('/:id', checkAuth, updateOwner);
routes.delete('/:id', checkAuth, deleteOwner);

module.exports = routes;
