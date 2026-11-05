const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Catalogo de Organos y Sistemas del examen clinico (Estado general, Hidratacion, Ojos, ...)
class Organ extends Model { }

Organ.init({
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
    // Solo se muestran en el formulario los que tengan status = true
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Organ',
    tableName: 'organs',
    timestamps: false,
});

module.exports = Organ;
