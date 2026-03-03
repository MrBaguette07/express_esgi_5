const express = require("express");
const router = express.Router();
const messageController = require('./message.controller.js');
const authMiddleware = require('./../auth/auth.middleware.js');

router.get('/',messageController.getAll);
router.get('/:id',messageController.getById);
router.post('/',authMiddleware,messageController.create);
router.put('/:id',messageController.update);
router.delete('/:id',messageController.delete);


module.exports = router;