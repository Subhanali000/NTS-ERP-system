const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Restrict document generation to directors only
router.use(authMiddleware.verifyToken);
router.use('/generate', authMiddleware.restrictTo('director')); // Sub-route for generation
router.use('/upload', authMiddleware.restrictTo('director', 'employee', 'intern', 'manager')); // Upload for all roles

router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.post('/generate/offer-letter', documentController.generateOfferLetter);
router.post('/generate/experience-certificate', documentController.generateExperienceCertificate);
router.post('/generate/letter-of-recommendation', documentController.generateLetterOfRecommendation);
router.post('/generate/internship-completion', documentController.generateInternshipCompletionCertificate);

module.exports = router;