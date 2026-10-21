const { PetHistory, OwnerHistory, MedicalRecord, Consultation } = require('../models/associations');

// Devuelve la mascota (con su propietario) junto a su historia medica y consultas.
// Si la mascota aun no tiene historia medica, se responde con medicalRecord: null
// para que el frontend pueda mostrar el estado vacio en una sola peticion.
const getMedicalRecordByPetId = async (req, res) => {
    const { petId } = req.params;

    try {
        const pet = await PetHistory.findByPk(petId, {
            include: [
                { model: OwnerHistory, as: 'owner' }
            ]
        });

        if (!pet) {
            return res.status(404).json({ msg: `No existe una mascota con el id ${petId}` });
        }

        const medicalRecord = await MedicalRecord.findOne({
            where: { petId },
            include: [
                {
                    model: Consultation,
                    as: 'consultations',
                    where: { state: true },
                    required: false,
                    separate: true,
                    order: [['date', 'DESC']]
                }
            ]
        });

        res.json({ pet, medicalRecord });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la historia médica' });
    }
};

module.exports = {
    getMedicalRecordByPetId
};
