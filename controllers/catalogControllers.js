const { Organ, ComplementaryTest, Product } = require('../models/associations');

// Fabrica de CRUD para catalogos simples { id, name, status }.
// En el GET, por defecto solo se devuelven los activos (status = true);
// con ?all=true se devuelven todos (para administrarlos).
function catalogCrud(Model, label) {
    const getAll = async (req, res) => {
        try {
            const where = req.query.all === 'true' ? {} : { status: true };
            const items = await Model.findAll({ where, order: [['id', 'ASC']] });
            res.json(items);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: `Error al obtener ${label}` });
        }
    };

    const create = async (req, res) => {
        const { name, status } = req.body;
        if (!name?.trim()) return res.status(400).json({ msg: 'El nombre es obligatorio' });
        try {
            const item = await Model.create({ name: name.trim(), status: status ?? true });
            res.status(201).json(item);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ msg: `Ya existe un registro con el nombre "${name}"` });
            }
            console.error(error);
            res.status(500).json({ msg: `Error al crear en ${label}` });
        }
    };

    const update = async (req, res) => {
        const { id } = req.params;
        const { name, status } = req.body;
        try {
            const item = await Model.findByPk(id);
            if (!item) return res.status(404).json({ msg: `No existe el registro con id ${id}` });
            await item.update({
                ...(name !== undefined && { name: name.trim() }),
                ...(status !== undefined && { status })
            });
            res.json(item);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: `Error al actualizar en ${label}` });
        }
    };

    // No se borra fisicamente (hay consultas que lo referencian): se desactiva
    const remove = async (req, res) => {
        const { id } = req.params;
        try {
            await Model.update({ status: false }, { where: { id } });
            res.json({ ok: true, msg: `Registro ${id} desactivado` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: `Error al desactivar en ${label}` });
        }
    };

    return { getAll, create, update, remove };
}

module.exports = {
    organs: catalogCrud(Organ, 'organos y sistemas'),
    complementaryTests: catalogCrud(ComplementaryTest, 'pruebas complementarias'),
    products: catalogCrud(Product, 'productos')
};
