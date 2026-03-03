const commentService = require('./comment.service.js');

function getCommentErrorResponse(e) {
    if (e.message === 'Ticket introuvable' || e.message === 'Commentaire introuvable') {
        return { status: 404, message: e.message };
    }
    if (e.message === 'Accès refusé' || e.message.includes('autorisé')) {
        return { status: 403, message: e.message };
    }
    return null;
}

exports.getByTicket = async (req, res) => {
    try {
        const comments = await commentService.getByTicket(req.params.ticketId, req.token);
        res.status(200).json(comments);
    } catch (e) {
        const known = getCommentErrorResponse(e);
        if (known) return res.status(known.status).json({ error: known.message });
        res.status(500).json({ error: "Erreur lors de la récupération des commentaires" });
    }
};

exports.create = async (req, res) => {
    try {
        const comment = await commentService.create(req.params.ticketId, req.body, req.token);
        res.status(201).json(comment);
    } catch (e) {
        const known = getCommentErrorResponse(e);
        if (known) return res.status(known.status).json({ error: known.message });
        res.status(500).json({ error: "Erreur lors de la création du commentaire" });
    }
};

exports.update = async (req, res) => {
    try {
        const comment = await commentService.update(req.params.id, req.params.ticketId, req.body.content, req.token.userId);
        res.status(200).json(comment);
    } catch (e) {
        const known = getCommentErrorResponse(e);
        if (known) return res.status(known.status).json({ error: known.message });
        res.status(500).json({ error: "Erreur lors de la mise à jour du commentaire" });
    }
};

exports.delete = async (req, res) => {
    try {
        await commentService.delete(req.params.id, req.params.ticketId, req.token.userId);
        res.status(200).json({ message: 'Commentaire supprimé avec succès' });
    } catch (e) {
        const known = getCommentErrorResponse(e);
        if (known) return res.status(known.status).json({ error: known.message });
        res.status(500).json({ error: "Erreur lors de la suppression du commentaire" });
    }
};
