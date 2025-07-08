const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const authMiddleware = require('../middleware/authMiddleware');



router.get('/team-performance', managerController.viewTeamPerformance);
router.post('/task', managerController.assignTask);
router.post('/leave/approve', managerController.approveLeave);
router.post('/leave', managerController.applyLeave);
router.get('/employees', managerController.getEmployees);
router.get('/interns', managerController.getInterns);
router.post('/project', managerController.createProject);
router.get('/team-progress', managerController.getTeamProgress);
router.get('/active-projects', managerController.getActiveProjects);
router.post('/employee', managerController.addEmployee); // New endpoint

module.exports = router;