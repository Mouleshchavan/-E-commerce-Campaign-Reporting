const express = require('express');
const router = express.Router();
const {
  upload,
  uploadCSV,
  reportByCampaign,
  reportByAdGroupID,
  reportByFSNID,
  reportByProductName
} = require('../controllers/productController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// File upload
router.post('/upload', authenticateToken, upload.single('file'), uploadCSV);

// Reporting APIs
router.post('/report/campaign', authenticateToken, reportByCampaign);
router.post('/report/adGroupID', authenticateToken, reportByAdGroupID);
router.post('/report/fsnID', authenticateToken, reportByFSNID);
router.post('/report/productName', authenticateToken, reportByProductName);

module.exports = router;
