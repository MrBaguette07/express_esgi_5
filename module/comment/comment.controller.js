const Comment = require('./comment.model.js');
const User = require('./../user/user.model.js');
const Ticket = require('./../ticket/ticket.model.js');

exports.getByTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });

        const userRole = req.token.role;
        const userId = req.token.userId;
        const teamId = req.token.teamId;

        // Un collaborateur ne peut voir que les commentaires de ses propres tickets
        if (userRole === 'collaborateur' && ticket.author_id !== userId) {
            return res.status(403).json({ error: "Accès refusé" });
        }

        // Un manager ne peut voir que les commentaires des tickets de son équipe
        if (userRole === 'manager') {
            const author = await User.findByPk(ticket.author_id);
            if (!author || author.team_id !== teamId) {
                return res.status(403).json({ error: "Accès refusé" });
            }
        }

        const isSupport = userRole === 'support'; // L'énoncé dit "Support : Peut ajouter des commentaires internes"
        // On suppose que seul le support les voit si l'énoncé est strict
        // Mais souvent le manager doit aussi les voir ? Dans le doute, on va restreindre au support
        // selon l'énoncé qui ne mentionne pas le manager pour l'interne.
        const where = { ticket_id: req.params.ticketId };
        if (!isSupport) where.is_internal = false;  // les collaborateurs et managers ne voient pas les notes internes

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

        const userRole = req.token.role;
        const userId = req.token.userId;

        // Un collaborateur ne peut commenter que ses propres tickets
        if (userRole === 'collaborateur' && ticket.author_id !== userId) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à commenter ce ticket" });
        }

        const isSupport = ['support', 'manager'].includes(userRole);
        const is_internal = isSupport ? (req.body.is_internal ?? false) : false;

        const comment = await Comment.create({
            content: req.body.content,
            is_internal,
            ticket_id: Number(req.params.ticketId),
            author_id: userId
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
