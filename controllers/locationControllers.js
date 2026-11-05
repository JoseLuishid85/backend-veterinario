const { City, Municipality, Parish, OwnerHistory } = require('../models/associations');

// ==================== CIUDADES ====================

const getCities = async (req, res) => {
    try {
        const cities = await City.findAll({ order: [['name', 'ASC']] });
        res.json(cities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las ciudades' });
    }
};

const createCity = async (req, res) => {
    const { name } = req.body;

    if (!name?.trim()) {
        return res.status(400).json({ msg: 'El nombre de la ciudad es obligatorio' });
    }

    try {
        const city = await City.create({ name: name.trim() });
        res.status(201).json({ msg: 'Ciudad agregada con éxito', city });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al procesar datos' });
    }
};

const updateCity = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name?.trim()) {
        return res.status(400).json({ msg: 'El nombre de la ciudad es obligatorio' });
    }

    try {
        const city = await City.findByPk(id);
        if (!city) {
            return res.status(404).json({ msg: `No existe una ciudad con el id ${id}` });
        }

        await city.update({ name: name.trim() });
        res.json({ ok: true, city });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteCity = async (req, res) => {
    const { id } = req.params;

    try {
        const city = await City.findByPk(id);
        if (!city) {
            return res.status(404).json({ msg: `No existe una ciudad con el id ${id}` });
        }

        const municipalityExists = await Municipality.findOne({ where: { cityId: id } });
        if (municipalityExists) {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede eliminar la ciudad porque tiene municipios asociados'
            });
        }

        await city.destroy();
        res.json({ ok: true, msg: 'La ciudad fue eliminada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la ciudad' });
    }
};

// ==================== MUNICIPIOS ====================

// GET /municipalities?cityId=1  -> filtra por ciudad (opcional)
const getMunicipalities = async (req, res) => {
    const { cityId } = req.query;

    try {
        const municipalities = await Municipality.findAll({
            where: cityId ? { cityId } : {},
            order: [['name', 'ASC']]
        });
        res.json(municipalities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los municipios' });
    }
};

const createMunicipality = async (req, res) => {
    const { name, cityId } = req.body;

    if (!name?.trim() || !cityId) {
        return res.status(400).json({ msg: 'El nombre y la ciudad son obligatorios' });
    }

    try {
        const city = await City.findByPk(cityId);
        if (!city) {
            return res.status(400).json({ msg: 'La ciudad seleccionada no existe' });
        }

        const municipality = await Municipality.create({ name: name.trim(), cityId });
        res.status(201).json({ msg: 'Municipio agregado con éxito', municipality });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al procesar datos' });
    }
};

const updateMunicipality = async (req, res) => {
    const { id } = req.params;
    const { name, cityId } = req.body;

    if (!name?.trim() || !cityId) {
        return res.status(400).json({ msg: 'El nombre y la ciudad son obligatorios' });
    }

    try {
        const municipality = await Municipality.findByPk(id);
        if (!municipality) {
            return res.status(404).json({ msg: `No existe un municipio con el id ${id}` });
        }

        const city = await City.findByPk(cityId);
        if (!city) {
            return res.status(400).json({ msg: 'La ciudad seleccionada no existe' });
        }

        await municipality.update({ name: name.trim(), cityId });
        res.json({ ok: true, municipality });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteMunicipality = async (req, res) => {
    const { id } = req.params;

    try {
        const municipality = await Municipality.findByPk(id);
        if (!municipality) {
            return res.status(404).json({ msg: `No existe un municipio con el id ${id}` });
        }

        const parishExists = await Parish.findOne({ where: { municipalityId: id } });
        if (parishExists) {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede eliminar el municipio porque tiene parroquias asociadas'
            });
        }

        await municipality.destroy();
        res.json({ ok: true, msg: 'El municipio fue eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el municipio' });
    }
};

// ==================== PARROQUIAS ====================

// GET /parishes?municipalityId=1  -> filtra por municipio (opcional)
const getParishes = async (req, res) => {
    const { municipalityId } = req.query;

    try {
        const parishes = await Parish.findAll({
            where: municipalityId ? { municipalityId } : {},
            order: [['name', 'ASC']]
        });
        res.json(parishes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las parroquias' });
    }
};

const createParish = async (req, res) => {
    const { name, municipalityId } = req.body;

    if (!name?.trim() || !municipalityId) {
        return res.status(400).json({ msg: 'El nombre y el municipio son obligatorios' });
    }

    try {
        const municipality = await Municipality.findByPk(municipalityId);
        if (!municipality) {
            return res.status(400).json({ msg: 'El municipio seleccionado no existe' });
        }

        const parish = await Parish.create({ name: name.trim(), municipalityId });
        res.status(201).json({ msg: 'Parroquia agregada con éxito', parish });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al procesar datos' });
    }
};

const updateParish = async (req, res) => {
    const { id } = req.params;
    const { name, municipalityId } = req.body;

    if (!name?.trim() || !municipalityId) {
        return res.status(400).json({ msg: 'El nombre y el municipio son obligatorios' });
    }

    try {
        const parish = await Parish.findByPk(id);
        if (!parish) {
            return res.status(404).json({ msg: `No existe una parroquia con el id ${id}` });
        }

        const municipality = await Municipality.findByPk(municipalityId);
        if (!municipality) {
            return res.status(400).json({ msg: 'El municipio seleccionado no existe' });
        }

        await parish.update({ name: name.trim(), municipalityId });
        res.json({ ok: true, parish });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteParish = async (req, res) => {
    const { id } = req.params;

    try {
        const parish = await Parish.findByPk(id);
        if (!parish) {
            return res.status(404).json({ msg: `No existe una parroquia con el id ${id}` });
        }

        const ownerExists = await OwnerHistory.findOne({ where: { parishId: id } });
        if (ownerExists) {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede eliminar la parroquia porque tiene propietarios asociados'
            });
        }

        await parish.destroy();
        res.json({ ok: true, msg: 'La parroquia fue eliminada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la parroquia' });
    }
};

module.exports = {
    getCities,
    createCity,
    updateCity,
    deleteCity,
    getMunicipalities,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality,
    getParishes,
    createParish,
    updateParish,
    deleteParish,
};
