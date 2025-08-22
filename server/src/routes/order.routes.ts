import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { orderController } from '../controllers/order.controller';
import { orderValidation } from '../validations/order.validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Order Overview & Analytics
router.get('/overview', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderController.getOrderOverview
);

router.get('/dashboard', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderController.getOrderDashboard
);

// Order Management CRUD
router.get('/', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.getOrders,
  validateRequest,
  orderController.getOrders
);

router.get('/:orderId', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.getOrder,
  validateRequest,
  orderController.getOrder
);

router.post('/', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.createOrder,
  validateRequest,
  orderController.createOrder
);

router.put('/:orderId', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.updateOrder,
  validateRequest,
  orderController.updateOrder
);

router.delete('/:orderId', 
  authorizeRoles(['admin', 'manager']), 
  orderValidation.deleteOrder,
  validateRequest,
  orderController.deleteOrder
);

// Order Status Management
router.patch('/:orderId/status', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.updateOrderStatus,
  validateRequest,
  orderController.updateOrderStatus
);

router.patch('/:orderId/confirm', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.confirmOrder,
  validateRequest,
  orderController.confirmOrder
);

router.patch('/:orderId/cancel', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.cancelOrder,
  validateRequest,
  orderController.cancelOrder
);

router.patch('/:orderId/refund', 
  authorizeRoles(['admin', 'manager']), 
  orderValidation.refundOrder,
  validateRequest,
  orderController.refundOrder
);

// Order Items Management
router.get('/:orderId/items', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.getOrderItems,
  validateRequest,
  orderController.getOrderItems
);

router.post('/:orderId/items', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.addOrderItem,
  validateRequest,
  orderController.addOrderItem
);

router.put('/:orderId/items/:itemId', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.updateOrderItem,
  validateRequest,
  orderController.updateOrderItem
);

router.delete('/:orderId/items/:itemId', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.removeOrderItem,
  validateRequest,
  orderController.removeOrderItem
);

// Order Fulfillment
router.post('/:orderId/fulfill', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.fulfillOrder,
  validateRequest,
  orderController.fulfillOrder
);

router.post('/:orderId/partial-fulfill', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.partialFulfillment,
  validateRequest,
  orderController.partialFulfillment
);

router.post('/:orderId/ship', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.shipOrder,
  validateRequest,
  orderController.shipOrder
);

router.post('/:orderId/deliver', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.deliverOrder,
  validateRequest,
  orderController.deliverOrder
);

// Order Payment Management
router.get('/:orderId/payment', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.getOrderPayment,
  validateRequest,
  orderController.getOrderPayment
);

router.post('/:orderId/payment', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.processPayment,
  validateRequest,
  orderController.processPayment
);

router.post('/:orderId/payment/refund', 
  authorizeRoles(['admin', 'manager']), 
  orderValidation.refundPayment,
  validateRequest,
  orderController.refundPayment
);

router.post('/:orderId/payment/partial-refund', 
  authorizeRoles(['admin', 'manager']), 
  orderValidation.partialRefund,
  validateRequest,
  orderController.partialRefund
);

// Order Shipping & Delivery
router.get('/:orderId/shipping', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.getOrderShipping,
  validateRequest,
  orderController.getOrderShipping
);

router.post('/:orderId/shipping', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.createShipping,
  validateRequest,
  orderController.createShipping
);

router.put('/:orderId/shipping/:shippingId', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.updateShipping,
  validateRequest,
  orderController.updateShipping
);

router.post('/:orderId/shipping/:shippingId/track', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.trackShipping,
  validateRequest,
  orderController.trackShipping
);

// Order Returns & Exchanges
router.post('/:orderId/return', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.createReturn,
  validateRequest,
  orderController.createReturn
);

router.get('/:orderId/returns', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.getOrderReturns,
  validateRequest,
  orderController.getOrderReturns
);

router.patch('/:orderId/returns/:returnId/approve', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.approveReturn,
  validateRequest,
  orderController.approveReturn
);

router.patch('/:orderId/returns/:returnId/reject', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer']), 
  orderValidation.rejectReturn,
  validateRequest,
  orderController.rejectReturn
);

// Order Reviews & Ratings
router.get('/:orderId/reviews', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.getOrderReviews,
  validateRequest,
  orderController.getOrderReviews
);

router.post('/:orderId/reviews', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.createReview,
  validateRequest,
  orderController.createReview
);

router.put('/:orderId/reviews/:reviewId', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.updateReview,
  validateRequest,
  orderController.updateReview
);

router.delete('/:orderId/reviews/:reviewId', 
  authorizeRoles(['admin', 'manager', 'partner', 'buyer']), 
  orderValidation.deleteReview,
  validateRequest,
  orderController.deleteReview
);

// Order Notifications
router.get('/:orderId/notifications', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.getOrderNotifications,
  validateRequest,
  orderController.getOrderNotifications
);

router.post('/:orderId/notifications', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.sendNotification,
  validateRequest,
  orderController.sendOrderNotification
);

// Order Analytics & Reports
router.get('/analytics/overall', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderController.getOverallOrderAnalytics
);

router.get('/analytics/by-status', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderController.getOrderAnalyticsByStatus
);

router.get('/analytics/by-category', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderController.getOrderAnalyticsByCategory
);

router.get('/analytics/trends', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderController.getOrderTrends
);

router.get('/analytics/revenue', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderController.getOrderRevenueAnalytics
);

// Order Reports & Export
router.get('/reports/summary', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.getOrderReports,
  validateRequest,
  orderController.getOrderSummaryReports
);

router.get('/reports/detailed', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.getDetailedReports,
  validateRequest,
  orderController.getDetailedOrderReports
);

router.post('/export', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.exportOrders,
  validateRequest,
  orderController.exportOrders
);

// Bulk Operations
router.post('/bulk-create', 
  authorizeRoles(['admin', 'manager']), 
  orderValidation.bulkCreateOrders,
  validateRequest,
  orderController.bulkCreateOrders
);

router.post('/bulk-update', 
  authorizeRoles(['admin', 'manager']), 
  orderValidation.bulkUpdateOrders,
  validateRequest,
  orderController.bulkUpdateOrders
);

router.post('/bulk-status-update', 
  authorizeRoles(['admin', 'manager']), 
  orderValidation.bulkStatusUpdate,
  validateRequest,
  orderController.bulkUpdateOrderStatus
);

// Order Search & Filter
router.get('/search', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.searchOrders,
  validateRequest,
  orderController.searchOrders
);

router.get('/filter', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer']), 
  orderValidation.filterOrders,
  validateRequest,
  orderController.filterOrders
);

// Order Templates & Presets
router.get('/templates', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderController.getOrderTemplates
);

router.get('/templates/:templateId', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.getOrderTemplate,
  validateRequest,
  orderController.getOrderTemplate
);

router.post('/templates', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.createOrderTemplate,
  validateRequest,
  orderController.createOrderTemplate
);

router.put('/templates/:templateId', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.updateOrderTemplate,
  validateRequest,
  orderController.updateOrderTemplate
);

router.delete('/templates/:templateId', 
  authorizeRoles(['admin', 'manager', 'partner']), 
  orderValidation.deleteOrderTemplate,
  validateRequest,
  orderController.deleteOrderTemplate
);

export default router;
