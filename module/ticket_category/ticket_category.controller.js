const TicketCategory = require('./ticket_category.model.js');

exports.getAll = async (req, res) => {
    try {
        const categories = await TicketCategory.findAll();
        res.status(200).json(categories);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const category = await TicketCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Catégorie introuvable' });
        res.status(200).json(category);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const category = await TicketCategory.create(req.body);
        res.status(201).json(category);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [count] = await TicketCategory.update(req.body, { where: { id: req.params.id } });
        if (count === 0) return res.status(404).json({ error: 'Catégorie introuvable' });
        res.status(200).json({ message: `Lignes modifiées : ${count}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await TicketCategory.destroy({ where: { id: req.params.id } });
        if (count === 0) return res.status(404).json({ error: 'Catégorie introuvable' });
        res.status(200).json({ message: `Lignes supprimées : ${count}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
