const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Parish extends Model { }

Parish.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    municipalityId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Parish',
    tableName: 'parishes',
    timestamps: false,
});

module.exports = Parish;
