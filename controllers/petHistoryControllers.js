const sequelize = require('../config/database');
const {
    PetHistory,
    OwnerHistory,
    MedicalRecord,
    Consultation,
    ConsultationOrgan,
    ConsultationComplementaryTest,
    ConsultationTreatment
} = require('../models/associations');

// Elimina fisicamente una mascota junto con su historia medica y todas sus consultas
// (y el detalle de cada consulta). Debe ejecutarse dentro de una transaccion.
// Devuelve la cantidad de consultas eliminadas.
const destroyPetWithHistory = async (petId, transaction) => {
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
            consultationsDeleted = await Consultation.destroy({ where: { id: consultationIds }, transaction });
        }

        await MedicalRecord.destroy({ where: { id: recordIds }, transaction });
    }

    await PetHistory.destroy({ where: { id: petId }, transaction });
    return consultationsDeleted;
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
            photo: data.photo,
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
            photo: data.photo,
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

        const consultationsDeleted = await sequelize.transaction((t) => destroyPetWithHistory(pet.id, t));

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

module.exports = {
    createPetHistory,
    getPetsHistory,
    getPetHistoryById,
    getPetsHistoryByOwnerId,
    updatePetHistory,
    deletePetHistory,
    destroyPetWithHistory
};
