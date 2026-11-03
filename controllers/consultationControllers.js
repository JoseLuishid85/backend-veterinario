const { Op } = require('sequelize');
const { PetHistory, MedicalRecord, Consultation, OwnerHistory } = require('../models/associations');

const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 1000;

const createConsultation = async (req, res) => {
    const data = req.body;

    try {
        const pet = await PetHistory.findByPk(data.petId);
        if (!pet) {
            return res.status(404).json({ msg: `No existe una mascota con el id ${data.petId}` });
        }

        // 1. Obtener (o crear) la historia medica de la mascota
        const [medicalRecord] = await MedicalRecord.findOrCreate({
            where: { petId: data.petId },
            defaults: { petId: data.petId }
        });

        // 2. Actualizar los datos anamnesicos con lo enviado en el formulario
        await medicalRecord.update({
            dewormingDate: data.dewormingDate,
            dewormingProduct: data.dewormingProduct,
            vaccines: data.vaccines,
            previousDiseases: data.previousDiseases,
            diet: data.diet,
            reproductiveStatus: data.reproductiveStatus,
            lastHeatDate: data.lastHeatDate,
            lastDeliveryDate: data.lastDeliveryDate
        });

        // 3. Crear el registro de la consulta
        const newConsultation = await Consultation.create({
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
            systems: data.systems,
            findings: data.findings,
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            complementaryTests: data.complementaryTests
        });

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
//   ?limit=N     -> cantidad maxima (por defecto 20, hasta 1000)
const getConsultations = async (req, res) => {
    const where = { state: true };

    if (req.query.today === 'true') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        where.createdAt = { [Op.gte]: start, [Op.lt]: end };
    }

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_LIST_LIMIT)
        : DEFAULT_LIST_LIMIT;

    try {
        const consultations = await Consultation.findAll({
            where,
            limit,
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
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
                                { model: OwnerHistory, as: 'owner', attributes: ['id', 'name', 'lastName'] }
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
            include: [{ model: MedicalRecord, as: 'medicalRecord' }]
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
    try {
        await Consultation.update({
            date: data.date,
            symptomsDate: data.symptomsDate,
            consultationReason: data.consultationReason,
            temperature: data.temperature,
            weight: data.weight,
            lymphNodes: data.lymphNodes,
            mucosa: data.mucosa,
            demeanor: data.demeanor,
            demeanorOther: data.demeanorOther,
            systems: data.systems,
            findings: data.findings,
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            complementaryTests: data.complementaryTests
        }, {
            where: { id }
        });

        const updatedConsultation = await Consultation.findByPk(id);
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
    createConsultation,
    getConsultations,
    getConsultationById,
    updateConsultation,
    deleteConsultation
};
