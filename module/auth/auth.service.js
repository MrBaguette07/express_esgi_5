const User = require('./../user/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (email, password) => {
    if (!email || !password) {
        throw new Error("L'email et le mot de passe sont requis");
    }
    
    let user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error("Compte introuvable");
    }
    
    let result = bcrypt.compareSync(password, user.password);
    if (!result) {
        throw new Error("Mot de passe incorrect");
    }
    
    let token = jwt.sign(
        { userId: user.id, role: user.role, teamId: user.team_id },
        process.env.JWT_KEY
    );
    
    return { token, full_name: user.full_name };
};

exports.signin = async (userData) => {
    const { email, password, full_name, role, team_id } = userData;
    
    if (!email || !password || !full_name) {
        throw new Error("L'email, le mot de passe et le nom complet sont requis");
    }
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new Error("Cet email est déjà utilisé");
    }
    
    let hash = bcrypt.hashSync(password, 10);
    let user = await User.create({
        email,
        full_name,
        password: hash,
        role: role || 'collaborateur',
        team_id: team_id || null
    });
    
    return user;
};
