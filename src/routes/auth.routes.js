const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/register',authController.register);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/verify-forgot-otp', authController.verifyForgotOtp);
router.post('/change-password', authController.changePassword);
router.get('/me',authenticate, authController.getProfile);

module.exports = router;
