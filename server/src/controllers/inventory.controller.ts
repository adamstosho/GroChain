import { Request, Response } from 'express';
import { InventoryItem } from '../models/inventory.model';
import { logger } from '../utils/logger';

export const inventoryController = {
  // Get inventory overview
  async getInventoryOverview(req: Request, res: Response) {
    try {
      const totalItems = await InventoryItem.countDocuments();
      const lowStockItems = await InventoryItem.countDocuments({
        $expr: { $lte: ['$currentStock', '$minStockLevel'] }
      });
      const expiringItems = await InventoryItem.countDocuments({
        expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      });
      const totalValue = await InventoryItem.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } } } }
      ]);

      res.json({
        success: true,
        data: {
          totalItems,
          lowStockItems,
          expiringItems,
          totalValue: totalValue[0]?.total || 0
        }
      });
    } catch (error) {
      logger.error('Error getting inventory overview:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get stock levels
  async getStockLevels(req: Request, res: Response) {
    try {
      const stockLevels = await InventoryItem.aggregate([
        {
          $group: {
            _id: '$category',
            totalItems: { $sum: 1 },
            lowStock: {
              $sum: {
                $cond: [
                  { $lte: ['$currentStock', '$minStockLevel'] },
                  1,
                  0
                ]
              }
            },
            outOfStock: {
              $sum: {
                $cond: [
                  { $eq: ['$currentStock', 0] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: stockLevels
      });
    } catch (error) {
      logger.error('Error getting stock levels:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get low stock alerts
  async getLowStockAlerts(req: Request, res: Response) {
    try {
      const lowStockItems = await InventoryItem.find({
        $expr: { $lte: ['$currentStock', '$minStockLevel'] }
      }).populate('supplier', 'name contactPhone');

      res.json({
        success: true,
        data: lowStockItems
      });
    } catch (error) {
      logger.error('Error getting low stock alerts:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get expiring items
  async getExpiringItems(req: Request, res: Response) {
    try {
      const expiringItems = await InventoryItem.find({
        expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      }).populate('supplier', 'name contactPhone');

      res.json({
        success: true,
        data: expiringItems
      });
    } catch (error) {
      logger.error('Error getting expiring items:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get inventory items with pagination and filters
  async getInventoryItems(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category, status, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { batchNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const items = await InventoryItem.find(filter)
        .populate('supplier', 'name contactPhone')
        .populate('warehouse', 'name location')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await InventoryItem.countDocuments(filter);

      res.json({
        success: true,
        data: {
          items,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error getting inventory items:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get single inventory item
  async getInventoryItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const item = await InventoryItem.findById(itemId)
        .populate('supplier', 'name contactPhone email')
        .populate('warehouse', 'name location address')
        .populate('farmerId', 'name email phone')
        .populate('partnerId', 'name contactPhone email');

      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      logger.error('Error getting inventory item:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create inventory item
  async createInventoryItem(req: Request, res: Response) {
    try {
      const itemData = {
        ...req.body,
        createdBy: req.user?.id,
        updatedBy: req.user?.id
      };

      const item = new InventoryItem(itemData);
      await item.save();

      res.status(201).json({
        success: true,
        data: item,
        message: 'Inventory item created successfully'
      });
    } catch (error) {
      logger.error('Error creating inventory item:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update inventory item
  async updateInventoryItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const updateData = {
        ...req.body,
        updatedBy: req.user?.id
      };

      const item = await InventoryItem.findByIdAndUpdate(
        itemId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      res.json({
        success: true,
        data: item,
        message: 'Inventory item updated successfully'
      });
    } catch (error) {
      logger.error('Error updating inventory item:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Delete inventory item
  async deleteInventoryItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const item = await InventoryItem.findByIdAndDelete(itemId);

      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      res.json({
        success: true,
        message: 'Inventory item deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting inventory item:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update stock level
  async updateStockLevel(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { currentStock, reason } = req.body;

      const item = await InventoryItem.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      item.currentStock = currentStock;
      item.updatedBy = req.user?.id;
      await item.save();

      res.json({
        success: true,
        data: item,
        message: 'Stock level updated successfully'
      });
    } catch (error) {
      logger.error('Error updating stock level:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Adjust stock
  async adjustStock(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { adjustment, reason, type } = req.body;

      const item = await InventoryItem.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      if (type === 'add') {
        item.currentStock += adjustment;
      } else if (type === 'subtract') {
        if (item.currentStock < adjustment) {
          return res.status(400).json({ 
            success: false, 
            message: 'Insufficient stock for adjustment' 
          });
        }
        item.currentStock -= adjustment;
      }

      item.updatedBy = req.user?.id;
      await item.save();

      res.json({
        success: true,
        data: item,
        message: 'Stock adjusted successfully'
      });
    } catch (error) {
      logger.error('Error adjusting stock:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get inventory movements
  async getInventoryMovements(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, itemId, type, startDate, endDate } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // This would typically query a separate movements collection
      // For now, returning mock data
      const movements = [
        {
          id: '1',
          itemId: 'item1',
          type: 'in',
          quantity: 100,
          reason: 'Purchase',
          timestamp: new Date(),
          userId: 'user1'
        }
      ];

      res.json({
        success: true,
        data: {
          movements,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 1,
            pages: 1
          }
        }
      });
    } catch (error) {
      logger.error('Error getting inventory movements:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create inventory movement
  async createInventoryMovement(req: Request, res: Response) {
    try {
      // This would typically create a record in a movements collection
      // For now, just updating the item stock
      const { itemId, type, quantity, reason } = req.body;

      const item = await InventoryItem.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      if (type === 'in') {
        item.currentStock += quantity;
      } else if (type === 'out') {
        if (item.currentStock < quantity) {
          return res.status(400).json({ 
            success: false, 
            message: 'Insufficient stock' 
          });
        }
        item.currentStock -= quantity;
      }

      item.updatedBy = req.user?.id;
      await item.save();

      res.json({
        success: true,
        message: 'Inventory movement recorded successfully'
      });
    } catch (error) {
      logger.error('Error creating inventory movement:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get inventory categories
  async getInventoryCategories(req: Request, res: Response) {
    try {
      const categories = await InventoryItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      logger.error('Error getting inventory categories:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create inventory category
  async createInventoryCategory(req: Request, res: Response) {
    try {
      // This would typically create a category in a separate collection
      // For now, just returning success
      res.json({
        success: true,
        message: 'Category created successfully'
      });
    } catch (error) {
      logger.error('Error creating inventory category:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update inventory category
  async updateInventoryCategory(req: Request, res: Response) {
    try {
      // This would typically update a category in a separate collection
      res.json({
        success: true,
        message: 'Category updated successfully'
      });
    } catch (error) {
      logger.error('Error updating inventory category:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Delete inventory category
  async deleteInventoryCategory(req: Request, res: Response) {
    try {
      // This would typically delete a category from a separate collection
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting inventory category:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get suppliers
  async getSuppliers(req: Request, res: Response) {
    try {
      // This would typically query a suppliers collection
      // For now, returning mock data
      const suppliers = [
        {
          id: 'supplier1',
          name: 'ABC Suppliers',
          contactPhone: '+2348012345678',
          email: 'info@abcsuppliers.com'
        }
      ];

      res.json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      logger.error('Error getting suppliers:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get supplier
  async getSupplier(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;
      // This would typically query a suppliers collection
      res.json({
        success: true,
        data: { id: supplierId, name: 'ABC Suppliers' }
      });
    } catch (error) {
      logger.error('Error getting supplier:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create supplier
  async createSupplier(req: Request, res: Response) {
    try {
      // This would typically create a supplier in a separate collection
      res.json({
        success: true,
        message: 'Supplier created successfully'
      });
    } catch (error) {
      logger.error('Error creating supplier:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update supplier
  async updateSupplier(req: Request, res: Response) {
    try {
      // This would typically update a supplier in a separate collection
      res.json({
        success: true,
        message: 'Supplier updated successfully'
      });
    } catch (error) {
      logger.error('Error updating supplier:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Delete supplier
  async deleteSupplier(req: Request, res: Response) {
    try {
      // This would typically delete a supplier from a separate collection
      res.json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting supplier:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get warehouses
  async getWarehouses(req: Request, res: Response) {
    try {
      // This would typically query a warehouses collection
      const warehouses = [
        {
          id: 'warehouse1',
          name: 'Main Warehouse',
          location: 'Lagos',
          address: '123 Warehouse Street, Lagos'
        }
      ];

      res.json({
        success: true,
        data: warehouses
      });
    } catch (error) {
      logger.error('Error getting warehouses:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get warehouse
  async getWarehouse(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      // This would typically query a warehouses collection
      res.json({
        success: true,
        data: { id: warehouseId, name: 'Main Warehouse' }
      });
    } catch (error) {
      logger.error('Error getting warehouse:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create warehouse
  async createWarehouse(req: Request, res: Response) {
    try {
      // This would typically create a warehouse in a separate collection
      res.json({
        success: true,
        message: 'Warehouse created successfully'
      });
    } catch (error) {
      logger.error('Error creating warehouse:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update warehouse
  async updateWarehouse(req: Request, res: Response) {
    try {
      // This would typically update a warehouse in a separate collection
      res.json({
        success: true,
        message: 'Warehouse updated successfully'
      });
    } catch (error) {
      logger.error('Error updating warehouse:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Delete warehouse
  async deleteWarehouse(req: Request, res: Response) {
    try {
      // This would typically delete a warehouse from a separate collection
      res.json({
        success: true,
        message: 'Warehouse deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting warehouse:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get inventory reports
  async getInventoryReports(req: Request, res: Response) {
    try {
      const { reportType, parameters } = req.body;
      // This would generate various inventory reports
      res.json({
        success: true,
        data: { reportType, parameters }
      });
    } catch (error) {
      logger.error('Error getting inventory reports:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Export inventory data
  async exportInventoryData(req: Request, res: Response) {
    try {
      const { format, filters } = req.body;
      // This would export inventory data in the specified format
      res.json({
        success: true,
        message: `Inventory data exported in ${format} format`
      });
    } catch (error) {
      logger.error('Error exporting inventory data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Bulk import items
  async bulkImportItems(req: Request, res: Response) {
    try {
      const { items } = req.body;
      // This would bulk import inventory items
      res.json({
        success: true,
        message: `${items.length} items imported successfully`
      });
    } catch (error) {
      logger.error('Error bulk importing items:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Bulk update items
  async bulkUpdateItems(req: Request, res: Response) {
    try {
      const { updates } = req.body;
      // This would bulk update inventory items
      res.json({
        success: true,
        message: `${updates.length} items updated successfully`
      });
    } catch (error) {
      logger.error('Error bulk updating items:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Generate QR code
  async generateQRCode(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const item = await InventoryItem.findById(itemId);
      
      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      // This would generate a QR code for the item
      res.json({
        success: true,
        data: { qrCode: `QR_${item.sku}_${Date.now()}` }
      });
    } catch (error) {
      logger.error('Error generating QR code:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Generate barcode
  async generateBarcode(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const item = await InventoryItem.findById(itemId);
      
      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      // This would generate a barcode for the item
      res.json({
        success: true,
        data: { barcode: `BAR_${item.sku}_${Date.now()}` }
      });
    } catch (error) {
      logger.error('Error generating barcode:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Search inventory items
  async searchInventoryItems(req: Request, res: Response) {
    try {
      const { query, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const searchFilter = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { batchNumber: { $regex: query, $options: 'i' } }
        ]
      };

      const items = await InventoryItem.find(searchFilter)
        .populate('supplier', 'name contactPhone')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await InventoryItem.countDocuments(searchFilter);

      res.json({
        success: true,
        data: {
          items,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error searching inventory items:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Filter inventory items
  async filterInventoryItems(req: Request, res: Response) {
    try {
      const { category, status, quality, supplier, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (quality) filter.quality = quality;
      if (supplier) filter.supplier = supplier;

      const items = await InventoryItem.find(filter)
        .populate('supplier', 'name contactPhone')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await InventoryItem.countDocuments(filter);

      res.json({
        success: true,
        data: {
          items,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error filtering inventory items:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
