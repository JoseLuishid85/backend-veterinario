const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Detalle: resultado de cada organo/sistema examinado en una consulta.
// Solo se guardan los examinados (N / AN); si un organo no tiene fila se considera NE (No Examinado).
class ConsultationOrgan extends Model { }

ConsultationOrgan.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    consultationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    organId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    result: {
        type: DataTypes.ENUM('N', 'AN', 'NE'), // Normal, Anormal, No Examinado
        allowNull: false,
        defaultValue: 'NE'
    }
}, {
    sequelize,
    modelName: 'ConsultationOrgan',
    tableName: 'consultation_organs',
    timestamps: false,
    indexes: [{ name: 'uq_consultation_organ', unique: true, fields: ['consultationId', 'organId'] }]
});

module.exports = ConsultationOrgan;
