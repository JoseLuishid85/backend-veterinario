// Datos iniciales de los catalogos de la consulta.
// "key" es la clave que se usaba en las columnas JSON antiguas (systems / complementaryTests),
// se usa solo para migrar las consultas existentes.
const ORGANS = [
    { key: 'generalCondition', name: 'Estado General y Condición Corporal' },
    { key: 'hydrationStatus', name: 'Estado de Hidratación' },
    { key: 'integumentarySystem', name: 'Sistema Tegumentario' },
    { key: 'eyes', name: 'Ojos' },
    { key: 'ears', name: 'Oídos' },
    { key: 'nose', name: 'Nariz' },
    { key: 'digestiveSystem', name: 'Sistema Digestivo' },
    { key: 'respiratorySystem', name: 'Sistema Respiratorio' },
    { key: 'nervousSystem', name: 'Sistema Nervioso' },
    { key: 'musculoskeletalSystem', name: 'Sistema Musculoesquelético' },
    { key: 'cardiovascularSystem', name: 'Sistema Cardiovascular' },
    { key: 'genitourinarySystem', name: 'Sistema Genitourinario' },
];

const COMPLEMENTARY_TESTS = [
    { key: 'bloodChemistry', name: 'Química Sanguínea' },
    { key: 'xray', name: 'Rayos X' },
    { key: 'ultrasound', name: 'Ecografía' },
    { key: 'skinScraping', name: 'Frotis (raspado piel)' },
    { key: 'coprology', name: 'Coprológico' },
    { key: 'urinalysis', name: 'Parcial de Orina' },
    { key: 'cpvScreen', name: 'Descarte de CPV' },
    { key: 'cdvScreen', name: 'Descarte de CDV' },
    { key: 'hepaticProfile', name: 'Perfil Hepático' },
    { key: 'renalProfile', name: 'Perfil Renal' },
    { key: 'biopsy', name: 'Biopsia' },
    { key: 'other', name: 'Otros' },
];

// Inserta los registros que falten (idempotente, busca por nombre).
// Devuelve un mapa key -> id para usarlo en la migracion.
async function seedCatalog(Model, items) {
    const ids = {};
    for (const item of items) {
        const [row] = await Model.findOrCreate({ where: { name: item.name }, defaults: { name: item.name, status: true } });
        ids[item.key] = row.id;
    }
    return ids;
}

async function seedCatalogs({ Organ, ComplementaryTest }) {
    const organIds = await seedCatalog(Organ, ORGANS);
    const testIds = await seedCatalog(ComplementaryTest, COMPLEMENTARY_TESTS);
    return { organIds, testIds };
}

module.exports = { ORGANS, COMPLEMENTARY_TESTS, seedCatalogs };
