const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class City extends Model { }

City.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'City',
    tableName: 'cities',
    timestamps: false,
});

module.exports = City;
