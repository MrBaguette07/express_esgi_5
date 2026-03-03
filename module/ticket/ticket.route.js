const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller.js');
const authMiddleware = require('./../auth/auth.middleware.js');

router.get('/',          authMiddleware, ticketController.getAll);
router.get('/:id',       authMiddleware, ticketController.getById);
router.post('/',         authMiddleware, ticketController.create);
router.put('/:id',       authMiddleware, ticketController.update);
router.delete('/:id',    authMiddleware, ticketController.delete);
router.patch('/:id/assign', authMiddleware, ticketController.assign);
router.patch('/:id/status', authMiddleware, ticketController.updateStatus);

module.exports = router;
