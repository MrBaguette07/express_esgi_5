const express = require("express");
const router = express.Router();
const userController = require('./user.controller.js');
const authMiddleware = require('./../auth/auth.middleware.js');

router.get('/',userController.getAll);
router.get('/:id',userController.getById);
router.post('/',userController.create);
router.put('/:id',userController.update);
router.delete('/:id',userController.delete);
router.get('/search/:username',authMiddleware,userController.searchContact);
router.post('/addContact',authMiddleware,userController.addContact);


module.exports = router;