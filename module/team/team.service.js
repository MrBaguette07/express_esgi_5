const Team = require('./team.model.js');

exports.getAll = async () => {
    return await Team.findAll();
};

exports.getById = async (id) => {
    const team = await Team.findByPk(id);
    if (!team) {
        throw new Error('Équipe introuvable');
    }
    return team;
};

exports.create = async (teamData) => {
    return await Team.create(teamData);
};

exports.update = async (id, teamData) => {
    const [count] = await Team.update(teamData, { where: { id } });
    if (count === 0) {
        throw new Error('Équipe introuvable');
    }
    return count;
};

exports.delete = async (id) => {
    const count = await Team.destroy({ where: { id } });
    if (count === 0) {
        throw new Error('Équipe introuvable');
    }
    return count;
};
