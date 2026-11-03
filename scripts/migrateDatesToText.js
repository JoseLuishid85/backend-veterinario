// Convierte a texto (VARCHAR(100)) los campos de fecha que el cliente quiere escribir libremente:
//   consultations: date, symptomsDate
//   medical_records: dewormingDate, lastHeatDate, lastDeliveryDate
// Los valores existentes ("YYYY-MM-DD") se reescriben como "DD/MM/YYYY".
// Nota: MySQL/MariaDB no permite revertir un ALTER TABLE dentro de una transaccion.
// Es idempotente: se puede ejecutar varias veces sin problema.
// Uso: node scripts/migrateDatesToText.js
const sequelize = require('../config/database');

const COLUMNS = [
    { table: 'consultations', column: 'date', nullable: false },
    { table: 'consultations', column: 'symptomsDate', nullable: true },
    { table: 'medical_records', column: 'dewormingDate', nullable: true },
    { table: 'medical_records', column: 'lastHeatDate', nullable: true },
    { table: 'medical_records', column: 'lastDeliveryDate', nullable: true },
];

(async () => {
    try {
        for (const { table, column, nullable } of COLUMNS) {
            await sequelize.query(
                `ALTER TABLE \`${table}\` MODIFY \`${column}\` VARCHAR(100) ${nullable ? 'NULL' : 'NOT NULL'}`
            );
            const [result] = await sequelize.query(
                `UPDATE \`${table}\`
                    SET \`${column}\` = DATE_FORMAT(STR_TO_DATE(\`${column}\`, '%Y-%m-%d'), '%d/%m/%Y')
                  WHERE \`${column}\` REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'`
            );
            console.log(`${table}.${column} -> VARCHAR(100) (${result.affectedRows ?? 0} filas reformateadas)`);
        }
        console.log('Migración completada.');
    } catch (error) {
        console.error('Error en la migración:', error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
})();
