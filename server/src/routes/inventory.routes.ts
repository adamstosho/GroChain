import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { inventoryController } from '../controllers/inventory.controller';
import { inventoryValidation } from '../validations/inventory.validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Inventory Overview & Analytics
router.get('/overview', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryController.getInventoryOverview
);

router.get('/stock-levels', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryController.getStockLevels
);

router.get('/alerts/low-stock', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryController.getLowStockAlerts
);

router.get('/alerts/expiring', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryController.getExpiringItems
);

// Inventory Items CRUD
router.get('/items', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  inventoryValidation.getItems,
  validateRequest,
  inventoryController.getInventoryItems
);

router.get('/items/:itemId', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  inventoryValidation.getItem,
  validateRequest,
  inventoryController.getInventoryItem
);

router.post('/items', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.createItem,
  validateRequest,
  inventoryController.createInventoryItem
);

router.put('/items/:itemId', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.updateItem,
  validateRequest,
  inventoryController.updateInventoryItem
);

router.delete('/items/:itemId', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.deleteItem,
  validateRequest,
  inventoryController.deleteInventoryItem
);

// Stock Management
router.patch('/items/:itemId/stock', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.updateStock,
  validateRequest,
  inventoryController.updateStockLevel
);

router.post('/items/:itemId/stock-adjustment', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.stockAdjustment,
  validateRequest,
  inventoryController.adjustStock
);

// Inventory Movements
router.get('/movements', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.getMovements,
  validateRequest,
  inventoryController.getInventoryMovements
);

router.post('/movements', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.createMovement,
  validateRequest,
  inventoryController.createInventoryMovement
);

// Categories Management
router.get('/categories', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  inventoryController.getInventoryCategories
);

router.post('/categories', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.createCategory,
  validateRequest,
  inventoryController.createInventoryCategory
);

router.put('/categories/:categoryId', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.updateCategory,
  validateRequest,
  inventoryController.updateInventoryCategory
);

router.delete('/categories/:categoryId', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.deleteCategory,
  validateRequest,
  inventoryController.deleteInventoryCategory
);

// Suppliers Management
router.get('/suppliers', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryController.getSuppliers
);

router.get('/suppliers/:supplierId', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.getSupplier,
  validateRequest,
  inventoryController.getSupplier
);

router.post('/suppliers', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.createSupplier,
  validateRequest,
  inventoryController.createSupplier
);

router.put('/suppliers/:supplierId', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.updateSupplier,
  validateRequest,
  inventoryController.updateSupplier
);

router.delete('/suppliers/:supplierId', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.deleteSupplier,
  validateRequest,
  inventoryController.deleteSupplier
);

// Warehouses Management
router.get('/warehouses', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryController.getWarehouses
);

router.get('/warehouses/:warehouseId', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.getWarehouse,
  validateRequest,
  inventoryController.getWarehouse
);

router.post('/warehouses', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.createWarehouse,
  validateRequest,
  inventoryController.createWarehouse
);

router.put('/warehouses/:warehouseId', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.updateWarehouse,
  validateRequest,
  inventoryController.updateWarehouse
);

router.delete('/warehouses/:warehouseId', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.deleteWarehouse,
  validateRequest,
  inventoryController.deleteWarehouse
);

// Reports & Export
router.get('/reports', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.getReports,
  validateRequest,
  inventoryController.getInventoryReports
);

router.post('/export', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  inventoryValidation.exportData,
  validateRequest,
  inventoryController.exportInventoryData
);

// Bulk Operations
router.post('/bulk-import', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.bulkImport,
  validateRequest,
  inventoryController.bulkImportItems
);

router.post('/bulk-update', 
  authorizeRoles(['admin', 'manager']), 
  inventoryValidation.bulkUpdate,
  validateRequest,
  inventoryController.bulkUpdateItems
);

// QR Code & Barcode
router.get('/items/:itemId/qr-code', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  inventoryValidation.getItem,
  validateRequest,
  inventoryController.generateQRCode
);

router.get('/items/:itemId/barcode', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  inventoryValidation.getItem,
  validateRequest,
  inventoryController.generateBarcode
);

// Search & Filter
router.get('/search', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  inventoryValidation.searchItems,
  validateRequest,
  inventoryController.searchInventoryItems
);

router.get('/filter', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  inventoryValidation.filterItems,
  validateRequest,
  inventoryController.filterInventoryItems
);

export default router;
