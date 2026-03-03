const teamService = require('./team.service.js');

exports.getAll = async (req, res) => {
    try {
        const teams = await teamService.getAll();
        res.status(200).json(teams);
    } catch (e) {
        res.status(500).json({ error: "Erreur lors de la récupération des équipes" });
    }
};

exports.getById = async (req, res) => {
    try {
        const team = await teamService.getById(req.params.id);
        res.status(200).json(team);
    } catch (e) {
        if (e.message === 'Équipe introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la récupération de l'équipe" });
    }
};

exports.create = async (req, res) => {
    try {
        const team = await teamService.create(req.body);
        res.status(201).json(team);
    } catch (e) {
        if (e.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: "Données invalides pour la création de l'équipe" });
        }
        res.status(500).json({ error: "Erreur lors de la création de l'équipe" });
    }
};

exports.update = async (req, res) => {
    try {
        await teamService.update(req.params.id, req.body);
        res.status(200).json({ message: "Équipe mise à jour avec succès" });
    } catch (e) {
        if (e.message === 'Équipe introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'équipe" });
    }
};

exports.delete = async (req, res) => {
    try {
        await teamService.delete(req.params.id);
        res.status(200).json({ message: "Équipe supprimée avec succès" });
    } catch (e) {
        if (e.message === 'Équipe introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la suppression de l'équipe" });
    }
};
