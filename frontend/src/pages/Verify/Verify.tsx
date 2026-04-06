import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Download, ArrowLeft, Shield } from 'lucide-react';
import { get } from '@/utils/api';

interface VerifyData {
  certificateId: string;
  recipientName: string;
  certificateTitle: string;
  issuerName: string;
  issueDate: string;
  expiryDate?: string;
  description?: string;
  pdfUrl?: string;
  issuedAt: string;
  template?: { name: string; category: string };
  organization?: {
    _id: string;
    name: string;
    slug: string;
    whiteLabel: {
      brandName?: string;
      logoUrl?: string;
      primaryColor: string;
      secondaryColor: string;
      supportEmail?: string;
      customDomain?: string;
      hidePoweredBy: boolean;
    };
  } | null;
}

export const Verify: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [data, setData] = useState<VerifyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const brandName = data?.organization?.whiteLabel.brandName || data?.organization?.name || 'Certify';
  const showPoweredBy = !data?.organization?.whiteLabel.hidePoweredBy;

  useEffect(() => {
    if (!certificateId) return;
    const load = async () => {
      try {
        const res = await get<VerifyData>(`/verify/${certificateId}`);
        setData(res.data ?? null);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Minimal header */}
      <header className="bg-base-100 border-b border-base-200 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          {data?.organization?.whiteLabel.logoUrl ? (
            <img
              src={data.organization.whiteLabel.logoUrl}
              alt={`${brandName} logo`}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <Shield size={22} className="text-primary" />
          )}
          <span className="font-bold text-lg text-base-content">{brandName}</span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-lg">
          {isLoading ? (
            <div className="card bg-base-100 p-10 text-center">
              <span className="loading loading-spinner loading-lg text-primary mx-auto" />
              <p className="text-base-content/60 mt-4">Verifying certificate...</p>
            </div>
          ) : notFound ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card bg-base-100 p-10 text-center"
            >
              <XCircle size={56} className="text-error mx-auto mb-4" />
              <h1 className="text-xl font-bold text-base-content mb-2">Certificate Not Found</h1>
              <p className="text-base-content/60 mb-6">
                The certificate ID <code className="text-primary">{certificateId}</code> does not
                exist or has been removed.
              </p>
              <Link to="/" className="btn btn-outline btn-sm">
                <ArrowLeft size={14} />
                Go Home
              </Link>
            </motion.div>
          ) : data ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Valid badge */}
              <div className="card bg-success/10 border border-success/30 p-4 flex flex-row items-center gap-3">
                <CheckCircle size={28} className="text-success shrink-0" />
                <div>
                  <p className="font-semibold text-success">Certificate Verified</p>
                  <p className="text-sm text-base-content/60">
                    This certificate is authentic and was issued by {brandName}.
                  </p>
                </div>
              </div>

              {/* Certificate details */}
              <div className="card bg-base-100 border border-base-200">
                <div className="card-body gap-4">
                  <div className="text-center border-b border-base-200 pb-4">
                    <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                      Certificate of
                    </p>
                    <h2 className="text-2xl font-bold text-base-content">{data.certificateTitle}</h2>
                    {data.description && (
                      <p className="text-base-content/60 text-sm mt-1">{data.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-base-content/50 uppercase tracking-wide">
                        Awarded to
                      </p>
                      <p className="font-semibold text-base-content mt-0.5">{data.recipientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50 uppercase tracking-wide">
                        Issued by
                      </p>
                      <p className="font-semibold text-base-content mt-0.5">{data.issuerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50 uppercase tracking-wide">
                        Issue Date
                      </p>
                      <p className="font-medium text-base-content mt-0.5">
                        {new Date(data.issueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {data.expiryDate && (
                      <div>
                        <p className="text-xs text-base-content/50 uppercase tracking-wide">
                          Expiry Date
                        </p>
                        <p className="font-medium text-base-content mt-0.5">
                          {new Date(data.expiryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-base-200 pt-3">
                    <p className="text-xs text-base-content/40">
                      Certificate ID:{' '}
                      <code className="text-base-content/60">{data.certificateId}</code>
                    </p>
                  </div>
                </div>
              </div>

              {data.pdfUrl && (
                <a
                  href={data.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full"
                >
                  <Download size={16} />
                  Download Certificate PDF
                </a>
              )}

              {(showPoweredBy || data?.organization?.whiteLabel.supportEmail) && (
                <div className="text-center text-xs text-base-content/40 pt-2">
                  {data?.organization?.whiteLabel.supportEmail && (
                    <p>Support: {data.organization.whiteLabel.supportEmail}</p>
                  )}
                  {showPoweredBy && <p>Powered by Certify</p>}
                </div>
              )}
            </motion.div>
          ) : null}
        </div>
      </main>
    </div>
  );
};
