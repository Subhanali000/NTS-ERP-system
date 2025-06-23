const express = require('express');
const router = express.Router();
const directorController = require('../controllers/directorController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('director'));

router.post('/register/employee', directorController.registerEmployee);
router.post('/register/intern', directorController.registerIntern);
router.post('/register/manager', directorController.registerManager);
router.post('/leave/approve', directorController.approveLeave);
router.get('/division-data', directorController.viewDivisionData);
router.get('/employees', directorController.getAllEmployees);
router.get('/interns', directorController.getAllInterns);
router.get('/managers', directorController.getAllManagers);
router.delete('/users/:user_id', directorController.deleteUser);
router.patch('/users/:user_id', directorController.updateUser);

module.exports = router;