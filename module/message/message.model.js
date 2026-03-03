const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const Message = bdd.define('Message', {
    content: {
        type: DataTypes.TEXT
    }
},{
    tableName: "message"
});

module.exports = Message;