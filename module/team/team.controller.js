const teamService = require('./team.service.js');

exports.getAll = async (req, res) => {
    try {
        const teams = await teamService.getAll();
        res.status(200).json(teams);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const team = await teamService.getById(req.params.id);
        res.status(200).json(team);
    } catch (e) {
        const status = e.message === 'Équipe introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const team = await teamService.create(req.body);
        res.status(201).json(team);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const count = await teamService.update(req.params.id, req.body);
        res.status(200).json({ message: `Lignes modifiées : ${count}` });
    } catch (e) {
        const status = e.message === 'Équipe introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await teamService.delete(req.params.id);
        res.status(200).json({ message: `Lignes supprimées : ${count}` });
    } catch (e) {
        const status = e.message === 'Équipe introuvable' ? 404 : 500;
        res.status(status).json({ error: e.message });
    }
};
