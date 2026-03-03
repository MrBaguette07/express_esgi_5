const userService = require('./user.service.js');

exports.getAll = async (req, res) => {
    try {
        const users = await userService.getAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const user = await userService.getById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        const status = error.message === "Utilisateur non trouvé" ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const user = await userService.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        let status = 500;
        if (error.message.includes("requis") || error.message.includes("invalide")) status = 400;
        if (error.name === 'SequelizeUniqueConstraintError') status = 409;
        res.status(status).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updatedUser = await userService.update(req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        let status = 500;
        if (error.message === "Utilisateur non trouvé") status = 404;
        if (error.message.includes("invalide")) status = 400;
        if (error.name === 'SequelizeUniqueConstraintError') status = 409;
        res.status(status).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await userService.delete(req.params.id);
        res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (error) {
        const status = error.message === "Utilisateur non trouvé" ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};