const commentService = require('./comment.service.js');

exports.getByTicket = async (req, res) => {
    try {
        const comments = await commentService.getByTicket(req.params.ticketId, req.token);
        res.status(200).json(comments);
    } catch (e) {
        let status = 500;
        if (e.message === 'Ticket introuvable') status = 404;
        if (e.message === 'Accès refusé') status = 403;
        res.status(status).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const comment = await commentService.create(req.params.ticketId, req.body, req.token);
        res.status(201).json(comment);
    } catch (e) {
        let status = 500;
        if (e.message === 'Ticket introuvable') status = 404;
        if (e.message.includes("autorisé")) status = 403;
        res.status(status).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const comment = await commentService.update(req.params.id, req.params.ticketId, req.body.content, req.token.userId);
        res.status(200).json(comment);
    } catch (e) {
        let status = 500;
        if (e.message === 'Commentaire introuvable') status = 404;
        if (e.message === 'Accès refusé') status = 403;
        res.status(status).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await commentService.delete(req.params.id, req.params.ticketId, req.token.userId);
        res.status(200).json({ message: 'Commentaire supprimé' });
    } catch (e) {
        let status = 500;
        if (e.message === 'Commentaire introuvable') status = 404;
        if (e.message === 'Accès refusé') status = 403;
        res.status(status).json({ error: e.message });
    }
};
