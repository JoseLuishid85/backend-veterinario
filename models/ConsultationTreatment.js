const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Detalle: cada fila del Tratamiento Asignado de una consulta
class ConsultationTreatment extends Model { }

ConsultationTreatment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    consultationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER, // Producto Base
        allowNull: false
    },
    baseDose: {
        type: DataTypes.STRING(150), // Dosis Basica
        allowNull: true
    },
    presentation: {
        type: DataTypes.STRING(150), // Presentacion
        allowNull: true
    },
    route: {
        type: DataTypes.STRING(100), // Via
        allowNull: true
    },
    frequencyDuration: {
        type: DataTypes.STRING(255), // Frecuencia y Duracion
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'ConsultationTreatment',
    tableName: 'consultation_treatments',
    timestamps: false,
});

module.exports = ConsultationTreatment;
