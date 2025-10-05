import express from 'express'
const router = express.Router();

import healthRoutes from './health.js'
import ssrRoutes from './ssr.js'


router.use('/health', healthRoutes);

// Catch all route for the SSR
router.use('/', ssrRoutes);

export default router;
