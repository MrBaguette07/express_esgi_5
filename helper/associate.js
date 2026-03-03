const User = require('./../module/user/user.model.js');
const Message = require('./../module/message/message.model.js');
const Conversation = require('./../module/conversation/conversation.model.js')

const associate = async () => {
    User.hasMany(Message, {foreignKey: "userId"});
    Message.belongsTo(User, {foreignKey: "userId"});

    Conversation.hasMany(Message,{foreignKey: "conversationId"});

    User.belongsToMany(Conversation,{through: "user_has_conversation", as:"conversations"});
    Conversation.belongsToMany(User,{through: "user_has_conversation", as: "users"});
    Conversation.belongsToMany(User,{through: "user_has_conversation", as: "filter"});

    User.belongsToMany(User, {through: "user_has_contact",as:"contact"});
}

module.exports = associate;