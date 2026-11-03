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
    // Fechas como texto libre a pedido del cliente
    dewormingDate: {
        type: DataTypes.STRING(100),
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
        type: DataTypes.STRING(100), // Ultimo Celo
        allowNull: true
    },
    lastDeliveryDate: {
        type: DataTypes.STRING(100), // Fecha ultimo Parto
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
