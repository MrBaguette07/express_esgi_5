const express = require('express');
const router = express.Router();
const ticketPriorityController = require('./ticket_priority.controller.js');
const authMiddleware = require('./../auth/auth.middleware.js');

router.get('/', authMiddleware, ticketPriorityController.getAll);
router.get('/:id', authMiddleware, ticketPriorityController.getById);
router.post('/', authMiddleware, ticketPriorityController.create);
router.put('/:id', authMiddleware, ticketPriorityController.update);
router.delete('/:id', authMiddleware, ticketPriorityController.delete);

module.exports = router;
