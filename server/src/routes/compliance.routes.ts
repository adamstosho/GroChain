import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  getComplianceReports,
  generateComplianceReport,
  getAuditTrails,
  getComplianceMetrics,
  getRegulatoryRequirements,
  exportComplianceData
} from '../controllers/compliance.controller';
import Joi from 'joi';

const router = Router();

// Compliance Reports
router.get(
  '/reports',
  authenticateJWT,
  authorizeRoles('admin', 'partner'),
  getComplianceReports
);

router.post(
  '/generate-report',
  authenticateJWT,
  authorizeRoles('admin'),
  validateRequest(Joi.object({
    type: Joi.string().valid('regulatory', 'financial', 'environmental', 'quality').default('regulatory'),
    dateRange: Joi.string().valid('monthly', 'quarterly', 'yearly').default('monthly')
  })),
  generateComplianceReport
);

// Audit Trails
router.get(
  '/audit-trails',
  authenticateJWT,
  authorizeRoles('admin', 'partner'),
  getAuditTrails
);

// Compliance Metrics
router.get(
  '/metrics',
  authenticateJWT,
  authorizeRoles('admin', 'partner'),
  getComplianceMetrics
);

// Regulatory Requirements
router.get(
  '/regulatory-requirements',
  authenticateJWT,
  authorizeRoles('admin', 'partner'),
  getRegulatoryRequirements
);

// Export Compliance Data
router.get(
  '/export',
  authenticateJWT,
  authorizeRoles('admin'),
  validateRequest(Joi.object({
    format: Joi.string().valid('pdf', 'excel', 'csv').default('pdf')
  }), 'query'),
  exportComplianceData
);

export default router;
