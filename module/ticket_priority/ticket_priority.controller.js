const TicketPriority = require('./ticket_priority.model.js');

exports.getAll = async (req, res) => {
    try {
        const priorities = await TicketPriority.findAll({ order: [['level', 'ASC']] });
        res.status(200).json(priorities);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const priority = await TicketPriority.findByPk(req.params.id);
        if (!priority) return res.status(404).json({ error: 'Priorité introuvable' });
        res.status(200).json(priority);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const priority = await TicketPriority.create(req.body);
        res.status(201).json(priority);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [count] = await TicketPriority.update(req.body, { where: { id: req.params.id } });
        if (count === 0) return res.status(404).json({ error: 'Priorité introuvable' });
        res.status(200).json({ message: `Lignes modifiées : ${count}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await TicketPriority.destroy({ where: { id: req.params.id } });
        if (count === 0) return res.status(404).json({ error: 'Priorité introuvable' });
        res.status(200).json({ message: `Lignes supprimées : ${count}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
