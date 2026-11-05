const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Municipality extends Model { }

Municipality.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    cityId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Municipality',
    tableName: 'municipalities',
    timestamps: false,
});

module.exports = Municipality;
