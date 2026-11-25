const Owner = require('./Owner');
const Pet = require('./Pet');
const OwnerHistory = require('./OwnerHistory');
const PetHistory = require('./PetHistory');
const MedicalRecord = require('./MedicalRecord');
const Consultation = require('./Consultation');
const City = require('./City');
const Municipality = require('./Municipality');
const Parish = require('./Parish');
const Organ = require('./Organ');
const ConsultationOrgan = require('./ConsultationOrgan');
const ComplementaryTest = require('./ComplementaryTest');
const ConsultationComplementaryTest = require('./ConsultationComplementaryTest');
const Product = require('./Product');
const ConsultationTreatment = require('./ConsultationTreatment');
const ConsultationTestFile = require('./ConsultationTestFile');

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

// --- Ubicacion: Ciudad -> Municipio -> Parroquia -> Propietario (historia) ---

// Una ciudad tiene muchos municipios
City.hasMany(Municipality, { foreignKey: 'cityId', as: 'municipalities' });
Municipality.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

// Un municipio tiene muchas parroquias
Municipality.hasMany(Parish, { foreignKey: 'municipalityId', as: 'parishes' });
Parish.belongsTo(Municipality, { foreignKey: 'municipalityId', as: 'municipality' });

// Una parroquia tiene muchos propietarios (historia)
Parish.hasMany(OwnerHistory, { foreignKey: 'parishId', as: 'owners' });
OwnerHistory.belongsTo(Parish, { foreignKey: 'parishId', as: 'parish' });

// --- Detalle de consulta: Organos y Sistemas / Pruebas Complementarias ---

// Una consulta tiene muchos resultados de organos
Consultation.hasMany(ConsultationOrgan, { foreignKey: 'consultationId', as: 'organs', onDelete: 'CASCADE' });
ConsultationOrgan.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

// Un organo (catalogo) aparece en muchos detalles
Organ.hasMany(ConsultationOrgan, { foreignKey: 'organId', as: 'consultationOrgans' });
ConsultationOrgan.belongsTo(Organ, { foreignKey: 'organId', as: 'organ' });

// Una consulta tiene muchas pruebas complementarias
Consultation.hasMany(ConsultationComplementaryTest, { foreignKey: 'consultationId', as: 'complementaryTests', onDelete: 'CASCADE' });
ConsultationComplementaryTest.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

// Una prueba (catalogo) aparece en muchos detalles
ComplementaryTest.hasMany(ConsultationComplementaryTest, { foreignKey: 'complementaryTestId', as: 'consultationTests' });
ConsultationComplementaryTest.belongsTo(ComplementaryTest, { foreignKey: 'complementaryTestId', as: 'test' });

// Una consulta tiene muchos archivos adjuntos a sus pruebas complementarias
Consultation.hasMany(ConsultationTestFile, { foreignKey: 'consultationId', as: 'testFiles' });
ConsultationTestFile.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

// --- Tratamiento Asignado ---

// Una consulta tiene muchas filas de tratamiento
Consultation.hasMany(ConsultationTreatment, { foreignKey: 'consultationId', as: 'treatments', onDelete: 'CASCADE' });
ConsultationTreatment.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

// Un producto (catalogo) aparece en muchos tratamientos
Product.hasMany(ConsultationTreatment, { foreignKey: 'productId', as: 'treatments' });
ConsultationTreatment.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
    Owner,
    Pet,
    OwnerHistory,
    PetHistory,
    MedicalRecord,
    Consultation,
    City,
    Municipality,
    Parish,
    Organ,
    ConsultationOrgan,
    ComplementaryTest,
    ConsultationComplementaryTest,
    Product,
    ConsultationTreatment,
    ConsultationTestFile
};
