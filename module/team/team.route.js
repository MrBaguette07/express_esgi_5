const express = require('express');
const router = express.Router();
const teamController = require('./team.controller.js');
const authMiddleware = require('./../auth/auth.middleware.js');

router.get('/', authMiddleware, teamController.getAll);
router.get('/:id', authMiddleware, teamController.getById);
router.post('/', authMiddleware, teamController.create);
router.put('/:id', authMiddleware, teamController.update);
router.delete('/:id', authMiddleware, teamController.delete);

module.exports = router;
