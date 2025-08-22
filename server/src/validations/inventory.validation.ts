import Joi from 'joi';

export const inventoryValidation = {
  // Get inventory items validation
  getItems: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      category: Joi.string().valid(
        'grains', 'vegetables', 'fruits', 'tubers', 'legumes', 
        'spices', 'herbs', 'livestock', 'dairy', 'poultry', 
        'fish', 'equipment', 'supplies', 'other'
      ),
      status: Joi.string().valid('active', 'inactive', 'discontinued', 'recalled'),
      search: Joi.string().min(1).max(100)
    });

    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Get single inventory item validation
  getItem: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      itemId: Joi.string().required().min(24).max(24)
    });

    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Create inventory item validation
  createItem: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      name: Joi.string().required().min(2).max(100),
      description: Joi.string().required().min(10).max(500),
      category: Joi.string().required().valid(
        'grains', 'vegetables', 'fruits', 'tubers', 'legumes', 
        'spices', 'herbs', 'livestock', 'dairy', 'poultry', 
        'fish', 'equipment', 'supplies', 'other'
      ),
      subcategory: Joi.string().required().min(2).max(50),
      unit: Joi.string().required().valid(
        'kg', 'g', 'ton', 'lb', 'piece', 'bundle', 'bag', 
        'sack', 'carton', 'crate', 'bottle', 'liter', 'ml', 
        'dozen', 'pair', 'set', 'other'
      ),
      unitPrice: Joi.number().required().min(0),
      costPrice: Joi.number().required().min(0),
      sellingPrice: Joi.number().required().min(0),
      currentStock: Joi.number().required().min(0),
      minStockLevel: Joi.number().required().min(0),
      maxStockLevel: Joi.number().required().min(0),
      reorderPoint: Joi.number().required().min(0),
      supplier: Joi.string().required().min(24).max(24),
      warehouse: Joi.string().required().min(24).max(24),
      location: Joi.string().required().min(2).max(100),
      expiryDate: Joi.date().optional(),
      harvestDate: Joi.date().optional(),
      quality: Joi.string().valid('premium', 'standard', 'basic', 'rejected').default('standard'),
      grade: Joi.string().valid('A', 'B', 'C', 'D').default('B'),
      moistureContent: Joi.number().min(0).max(100).optional(),
      proteinContent: Joi.number().min(0).max(100).optional(),
      organic: Joi.boolean().default(false),
      certified: Joi.boolean().default(false),
      certificationBody: Joi.string().optional().max(100),
      certificationExpiry: Joi.date().optional(),
      countryOfOrigin: Joi.string().required().min(2).max(50),
      region: Joi.string().required().min(2).max(50),
      farmId: Joi.string().optional().min(24).max(24),
      farmerId: Joi.string().optional().min(24).max(24),
      partnerId: Joi.string().optional().min(24).max(24),
      tags: Joi.array().items(Joi.string().max(50)).optional(),
      images: Joi.array().items(Joi.string().uri()).optional(),
      documents: Joi.array().items(Joi.string().uri()).optional(),
      notes: Joi.string().optional().max(500)
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Update inventory item validation
  updateItem: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      itemId: Joi.string().required().min(24).max(24),
      name: Joi.string().optional().min(2).max(100),
      description: Joi.string().optional().min(10).max(500),
      category: Joi.string().optional().valid(
        'grains', 'vegetables', 'fruits', 'tubers', 'legumes', 
        'spices', 'herbs', 'livestock', 'dairy', 'poultry', 
        'fish', 'equipment', 'supplies', 'other'
      ),
      subcategory: Joi.string().optional().min(2).max(50),
      unit: Joi.string().optional().valid(
        'kg', 'g', 'ton', 'lb', 'piece', 'bundle', 'bag', 
        'sack', 'carton', 'crate', 'bottle', 'liter', 'ml', 
        'dozen', 'pair', 'set', 'other'
      ),
      unitPrice: Joi.number().optional().min(0),
      costPrice: Joi.number().optional().min(0),
      sellingPrice: Joi.number().optional().min(0),
      currentStock: Joi.number().optional().min(0),
      minStockLevel: Joi.number().optional().min(0),
      maxStockLevel: Joi.number().optional().min(0),
      reorderPoint: Joi.number().optional().min(0),
      supplier: Joi.string().optional().min(24).max(24),
      warehouse: Joi.string().optional().min(24).max(24),
      location: Joi.string().optional().min(2).max(100),
      expiryDate: Joi.date().optional(),
      harvestDate: Joi.date().optional(),
      quality: Joi.string().valid('premium', 'standard', 'basic', 'rejected').optional(),
      grade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
      moistureContent: Joi.number().min(0).max(100).optional(),
      proteinContent: Joi.number().min(0).max(100).optional(),
      organic: Joi.boolean().optional(),
      certified: Joi.boolean().optional(),
      certificationBody: Joi.string().optional().max(100),
      certificationExpiry: Joi.date().optional(),
      countryOfOrigin: Joi.string().optional().min(2).max(50),
      region: Joi.string().optional().min(2).max(50),
      farmId: Joi.string().optional().min(24).max(24),
      farmerId: Joi.string().optional().min(24).max(24),
      partnerId: Joi.string().optional().min(24).max(24),
      status: Joi.string().valid('active', 'inactive', 'discontinued', 'recalled').optional(),
      tags: Joi.array().items(Joi.string().max(50)).optional(),
      images: Joi.array().items(Joi.string().uri()).optional(),
      documents: Joi.array().items(Joi.string().uri()).optional(),
      notes: Joi.string().optional().max(500)
    });

    const { error } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Delete inventory item validation
  deleteItem: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      itemId: Joi.string().required().min(24).max(24)
    });

    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Update stock level validation
  updateStock: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      itemId: Joi.string().required().min(24).max(24),
      currentStock: Joi.number().required().min(0),
      reason: Joi.string().required().min(5).max(200)
    });

    const { error } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Stock adjustment validation
  stockAdjustment: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      itemId: Joi.string().required().min(24).max(24),
      adjustment: Joi.number().required().min(0),
      reason: Joi.string().required().min(5).max(200),
      type: Joi.string().required().valid('add', 'subtract')
    });

    const { error } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Get inventory movements validation
  getMovements: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      itemId: Joi.string().optional().min(24).max(24),
      type: Joi.string().valid('in', 'out').optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional()
    });

    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Create inventory movement validation
  createMovement: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      itemId: Joi.string().required().min(24).max(24),
      type: Joi.string().required().valid('in', 'out'),
      quantity: Joi.number().required().min(0.01),
      reason: Joi.string().required().min(5).max(200)
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Create inventory category validation
  createCategory: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      name: Joi.string().required().min(2).max(50),
      description: Joi.string().optional().max(200),
      parentCategory: Joi.string().optional().min(24).max(24)
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Update inventory category validation
  updateCategory: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      categoryId: Joi.string().required().min(24).max(24),
      name: Joi.string().optional().min(2).max(50),
      description: Joi.string().optional().max(200),
      parentCategory: Joi.string().optional().min(24).max(24)
    });

    const { error } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Delete inventory category validation
  deleteCategory: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      categoryId: Joi.string().required().min(24).max(24)
    });

    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Get supplier validation
  getSupplier: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      supplierId: Joi.string().required().min(24).max(24)
    });

    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Create supplier validation
  createSupplier: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      name: Joi.string().required().min(2).max(100),
      contactPhone: Joi.string().required().min(10).max(15),
      email: Joi.string().email().optional(),
      address: Joi.string().optional().max(200),
      contactPerson: Joi.string().optional().max(100)
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Update supplier validation
  updateSupplier: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      supplierId: Joi.string().required().min(24).max(24),
      name: Joi.string().optional().min(2).max(100),
      contactPhone: Joi.string().optional().min(10).max(15),
      email: Joi.string().email().optional(),
      address: Joi.string().optional().max(200),
      contactPerson: Joi.string().optional().max(100)
    });

    const { error } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Delete supplier validation
  deleteSupplier: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      supplierId: Joi.string().required().min(24).max(24)
    });

    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Get warehouse validation
  getWarehouse: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      warehouseId: Joi.string().required().min(24).max(24)
    });

    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Create warehouse validation
  createWarehouse: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      name: Joi.string().required().min(2).max(100),
      location: Joi.string().required().min(2).max(100),
      address: Joi.string().required().min(10).max(200),
      capacity: Joi.number().optional().min(0),
      manager: Joi.string().optional().min(24).max(24)
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Update warehouse validation
  updateWarehouse: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      warehouseId: Joi.string().required().min(24).max(24),
      name: Joi.string().optional().min(2).max(100),
      location: Joi.string().optional().min(2).max(100),
      address: Joi.string().optional().min(10).max(200),
      capacity: Joi.number().optional().min(0),
      manager: Joi.string().optional().min(24).max(24)
    });

    const { error } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Delete warehouse validation
  deleteWarehouse: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      warehouseId: Joi.string().required().min(24).max(24)
    });

    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Get inventory reports validation
  getReports: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      reportType: Joi.string().required().valid(
        'stock-levels', 'movements', 'expiry', 'value', 'performance'
      ),
      parameters: Joi.object().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Export inventory data validation
  exportData: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      format: Joi.string().required().valid('csv', 'excel', 'pdf', 'json'),
      filters: Joi.object().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Bulk import items validation
  bulkImport: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      items: Joi.array().items(Joi.object({
        name: Joi.string().required().min(2).max(100),
        category: Joi.string().required(),
        unit: Joi.string().required(),
        unitPrice: Joi.number().required().min(0)
      })).min(1).max(1000).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  },

  // Bulk update items validation
  bulkUpdate: (req: any, res: any, next: any) => {
    const schema = Joi.object({
      updates: Joi.array().items(Joi.object({
        itemId: Joi.string().required().min(24).max(24),
        updates: Joi.object().required()
      })).min(1).max(100).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  }
};
