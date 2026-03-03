const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const User = bdd.define('User', {
    fullname: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(511),
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(256),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},{
    tableName: "user"
});

module.exports = User;