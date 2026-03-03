const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams pour récupérer :ticketId
const commentController = require('./comment.controller.js');
const authMiddleware = require('./../auth/auth.middleware.js');

router.get('/',     authMiddleware, commentController.getByTicket);
router.post('/',    authMiddleware, commentController.create);
router.put('/:id',  authMiddleware, commentController.update);
router.delete('/:id', authMiddleware, commentController.delete);

module.exports = router;
