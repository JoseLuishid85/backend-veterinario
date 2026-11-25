const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_ROOT = path.join(__dirname, '../uploads');

const IMAGE_TYPES = {
    extensions: ['.jpeg', '.jpg', '.png', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

const PDF_AND_IMAGE_TYPES = {
    extensions: [...IMAGE_TYPES.extensions, '.pdf'],
    mimeTypes: [...IMAGE_TYPES.mimeTypes, 'application/pdf'],
};

// Crea un middleware de multer que guarda en uploads/<folder> con nombre aleatorio (UUID).
//   allowed:  { extensions, mimeTypes }  -> se validan ambos
//   maxSize:  tamano maximo por archivo (bytes)
//   typeError: mensaje cuando el tipo no esta permitido
function createUploader({ folder, allowed, maxSize, maxFiles = 1, typeError }) {
    const dir = path.join(UPLOADS_ROOT, folder);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
        }
    });

    return multer({
        storage,
        limits: { fileSize: maxSize, files: maxFiles },
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowed.extensions.includes(ext) && allowed.mimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                const error = new Error(typeError);
                error.code = 'INVALID_FILE_TYPE';
                cb(error);
            }
        }
    });
}

// Convierte los errores de multer en respuestas 400 con un mensaje claro (en vez de un 500 en HTML).
function handleUpload(middleware, maxSizeMb) {
    return (req, res, next) => {
        middleware(req, res, (err) => {
            if (!err) return next();
            let msg = 'No se pudo subir el archivo';
            if (err.code === 'LIMIT_FILE_SIZE') msg = `Cada archivo puede pesar como máximo ${maxSizeMb} MB`;
            else if (err.code === 'LIMIT_FILE_COUNT') msg = 'Se superó la cantidad máxima de archivos por envío';
            else if (err.code === 'INVALID_FILE_TYPE') msg = err.message;
            else if (err.code === 'LIMIT_UNEXPECTED_FILE') msg = 'Campo de archivo no esperado';
            else console.error(err);
            res.status(400).json({ ok: false, msg });
        });
    };
}

// --- Fotos de mascotas (frontend publico / QR) ---
const upload = createUploader({
    folder: 'pets',
    allowed: IMAGE_TYPES,
    maxSize: 5 * 1024 * 1024,
    typeError: 'Solo se permiten imágenes (jpeg, jpg, png, webp)',
});

// --- Foto de la mascota en la historia clinica ---
const PET_PHOTO_MAX_MB = 5;
const petHistoryPhotoUpload = handleUpload(
    createUploader({
        folder: 'pets-history',
        allowed: IMAGE_TYPES,
        maxSize: PET_PHOTO_MAX_MB * 1024 * 1024,
        typeError: 'La foto debe ser una imagen (jpg, png o webp)',
    }).single('photo'),
    PET_PHOTO_MAX_MB
);

// --- Archivos de pruebas diagnosticas complementarias (PDF o imagen) ---
const TEST_FILE_MAX_MB = 10;
const TEST_FILES_PER_REQUEST = 10;
const testFilesUpload = handleUpload(
    createUploader({
        folder: 'tests',
        allowed: PDF_AND_IMAGE_TYPES,
        maxSize: TEST_FILE_MAX_MB * 1024 * 1024,
        maxFiles: TEST_FILES_PER_REQUEST,
        typeError: 'Solo se permiten archivos PDF o imágenes (jpg, png, webp)',
    }).array('files', TEST_FILES_PER_REQUEST),
    TEST_FILE_MAX_MB
);

module.exports = upload;
module.exports.petHistoryPhotoUpload = petHistoryPhotoUpload;
module.exports.testFilesUpload = testFilesUpload;
module.exports.UPLOADS_ROOT = UPLOADS_ROOT;
