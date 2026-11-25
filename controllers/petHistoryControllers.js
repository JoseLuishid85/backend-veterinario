const sequelize = require('../config/database');
const {
    PetHistory,
    OwnerHistory,
    MedicalRecord,
    Consultation,
    ConsultationOrgan,
    ConsultationComplementaryTest,
    ConsultationTreatment,
    ConsultationTestFile
} = require('../models/associations');
const { toPublicPath, removeUploadedFiles, discardUploadedFiles } = require('../helpers/files');

const PET_PHOTO_FOLDER = 'pets-history';

// Elimina fisicamente una mascota junto con su historia medica y todas sus consultas
// (y el detalle de cada consulta). Debe ejecutarse dentro de una transaccion.
// Devuelve { consultationsDeleted, files }: "files" son las rutas de archivos (foto y adjuntos
// de pruebas) que hay que borrar del disco DESPUES de confirmar la transaccion.
const destroyPetWithHistory = async (petId, transaction) => {
    const pet = await PetHistory.findByPk(petId, { attributes: ['id', 'photo'], transaction });
    const files = pet?.photo ? [pet.photo] : [];
    const records = await MedicalRecord.findAll({ where: { petId }, attributes: ['id'], transaction });
    const recordIds = records.map((r) => r.id);
    let consultationsDeleted = 0;

    if (recordIds.length > 0) {
        const consultations = await Consultation.findAll({
            where: { medicalRecordId: recordIds },
            attributes: ['id'],
            transaction
        });
        const consultationIds = consultations.map((c) => c.id);

        if (consultationIds.length > 0) {
            const where = { consultationId: consultationIds };
            await ConsultationOrgan.destroy({ where, transaction });
            await ConsultationComplementaryTest.destroy({ where, transaction });
            await ConsultationTreatment.destroy({ where, transaction });
            const testFiles = await ConsultationTestFile.findAll({ where, attributes: ['filePath'], transaction });
            files.push(...testFiles.map((f) => f.filePath));
            await ConsultationTestFile.destroy({ where, transaction });
            consultationsDeleted = await Consultation.destroy({ where: { id: consultationIds }, transaction });
        }

        await MedicalRecord.destroy({ where: { id: recordIds }, transaction });
    }

    await PetHistory.destroy({ where: { id: petId }, transaction });
    return { consultationsDeleted, files };
};

const createPetHistory = async (req, res) => {
    const data = req.body;
    try {
        const ownerExists = await OwnerHistory.findByPk(data.ownerId);
        if (!ownerExists) {
            return res.status(404).json({ msg: `No existe un propietario con el id ${data.ownerId}` });
        }

        const newPet = await PetHistory.create({
            name: data.name,
            breed: data.breed,
            petType: data.petType,
            birthDate: data.birthDate,
            color: data.color,
            // La foto se sube aparte con PUT /pet-history/:id/photo
            gender: data.gender,
            weight: data.weight,
            ownerId: data.ownerId
        });

        res.status(201).json({
            msg: "Mascota agregada con éxito",
            pet: newPet
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getPetsHistory = async (req, res) => {
    try {
        const pets = await PetHistory.findAll({
            where: { state: true },
            include: [
                { model: OwnerHistory, as: 'owner', attributes: ['id', 'name', 'lastName', 'idNumber', 'phone'] }
            ]
        });
        res.json(pets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener las mascotas" });
    }
};

const getPetHistoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const pet = await PetHistory.findByPk(id, {
            include: [
                { model: OwnerHistory, as: 'owner', attributes: ['id', 'name', 'lastName', 'idNumber', 'phone'] }
            ]
        });

        if (!pet) {
            return res.status(404).json({ msg: `No existe una mascota con el id ${id}` });
        }
        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener la mascota" });
    }
};

const getPetsHistoryByOwnerId = async (req, res) => {
    const { ownerId } = req.params;

    try {
        const ownerExists = await OwnerHistory.findByPk(ownerId);
        if (!ownerExists) {
            return res.status(404).json({ msg: `No existe un propietario con el id ${ownerId}` });
        }

        const pets = await PetHistory.findAll({
            where: { ownerId, state: true }
        });

        res.json(pets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener las mascotas del propietario" });
    }
};

const updatePetHistory = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const pet = await PetHistory.findByPk(id);
        if (!pet) {
            return res.status(404).json({ ok: false, msg: `No existe una mascota con el id ${id}` });
        }

        if (data.ownerId !== undefined && String(data.ownerId) !== String(pet.ownerId)) {
            const ownerExists = await OwnerHistory.findByPk(data.ownerId);
            if (!ownerExists) {
                return res.status(404).json({ ok: false, msg: `No existe un propietario con el id ${data.ownerId}` });
            }
        }

        await PetHistory.update({
            name: data.name,
            breed: data.breed,
            petType: data.petType,
            birthDate: data.birthDate,
            color: data.color,
            // La foto se cambia aparte con PUT/DELETE /pet-history/:id/photo
            gender: data.gender,
            weight: data.weight,
            ownerId: data.ownerId,
            state: data.state
        }, {
            where: { id }
        });

        const updatedPet = await PetHistory.findByPk(id, {
            include: [
                { model: OwnerHistory, as: 'owner', attributes: ['id', 'name', 'lastName', 'idNumber', 'phone'] }
            ]
        });

        res.json({ ok: true, pet: updatedPet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

// Elimina la mascota de forma definitiva, incluida su historia medica y todas sus consultas.
const deletePetHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const pet = await PetHistory.findByPk(id);
        if (!pet) {
            return res.status(404).json({ ok: false, msg: `No existe una mascota con el id ${id}` });
        }

        const { consultationsDeleted, files } = await sequelize.transaction((t) => destroyPetWithHistory(pet.id, t));
        await removeUploadedFiles(files);

        res.json({
            ok: true,
            consultationsDeleted,
            msg: consultationsDeleted > 0
                ? `La mascota ${pet.name} y su historia médica (${consultationsDeleted} consulta${consultationsDeleted === 1 ? '' : 's'}) fueron eliminadas`
                : `La mascota ${pet.name} fue eliminada`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la mascota' });
    }
};

// PUT /pet-history/:id/photo   (multipart: photo)
// Sube o reemplaza la foto de la mascota (la anterior se borra del disco).
const updatePetHistoryPhoto = async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    try {
        if (!file) {
            return res.status(400).json({ ok: false, msg: 'No se recibió ninguna foto' });
        }

        const pet = await PetHistory.findByPk(id);
        if (!pet) {
            await discardUploadedFiles(PET_PHOTO_FOLDER, [file]);
            return res.status(404).json({ ok: false, msg: `No existe una mascota con el id ${id}` });
        }

        const previousPhoto = pet.photo;
        await pet.update({ photo: toPublicPath(PET_PHOTO_FOLDER, file) });
        if (previousPhoto && previousPhoto !== pet.photo) await removeUploadedFiles([previousPhoto]);

        res.json({ ok: true, pet });
    } catch (error) {
        console.error(error);
        if (file) await discardUploadedFiles(PET_PHOTO_FOLDER, [file]);
        res.status(500).json({ ok: false, msg: 'Error al guardar la foto' });
    }
};

// DELETE /pet-history/:id/photo
const deletePetHistoryPhoto = async (req, res) => {
    const { id } = req.params;
    try {
        const pet = await PetHistory.findByPk(id);
        if (!pet) {
            return res.status(404).json({ ok: false, msg: `No existe una mascota con el id ${id}` });
        }
        const previousPhoto = pet.photo;
        await pet.update({ photo: null });
        await removeUploadedFiles([previousPhoto]);
        res.json({ ok: true, pet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la foto' });
    }
};

module.exports = {
    updatePetHistoryPhoto,
    deletePetHistoryPhoto,
    createPetHistory,
    getPetsHistory,
    getPetHistoryById,
    getPetsHistoryByOwnerId,
    updatePetHistory,
    deletePetHistory,
    destroyPetWithHistory
};
