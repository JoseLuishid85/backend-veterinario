// Agrega a consultations las columnas de la consulta reagendada (control de seguimiento):
//   followUpDate (DATE)          -> fecha del proximo control
//   followUpNote (VARCHAR(255))  -> motivo del control
// Es idempotente: si las columnas ya existen, no hace nada.
// Uso: node scripts/migrateConsultationFollowUp.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const COLUMNS = {
    followUpDate: { type: DataTypes.DATEONLY, allowNull: true },
    followUpNote: { type: DataTypes.STRING(255), allowNull: true },
};

(async () => {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const existing = await queryInterface.describeTable('consultations');

        for (const [column, definition] of Object.entries(COLUMNS)) {
            if (existing[column]) {
                console.log(`consultations.${column} ya existe`);
                continue;
            }
            await queryInterface.addColumn('consultations', column, definition);
            console.log(`consultations.${column} agregada`);
        }

        // Indice para listar rapido los proximos controles
        const indexes = await queryInterface.showIndex('consultations');
        if (!indexes.some((i) => i.name === 'consultations_follow_up_date')) {
            await queryInterface.addIndex('consultations', ['followUpDate'], { name: 'consultations_follow_up_date' });
            console.log('Indice consultations_follow_up_date creado');
        }
    } catch (error) {
        console.error('Error en la migracion:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
})();
