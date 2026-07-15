const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Pet extends Model { }

Pet.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    photo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    species: {
        type: DataTypes.STRING(50), // Canino, Felino, Ave, etc.
        allowNull: false
    },
    breed: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING(20), // Macho, Hembra
        allowNull: true
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    weight: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    code: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
    },
    qrCode: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Pet',
    tableName: 'pets',
    timestamps: true,
});

module.exports = Pet;
