const User = require('./../user/user.model.js');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
    if (!req.body.email && !req.body.username) {
        return res.status(400).json({ error: "Email or username is required" });
    }
    if (!req.body.password) {
        return res.status(400).json({ error: "Password is required" });
    }
    let user = await User.findOne({
        where: {
            [Op.or]: {
                email: req.body.email || "",
                username: req.body.username || ""
            }
        }
    });
    if(!user){
        return res.status(400).json({ error: "Account not found" });
    }
    let result = bcrypt.compareSync(req.body.password,user.password);
    if(!result){
        return res.status(400).json({ error: "Wrong password" });
    }
    let token = jwt.sign({userId: user.id},process.env.JWT_KEY);
    res.status(200).json({token, username: user.username});
}

exports.signin = async (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ error: "Email is required" });
    }
    if (!req.body.password) {
        return res.status(400).json({ error: "Password is required" });
    }
    if (!req.body.username) {
        return res.status(400).json({ error: "Username is required" });
    }
    const result = User.findAll({
        where: {
            [Op.or]: {
                email: req.body.email,
                username: req.body.username
            }
        }
    });
    if (result.length > 0) {
        return res.status(400).json({ error: "Email or username already exists" });
    }
    let hash = bcrypt.hashSync(req.body.password, 10);
    let user = await User.create({
        email: req.body.email,
        username: req.body.username,
        password: hash
    });
    res.status(201).json(user);
}
