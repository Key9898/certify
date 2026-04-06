import crypto from 'crypto';
import { Webhook, WebhookEvent } from '../models/Webhook';
import { isSafeUrl } from '../utils/ssrfProtection';
import { logger, logSecurityEvent } from '../utils/logger';

const signPayload = (secret: string, payload: string): string => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

export const triggerWebhooks = async (
  userId: string,
  event: WebhookEvent,
  data: unknown
): Promise<void> => {
  const webhooks = await Webhook.find({
    createdBy: userId,
    isActive: true,
    events: event,
  });

  if (webhooks.length === 0) return;

  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });

  await Promise.allSettled(
    webhooks.map(async (webhook) => {
      const urlCheck = await isSafeUrl(webhook.url);
      if (!urlCheck.safe) {
        logSecurityEvent('Webhook URL blocked', {
          webhookId: webhook._id.toString(),
          reason: urlCheck.reason,
        });
        return;
      }

      const signature = signPayload(webhook.secret, payload);
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Certify-Event': event,
            'X-Certify-Signature': `sha256=${signature}`,
          },
          body: payload,
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
          logger.warn('Webhook', 'Delivery failed', {
            webhookId: webhook._id.toString(),
            status: response.status,
          });
        }
      } catch (err) {
        logger.error('Webhook', 'Delivery error', err);
      }
    })
  );
};
