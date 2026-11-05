const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Detalle: pruebas complementarias marcadas en una consulta (solo se guardan las seleccionadas)
class ConsultationComplementaryTest extends Model { }

ConsultationComplementaryTest.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    consultationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    complementaryTestId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    detail: {
        type: DataTypes.STRING(255), // Resultado / detalle
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'ConsultationComplementaryTest',
    tableName: 'consultation_complementary_tests',
    timestamps: false,
    indexes: [{ name: 'uq_consultation_test', unique: true, fields: ['consultationId', 'complementaryTestId'] }]
});

module.exports = ConsultationComplementaryTest;
