const ticketPriorityService = require('./ticket_priority.service.js');

exports.getAll = async (req, res) => {
    try {
        const priorities = await ticketPriorityService.getAll();
        res.status(200).json(priorities);
    } catch (e) {
        res.status(500).json({ error: "Erreur lors de la récupération des priorités" });
    }
};

exports.getById = async (req, res) => {
    try {
        const priority = await ticketPriorityService.getById(req.params.id);
        res.status(200).json(priority);
    } catch (e) {
        if (e.message === 'Priorité introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la récupération de la priorité" });
    }
};

exports.create = async (req, res) => {
    try {
        const priority = await ticketPriorityService.create(req.body);
        res.status(201).json(priority);
    } catch (e) {
        if (e.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: "Données invalides pour la création de la priorité" });
        }
        res.status(500).json({ error: "Erreur lors de la création de la priorité" });
    }
};

exports.update = async (req, res) => {
    try {
        await ticketPriorityService.update(req.params.id, req.body);
        res.status(200).json({ message: "Priorité mise à jour avec succès" });
    } catch (e) {
        if (e.message === 'Priorité introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la mise à jour de la priorité" });
    }
};

exports.delete = async (req, res) => {
    try {
        await ticketPriorityService.delete(req.params.id);
        res.status(200).json({ message: "Priorité supprimée avec succès" });
    } catch (e) {
        if (e.message === 'Priorité introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la suppression de la priorité" });
    }
};
