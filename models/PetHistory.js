const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class PetHistory extends Model { }

PetHistory.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    breed: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    petType: {
        type: DataTypes.STRING(50), // Felino, Canino, Ave, etc.
        allowNull: false
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    photo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING(10), // Macho, Hembra
        allowNull: true
    },
    weight: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'PetHistory',
    tableName: 'pets_history',
    timestamps: true,
});

module.exports = PetHistory;
