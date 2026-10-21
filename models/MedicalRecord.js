const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class MedicalRecord extends Model { }

MedicalRecord.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    petId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    dewormingDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    dewormingProduct: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    vaccines: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    previousDiseases: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    diet: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reproductiveStatus: {
        type: DataTypes.ENUM('Entero', 'Esterilizado'), // Estado reproductivo
        allowNull: true
    },
    lastHeatDate: {
        type: DataTypes.DATEONLY, // Ultimo Celo
        allowNull: true
    },
    lastDeliveryDate: {
        type: DataTypes.DATEONLY, // Fecha ultimo Parto
        allowNull: true
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'MedicalRecord',
    tableName: 'medical_records',
    timestamps: true,
});

module.exports = MedicalRecord;
