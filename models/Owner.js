const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Owner extends Model { }

Owner.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    idCard: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Owner',
    tableName: 'owners',
    timestamps: true,
});

module.exports = Owner;
