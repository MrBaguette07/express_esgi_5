const express = require('express');
const app = express();
const userRouter = require('./module/user/user.route.js');
const messageRouter = require('./module/message/message.route.js');
const conversationRouter = require('./module/conversation/conversation.route.js');
const authRouter = require('./module/auth/auth.route.js');
const {connect} = require('./helper/connexion.js');
const associate = require('./helper/associate.js');
const cors = require('cors')

const startBdd = async () => {
    await connect();
    await associate();
}
startBdd();
app.use(cors())
app.use(express.json());

app.use('/user',userRouter);
app.use('/message',messageRouter);
app.use('/conversation',conversationRouter);
app.use('/auth',authRouter);

module.exports = app;