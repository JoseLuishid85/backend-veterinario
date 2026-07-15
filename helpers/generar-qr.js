const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ quiet: true });

const qrDir = path.join(__dirname, '../uploads/qrcodes');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const generarQR = async (code) => {
    if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
    }

    const fileName = `${code}.png`;
    const filePath = path.join(qrDir, fileName);
    const petUrl = `${FRONTEND_URL}/mascota/${code}`;

    await QRCode.toFile(filePath, petUrl, {
        width: 300,
        margin: 2
    });

    return `/uploads/qrcodes/${fileName}`;
};

module.exports = generarQR;
