const express = require('express');
const router = express.Router();
const directorController = require('../controllers/directorController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('Global HR Director',
    'Global Operations Director',
    'Engineering Director',
    'Director – Tech Team',
    'Director – Business Development'));

router.post('/add-employee', directorController.addEmployee);
router.post('/create-project', directorController.createProject);
router.post('/assign-employee', directorController.assignEmployee);
router.post('/leave/approve', directorController.approveLeave);
router.get('/division-data', directorController.viewDivisionData);
router.get('/total-employees', directorController.getTotalEmployees);
router.get('/active-projects', directorController.getActiveProjects);
router.get('/departments', directorController.getDepartments);
router.get('/avg-performance', directorController.getAvgPerformance);
router.get('/employees', directorController.getAllEmployees);
router.get('/interns', directorController.getAllInterns);
router.get('/managers', directorController.getAllManagers);
router.delete('/users/:user_id', directorController.deleteUser);
router.patch('/users/:user_id', directorController.updateUser);
router.get('/team-progress', directorController.getTeamProgress);
router.get('/tasks', directorController.getAllTasks); // New route
router.get('/progress-reports', directorController.getProgressReports); // New route
router.get('/attendance', directorController.getAttendance); // New route

module.exports = router;