const ticketService = require('./ticket.service.js');

exports.getAll = async (req, res) => {
    try {
        const tickets = await ticketService.getAll(req.query, req.token);
        res.status(200).json(tickets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const ticket = await ticketService.getById(req.params.id, req.token);
        res.status(200).json(ticket);
    } catch (e) {
        let status = 500;
        if (e.message === 'Ticket introuvable') status = 404;
        if (e.message === 'Accès refusé') status = 403;
        res.status(status).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const ticket = await ticketService.create(req.body, req.token);
        res.status(201).json(ticket);
    } catch (e) {
        const status = e.message.includes('Un collaborateur ne peut pas') ? 403 : 500;
        res.status(status).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const count = await ticketService.update(req.params.id, req.body, req.token);
        res.status(200).json({ message: `Lignes modifiées : ${count}` });
    } catch (e) {
        let status = 500;
        if (e.message === 'Ticket introuvable') status = 404;
        if (e.message.includes('autorisé') || e.message.includes('Le support ne peut pas') || e.message.includes('Seul un manager') || e.message.includes('Le manager ne peut modifier')) status = 403;
        res.status(status).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await ticketService.delete(req.params.id);
        res.status(200).json({ message: `Lignes supprimées : ${count}` });
    } catch (e) {
        const status = e.message === 'Ticket introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};

exports.assign = async (req, res) => {
    try {
        await ticketService.assign(req.params.id, req.body.assignee_id, req.token);
        res.status(200).json({ message: 'Ticket assigné avec succès' });
    } catch (e) {
        let status = 500;
        if (e.message === 'Ticket introuvable') status = 404;
        if (e.message.includes('Seul le support')) status = 403;
        if (e.message.includes('Un ticket ne peut être assigné')) status = 400;
        res.status(status).json({ error: e.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        await ticketService.updateStatus(req.params.id, req.body.status, req.token);
        res.status(200).json({ message: 'Statut mis à jour' });
    } catch (e) {
        let status = 500;
        if (e.message === 'Ticket introuvable') status = 404;
        if (e.message.includes('non autorisé')) status = 400;
        if (e.message.includes("n'avez pas les droits")) status = 403;
        res.status(status).json({ error: e.message });
    }
};
