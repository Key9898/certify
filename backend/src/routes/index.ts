import { Router } from 'express';
import authRoutes from './authRoutes';
import templateRoutes from './templateRoutes';
import certificateRoutes from './certificateRoutes';
import uploadRoutes from './uploadRoutes';
import userRoutes from './userRoutes';
import batchRoutes from './batchRoutes';
import verifyRoutes from './verifyRoutes';
import apiKeyRoutes from './apiKeyRoutes';
import v1Routes from './v1Routes';
import webhookRoutes from './webhookRoutes';
import analyticsRoutes from './analyticsRoutes';
import integrationRoutes from './integrationRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/templates', templateRoutes);
router.use('/certificates', certificateRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', userRoutes);
router.use('/batch', batchRoutes);
router.use('/verify', verifyRoutes);
router.use('/keys', apiKeyRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/v1', v1Routes);
router.use('/integrations', integrationRoutes);

export default router;
