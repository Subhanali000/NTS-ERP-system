const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('employee', 'intern'));

router.post('/attendance', employeeController.submitAttendance);
router.post('/leave', employeeController.applyLeave);
router.post('/task-progress', employeeController.submitTaskProgress);
router.post('/progress', employeeController.submitProgress);
router.get('/profile', employeeController.getProfile);
router.get('/attendance', employeeController.getAttendance);
router.get('/leaves', employeeController.getLeaves);
router.get('/tasks', employeeController.getTasks);
router.get('/progress', employeeController.getProgress);

module.exports = router;