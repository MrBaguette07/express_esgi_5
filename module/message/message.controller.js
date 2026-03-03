const Conversation = require('../conversation/conversation.model.js');
const Message = require('./message.model.js');
const User = require('./../user/user.model.js');
const {getIO} = require("./../../helper/socketManager.js");

exports.getAll = async (req, res) => {
    let messageList = await Message.findAll();
    res.status(200).json(messageList);
}

exports.getById = async (req, res) => {
    let message = await Message.findOne({
        where: {
            id: req.params.id
        }
    });
    res.status(200).json(message);
}

exports.create = async (req, res) => {
    if(!req.body.message){
        res.status(400).json({error: "Message is required"});
    }
    if(!req.body.conversationId){
        res.status(400).json({error: "Conversation is required"});
    }
    let conversation = await Conversation.findOne({
         where: {
            id: req.body.conversationId
        }, include: [{
            model: User,
            through: {attributes : []},
            attributes: [],
            required: true,
            where: {
                id: req.token.userId
            },
            as: "filter"
        }]
    });
    if(!conversation){
        res.status(401).json({error: "You are not in this conversation"});
    }
    let message = await Message.create({
        content: req.body.message,
        conversationId: req.body.conversationId,
        userId: req.token.userId
    });

    const io = getIO();
    io.to("conversation-"+conversation.id).emit("message",message);

    res.status(201).json(message);
}

exports.update = async (req, res) => {
    let result = await Message.update({
        ...req.body
    },{
        where: {
            id: req.params.id
        }
    });
    res.status(201).json({message: "Lignes modifiées : " + result[0]});
}

exports.delete = async (req, res) => {
    let result = await Message.destroy({
        where: {
            id: req.params.id
        }
    });
    res.status(200).json({message: "Lignes supprimées : " + result})
}