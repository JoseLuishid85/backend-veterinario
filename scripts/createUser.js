// Crea un usuario desde consola (útil para el primer acceso, ya que POST /user requiere token).
// Uso: node scripts/createUser.js <email> <password> <nombre> <apellido> [rol]
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const User = require('../models/User');

const [email, password, name, lastName, rol = 'admin'] = process.argv.slice(2);

(async () => {
    if (!email || !password || !name || !lastName) {
        console.log('Uso: node scripts/createUser.js <email> <password> <nombre> <apellido> [rol]');
        process.exit(1);
    }

    try {
        await User.sync();

        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            console.log('El correo electrónico ya está en uso');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, name, lastName, rol });
        console.log(`Usuario creado con éxito (id ${user.id})`);
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
})();
