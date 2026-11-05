// Pasa la columna JSON consultations.treatment a tablas propias:
//   products (catalogo de productos base) + consultation_treatments (detalle)
// 1. Crea las tablas nuevas
// 2. Por cada fila de tratamiento guardada, busca o crea el producto por nombre (baseProduct)
//    y crea la fila en consultation_treatments
// 3. Con --drop elimina la columna treatment de consultations
// Es idempotente: si una consulta ya tiene tratamiento en la tabla nueva, no se vuelve a migrar.
// Uso: node scripts/migrateConsultationTreatment.js          (migra y deja la columna vieja)
//      node scripts/migrateConsultationTreatment.js --drop   (migra y borra la columna vieja)
const sequelize = require('../config/database');
const { Product, ConsultationTreatment } = require('../models/associations');

const parse = (value) => {
    if (!value) return null;
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return null; }
};

const clean = (v) => (typeof v === 'string' ? v.trim() : v) || null;

(async () => {
    const drop = process.argv.includes('--drop');
    try {
        await Product.sync();
        await ConsultationTreatment.sync();
        console.log('Tablas products y consultation_treatments listas.');

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('consultations');

        if (!columns.treatment) {
            console.log('La columna consultations.treatment ya no existe, no hay datos que migrar.');
            return;
        }

        const [rows] = await sequelize.query('SELECT id, treatment FROM consultations');
        let migratedRows = 0;
        let skipped = 0;

        await sequelize.transaction(async (transaction) => {
            for (const row of rows) {
                const treatment = parse(row.treatment);
                if (!Array.isArray(treatment) || treatment.length === 0) continue;

                const already = await ConsultationTreatment.count({ where: { consultationId: row.id }, transaction });
                if (already) { skipped++; continue; }

                for (const item of treatment) {
                    const name = clean(item?.baseProduct);
                    if (!name) continue;
                    const [product] = await Product.findOrCreate({
                        where: { name },
                        defaults: { name, status: true },
                        transaction
                    });
                    await ConsultationTreatment.create({
                        consultationId: row.id,
                        productId: product.id,
                        baseDose: clean(item.baseDose),
                        presentation: clean(item.presentation),
                        route: clean(item.route),
                        frequencyDuration: clean(item.frequencyDuration)
                    }, { transaction });
                    migratedRows++;
                }
            }
        });

        const products = await Product.count();
        console.log(`Revisadas ${rows.length} consultas: ${migratedRows} filas de tratamiento migradas (${skipped} consultas ya migradas). Productos en catalogo: ${products}.`);

        if (drop) {
            await queryInterface.removeColumn('consultations', 'treatment');
            console.log('Columna treatment eliminada de consultations.');
        } else {
            console.log('La columna vieja se mantiene. Ejecuta con --drop cuando verifiques los datos.');
        }

        console.log('Migración completada.');
    } catch (error) {
        console.error('Error en la migración:', error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
})();
