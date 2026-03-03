const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const Comment = bdd.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ticket_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_internal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Comment;
