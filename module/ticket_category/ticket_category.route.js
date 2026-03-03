const express = require('express');
const router = express.Router();
const ticketCategoryController = require('./ticket_category.controller.js');
const authMiddleware = require('./../auth/auth.middleware.js');

router.get('/', authMiddleware, ticketCategoryController.getAll);
router.get('/:id', authMiddleware, ticketCategoryController.getById);
router.post('/', authMiddleware, ticketCategoryController.create);
router.put('/:id', authMiddleware, ticketCategoryController.update);
router.delete('/:id', authMiddleware, ticketCategoryController.delete);

module.exports = router;
