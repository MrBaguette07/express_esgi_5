const TicketPriority = require('./ticket_priority.model.js');

exports.getAll = async () => {
    return await TicketPriority.findAll({ order: [['level', 'ASC']] });
};

exports.getById = async (id) => {
    const priority = await TicketPriority.findByPk(id);
    if (!priority) {
        throw new Error('Priorité introuvable');
    }
    return priority;
};

exports.create = async (priorityData) => {
    return await TicketPriority.create(priorityData);
};

exports.update = async (id, priorityData) => {
    const [count] = await TicketPriority.update(priorityData, { where: { id } });
    if (count === 0) {
        throw new Error('Priorité introuvable');
    }
    return count;
};

exports.delete = async (id) => {
    const count = await TicketPriority.destroy({ where: { id } });
    if (count === 0) {
        throw new Error('Priorité introuvable');
    }
    return count;
};
