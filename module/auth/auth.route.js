const express = require("express");
const router = express.Router();
const authController = require('./auth.controller.js');

router.post('/login',authController.login);
router.post('/signin',authController.signin);

module.exports = router;
