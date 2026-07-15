const express = require('express');
const {
    createOwner,
    getOwners,
    getOwnerById,
    updateOwner,
    deleteOwner
} = require('../controllers/ownerControllers.js');

const routes = express.Router();

routes.post('/', createOwner);
routes.get('/', getOwners);
routes.get('/:id', getOwnerById);
routes.put('/:id', updateOwner);
routes.delete('/:id', deleteOwner);

module.exports = routes;
