const bcrypt = require('bcryptjs');
const User = require('./user.model.js');

const LES_ROLES = ['collaborateur', 'support', 'manager'];

exports.getAll = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
};

exports.getById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
};

exports.create = async (req, res) => {
    try {
        const { full_name, email, password, role, team_id } = req.body;

        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ error: "Les champs full_name, email, password et role sont requis" });
        }
        if (!LES_ROLES.includes(role)) {
            return res.status(400).json({ error: "Rôle invalide. Ce rôle n'existe pas."});
        }

        const hash = bcrypt.hashSync(password, 10);
        const user = await User.create({ full_name, email, password: hash, role, team_id });
        res.status(201).json(user);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: "Cet email est déjà utilisé" });
        }
        res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
    }
};

exports.update = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const { full_name, email, role, team_id } = req.body;

        if (role && !LES_ROLES.includes(role)) {
            return res.status(400).json({ error: "Rôle invalide. Valeurs acceptées : " + LES_ROLES.join(', ') });
        }

        await User.update({ full_name, email, role, team_id }, {
            where: { id: req.params.id }
        });

        const updatedUser = await User.findByPk(req.params.id);
        res.status(200).json(updatedUser);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: "Cet email est déjà utilisé" });
        }
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    }
};

exports.delete = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        await user.destroy();
        res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
};