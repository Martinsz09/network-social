const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getRegister);
router.post('/', userController.postRegister);
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

module.exports = router;
