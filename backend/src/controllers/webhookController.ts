import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types';
import { Webhook } from '../models/Webhook';
import type { WebhookEvent } from '../models/Webhook';

const VALID_EVENTS: WebhookEvent[] = [
  'certificate.created',
  'certificate.pdf_generated',
  'batch.completed',
  'batch.failed',
];

export const listWebhooks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const webhooks = await Webhook.find({ createdBy: req.user!._id })
      .select('_id url events isActive createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: webhooks });
  } catch (error) {
    next(error);
  }
};

export const createWebhook = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { url, events } = req.body as { url?: string; events?: string[] };

    if (!url?.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'URL is required.' },
      });
      return;
    }

    try {
      new URL(url);
    } catch {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid URL format.' },
      });
      return;
    }

    const resolvedEvents: WebhookEvent[] =
      Array.isArray(events) && events.length > 0
        ? (events.filter((e) => VALID_EVENTS.includes(e as WebhookEvent)) as WebhookEvent[])
        : ['certificate.created'];

    const webhook = new Webhook({
      url: url.trim(),
      events: resolvedEvents,
      createdBy: new mongoose.Types.ObjectId(req.user!._id.toString()),
    });

    await webhook.save();
    res.status(201).json({
      success: true,
      data: {
        _id: webhook._id,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
        secret: webhook.secret,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWebhook = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const webhook = await Webhook.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user!._id,
    });

    if (!webhook) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Webhook not found.' },
      });
      return;
    }

    res.json({ success: true, data: { message: 'Webhook deleted.' } });
  } catch (error) {
    next(error);
  }
};
