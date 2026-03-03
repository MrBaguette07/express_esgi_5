const ticketCategoryService = require('./ticket_category.service.js');

exports.getAll = async (req, res) => {
    try {
        const categories = await ticketCategoryService.getAll();
        res.status(200).json(categories);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const category = await ticketCategoryService.getById(req.params.id);
        res.status(200).json(category);
    } catch (e) {
        const status = e.message === 'Catégorie introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const category = await ticketCategoryService.create(req.body);
        res.status(201).json(category);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const count = await ticketCategoryService.update(req.params.id, req.body);
        res.status(200).json({ message: `Lignes modifiées : ${count}` });
    } catch (e) {
        const status = e.message === 'Catégorie introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await ticketCategoryService.delete(req.params.id);
        res.status(200).json({ message: `Lignes supprimées : ${count}` });
    } catch (e) {
        const status = e.message === 'Catégorie introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};
