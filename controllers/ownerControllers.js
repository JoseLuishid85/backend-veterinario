const { Owner, Pet } = require('../models/associations');

const createOwner = async (req, res) => {
    const data = req.body;

    try {

        const ownerExists = await Owner.findOne({ where: { idCard: data.idCard } });
        if (ownerExists) {
            return res.status(400).json({ msg: 'Ya existe un propietario con esa cédula' });
        }

        const newOwner = await Owner.create({
            firstName: data.firstName,
            lastName: data.lastName,
            idCard: data.idCard,
            address: data.address,
            phone: data.phone,
            email: data.email || null
        });

        res.status(201).json({
            msg: 'Propietario registrado con éxito',
            owner: newOwner
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al procesar datos' });
    }
};

const getOwners = async (req, res) => {
    try {
        const owners = await Owner.findAll({ where: { state: true } });
        res.json(owners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los propietarios' });
    }
};

const getOwnerById = async (req, res) => {
    const { id } = req.params;
    try {
        const owner = await Owner.findByPk(id, {
            include: [
                { model: Pet, as: 'pets', where: { state: true }, required: false }
            ]
        });

        if (!owner) {
            return res.status(404).json({ msg: `No existe un propietario con el id ${id}` });
        }
        res.json(owner);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el propietario' });
    }
};

const updateOwner = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const owner = await Owner.findByPk(id);
        if (!owner) {
            return res.status(404).json({ msg: `No existe un propietario con el id ${id}` });
        }

        await Owner.update({
            firstName: data.firstName,
            lastName: data.lastName,
            idCard: data.idCard,
            address: data.address,
            phone: data.phone,
            email: data.email || null,
            state: data.state
        }, {
            where: { id }
        });

        const updatedOwner = await Owner.findByPk(id);

        res.json({ ok: true, owner: updatedOwner });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteOwner = async (req, res) => {
    const { id } = req.params;
    try {
        await Owner.update({ state: false }, { where: { id } });
        res.json({ ok: true, msg: `Propietario con id ${id} desactivado con éxito` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el propietario' });
    }
};

module.exports = {
    createOwner,
    getOwners,
    getOwnerById,
    updateOwner,
    deleteOwner
};
