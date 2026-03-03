const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const Team = bdd.define('Team', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'teams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Team;
