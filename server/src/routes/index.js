import { Router } from 'express';
import rideRoutes from './ride.routes.js';
import rideRequestRoutes from './rideRequest.routes.js';
import notificationRoutes from './notification.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import vehicleRoutes from './vehicle.routes.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: 'ok',
            message: 'MoveMate API is healthy'
        }
    });
});

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Vehicle routes
router.use('/vehicles', vehicleRoutes);
// Ride routes
router.use('/rides', rideRoutes);
router.use('/ride-requests', rideRequestRoutes);
router.use('/notifications', notificationRoutes);

export default router;