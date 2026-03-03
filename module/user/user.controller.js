const userService = require('./user.service.js');

exports.getAll = async (req, res) => {
    try {
        const users = await userService.getAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
};

exports.getById = async (req, res) => {
    try {
        const user = await userService.getById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        if (error.message === "Utilisateur non trouvé") {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
};

exports.create = async (req, res) => {
    try {
        const user = await userService.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        if (error.message.includes("requis") || error.message.includes("invalide")) {
            return res.status(400).json({ error: error.message });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: "Un utilisateur avec cet email existe déjà" });
        }
        res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
    }
};

exports.update = async (req, res) => {
    try {
        const updatedUser = await userService.update(req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        if (error.message === "Utilisateur non trouvé") {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("invalide")) {
            return res.status(400).json({ error: error.message });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: "Un utilisateur avec cet email existe déjà" });
        }
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    }
};

exports.delete = async (req, res) => {
    try {
        await userService.delete(req.params.id);
        res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (error) {
        if (error.message === "Utilisateur non trouvé") {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
};