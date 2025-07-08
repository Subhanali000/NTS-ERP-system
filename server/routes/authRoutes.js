const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup/directors', authController.signupDirector);
router.post('/login', authController.login);

module.exports = router;