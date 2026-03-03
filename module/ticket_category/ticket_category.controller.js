const ticketCategoryService = require('./ticket_category.service.js');

exports.getAll = async (req, res) => {
    try {
        const categories = await ticketCategoryService.getAll();
        res.status(200).json(categories);
    } catch (e) {
        res.status(500).json({ error: "Erreur lors de la récupération des catégories" });
    }
};

exports.getById = async (req, res) => {
    try {
        const category = await ticketCategoryService.getById(req.params.id);
        res.status(200).json(category);
    } catch (e) {
        if (e.message === 'Catégorie introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la récupération de la catégorie" });
    }
};

exports.create = async (req, res) => {
    try {
        const category = await ticketCategoryService.create(req.body);
        res.status(201).json(category);
    } catch (e) {
        if (e.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: "Données invalides pour la création de la catégorie" });
        }
        res.status(500).json({ error: "Erreur lors de la création de la catégorie" });
    }
};

exports.update = async (req, res) => {
    try {
        await ticketCategoryService.update(req.params.id, req.body);
        res.status(200).json({ message: "Catégorie mise à jour avec succès" });
    } catch (e) {
        if (e.message === 'Catégorie introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la mise à jour de la catégorie" });
    }
};

exports.delete = async (req, res) => {
    try {
        await ticketCategoryService.delete(req.params.id);
        res.status(200).json({ message: "Catégorie supprimée avec succès" });
    } catch (e) {
        if (e.message === 'Catégorie introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la suppression de la catégorie" });
    }
};
