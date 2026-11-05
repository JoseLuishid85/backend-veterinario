const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Catalogo de Pruebas Diagnosticas Complementarias (Quimica Sanguinea, Rayos X, ...)
class ComplementaryTest extends Model { }

ComplementaryTest.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
    },
    // Solo se muestran en el formulario las que tengan status = true
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'ComplementaryTest',
    tableName: 'complementary_tests',
    timestamps: false,
});

module.exports = ComplementaryTest;
