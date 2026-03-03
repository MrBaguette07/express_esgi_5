const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const User = bdd.define('User', {
    firstname: {
        type: DataTypes.STRING(255)
    },
    lastname: {
        type: DataTypes.STRING(255)
    },
    username: {
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
    }
},{
    tableName: "user"
});

module.exports = User;