const { Op } = require('sequelize');
const sequelize = require('../config/database');
const {
    PetHistory,
    MedicalRecord,
    Consultation,
    OwnerHistory,
    Organ,
    ConsultationOrgan,
    ComplementaryTest,
    ConsultationComplementaryTest,
    Product,
    ConsultationTreatment
} = require('../models/associations');

const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 1000;

// Includes para traer el detalle (organos, pruebas y tratamiento) con el nombre del catalogo
const DETAIL_INCLUDES = [
    {
        model: ConsultationOrgan,
        as: 'organs',
        attributes: ['id', 'organId', 'result'],
        include: [{ model: Organ, as: 'organ', attributes: ['id', 'name'] }]
    },
    {
        model: ConsultationComplementaryTest,
        as: 'complementaryTests',
        attributes: ['id', 'complementaryTestId', 'detail'],
        include: [{ model: ComplementaryTest, as: 'test', attributes: ['id', 'name'] }]
    },
    {
        model: ConsultationTreatment,
        as: 'treatments',
        attributes: ['id', 'productId', 'baseDose', 'presentation', 'route', 'frequencyDuration'],
        include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
        separate: true,
        order: [['id', 'ASC']]
    }
];

// Guarda (reemplaza) el detalle de organos y pruebas de una consulta.
//   organs:             [{ organId, result: 'N' | 'AN' | 'NE' }]   (NE no se guarda)
//   complementaryTests: [{ complementaryTestId, detail }]          (solo las marcadas)
//   treatment:          [{ productId, baseDose, presentation, route, frequencyDuration }] (solo filas con producto)
// Si alguno no viene como arreglo, ese detalle no se toca.
async function saveConsultationDetails(consultationId, { organs, complementaryTests, treatment }, transaction) {
    if (Array.isArray(organs)) {
        await ConsultationOrgan.destroy({ where: { consultationId }, transaction });
        const rows = organs
            .filter((o) => o?.organId && ['N', 'AN'].includes(o.result))
            .map((o) => ({ consultationId, organId: o.organId, result: o.result }));
        if (rows.length) await ConsultationOrgan.bulkCreate(rows, { transaction });
    }

    if (Array.isArray(complementaryTests)) {
        await ConsultationComplementaryTest.destroy({ where: { consultationId }, transaction });
        const rows = complementaryTests
            .filter((t) => t?.complementaryTestId)
            .map((t) => ({ consultationId, complementaryTestId: t.complementaryTestId, detail: t.detail || null }));
        if (rows.length) await ConsultationComplementaryTest.bulkCreate(rows, { transaction });
    }

    if (Array.isArray(treatment)) {
        await ConsultationTreatment.destroy({ where: { consultationId }, transaction });
        const clean = (v) => (typeof v === 'string' ? v.trim() : v) || null;
        const rows = treatment
            .filter((t) => t?.productId)
            .map((t) => ({
                consultationId,
                productId: t.productId,
                baseDose: clean(t.baseDose),
                presentation: clean(t.presentation),
                route: clean(t.route),
                frequencyDuration: clean(t.frequencyDuration)
            }));
        if (rows.length) await ConsultationTreatment.bulkCreate(rows, { transaction });
    }
}

// Campos obligatorios de una consulta: fecha y motivo
function validateRequired(data) {
    const missing = [];
    if (!String(data.date ?? '').trim()) missing.push('fecha');
    if (!String(data.consultationReason ?? '').trim()) missing.push('motivo de la consulta');
    if (missing.length) return `Campos obligatorios: ${missing.join(' y ')}`;
    if (data.followUpDate && !isValidDateOnly(data.followUpDate)) return 'La fecha del control no es válida';
    return null;
}

// "YYYY-MM-DD" que corresponde a una fecha real
function isValidDateOnly(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
    if (!match) return false;
    const [, y, m, d] = match.map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// Fecha local "YYYY-MM-DD" (para comparar con columnas DATEONLY)
function toDateOnly(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Consulta reagendada: sin fecha se limpia tambien el motivo del control
const pickFollowUp = (data) => {
    const followUpDate = data.followUpDate || null;
    const note = typeof data.followUpNote === 'string' ? data.followUpNote.trim() : '';
    return { followUpDate, followUpNote: followUpDate && note ? note.slice(0, 255) : null };
};

// Datos anamnesicos que viven en la historia medica (se actualizan desde el formulario de consulta)
const pickAnamnesis = (data) => ({
    dewormingDate: data.dewormingDate,
    dewormingProduct: data.dewormingProduct,
    vaccines: data.vaccines,
    previousDiseases: data.previousDiseases,
    diet: data.diet,
    reproductiveStatus: data.reproductiveStatus,
    lastHeatDate: data.lastHeatDate,
    lastDeliveryDate: data.lastDeliveryDate
});

const createConsultation = async (req, res) => {
    const data = req.body;

    const validationError = validateRequired(data);
    if (validationError) {
        return res.status(400).json({ msg: validationError });
    }

    try {
        const pet = await PetHistory.findByPk(data.petId);
        if (!pet) {
            return res.status(404).json({ msg: `No existe una mascota con el id ${data.petId}` });
        }

        const { consultation, medicalRecord } = await sequelize.transaction(async (transaction) => {
            // 1. Obtener (o crear) la historia medica de la mascota
            const [medicalRecord] = await MedicalRecord.findOrCreate({
                where: { petId: data.petId },
                defaults: { petId: data.petId },
                transaction
            });

            // 2. Actualizar los datos anamnesicos con lo enviado en el formulario
            await medicalRecord.update(pickAnamnesis(data), { transaction });

            // 3. Crear el registro de la consulta
            const consultation = await Consultation.create({
                medicalRecordId: medicalRecord.id,
                date: data.date,
                symptomsDate: data.symptomsDate,
                consultationReason: data.consultationReason,
                temperature: data.temperature,
                weight: data.weight,
                lymphNodes: data.lymphNodes,
                mucosa: data.mucosa,
                demeanor: data.demeanor,
                demeanorOther: data.demeanorOther,
                findings: data.findings,
                diagnosis: data.diagnosis,
                ...pickFollowUp(data)
            }, { transaction });

            // 4. Detalle de organos, pruebas complementarias y tratamiento
            await saveConsultationDetails(consultation.id, data, transaction);

            return { consultation, medicalRecord };
        });

        const newConsultation = await Consultation.findByPk(consultation.id, { include: DETAIL_INCLUDES });

        res.status(201).json({
            msg: 'Consulta registrada con éxito',
            consultation: newConsultation,
            medicalRecord
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al procesar datos' });
    }
};

// GET /consultation
//   ?today=true  -> solo las consultas registradas hoy (por createdAt, ya que "date" es texto libre)
//   ?yesterday=true -> solo las consultas registradas ayer (para el seguimiento)
//   ?week=true   -> consultas de esta semana, del lunes hasta ayer (seguimiento del sabado)
//   ?followUp=true -> consultas reagendadas con control desde hoy en adelante (orden: el mas proximo primero)
//   ?limit=N     -> cantidad maxima (por defecto 20, hasta 1000)
const getConsultations = async (req, res) => {
    const where = { state: true };
    const isFollowUp = req.query.followUp === 'true';

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (isFollowUp) {
        where.followUpDate = { [Op.gte]: toDateOnly(todayStart) };
    } else if (req.query.today === 'true' || req.query.yesterday === 'true') {
        const start = new Date(todayStart);
        if (req.query.yesterday === 'true') start.setDate(start.getDate() - 1);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        where.createdAt = { [Op.gte]: start, [Op.lt]: end };
    } else if (req.query.week === 'true') {
        // Desde el lunes de esta semana hasta ayer (el domingo cuenta como fin de la semana que termina)
        const start = new Date(todayStart);
        const daysSinceMonday = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - daysSinceMonday);
        where.createdAt = { [Op.gte]: start, [Op.lt]: todayStart };
    }

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_LIST_LIMIT)
        : DEFAULT_LIST_LIMIT;

    try {
        const consultations = await Consultation.findAll({
            where,
            limit,
            order: isFollowUp
                ? [['followUpDate', 'ASC'], ['id', 'ASC']]
                : [['createdAt', 'DESC'], ['id', 'DESC']],
            include: [
                {
                    model: MedicalRecord,
                    as: 'medicalRecord',
                    attributes: ['id', 'petId'],
                    include: [
                        {
                            model: PetHistory,
                            as: 'pet',
                            attributes: ['id', 'name', 'petType'],
                            include: [
                                { model: OwnerHistory, as: 'owner', attributes: ['id', 'name', 'lastName', 'phone'] }
                            ]
                        }
                    ]
                }
            ]
        });
        res.json(consultations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las consultas' });
    }
};

const getConsultationById = async (req, res) => {
    const { id } = req.params;
    try {
        const consultation = await Consultation.findByPk(id, {
            include: [
                {
                    model: MedicalRecord,
                    as: 'medicalRecord',
                    include: [
                        {
                            model: PetHistory,
                            as: 'pet',
                            include: [{ model: OwnerHistory, as: 'owner' }]
                        }
                    ]
                },
                ...DETAIL_INCLUDES
            ]
        });

        if (!consultation) {
            return res.status(404).json({ msg: `No existe una consulta con el id ${id}` });
        }
        res.json(consultation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la consulta' });
    }
};

const updateConsultation = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const validationError = validateRequired(data);
    if (validationError) {
        return res.status(400).json({ ok: false, msg: validationError });
    }

    try {
        const consultation = await Consultation.findByPk(id);
        if (!consultation) {
            return res.status(404).json({ ok: false, msg: `No existe una consulta con el id ${id}` });
        }

        await sequelize.transaction(async (transaction) => {
            await consultation.update({
                date: data.date,
                symptomsDate: data.symptomsDate,
                consultationReason: data.consultationReason,
                temperature: data.temperature,
                weight: data.weight,
                lymphNodes: data.lymphNodes,
                mucosa: data.mucosa,
                demeanor: data.demeanor,
                demeanorOther: data.demeanorOther,
                findings: data.findings,
                diagnosis: data.diagnosis,
                ...pickFollowUp(data)
            }, { transaction });

            await saveConsultationDetails(consultation.id, data, transaction);

            // Los anamnesicos se guardan en la historia medica de la mascota
            await MedicalRecord.update(pickAnamnesis(data), {
                where: { id: consultation.medicalRecordId },
                transaction
            });
        });

        const updatedConsultation = await Consultation.findByPk(id, { include: DETAIL_INCLUDES });
        res.json({ ok: true, consultation: updatedConsultation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const deleteConsultation = async (req, res) => {
    const { id } = req.params;
    try {
        await Consultation.update({ state: false }, { where: { id } });
        res.json({ ok: true, msg: `Consulta con id ${id} eliminada con éxito` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la consulta' });
    }
};

module.exports = {
    DETAIL_INCLUDES,
    createConsultation,
    getConsultations,
    getConsultationById,
    updateConsultation,
    deleteConsultation
};
