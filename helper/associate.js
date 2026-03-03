const User           = require('./../module/user/user.model.js');
const Team           = require('./../module/team/team.model.js');
const Ticket         = require('./../module/ticket/ticket.model.js');
const Comment        = require('./../module/comment/comment.model.js');
const TicketCategory = require('./../module/ticket_category/ticket_category.model.js');
const TicketPriority = require('./../module/ticket_priority/ticket_priority.model.js');

const associate = async () => {
    User.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
    Team.hasMany(User,   { foreignKey: 'team_id', as: 'members' });
    Team.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

    Ticket.belongsTo(TicketCategory, { foreignKey: 'category_id', as: 'category' });
    Ticket.belongsTo(TicketPriority, { foreignKey: 'priority_id', as: 'priority' });
    TicketCategory.hasMany(Ticket, { foreignKey: 'category_id', as: 'tickets' });
    TicketPriority.hasMany(Ticket, { foreignKey: 'priority_id', as: 'tickets' });

    Ticket.belongsTo(User, { foreignKey: 'author_id',   as: 'author' });
    Ticket.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });
    User.hasMany(Ticket,   { foreignKey: 'author_id',   as: 'createdTickets' });
    User.hasMany(Ticket,   { foreignKey: 'assignee_id', as: 'assignedTickets' });

    Comment.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
    Comment.belongsTo(User,   { foreignKey: 'author_id', as: 'author' });
    Ticket.hasMany(Comment,   { foreignKey: 'ticket_id', as: 'comments' });
    User.hasMany(Comment,     { foreignKey: 'author_id', as: 'comments' });
};

module.exports = associate;