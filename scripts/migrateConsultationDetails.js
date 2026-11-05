// Pasa "systems" y "complementaryTests" (columnas JSON de consultations) a tablas propias:
//   organs + consultation_organs
//   complementary_tests + consultation_complementary_tests
// 1. Crea las tablas nuevas
// 2. Llena los catalogos (organos y pruebas)
// 3. Copia los datos de las consultas existentes a las tablas de detalle
// 4. Con --drop elimina las columnas JSON viejas de consultations
// Es idempotente: se puede ejecutar varias veces sin duplicar datos.
// Uso: node scripts/migrateConsultationDetails.js          (migra y deja las columnas viejas)
//      node scripts/migrateConsultationDetails.js --drop   (migra y borra las columnas viejas)
const sequelize = require('../config/database');
const {
    Organ,
    ConsultationOrgan,
    ComplementaryTest,
    ConsultationComplementaryTest
} = require('../models/associations');
const { seedCatalogs } = require('../seeders/catalogs');

const parse = (value) => {
    if (!value) return null;
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return null; }
};

(async () => {
    const drop = process.argv.includes('--drop');
    try {
        await Organ.sync();
        await ComplementaryTest.sync();
        await ConsultationOrgan.sync();
        await ConsultationComplementaryTest.sync();
        console.log('Tablas nuevas listas.');

        const { organIds, testIds } = await seedCatalogs({ Organ, ComplementaryTest });
        console.log(`Catalogos: ${Object.keys(organIds).length} organos, ${Object.keys(testIds).length} pruebas.`);

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('consultations');
        const hasSystems = !!columns.systems;
        const hasTests = !!columns.complementaryTests;

        if (!hasSystems && !hasTests) {
            console.log('Las columnas JSON viejas ya no existen, no hay datos que migrar.');
            return;
        }

        const selectCols = ['id', hasSystems && 'systems', hasTests && 'complementaryTests'].filter(Boolean).join(', ');
        const [rows] = await sequelize.query(`SELECT ${selectCols} FROM consultations`);

        let organRows = 0;
        let testRows = 0;

        await sequelize.transaction(async (transaction) => {
            for (const row of rows) {
                const systems = parse(row.systems) || {};
                for (const [key, result] of Object.entries(systems)) {
                    // NE no se guarda: la ausencia de fila significa "No Examinado"
                    if (!organIds[key] || !['N', 'AN'].includes(result)) continue;
                    await ConsultationOrgan.findOrCreate({
                        where: { consultationId: row.id, organId: organIds[key] },
                        defaults: { result },
                        transaction
                    });
                    organRows++;
                }

                const tests = parse(row.complementaryTests) || {};
                for (const [key, value] of Object.entries(tests)) {
                    if (!testIds[key] || !value?.checked) continue;
                    await ConsultationComplementaryTest.findOrCreate({
                        where: { consultationId: row.id, complementaryTestId: testIds[key] },
                        defaults: { detail: value.detail || null },
                        transaction
                    });
                    testRows++;
                }
            }
        });

        console.log(`Migradas ${rows.length} consultas: ${organRows} resultados de organos, ${testRows} pruebas.`);

        if (drop) {
            if (hasSystems) await queryInterface.removeColumn('consultations', 'systems');
            if (hasTests) await queryInterface.removeColumn('consultations', 'complementaryTests');
            console.log('Columnas systems y complementaryTests eliminadas de consultations.');
        } else {
            console.log('Las columnas viejas se mantienen. Ejecuta con --drop cuando verifiques los datos.');
        }

        console.log('Migración completada.');
    } catch (error) {
        console.error('Error en la migración:', error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
})();
