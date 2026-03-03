const User = require('./../user/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ error: "Email is required" });
    }
    if (!req.body.password) {
        return res.status(400).json({ error: "Password is required" });
    }
    let user = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if(!user){
        return res.status(400).json({ error: "Account not found" });
    }
    let result = bcrypt.compareSync(req.body.password,user.password);
    if(!result){
        return res.status(400).json({ error: "Wrong password" });
    }
    let token = jwt.sign({userId: user.id, role: user.role, teamId: user.team_id},process.env.JWT_KEY);
    res.status(200).json({token, full_name: user.full_name});
}

exports.signin = async (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ error: "Email is required" });
    }
    if (!req.body.password) {
        return res.status(400).json({ error: "Password is required" });
    }
    if (!req.body.full_name) {
        return res.status(400).json({ error: "Full name is required" });
    }
    const result = await User.findAll({
        where: {
            email: req.body.email
        }
    });
    if (result.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
    }
    let hash = bcrypt.hashSync(req.body.password, 10);
    let user = await User.create({
        email: req.body.email,
        full_name: req.body.full_name,
        password: hash,
        role: req.body.role || 'collaborateur',
        team_id: req.body.team_id || null
    });
    res.status(201).json(user);
}
