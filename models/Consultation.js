const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Checklist de Organos y Sistemas: cada valor es 'N' (Normal), 'AN' (Anormal) o 'NE' (No Examinado)
const DEFAULT_SYSTEMS = {
    generalCondition: 'NE',
    hydrationStatus: 'NE',
    integumentarySystem: 'NE',
    eyes: 'NE',
    ears: 'NE',
    nose: 'NE',
    digestiveSystem: 'NE',
    respiratorySystem: 'NE',
    nervousSystem: 'NE',
    musculoskeletalSystem: 'NE',
    cardiovascularSystem: 'NE',
    genitourinarySystem: 'NE',
};

// Pruebas Diagnosticas Complementarias: cada valor es { checked, detail }
const DEFAULT_COMPLEMENTARY_TESTS = {
    bloodChemistry: { checked: false, detail: '' },
    xray: { checked: false, detail: '' },
    ultrasound: { checked: false, detail: '' },
    skinScraping: { checked: false, detail: '' },
    coprology: { checked: false, detail: '' },
    urinalysis: { checked: false, detail: '' },
    cpvScreen: { checked: false, detail: '' },
    cdvScreen: { checked: false, detail: '' },
    hepaticProfile: { checked: false, detail: '' },
    renalProfile: { checked: false, detail: '' },
    biopsy: { checked: false, detail: '' },
    other: { checked: false, detail: '' },
};

// MariaDB stores DataTypes.JSON as LONGTEXT (no native JSON type flag), so mysql2/Sequelize
// hand back the raw string instead of auto-parsing it. These getters normalize it either way.
function parseJsonField(rawValue) {
    return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
}

class Consultation extends Model { }

Consultation.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    medicalRecordId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    symptomsDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    consultationReason: {
        type: DataTypes.TEXT, // Motivo de Consulta
        allowNull: true
    },
    temperature: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    weight: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
    },
    lymphNodes: {
        type: DataTypes.STRING(150), // Ganglios Linfaticos
        allowNull: true
    },
    mucosa: {
        type: DataTypes.STRING(150), // Mucosas
        allowNull: true
    },
    demeanor: {
        type: DataTypes.ENUM('Letárgico', 'Estuporoso', 'Comatoso', 'Alerta'), // Actitud y Temperamento
        allowNull: true
    },
    demeanorOther: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    systems: {
        type: DataTypes.JSON, // Organos y Sistemas (checklist N/AN/NE)
        allowNull: true,
        defaultValue: DEFAULT_SYSTEMS,
        get() { return parseJsonField(this.getDataValue('systems')); }
    },
    findings: {
        type: DataTypes.TEXT, // Descripcion Hallazgos
        allowNull: true
    },
    diagnosis: {
        type: DataTypes.TEXT, // Diagnostico final presuntivo o confirmativo
        allowNull: true
    },
    treatment: {
        type: DataTypes.JSON, // Tratamiento Asignado: [{ baseProduct, baseDose, presentation, route, frequencyDuration }]
        allowNull: true,
        defaultValue: [],
        get() { return parseJsonField(this.getDataValue('treatment')); }
    },
    complementaryTests: {
        type: DataTypes.JSON, // Pruebas Diagnosticas Complementarias
        allowNull: true,
        defaultValue: DEFAULT_COMPLEMENTARY_TESTS,
        get() { return parseJsonField(this.getDataValue('complementaryTests')); }
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Consultation',
    tableName: 'consultations',
    timestamps: true,
});

module.exports = Consultation;
