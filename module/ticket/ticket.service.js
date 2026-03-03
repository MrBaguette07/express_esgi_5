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

exports.getAll = async (query, user) => {
    const where = {};
    if (query.status)   where.status      = query.status;
    if (query.priority) where.priority_id = query.priority;
    if (query.category) where.category_id = query.category;

    const { role: userRole, userId, teamId } = user;

    if (userRole === 'collaborateur') {
        where.author_id = userId;
    } else if (userRole === 'manager') {
        if (!teamId) {
            where.author_id = userId;
        } else {
            const teamUsers = await User.findAll({ where: { team_id: teamId }, attributes: ['id'] });
            const userIds = teamUsers.map(u => u.id);
            where.author_id = { [Op.in]: userIds };
        }
    }

    return await Ticket.findAll({ where, include: includeRelations, order: [['created_at', 'DESC']] });
};

exports.getById = async (id, user) => {
    const ticket = await Ticket.findByPk(id, { include: includeRelations });
    if (!ticket) {
        throw new Error('Ticket introuvable');
    }

    const { role: userRole, userId, teamId } = user;

    if (userRole === 'collaborateur' && ticket.author_id !== userId) {
        throw new Error('Accès refusé');
    } else if (userRole === 'manager') {
        const author = await User.findByPk(ticket.author_id);
        if (!author || author.team_id !== teamId) {
            throw new Error('Accès refusé');
        }
    }

    return ticket;
};

exports.create = async (ticketData, user) => {
    const { role: userRole, userId } = user;
    
    if (userRole === 'collaborateur') {
        const priorities = await TicketPriority.findAll();
        const critical = priorities.find(p => p.code.includes('critical'));
        
        if (critical && String(ticketData.priority_id) === String(critical.id)) {
            throw new Error('Un collaborateur ne peut pas créer un ticket en critical');
        }
    }

    return await Ticket.create({ ...ticketData, author_id: userId });
};

exports.update = async (id, ticketData, user) => {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
        throw new Error('Ticket introuvable');
    }

    const { role: userRole, teamId } = user;

    // Règle 3: Priorité
    if (ticketData.priority_id && parseInt(ticketData.priority_id) !== ticket.priority_id) {
        if (userRole === 'support') {
            throw new Error('Le support ne peut pas modifier la priorité');
        }
        if (userRole !== 'manager') {
            throw new Error('Seul un manager peut modifier la priorité');
        }
        // Un manager ne peut modifier que la priorité des membres de son équipe
        const author = await User.findByPk(ticket.author_id);
        if (!author || String(author.team_id) !== String(teamId)) {
            throw new Error("Vous n'êtes pas autorisé à modifier la priorité d'un ticket hors de votre équipe");
        }
    }

    // Règle : Manager ne peut pas traiter techniquement un ticket
    let dataToUpdate = ticketData;
    if (userRole === 'manager') {
        dataToUpdate = {};
        if (ticketData.priority_id) dataToUpdate.priority_id = ticketData.priority_id;
        
        if (Object.keys(ticketData).some(key => key !== 'priority_id')) {
            throw new Error("Le manager ne peut modifier que la priorité");
        }
    }

    const [count] = await Ticket.update(dataToUpdate, { where: { id } });
    return count;
};

exports.delete = async (id) => {
    const count = await Ticket.destroy({ where: { id } });
    if (count === 0) {
        throw new Error('Ticket introuvable');
    }
    return count;
};

exports.assign = async (id, assignee_id, user) => {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
        throw new Error('Ticket introuvable');
    }

    if (user.role !== 'support') {
        throw new Error('Seul le support peut assigner un ticket');
    }
    if (ticket.status !== 'open') {
        throw new Error("Un ticket ne peut être assigné que s'il est au statut open");
    }

    await Ticket.update(
        { assignee_id, status: 'assigned' },
        { where: { id } }
    );
    return true;
};

exports.updateStatus = async (id, newStatus, user) => {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
        throw new Error('Ticket introuvable');
    }

    const { role: userRole, userId } = user;

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
    if (!currentStatusTransitions || !currentStatusTransitions[newStatus]) {
        throw new Error(`Changement de statut ${ticket.status} => ${newStatus} non autorisé`);
    }

    const allowedRole = currentStatusTransitions[newStatus];
    let hasAccess = false;

    if (allowedRole === 'author') {
        if (Number(ticket.author_id) === Number(userId)) hasAccess = true;
    } else if (Array.isArray(allowedRole)) {
        if (allowedRole.includes(userRole)) hasAccess = true;
    } else {
        if (userRole === allowedRole) hasAccess = true;
    }

    if (!hasAccess) {
        throw new Error("Vous n'avez pas les droits pour effectuer ce changement de statut");
    }

    await Ticket.update({ status: newStatus }, { where: { id } });
    return true;
};
