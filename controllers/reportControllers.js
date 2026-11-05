const { Op } = require('sequelize');
const {
    Consultation,
    MedicalRecord,
    PetHistory,
    OwnerHistory,
    Parish,
    Municipality,
    City
} = require('../models/associations');

const NO_LOCATION = 'Sin ubicación';

// Convierte "YYYY-MM-DD" en una fecha local (sin desfase por zona horaria)
function parseDay(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
}

// Calcula el rango [start, end) segun el tipo de filtro:
//   ?type=month&year=2026&month=11
//   ?type=year&year=2026
//   ?type=range&from=2026-01-01&to=2026-03-31   (ambos dias incluidos)
function resolveRange(query) {
    const { type } = query;
    const year = Number.parseInt(query.year, 10);

    if (type === 'month') {
        const month = Number.parseInt(query.month, 10);
        if (!year || !month || month < 1 || month > 12) return { error: 'Debe indicar un mes y año válidos' };
        return { start: new Date(year, month - 1, 1), end: new Date(year, month, 1) };
    }

    if (type === 'year') {
        if (!year) return { error: 'Debe indicar un año válido' };
        return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
    }

    if (type === 'range') {
        const from = parseDay(query.from);
        const to = parseDay(query.to);
        if (!from || !to) return { error: 'Debe indicar las fechas desde y hasta (YYYY-MM-DD)' };
        if (from > to) return { error: 'La fecha "desde" no puede ser mayor que la fecha "hasta"' };
        const end = new Date(to);
        end.setDate(end.getDate() + 1);
        return { start: from, end };
    }

    return { error: 'Tipo de filtro inválido (month, year o range)' };
}

// GET /report/clients-by-location
// Clientes (propietarios) que tuvieron consultas en el periodo, agrupados por municipio y parroquia.
// El periodo se calcula con la fecha de registro de la consulta (createdAt), ya que el campo
// "date" es texto libre.
const getClientsByLocation = async (req, res) => {
    const range = resolveRange(req.query);
    if (range.error) return res.status(400).json({ msg: range.error });

    try {
        const consultations = await Consultation.findAll({
            where: {
                state: true,
                createdAt: { [Op.gte]: range.start, [Op.lt]: range.end }
            },
            attributes: ['id', 'date', 'createdAt'],
            include: [{
                model: MedicalRecord,
                as: 'medicalRecord',
                attributes: ['id'],
                required: true,
                include: [{
                    model: PetHistory,
                    as: 'pet',
                    attributes: ['id', 'name'],
                    required: true,
                    include: [{
                        model: OwnerHistory,
                        as: 'owner',
                        attributes: ['id', 'name', 'lastName', 'idNumber', 'phone', 'address'],
                        required: true,
                        include: [{
                            model: Parish,
                            as: 'parish',
                            attributes: ['id', 'name'],
                            include: [{
                                model: Municipality,
                                as: 'municipality',
                                attributes: ['id', 'name'],
                                include: [{ model: City, as: 'city', attributes: ['id', 'name'] }]
                            }]
                        }]
                    }]
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        // --- Agrupar ---
        const clients = new Map();        // ownerId -> cliente
        const municipalities = new Map(); // municipalityId -> { ..., parishes: Map }

        for (const consultation of consultations) {
            const pet = consultation.medicalRecord.pet;
            const owner = pet.owner;
            const parish = owner.parish;
            const municipality = parish?.municipality;
            const city = municipality?.city;

            // Cliente
            if (!clients.has(owner.id)) {
                clients.set(owner.id, {
                    ownerId: owner.id,
                    name: `${owner.name} ${owner.lastName}`,
                    idNumber: owner.idNumber,
                    phone: owner.phone,
                    address: owner.address,
                    parishId: parish?.id ?? null,
                    parish: parish?.name ?? NO_LOCATION,
                    municipalityId: municipality?.id ?? null,
                    municipality: municipality?.name ?? NO_LOCATION,
                    city: city?.name ?? null,
                    pets: new Set(),
                    visits: 0,
                    lastVisit: consultation.createdAt // ordenado DESC: la primera es la mas reciente
                });
            }
            const client = clients.get(owner.id);
            client.visits++;
            client.pets.add(pet.name);

            // Municipio / parroquia
            const munKey = municipality?.id ?? 0;
            if (!municipalities.has(munKey)) {
                municipalities.set(munKey, {
                    municipalityId: municipality?.id ?? null,
                    name: municipality?.name ?? NO_LOCATION,
                    city: city?.name ?? null,
                    clients: new Set(),
                    consultations: 0,
                    parishes: new Map()
                });
            }
            const mun = municipalities.get(munKey);
            mun.clients.add(owner.id);
            mun.consultations++;

            const parKey = parish?.id ?? 0;
            if (!mun.parishes.has(parKey)) {
                mun.parishes.set(parKey, {
                    parishId: parish?.id ?? null,
                    name: parish?.name ?? NO_LOCATION,
                    clients: new Set(),
                    consultations: 0
                });
            }
            const par = mun.parishes.get(parKey);
            par.clients.add(owner.id);
            par.consultations++;
        }

        const byClientsDesc = (a, b) => b.clients - a.clients || b.consultations - a.consultations || a.name.localeCompare(b.name);

        const byMunicipality = [...municipalities.values()]
            .map((m) => ({
                municipalityId: m.municipalityId,
                name: m.name,
                city: m.city,
                clients: m.clients.size,
                consultations: m.consultations,
                parishes: [...m.parishes.values()]
                    .map((p) => ({ parishId: p.parishId, name: p.name, clients: p.clients.size, consultations: p.consultations }))
                    .sort(byClientsDesc)
            }))
            .sort(byClientsDesc);

        const clientList = [...clients.values()]
            .map((c) => ({ ...c, pets: [...c.pets] }))
            .sort((a, b) => b.visits - a.visits || a.name.localeCompare(b.name));

        res.json({
            range: { start: range.start, end: range.end },
            totals: {
                consultations: consultations.length,
                clients: clientList.length,
                municipalities: byMunicipality.filter((m) => m.municipalityId).length,
                parishes: byMunicipality.reduce((acc, m) => acc + m.parishes.filter((p) => p.parishId).length, 0)
            },
            byMunicipality,
            clients: clientList
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al generar el reporte' });
    }
};

module.exports = {
    getClientsByLocation
};
