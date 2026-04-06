import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types';
import { ApiKey } from '../models/ApiKey';

export const listApiKeys = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const keys = await ApiKey.find({ createdBy: req.user!._id }).sort({ createdAt: -1 });
    // Never return the actual key value after creation — mask it
    const masked = keys.map((k) => ({
      _id: k._id,
      name: k.name,
      keyPreview: `${k.key.slice(0, 8)}...${k.key.slice(-4)}`,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));
    res.json({ success: true, data: masked });
  } catch (error) {
    next(error);
  }
};

export const createApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body as { name?: string };

    if (!name?.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'API key name is required.' },
      });
      return;
    }

    const existing = await ApiKey.countDocuments({ createdBy: req.user!._id, isActive: true });
    if (existing >= 10) {
      res.status(400).json({
        success: false,
        error: { code: 'LIMIT_EXCEEDED', message: 'Maximum of 10 active API keys allowed.' },
      });
      return;
    }

    const apiKey = new ApiKey({
      name: name.trim(),
      createdBy: new mongoose.Types.ObjectId(req.user!._id.toString()),
    });

    await apiKey.save();

    // Return full key ONLY on creation
    res.status(201).json({
      success: true,
      data: {
        _id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key, // shown once
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const revokeApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = await ApiKey.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user!._id },
      { isActive: false },
      { new: true }
    );

    if (!key) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'API key not found.' },
      });
      return;
    }

    res.json({ success: true, data: { message: 'API key revoked.' } });
  } catch (error) {
    next(error);
  }
};
