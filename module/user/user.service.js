const bcrypt = require('bcryptjs');
const User = require('./user.model.js');

const LES_ROLES = ['collaborateur', 'support', 'manager'];

exports.getAll = async () => {
    return await User.findAll();
};

exports.getById = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error("Utilisateur non trouvé");
    }
    return user;
};

exports.create = async (userData) => {
    const { full_name, email, password, role, team_id } = userData;

    if (!full_name || !email || !password || !role) {
        throw new Error("Les champs full_name, email, password et role sont requis");
    }
    if (!LES_ROLES.includes(role)) {
        throw new Error("Rôle invalide. Ce rôle n'existe pas.");
    }

    const hash = bcrypt.hashSync(password, 10);
    return await User.create({ full_name, email, password: hash, role, team_id });
};

exports.update = async (id, userData) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error("Utilisateur non trouvé");
    }

    const { full_name, email, role, team_id } = userData;

    if (role && !LES_ROLES.includes(role)) {
        throw new Error("Rôle invalide. Valeurs acceptées : " + LES_ROLES.join(', '));
    }

    await User.update({ full_name, email, role, team_id }, {
        where: { id }
    });

    return await User.findByPk(id);
};

exports.delete = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error("Utilisateur non trouvé");
    }
    await user.destroy();
    return true;
};
