import { Response } from 'express';
import { Certificate } from '../models/Certificate';
import { BatchJob } from '../models/BatchJob';
import { getWorkspaceMemberIds } from '../services/workspaceService';
import type { AuthenticatedRequest } from '../types';

export const getUsageStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      });
    }

    const memberIds = await getWorkspaceMemberIds(user);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [certificatesThisMonth, batchJobsThisMonth, totalCertificates] =
      await Promise.all([
        Certificate.countDocuments({
          createdBy: { $in: memberIds },
          createdAt: { $gte: startOfMonth },
        }),
        BatchJob.countDocuments({
          createdBy: { $in: memberIds },
          createdAt: { $gte: startOfMonth },
          status: 'completed',
        }),
        Certificate.countDocuments({
          createdBy: { $in: memberIds },
        }),
      ]);

    const storageUsedBytes = totalCertificates * 102400;

    res.json({
      success: true,
      data: {
        certificatesThisMonth,
        batchJobsThisMonth,
        storageUsedBytes,
        periodStart: startOfMonth.toISOString(),
        periodEnd: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch usage statistics',
      },
    });
  }
};
