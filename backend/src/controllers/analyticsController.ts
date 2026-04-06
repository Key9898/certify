import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { Certificate } from '../models/Certificate';
import { BatchJob } from '../models/BatchJob';
import { Template } from '../models/Template';
import { getWorkspaceMemberIds } from '../services/workspaceService';

export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workspaceUserIds = await getWorkspaceMemberIds(req.user!);

    const [
      totalCertificates,
      certificatesThisMonth,
      batchJobsTotal,
      batchJobsCompleted,
      topTemplates,
      certificatesByMonth,
    ] = await Promise.all([
      Certificate.countDocuments({ createdBy: { $in: workspaceUserIds } }),

      Certificate.countDocuments({
        createdBy: { $in: workspaceUserIds },
        createdAt: { $gte: new Date(new Date().setDate(1)) },
      }),

      BatchJob.countDocuments({ createdBy: { $in: workspaceUserIds } }),

      BatchJob.countDocuments({ createdBy: { $in: workspaceUserIds }, status: 'completed' }),

      Certificate.aggregate([
        { $match: { createdBy: { $in: workspaceUserIds } } },
        { $group: { _id: '$templateId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'templates',
            localField: '_id',
            foreignField: '_id',
            as: 'template',
          },
        },
        { $unwind: { path: '$template', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            templateId: '$_id',
            templateName: { $ifNull: ['$template.name', 'Unknown'] },
            count: 1,
          },
        },
      ]),

      Certificate.aggregate([
        { $match: { createdBy: { $in: workspaceUserIds } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            count: 1,
          },
        },
      ]),
    ]);

    // Count custom templates
    const customTemplates = await Template.countDocuments({
      createdBy: { $in: workspaceUserIds },
      isPublic: false,
    });

    res.json({
      success: true,
      data: {
        certificates: {
          total: totalCertificates,
          thisMonth: certificatesThisMonth,
          byMonth: certificatesByMonth.reverse(),
        },
        batch: {
          total: batchJobsTotal,
          completed: batchJobsCompleted,
          successRate: batchJobsTotal > 0 ? Math.round((batchJobsCompleted / batchJobsTotal) * 100) : 0,
        },
        templates: {
          customCount: customTemplates,
          topUsed: topTemplates,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
