const {
    Owner,
    Pet,
    OwnerHistory,
    PetHistory,
    MedicalRecord,
    Consultation,
    City,
    Municipality,
    Parish,
    Organ,
    ConsultationOrgan,
    ComplementaryTest,
    ConsultationComplementaryTest,
    Product,
    ConsultationTreatment
} = require('../models/associations');
const User = require('../models/User');
const { seedCatalogs } = require('../seeders/catalogs');

/*
 * Sincroniza (crea / actualiza) las tablas a partir de los modelos.
 * Uso:
 *   GET /vete2/api/data              -> crea las tablas que no existan (no toca las existentes)
 *   GET /vete2/api/data?alter=true   -> ademas ajusta columnas de tablas existentes al modelo
 *   GET /vete2/api/data?model=Pet    -> solo sincroniza ese modelo (se puede combinar con alter)
 *
 * El orden importa: primero las tablas padre y despues las que tienen llaves foraneas.
 * Comenta las lineas de los modelos que no quieras tocar.
 * Ademas llena los catalogos de Organos y Pruebas Complementarias (seeders/catalogs.js).
 *
 * OJO: alter=true elimina las columnas que ya no estan en el modelo
 * (ej. consultations.systems / complementaryTests / treatment). Migra los datos antes con
 * scripts/migrateConsultationDetails.js y scripts/migrateConsultationTreatment.js.
 */
const MODELOS = [
    User,
    City,
    Municipality,
    Parish,
    Owner,
    Pet,
    OwnerHistory,
    PetHistory,
    MedicalRecord,
    Consultation,
    Organ,
    ComplementaryTest,
    ConsultationOrgan,
    ConsultationComplementaryTest,
    Product,
    ConsultationTreatment,
];

const crearDB = async (req, res) => {
    const alter = req.query.alter === 'true';
    const soloModelo = req.query.model;

    let modelos = MODELOS;
    if (soloModelo) {
        modelos = MODELOS.filter(m => m.name.toLowerCase() === soloModelo.toLowerCase());
        if (modelos.length === 0) {
            return res.status(404).send({
                msg: `Modelo "${soloModelo}" no encontrado`,
                disponibles: MODELOS.map(m => m.name)
            });
        }
    }

    const resultado = [];

    for (const modelo of modelos) {
        try {
            await modelo.sync({ alter });
            resultado.push({ modelo: modelo.name, tabla: modelo.getTableName(), ok: true });
        } catch (error) {
            console.error(`Error sincronizando ${modelo.name}:`, error);
            resultado.push({ modelo: modelo.name, tabla: modelo.getTableName(), ok: false, error: error.message });
            // Si falla una tabla padre las siguientes probablemente fallen, se detiene aqui
            return res.status(500).send({ msg: `Error sincronizando ${modelo.name}`, alter, resultado });
        }
    }

    // Llena los catalogos (organos y pruebas complementarias) si faltan registros
    try {
        if (!soloModelo || ['organ', 'complementarytest'].includes(soloModelo.toLowerCase())) {
            await seedCatalogs({ Organ, ComplementaryTest });
        }
    } catch (error) {
        console.error('Error llenando catalogos:', error);
        return res.status(500).send({ msg: 'Tablas sincronizadas, pero fallo el llenado de catalogos', alter, resultado });
    }

    return res.status(200).send({ msg: 'Tablas sincronizadas', alter, resultado });
};

module.exports = {
    crearDB
};
