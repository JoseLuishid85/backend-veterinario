const Owner = require('./Owner');
const Pet = require('./Pet');

// --- Relaciones de Uno a Muchos (1:N) ---

// Un propietario tiene muchas mascotas
Owner.hasMany(Pet, { foreignKey: 'ownerId', as: 'pets' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId', as: 'owner' });

module.exports = {
    Owner,
    Pet
};
