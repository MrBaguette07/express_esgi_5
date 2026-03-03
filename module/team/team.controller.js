const Team = require('./team.model.js');

exports.getAll = async (req, res) => {
    try {
        const teams = await Team.findAll();
        res.status(200).json(teams);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const team = await Team.findByPk(req.params.id);
        if (!team) return res.status(404).json({ error: 'Équipe introuvable' });
        res.status(200).json(team);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const team = await Team.create(req.body);
        res.status(201).json(team);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [count] = await Team.update(req.body, { where: { id: req.params.id } });
        if (count === 0) return res.status(404).json({ error: 'Équipe introuvable' });
        res.status(200).json({ message: `Lignes modifiées : ${count}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await Team.destroy({ where: { id: req.params.id } });
        if (count === 0) return res.status(404).json({ error: 'Équipe introuvable' });
        res.status(200).json({ message: `Lignes supprimées : ${count}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
