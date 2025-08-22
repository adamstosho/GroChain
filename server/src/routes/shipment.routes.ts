import { Router } from 'express';
import { createShipment } from '../controllers/shipment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles('aggregator', 'partner', 'admin'), createShipment);

// NEW ENDPOINTS - Shipment Advanced Features
router.get(
  '/routes',
  authenticateJWT,
  authorizeRoles('aggregator', 'partner', 'admin'),
  (req, res) => {
    // TODO: Implement shipment routes controller
    res.json({
      success: true,
      data: [
        {
          id: "route_001",
          shipments: ["ship_001", "ship_002"],
          totalDistance: 150.5,
          totalCost: 25000,
          estimatedTime: 4.5,
          waypoints: [
            {
              name: "Farm A",
              coordinates: { lat: 7.0, lng: 3.0 },
              estimatedTime: "10:00 AM",
              status: 'pending'
            },
            {
              name: "Market B",
              coordinates: { lat: 6.5, lng: 3.3 },
              estimatedTime: "2:30 PM",
              status: 'pending'
            }
          ],
          driver: {
            name: "Emeka Okafor",
            phone: "+2348012345678",
            vehicle: "Toyota Hiace",
            plateNumber: "ABC123XY"
          },
          status: 'planned'
        }
      ]
    });
  }
);

router.get(
  '/delivery-zones',
  authenticateJWT,
  authorizeRoles('aggregator', 'partner', 'admin'),
  (req, res) => {
    // TODO: Implement delivery zones controller
    res.json({
      success: true,
      data: [
        {
          id: "zone_001",
          name: "Lagos Central",
          coordinates: [
            { lat: 6.5, lng: 3.3 },
            { lat: 6.6, lng: 3.3 },
            { lat: 6.6, lng: 3.4 },
            { lat: 6.5, lng: 3.4 }
          ],
          estimatedDeliveryTime: 2,
          deliveryFee: 1500,
          isActive: true
        }
      ]
    });
  }
);

export default router;
