const fs = require('fs/promises');
const path = require('path');
const { UPLOADS_ROOT } = require('../middlewares/upload');

// Ruta publica ("/uploads/<carpeta>/<archivo>") de un archivo subido por multer
const toPublicPath = (folder, file) => `/uploads/${folder}/${file.filename}`;

// Borra del disco archivos guardados con ruta publica "/uploads/...".
// Ignora los que ya no existen y nunca borra nada fuera de la carpeta uploads.
async function removeUploadedFiles(publicPaths) {
    await Promise.all(publicPaths.filter(Boolean).map(async (publicPath) => {
        const relative = String(publicPath).replace(/^\/?uploads\//, '');
        const absolute = path.resolve(UPLOADS_ROOT, relative);
        if (!absolute.startsWith(UPLOADS_ROOT + path.sep)) return;
        try {
            await fs.unlink(absolute);
        } catch (error) {
            if (error.code !== 'ENOENT') console.error('No se pudo borrar el archivo', absolute, error.message);
        }
    }));
}

// Borra los archivos que multer acaba de guardar (cuando la peticion termina rechazandose)
const discardUploadedFiles = (folder, files = []) =>
    removeUploadedFiles(files.map((f) => toPublicPath(folder, f)));

module.exports = { toPublicPath, removeUploadedFiles, discardUploadedFiles };
