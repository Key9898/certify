import { Request, Response, NextFunction } from 'express';
import { Certificate } from '../models/Certificate';
import { Organization } from '../models/Organization';

export const verifyCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const certificateId = req.params.certificateId?.trim().toUpperCase();

    if (!certificateId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Certificate ID is required.',
        },
      });
      return;
    }

    const certificate = await Certificate.findOne({ certificateId })
      .populate('templateId', 'name category')
      .populate('createdBy', 'name organizationId');

    if (!certificate) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Certificate not found.' },
      });
      return;
    }

    if (certificate.status === 'revoked') {
      res.status(410).json({
        success: false,
        error: {
          code: 'REVOKED',
          message: 'This certificate has been revoked by the issuer.',
        },
      });
      return;
    }

    const createdBy =
      certificate.createdBy &&
      typeof certificate.createdBy === 'object' &&
      '_id' in certificate.createdBy
        ? certificate.createdBy
        : null;

    let organization = null;
    if (
      createdBy &&
      'organizationId' in createdBy &&
      createdBy.organizationId
    ) {
      organization = await Organization.findById(
        createdBy.organizationId
      ).select('name slug whiteLabel');
    }

    res.json({
      success: true,
      data: {
        certificateId: certificate.certificateId,
        recipientName: certificate.recipientName,
        certificateTitle: certificate.certificateTitle,
        issuerName: certificate.issuerName,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        description: certificate.description,
        pdfUrl: certificate.pdfUrl,
        template: certificate.templateId,
        issuedAt: certificate.createdAt,
        organization: organization
          ? {
              _id: organization._id.toString(),
              name: organization.name,
              slug: organization.slug,
              whiteLabel: {
                brandName: organization.whiteLabel.brandName,
                logoUrl: organization.whiteLabel.logoUrl,
                primaryColor: organization.whiteLabel.primaryColor,
                secondaryColor: organization.whiteLabel.secondaryColor,
                supportEmail: organization.whiteLabel.supportEmail,
                customDomain: organization.whiteLabel.customDomain,
                hidePoweredBy: organization.whiteLabel.hidePoweredBy,
              },
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};
