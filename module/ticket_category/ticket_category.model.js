const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const TicketCategory = bdd.define('TicketCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    label: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'ticket_categories',
    timestamps: false
});

module.exports = TicketCategory;
