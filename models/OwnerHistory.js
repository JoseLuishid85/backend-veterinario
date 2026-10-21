const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class OwnerHistory extends Model { }

OwnerHistory.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    idNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'OwnerHistory',
    tableName: 'owners_history',
    timestamps: true,
});

module.exports = OwnerHistory;
