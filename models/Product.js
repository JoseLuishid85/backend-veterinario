const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Catalogo de productos base para el Tratamiento Asignado de la consulta
class Product extends Model { }

Product.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
    },
    // Solo se muestran en el select los que tengan status = true
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: false,
});

module.exports = Product;
