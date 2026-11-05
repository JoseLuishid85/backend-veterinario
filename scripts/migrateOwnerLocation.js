// Crea las tablas de ubicacion (cities, municipalities, parishes) y agrega
// la columna parishId (FK -> parishes.id) a owners_history.
// Necesario porque app.js usa sequelize.sync({ alter: false }), que no agrega
// columnas nuevas a tablas que ya existen.
// Es idempotente: se puede ejecutar varias veces sin problema.
// Uso: node scripts/migrateOwnerLocation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { City, Municipality, Parish } = require('../models/associations');

(async () => {
    try {
        await City.sync();
        await Municipality.sync();
        await Parish.sync();
        console.log('Tablas cities, municipalities y parishes listas.');

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('owners_history');

        if (!columns.parishId) {
            await queryInterface.addColumn('owners_history', 'parishId', {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'parishes', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            });
            console.log('Columna owners_history.parishId agregada.');
        } else {
            console.log('La columna owners_history.parishId ya existe.');
        }

        console.log('Migración completada.');
    } catch (error) {
        console.error('Error en la migración:', error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
})();
