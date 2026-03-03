const { Op } = require('sequelize');
const Ticket = require('./ticket.model.js');
const User = require('./../user/user.model.js');
const TicketCategory = require('./../ticket_category/ticket_category.model.js');
const TicketPriority = require('./../ticket_priority/ticket_priority.model.js');

const includeRelations = [
    { model: User, as: 'author',   attributes: ['id', 'full_name', 'email'] },
    { model: User, as: 'assignee', attributes: ['id', 'full_name', 'email'] },
    { model: TicketCategory, as: 'category' },
    { model: TicketPriority, as: 'priority' }
];

exports.getAll = async (req, res) => {
    try {
        const where = {};
        if (req.query.status)   where.status      = req.query.status;
        if (req.query.priority) where.priority_id = req.query.priority;
        if (req.query.category) where.category_id = req.query.category;

        const tickets = await Ticket.findAll({ where, include: includeRelations, order: [['created_at', 'DESC']] });
        res.status(200).json(tickets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id, { include: includeRelations });
        if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });
        res.status(200).json(ticket);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const ticket = await Ticket.create({ ...req.body, author_id: req.token.userId });
        res.status(201).json(ticket);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [count] = await Ticket.update(req.body, { where: { id: req.params.id } });
        if (count === 0) return res.status(404).json({ error: 'Ticket introuvable' });
        res.status(200).json({ message: `Lignes modifiées : ${count}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await Ticket.destroy({ where: { id: req.params.id } });
        if (count === 0) return res.status(404).json({ error: 'Ticket introuvable' });
        res.status(200).json({ message: `Lignes supprimées : ${count}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.assign = async (req, res) => {
    try {
        const { assignee_id } = req.body;
        const [count] = await Ticket.update(
            { assignee_id, status: 'assigned' },
            { where: { id: req.params.id } }
        );
        if (count === 0) return res.status(404).json({ error: 'Ticket introuvable' });
        res.status(200).json({ message: 'Ticket assigné avec succès' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'cancelled'];
        if (!allowed.includes(status)) return res.status(400).json({ error: 'Statut invalide' });

        const [count] = await Ticket.update({ status }, { where: { id: req.params.id } });
        if (count === 0) return res.status(404).json({ error: 'Ticket introuvable' });
        res.status(200).json({ message: 'Statut mis à jour' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
