const Comment = require('./comment.model.js');
const User = require('./../user/user.model.js');
const Ticket = require('./../ticket/ticket.model.js');

exports.getByTicket = async (ticketId, user) => {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
        throw new Error('Ticket introuvable');
    }

    const { role: userRole, userId, teamId } = user;

    if (userRole === 'collaborateur' && ticket.author_id !== userId) {
        throw new Error("Accès refusé");
    }

    if (userRole === 'manager') {
        const author = await User.findByPk(ticket.author_id);
        if (!author || author.team_id !== teamId) {
            throw new Error("Accès refusé");
        }
    }

    const isSupport = userRole === 'support';
    const where = { ticket_id: ticketId };
    if (!isSupport) where.is_internal = false;

    return await Comment.findAll({
        where,
        include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'email'] }],
        order: [['created_at', 'ASC']]
    });
};

exports.create = async (ticketId, commentData, user) => {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
        throw new Error('Ticket introuvable');
    }

    const { role: userRole, userId } = user;

    if (userRole === 'collaborateur' && ticket.author_id !== userId) {
        throw new Error("Vous n'êtes pas autorisé à commenter ce ticket");
    }

    const isSupport = ['support', 'manager'].includes(userRole);
    const is_internal = isSupport ? (commentData.is_internal ?? false) : false;

    return await Comment.create({
        content: commentData.content,
        is_internal,
        ticket_id: Number(ticketId),
        author_id: userId
    });
};

exports.update = async (id, ticketId, content, userId) => {
    const comment = await Comment.findOne({
        where: { id, ticket_id: ticketId }
    });
    if (!comment) {
        throw new Error('Commentaire introuvable');
    }
    if (comment.author_id !== userId) {
        throw new Error('Accès refusé');
    }

    await comment.update({ content });
    return comment;
};

exports.delete = async (id, ticketId, userId) => {
    const comment = await Comment.findOne({
        where: { id, ticket_id: ticketId }
    });
    if (!comment) {
        throw new Error('Commentaire introuvable');
    }
    if (comment.author_id !== userId) {
        throw new Error('Accès refusé');
    }

    await comment.destroy();
    return true;
};
