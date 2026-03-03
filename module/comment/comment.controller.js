const Comment = require('./comment.model.js');
const User = require('./../user/user.model.js');
const Ticket = require('./../ticket/ticket.model.js');

exports.getByTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });

        const isSupport = ['support', 'manager'].includes(req.token.role);
        const where = { ticket_id: req.params.ticketId };
        if (!isSupport) where.is_internal = false;  // les collaborateurs ne voient pas les notes internes

        const comments = await Comment.findAll({
            where,
            include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'email'] }],
            order: [['created_at', 'ASC']]
        });
        res.status(200).json(comments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });

        const isSupport = ['support', 'manager'].includes(req.token.role);
        const is_internal = isSupport ? (req.body.is_internal ?? false) : false;

        const comment = await Comment.create({
            content: req.body.content,
            is_internal,
            ticket_id: Number(req.params.ticketId),
            author_id: req.token.userId
        });
        res.status(201).json(comment);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const comment = await Comment.findOne({
            where: { id: req.params.id, ticket_id: req.params.ticketId }
        });
        if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' });
        if (comment.author_id !== req.token.userId) return res.status(403).json({ error: 'Accès refusé' });

        await comment.update({ content: req.body.content });
        res.status(200).json(comment);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const comment = await Comment.findOne({
            where: { id: req.params.id, ticket_id: req.params.ticketId }
        });
        if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' });
        if (comment.author_id !== req.token.userId) return res.status(403).json({ error: 'Accès refusé' });

        await comment.destroy();
        res.status(200).json({ message: 'Commentaire supprimé' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
