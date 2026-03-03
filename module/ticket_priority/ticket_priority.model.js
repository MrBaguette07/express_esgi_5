const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const TicketPriority = bdd.define('TicketPriority', {
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
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'ticket_priorities',
    timestamps: false
});

module.exports = TicketPriority;
