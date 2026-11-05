const { OwnerHistory, PetHistory, City, Municipality, Parish } = require('../models/associations');

// Incluye parroquia -> municipio -> ciudad del propietario
const locationInclude = {
    model: Parish,
    as: 'parish',
    attributes: ['id', 'name', 'municipalityId'],
    include: [{
        model: Municipality,
        as: 'municipality',
        attributes: ['id', 'name', 'cityId'],
        include: [{ model: City, as: 'city', attributes: ['id', 'name'] }]
    }]
};

// Normaliza y valida el parishId recibido. Devuelve { parishId } o { error }.
const resolveParishId = async (rawParishId) => {
    if (rawParishId === undefined || rawParishId === null || rawParishId === '') {
        return { parishId: null };
    }

    const parish = await Parish.findByPk(rawParishId);
    if (!parish) {
        return { error: 'La parroquia seleccionada no existe' };
    }

    return { parishId: parish.id };
};

const createOwnerHistory = async (req, res) => {
    const { name, lastName, idNumber, address, phone } = req.body;

    try {
        // 1. Validar si el propietario ya existe (por cédula)
        const ownerExists = await OwnerHistory.findOne({ where: { idNumber } });
        if (ownerExists) {
            return res.status(400).json({
                msg: 'Ya existe un propietario registrado con esa cédula',
            });
        }

        // 2. Validar la parroquia
        const { parishId, error } = await resolveParishId(req.body.parishId);
        if (error) {
            return res.status(400).json({ msg: error });
        }

        // 3. Crear el registro
        const created = await OwnerHistory.create({ name, lastName, idNumber, address, phone, parishId });
        const newOwner = await OwnerHistory.findByPk(created.id, { include: [locationInclude] });

        res.status(201).json({
            msg: "Propietario agregado con éxito",
            owner: newOwner
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al procesar datos"
        });
    }
};

const getOwnersHistory = async (req, res) => {
    try {
        const owners = await OwnerHistory.findAll({
            include: [
                { model: PetHistory, as: 'pets', attributes: ['id', 'name', 'petType'] },
                locationInclude
            ],
            order: [['lastName', 'ASC'], ['name', 'ASC']]
        });

        res.json(owners);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener los propietarios"
        });
    }
};

const getOwnerHistoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const owner = await OwnerHistory.findByPk(id, {
            include: [{ model: PetHistory, as: 'pets' }, locationInclude]
        });

        if (!owner) {
            return res.status(404).json({
                msg: `No existe un propietario con el id ${id}`
            });
        }

        res.json(owner);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener el propietario"
        });
    }
};

const updateOwnerHistory = async (req, res) => {
    const { id } = req.params;
    const { name, lastName, idNumber, address, phone } = req.body;

    try {
        const data = { name, lastName, idNumber, address, phone };

        // Solo se modifica la parroquia si viene en el body
        if (req.body.parishId !== undefined) {
            const { parishId, error } = await resolveParishId(req.body.parishId);
            if (error) {
                return res.status(400).json({ ok: false, msg: error });
            }
            data.parishId = parishId;
        }

        await OwnerHistory.update(data, { where: { id } });

        const updatedOwner = await OwnerHistory.findByPk(id, { include: [locationInclude] });

        res.json({
            ok: true,
            owner: updatedOwner
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar datos'
        });
    }
};

const changeStateOwnerHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const owner = await OwnerHistory.findByPk(id);

        await OwnerHistory.update({
            state: !owner.state
        }, {
            where: { id }
        });

        const ownerChanged = await OwnerHistory.findByPk(id);

        res.json({
            ok: true,
            owner: ownerChanged
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar datos'
        });
    }
};

const deleteOwnerHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const owner = await OwnerHistory.findByPk(id);

        if (!owner) {
            return res.status(404).json({
                msg: `No existe un propietario con el id ${id}`
            });
        }

        const petExists = await PetHistory.findOne({
            where: { ownerId: id }
        });

        if (petExists) {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede eliminar el propietario porque tiene mascotas asociadas'
            });
        }

        await owner.destroy();

        res.json({
            ok: true,
            msg: `El propietario fue eliminado con éxito`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar el propietario'
        });
    }
};

module.exports = {
    createOwnerHistory,
    getOwnersHistory,
    getOwnerHistoryById,
    updateOwnerHistory,
    changeStateOwnerHistory,
    deleteOwnerHistory,
};
