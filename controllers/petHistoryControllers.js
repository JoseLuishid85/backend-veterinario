const { PetHistory, OwnerHistory } = require('../models/associations');

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

const deletePetHistory = async (req, res) => {
    const { id } = req.params;
    try {
        await PetHistory.update({ state: false }, { where: { id } });
        res.json({ ok: true, msg: `Mascota con id ${id} desactivada con éxito` });
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
    deletePetHistory
};
