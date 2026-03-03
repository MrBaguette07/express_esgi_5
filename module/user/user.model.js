const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const User = bdd.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    full_name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('collaborateur', 'support', 'manager'),
        allowNull: false
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = User;