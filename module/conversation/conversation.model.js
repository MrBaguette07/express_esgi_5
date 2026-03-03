const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const Conversation = bdd.define('Conversation', {

},{
    tableName: "conversation"
});

module.exports = Conversation;
