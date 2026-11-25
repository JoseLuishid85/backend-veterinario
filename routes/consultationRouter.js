const express = require('express');
const checkAuth = require('../middlewares/validar-token.js');
const {
    createConsultation,
    getConsultations,
    getConsultationById,
    updateConsultation,
    deleteConsultation,
    uploadTestFiles,
    deleteTestFile
} = require('../controllers/consultationControllers.js');
const { testFilesUpload } = require('../middlewares/upload.js');

const routes = express.Router();

// Archivos de pruebas complementarias (PDF o imagen)
routes.post('/:id/test-files', checkAuth, testFilesUpload, uploadTestFiles);
routes.delete('/test-files/:fileId', checkAuth, deleteTestFile);

routes.post('/', checkAuth, createConsultation);
routes.get('/', checkAuth, getConsultations);
routes.get('/:id', checkAuth, getConsultationById);
routes.put('/:id', checkAuth, updateConsultation);
routes.delete('/:id', checkAuth, deleteConsultation);

module.exports = routes;
