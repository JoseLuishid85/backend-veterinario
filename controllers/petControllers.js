const crypto = require('crypto');
const { Pet, Owner } = require('../models/associations');

const createPet = async (req, res) => {
    const data = req.body;
    try {
        const ownerExists = await Owner.findByPk(data.ownerId);
        if (!ownerExists) {
            return res.status(404).json({ msg: `No existe un propietario con el id ${data.ownerId}` });
        }

        const code = crypto.randomUUID();

        const newPet = await Pet.create({
            name: data.name,
            species: data.species,
            breed: data.breed,
            color: data.color,
            gender: data.gender,
            birthDate: data.birthDate,
            weight: data.weight,
            observations: data.observations,
            photo: req.file ? `/uploads/pets/${req.file.filename}` : null,
            ownerId: data.ownerId,
            code
        });

        res.status(201).json({
            msg: 'Mascota registrada con éxito',
            pet: newPet
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al procesar datos' });
    }
};

const getPets = async (req, res) => {
    try {
        const pets = await Pet.findAll({
            where: { state: true },
            include: [
                { model: Owner, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'phone'] }
            ]
        });
        res.json(pets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las mascotas' });
    }
};

const getPetById = async (req, res) => {
    const { id } = req.params;
    try {
        const pet = await Pet.findByPk(id, {
            include: [
                { model: Owner, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'phone', 'email', 'address'] }
            ]
        });

        if (!pet) {
            return res.status(404).json({ msg: `No existe una mascota con el id ${id}` });
        }
        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la mascota' });
    }
};

const getPetByQrCode = async (req, res) => {
    const { code } = req.params;
    try {
        const pet = await Pet.findOne({
            where: { code },
            include: [
                { model: Owner, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'phone', 'email', 'address'] }
            ]
        });

        if (!pet) {
            return res.status(404).json({ msg: 'No existe una mascota con ese código QR' });
        }
        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al buscar la mascota' });
    }
};

const getPetsByOwner = async (req, res) => {
    const { ownerId } = req.params;
    try {
        const ownerExists = await Owner.findByPk(ownerId);
        if (!ownerExists) {
            return res.status(404).json({ msg: `No existe un propietario con el id ${ownerId}` });
        }

        const pets = await Pet.findAll({ where: { ownerId, state: true } });
        res.json(pets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las mascotas del propietario' });
    }
};

const updatePet = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const pet = await Pet.findByPk(id);
        if (!pet) {
            return res.status(404).json({ msg: `No existe una mascota con el id ${id}` });
        }

        await Pet.update({
            name: data.name,
            species: data.species,
            breed: data.breed,
            color: data.color,
            gender: data.gender,
            birthDate: data.birthDate,
            weight: data.weight,
            observations: data.observations,
            photo: req.file ? `/uploads/pets/${req.file.filename}` : pet.photo,
            ownerId: data.ownerId,
            state: data.state
        }, {
            where: { id }
        });

        const updatedPet = await Pet.findByPk(id, {
            include: [
                { model: Owner, as: 'owner', attributes: ['id', 'firstName', 'lastName'] }
            ]
        });

        res.json({ ok: true, pet: updatedPet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deletePet = async (req, res) => {
    const { id } = req.params;
    try {
        await Pet.update({ state: false }, { where: { id } });
        res.json({ ok: true, msg: `Mascota con id ${id} desactivada con éxito` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la mascota' });
    }
};

module.exports = {
    createPet,
    getPets,
    getPetById,
    getPetByQrCode,
    getPetsByOwner,
    updatePet,
    deletePet
};
