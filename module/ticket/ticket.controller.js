const ticketService = require('./ticket.service.js');

const KNOWN_ERRORS_404 = ['Ticket introuvable'];
const KNOWN_ERRORS_403 = [
    'Accès refusé',
    'Un collaborateur ne peut pas',
    'autorisé',
    'Le support ne peut pas',
    'Seul un manager',
    'Le manager ne peut modifier',
    'Seul le support',
    "n'avez pas les droits"
];

function getTicketErrorStatus(e) {
    if (KNOWN_ERRORS_404.includes(e.message)) return { status: 404, message: e.message };
    for (const msg of KNOWN_ERRORS_403) {
        if (e.message.includes(msg)) return { status: 403, message: e.message };
    }
    if (e.message.includes('non autorisé') || e.message.includes("ne peut être assigné")) {
        return { status: 400, message: e.message };
    }
    return null;
}

exports.getAll = async (req, res) => {
    try {
        const tickets = await ticketService.getAll(req.query, req.token);
        res.status(200).json(tickets);
    } catch (e) {
        res.status(500).json({ error: "Erreur lors de la récupération des tickets" });
    }
};

exports.getById = async (req, res) => {
    try {
        const ticket = await ticketService.getById(req.params.id, req.token);
        res.status(200).json(ticket);
    } catch (e) {
        const known = getTicketErrorStatus(e);
        if (known) return res.status(known.status).json({ error: known.message });
        res.status(500).json({ error: "Erreur lors de la récupération du ticket" });
    }
};

exports.create = async (req, res) => {
    try {
        const ticket = await ticketService.create(req.body, req.token);
        res.status(201).json(ticket);
    } catch (e) {
        const known = getTicketErrorStatus(e);
        if (known) return res.status(known.status).json({ error: known.message });
        res.status(500).json({ error: "Erreur lors de la création du ticket" });
    }
};

exports.update = async (req, res) => {
    try {
        await ticketService.update(req.params.id, req.body, req.token);
        res.status(200).json({ message: "Ticket mis à jour avec succès" });
    } catch (e) {
        const known = getTicketErrorStatus(e);
        if (known) return res.status(known.status).json({ error: known.message });
        res.status(500).json({ error: "Erreur lors de la mise à jour du ticket" });
    }
};

exports.delete = async (req, res) => {
    try {
        await ticketService.delete(req.params.id);
        res.status(200).json({ message: "Ticket supprimé avec succès" });
    } catch (e) {
        if (e.message === 'Ticket introuvable') {
            return res.status(404).json({ error: e.message });
        }
        res.status(500).json({ error: "Erreur lors de la suppression du ticket" });
    }
};

exports.assign = async (req, res) => {
    try {
        await ticketService.assign(req.params.id, req.body.assignee_id, req.token);
        res.status(200).json({ message: 'Ticket assigné avec succès' });
    } catch (e) {
        const known = getTicketErrorStatus(e);
        if (known) return res.status(known.status).json({ error: known.message });
        res.status(500).json({ error: "Erreur lors de l'assignation du ticket" });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        await ticketService.updateStatus(req.params.id, req.body.status, req.token);
        res.status(200).json({ message: 'Statut mis à jour avec succès' });
    } catch (e) {
        const known = getTicketErrorStatus(e);
        if (known) return res.status(known.status).json({ error: known.message });
        res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
    }
};
