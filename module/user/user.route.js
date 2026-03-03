const express = require("express");
const router = express.Router();
const userController = require('./user.controller.js');
const authMiddleware = require('./../auth/auth.middleware.js');

router.get('/', authMiddleware, userController.getAll);
router.get('/:id', authMiddleware, userController.getById);
router.post('/', userController.create);
router.put('/:id', authMiddleware, userController.update);
router.delete('/:id', authMiddleware, userController.delete);

module.exports = router;