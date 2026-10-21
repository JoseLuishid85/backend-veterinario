const Owner = require('./Owner');
const Pet = require('./Pet');
const OwnerHistory = require('./OwnerHistory');
const PetHistory = require('./PetHistory');
const MedicalRecord = require('./MedicalRecord');
const Consultation = require('./Consultation');

// --- Relaciones de Uno a Muchos (1:N) ---

// Un propietario tiene muchas mascotas
Owner.hasMany(Pet, { foreignKey: 'ownerId', as: 'pets' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId', as: 'owner' });

// --- Historia clinica (antes backend univet) ---

// Un propietario (historia) tiene muchas mascotas (historia)
OwnerHistory.hasMany(PetHistory, { foreignKey: 'ownerId', as: 'pets' });
PetHistory.belongsTo(OwnerHistory, { foreignKey: 'ownerId', as: 'owner' });

// Una mascota (historia) tiene una historia medica (1:1)
PetHistory.hasOne(MedicalRecord, { foreignKey: 'petId', as: 'medicalRecord' });
MedicalRecord.belongsTo(PetHistory, { foreignKey: 'petId', as: 'pet' });

// Una historia medica tiene muchas consultas
MedicalRecord.hasMany(Consultation, { foreignKey: 'medicalRecordId', as: 'consultations' });
Consultation.belongsTo(MedicalRecord, { foreignKey: 'medicalRecordId', as: 'medicalRecord' });

module.exports = {
    Owner,
    Pet,
    OwnerHistory,
    PetHistory,
    MedicalRecord,
    Consultation
};
