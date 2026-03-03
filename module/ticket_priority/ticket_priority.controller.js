const ticketPriorityService = require('./ticket_priority.service.js');

exports.getAll = async (req, res) => {
    try {
        const priorities = await ticketPriorityService.getAll();
        res.status(200).json(priorities);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const priority = await ticketPriorityService.getById(req.params.id);
        res.status(200).json(priority);
    } catch (e) {
        const status = e.message === 'Priorité introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const priority = await ticketPriorityService.create(req.body);
        res.status(201).json(priority);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const count = await ticketPriorityService.update(req.params.id, req.body);
        res.status(200).json({ message: `Lignes modifiées : ${count}` });
    } catch (e) {
        const status = e.message === 'Priorité introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await ticketPriorityService.delete(req.params.id);
        res.status(200).json({ message: `Lignes supprimées : ${count}` });
    } catch (e) {
        const status = e.message === 'Priorité introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};
