const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createOwnerHistory,
    getOwnersHistory,
    getOwnerHistoryById,
    updateOwnerHistory,
    changeStateOwnerHistory,
    deleteOwnerHistory
} = require('../controllers/ownerHistoryControllers.js');

const routes = express.Router();

routes.post('/', checkAuth, createOwnerHistory);
routes.get('/', checkAuth, getOwnersHistory);
routes.get('/:id', checkAuth, getOwnerHistoryById);
routes.get('/change-state/:id', checkAuth, changeStateOwnerHistory);
routes.put('/:id', checkAuth, updateOwnerHistory);
routes.delete('/:id', checkAuth, deleteOwnerHistory);

module.exports = routes;
