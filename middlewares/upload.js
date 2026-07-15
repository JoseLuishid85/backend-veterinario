const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const petsDir = path.join(__dirname, '../uploads/pets');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(petsDir)) {
            fs.mkdirSync(petsDir, { recursive: true });
        }
        cb(null, petsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (isValid) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
        }
    }
});

module.exports = upload;
