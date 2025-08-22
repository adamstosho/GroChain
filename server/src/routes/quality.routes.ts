import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { qualityController } from '../controllers/quality.controller';
import { qualityValidation } from '../validations/quality.validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Quality Overview & Analytics
router.get('/overview', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityController.getQualityOverview
);

router.get('/dashboard', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityController.getQualityDashboard
);

// Quality Standards Management
router.get('/standards', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityController.getQualityStandards
);

router.get('/standards/:standardId', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityValidation.getStandard,
  validateRequest,
  qualityController.getQualityStandard
);

router.post('/standards', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.createStandard,
  validateRequest,
  qualityController.createQualityStandard
);

router.put('/standards/:standardId', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.updateStandard,
  validateRequest,
  qualityController.updateQualityStandard
);

router.delete('/standards/:standardId', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.deleteStandard,
  validateRequest,
  qualityController.deleteQualityStandard
);

// Quality Inspections
router.get('/inspections', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityValidation.getInspections,
  validateRequest,
  qualityController.getQualityInspections
);

router.get('/inspections/:inspectionId', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityValidation.getInspection,
  validateRequest,
  qualityController.getQualityInspection
);

router.post('/inspections', 
  authorizeRoles(['admin', 'manager', 'inspector']), 
  qualityValidation.createInspection,
  validateRequest,
  qualityController.createQualityInspection
);

router.put('/inspections/:inspectionId', 
  authorizeRoles(['admin', 'manager', 'inspector']), 
  qualityValidation.updateInspection,
  validateRequest,
  qualityController.updateQualityInspection
);

router.delete('/inspections/:inspectionId', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.deleteInspection,
  validateRequest,
  qualityController.deleteQualityInspection
);

// Inspection Approval Workflow
router.patch('/inspections/:inspectionId/approve', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.approveInspection,
  validateRequest,
  qualityController.approveQualityInspection
);

router.patch('/inspections/:inspectionId/reject', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.rejectInspection,
  validateRequest,
  qualityController.rejectQualityInspection
);

router.patch('/inspections/:inspectionId/conditional-approval', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.conditionalApproval,
  validateRequest,
  qualityController.conditionalApproval
);

// Quality Tests Management
router.get('/tests', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityController.getQualityTests
);

router.get('/tests/:testId', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityValidation.getTest,
  validateRequest,
  qualityController.getQualityTest
);

router.post('/tests', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.createTest,
  validateRequest,
  qualityController.createQualityTest
);

router.put('/tests/:testId', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.updateTest,
  validateRequest,
  qualityController.updateQualityTest
);

router.delete('/tests/:testId', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.deleteTest,
  validateRequest,
  qualityController.deleteQualityTest
);

// Test Execution & Results
router.post('/tests/:testId/execute', 
  authorizeRoles(['admin', 'manager', 'inspector']), 
  qualityValidation.executeTest,
  validateRequest,
  qualityController.executeQualityTest
);

router.get('/tests/:testId/results', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityValidation.getTestResults,
  validateRequest,
  qualityController.getTestResults
);

router.post('/tests/:testId/results', 
  authorizeRoles(['admin', 'manager', 'inspector']), 
  qualityValidation.submitTestResults,
  validateRequest,
  qualityController.submitTestResults
);

// Quality Metrics & Analytics
router.get('/metrics/overall', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityController.getOverallQualityMetrics
);

router.get('/metrics/by-category', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityController.getQualityMetricsByCategory
);

router.get('/metrics/by-supplier', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityController.getQualityMetricsBySupplier
);

router.get('/metrics/trends', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityController.getQualityTrends
);

// Defect Management
router.get('/defects', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityValidation.getDefects,
  validateRequest,
  qualityController.getDefects
);

router.post('/defects', 
  authorizeRoles(['admin', 'manager', 'inspector']), 
  qualityValidation.createDefect,
  validateRequest,
  qualityController.createDefect
);

router.put('/defects/:defectId', 
  authorizeRoles(['admin', 'manager', 'inspector']), 
  qualityValidation.updateDefect,
  validateRequest,
  qualityController.updateDefect
);

router.delete('/defects/:defectId', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.deleteDefect,
  validateRequest,
  qualityController.deleteDefect
);

// Corrective Actions
router.get('/corrective-actions', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityValidation.getCorrectiveActions,
  validateRequest,
  qualityController.getCorrectiveActions
);

router.post('/corrective-actions', 
  authorizeRoles(['admin', 'manager', 'inspector']), 
  qualityValidation.createCorrectiveAction,
  validateRequest,
  qualityController.createCorrectiveAction
);

router.put('/corrective-actions/:actionId', 
  authorizeRoles(['admin', 'manager', 'inspector']), 
  qualityValidation.updateCorrectiveAction,
  validateRequest,
  qualityController.updateCorrectiveAction
);

router.patch('/corrective-actions/:actionId/complete', 
  authorizeRoles(['admin', 'manager', 'inspector']), 
  qualityValidation.completeCorrectiveAction,
  validateRequest,
  qualityController.completeCorrectiveAction
);

// Compliance & Certification
router.get('/compliance/overview', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityController.getComplianceOverview
);

router.get('/compliance/standards', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityController.getComplianceStandards
);

router.get('/compliance/certifications', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityController.getCertifications
);

router.post('/compliance/audit', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.createComplianceAudit,
  validateRequest,
  qualityController.createComplianceAudit
);

// Reports & Export
router.get('/reports/inspections', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityValidation.getInspectionReports,
  validateRequest,
  qualityController.getInspectionReports
);

router.get('/reports/defects', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityValidation.getDefectReports,
  validateRequest,
  qualityController.getDefectReports
);

router.get('/reports/compliance', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityValidation.getComplianceReports,
  validateRequest,
  qualityController.getComplianceReports
);

router.post('/export/inspections', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityValidation.exportInspections,
  validateRequest,
  qualityController.exportInspections
);

router.post('/export/defects', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  qualityValidation.exportDefects,
  validateRequest,
  qualityController.exportDefects
);

// Search & Filter
router.get('/search', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityValidation.searchQuality,
  validateRequest,
  qualityController.searchQuality
);

router.get('/filter', 
  authorizeRoles(['admin', 'manager', 'partner', 'inspector']), 
  qualityValidation.filterQuality,
  validateRequest,
  qualityController.filterQuality
);

// Bulk Operations
router.post('/bulk-inspections', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.bulkInspections,
  validateRequest,
  qualityController.bulkCreateInspections
);

router.post('/bulk-tests', 
  authorizeRoles(['admin', 'manager']), 
  qualityValidation.bulkTests,
  validateRequest,
  qualityController.bulkCreateTests
);

export default router;
