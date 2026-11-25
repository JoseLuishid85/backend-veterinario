const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

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
    // Las fechas se guardan como texto libre a pedido del cliente (ej. "03/11/2026", "hace 3 dias")
    date: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    symptomsDate: {
        type: DataTypes.STRING(100),
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
    // Organos y Sistemas -> tabla consultation_organs (ver ConsultationOrgan)
    findings: {
        type: DataTypes.TEXT, // Descripcion Hallazgos
        allowNull: true
    },
    diagnosis: {
        type: DataTypes.TEXT, // Diagnostico final presuntivo o confirmativo
        allowNull: true
    },
    // Consulta reagendada (control de seguimiento). Fecha real (no texto libre) para poder
    // listar en el dashboard los proximos controles y recordarle al propietario.
    followUpDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    followUpNote: {
        type: DataTypes.STRING(255), // Motivo del control
        allowNull: true
    },
    // Tratamiento Asignado -> tabla consultation_treatments (ver ConsultationTreatment)
    // Pruebas Diagnosticas Complementarias -> tabla consultation_complementary_tests
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
