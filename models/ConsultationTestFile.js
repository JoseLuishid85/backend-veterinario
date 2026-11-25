const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Archivos (PDF o imagen) adjuntos a una prueba complementaria de una consulta.
// Se relacionan por (consultationId, complementaryTestId) y no por el id de la fila de
// consultation_complementary_tests, porque esas filas se recrean cada vez que se edita la consulta.
class ConsultationTestFile extends Model { }

ConsultationTestFile.init({
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
    filePath: {
        type: DataTypes.STRING(255), // "/uploads/tests/<uuid>.pdf"
        allowNull: false
    },
    originalName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mimeType: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    size: {
        type: DataTypes.INTEGER, // bytes
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'ConsultationTestFile',
    tableName: 'consultation_test_files',
    timestamps: true,
    updatedAt: false,
    indexes: [{ name: 'idx_test_files_consultation', fields: ['consultationId', 'complementaryTestId'] }]
});

module.exports = ConsultationTestFile;
