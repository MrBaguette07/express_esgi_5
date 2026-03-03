const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const Ticket = bdd.define('Ticket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    priority_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('open', 'assigned', 'in_progress', 'resolved', 'closed', 'cancelled'),
        allowNull: false,
        defaultValue: 'open'
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assignee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Ticket;
