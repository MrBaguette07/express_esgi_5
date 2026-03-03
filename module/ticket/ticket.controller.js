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
            if (!teamId) {
                // S'il n'a pas d'équipe, il ne voit que ses propres tickets
                where.author_id = userId;
            } else {
                const teamUsers = await User.findAll({ where: { team_id: teamId }, attributes: ['id'] });
                const userIds = teamUsers.map(u => u.id);
                where.author_id = { [Op.in]: userIds };
            }
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
            const priorities = await TicketPriority.findAll();
            const critical = priorities.find(p => p.code.includes('critical'));
            
            if (critical && String(req.body.priority_id) === String(critical.id)) {
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
        const teamId = req.token.teamId;

        // Règle 3: Priorité
        if (req.body.priority_id && parseInt(req.body.priority_id) !== ticket.priority_id) {
            if (userRole === 'support') {
                return res.status(403).json({ error: 'Le support ne peut pas modifier la priorité' });
            }
            if (userRole !== 'manager') {
                return res.status(403).json({ error: 'Seul un manager peut modifier la priorité' });
            }
            // Un manager ne peut modifier que la priorité des membres de son équipe
            const author = await User.findByPk(ticket.author_id);
            if (!author || String(author.team_id) !== String(teamId)) {
                return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier la priorité d'un ticket hors de votre équipe" });
            }
        }

        // Règle : Manager ne peut pas traiter techniquement un ticket
        // Si le rôle est manager, on ne laisse passer que la priorité (priority_id)
        let dataToUpdate = req.body;
        if (userRole === 'manager') {
            dataToUpdate = {};
            if (req.body.priority_id) dataToUpdate.priority_id = req.body.priority_id;
            // Si le manager tente de modifier autre chose, on peut soit ignorer soit refuser. 
            // L'énoncé dit "Ne peut pas traiter techniquement un ticket". 
            // On va restreindre à la priorité uniquement.
            if (Object.keys(req.body).some(key => key !== 'priority_id')) {
                // Optionnel : On peut retourner une erreur ou simplement filtrer. 
                // Pour être strict par rapport à l'énoncé :
                return res.status(403).json({ error: "Le manager ne peut modifier que la priorité" });
            }
        }

        // Un collaborateur ne peut pas modifier ses propres tickets s'il ne sont pas 'open' ? 
        // L'énoncé ne le dit pas explicitement pour l'update, mais c'est logique.
        // On va rester sur ce qui est demandé.

        const [count] = await Ticket.update(dataToUpdate, { where: { id: req.params.id } });
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
            if (Number(ticket.author_id) === Number(userId)) hasAccess = true;
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
