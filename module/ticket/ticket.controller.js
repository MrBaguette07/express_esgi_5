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

        const userRole = req.token.role;
        const userId = req.token.userId;
        const teamId = req.token.teamId;

        if (userRole === 'collaborateur') {
            where.author_id = userId;
        } else if (userRole === 'manager') {
            const User = require('./../user/user.model.js');
            const teamUsers = await User.findAll({ where: { team_id: teamId }, attributes: ['id'] });
            const userIds = teamUsers.map(u => u.id);
            where.author_id = { [Op.in]: userIds };
        }

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

        const userRole = req.token.role;
        const userId = req.token.userId;
        const teamId = req.token.teamId;

        if (userRole === 'collaborateur' && ticket.author_id !== userId) {
            return res.status(403).json({ error: 'Accès refusé' });
        } else if (userRole === 'manager') {
            const author = await User.findByPk(ticket.author_id);
            if (!author || author.team_id !== teamId) {
                return res.status(403).json({ error: 'Accès refusé' });
            }
        }

        res.status(200).json(ticket);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const userRole = req.token.role;
        
        if (userRole === 'collaborateur') {
            const criticalPriority = await TicketPriority.findOne({ where: { code: 'critical' } });
            if (criticalPriority && parseInt(req.body.priority_id) === criticalPriority.id) {
                return res.status(403).json({ error: 'Un collaborateur ne peut pas créer un ticket en critical' });
            }
        }

        const ticket = await Ticket.create({ ...req.body, author_id: req.token.userId });
        res.status(201).json(ticket);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });

        const userRole = req.token.role;

        // Règle 3: Priorité
        if (req.body.priority_id && req.body.priority_id !== ticket.priority_id) {
            if (userRole === 'support') {
                return res.status(403).json({ error: 'Le support ne peut pas modifier la priorité' });
            }
            if (userRole !== 'manager') {
                // Seul le manager peut modifier la priorité selon l'énoncé ? 
                // "Un manager peut modifier la priorité"
                // Habituellement l'auteur le peut aussi, mais l'énoncé est strict.
                // Si on suit à la lettre : seul le manager peut modifier.
                return res.status(403).json({ error: 'Seul un manager peut modifier la priorité' });
            }
        }

        const [count] = await Ticket.update(req.body, { where: { id: req.params.id } });
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
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });

        const userRole = req.token.role;
        
        // Règle 2: open => assigned (support)
        if (userRole !== 'support') {
            return res.status(403).json({ error: 'Seul le support peut assigner un ticket' });
        }
        if (ticket.status !== 'open') {
            return res.status(400).json({ error: "Un ticket ne peut être assigné que s'il est au statut open" });
        }

        const { assignee_id } = req.body;
        await Ticket.update(
            { assignee_id, status: 'assigned' },
            { where: { id: req.params.id } }
        );
        res.status(200).json({ message: 'Ticket assigné avec succès' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });

        const userRole = req.token.role;
        const userId = req.token.userId;

        const transitions = {
            'open': {
                'assigned': 'support',
                'cancelled': 'author'
            },
            'assigned': {
                'in_progress': 'support'
            },
            'in_progress': {
                'resolved': 'support'
            },
            'resolved': {
                'closed': ['support', 'collaborateur']
            }
        };

        const currentStatusTransitions = transitions[ticket.status];
        if (!currentStatusTransitions || !currentStatusTransitions[status]) {
            return res.status(400).json({ error: `Changement de statut ${ticket.status} => ${status} non autorisé` });
        }

        const allowedRole = currentStatusTransitions[status];
        let hasAccess = false;

        if (allowedRole === 'author') {
            if (ticket.author_id === userId) hasAccess = true;
        } else if (Array.isArray(allowedRole)) {
            if (allowedRole.includes(userRole)) hasAccess = true;
        } else {
            if (userRole === allowedRole) hasAccess = true;
        }

        if (!hasAccess) {
            return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer ce changement de statut" });
        }

        await Ticket.update({ status }, { where: { id: req.params.id } });
        res.status(200).json({ message: 'Statut mis à jour' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
