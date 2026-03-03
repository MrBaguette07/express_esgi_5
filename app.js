const express = require('express');
const app = express();
const cors = require('cors');

const userRouter           = require('./module/user/user.route.js');
const authRouter           = require('./module/auth/auth.route.js');
const teamRouter           = require('./module/team/team.route.js');
const ticketRouter         = require('./module/ticket/ticket.route.js');
const commentRouter        = require('./module/comment/comment.route.js');
const ticketCategoryRouter = require('./module/ticket_category/ticket_category.route.js');
const ticketPriorityRouter = require('./module/ticket_priority/ticket_priority.route.js');

const { connect } = require('./helper/connexion.js');
const associate   = require('./helper/associate.js');

const startBdd = async () => {
    await connect();
    await associate();
};
startBdd();

app.use(cors());
app.use(express.json());

app.use('/auth',              authRouter);
app.use('/users',             userRouter);
app.use('/teams',             teamRouter);
app.use('/tickets',           ticketRouter);
app.use('/tickets/:ticketId/comments', commentRouter);
app.use('/ticket-categories', ticketCategoryRouter);
app.use('/ticket-priorities', ticketPriorityRouter);

module.exports = app;