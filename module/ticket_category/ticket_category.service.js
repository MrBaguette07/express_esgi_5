const TicketCategory = require('./ticket_category.model.js');

exports.getAll = async () => {
    return await TicketCategory.findAll();
};

exports.getById = async (id) => {
    const category = await TicketCategory.findByPk(id);
    if (!category) {
        throw new Error('Catégorie introuvable');
    }
    return category;
};

exports.create = async (categoryData) => {
    return await TicketCategory.create(categoryData);
};

exports.update = async (id, categoryData) => {
    const [count] = await TicketCategory.update(categoryData, { where: { id } });
    if (count === 0) {
        throw new Error('Catégorie introuvable');
    }
    return count;
};

exports.delete = async (id) => {
    const count = await TicketCategory.destroy({ where: { id } });
    if (count === 0) {
        throw new Error('Catégorie introuvable');
    }
    return count;
};
