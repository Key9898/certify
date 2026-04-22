import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { publicGet } from '@/utils/api';
import { QUICK_SPRING } from '@/utils/motion';

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
  const [isRevoked, setIsRevoked] = useState(false);
  const brandName =
    data?.organization?.whiteLabel.brandName ||
    data?.organization?.name ||
    'Certify';
  const showPoweredBy = !data?.organization?.whiteLabel.hidePoweredBy;

  useEffect(() => {
    if (!certificateId) return;
    const normalizedCertificateId = certificateId.trim().toUpperCase();
    const load = async () => {
      try {
        const res = await publicGet<VerifyData>(
          `/verify/${encodeURIComponent(normalizedCertificateId)}`
        );
        setData(res.data ?? null);
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 410) {
          setIsRevoked(true);
        } else {
          setNotFound(true);
        }
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
            <motion.div
              whileHover={{ rotate: -6, scale: 1.06, transition: QUICK_SPRING }}
              className="rounded bg-primary p-2 shadow-lg shadow-primary/20"
            >
              <img
                src="/Logo/logo.svg"
                alt="Certify"
                className="h-5 w-5 brightness-0 invert"
              />
            </motion.div>
          )}
          <span className="font-bold text-lg text-base-content">
            {brandName}
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-lg">
          {isLoading ? (
            <div className="card bg-base-100 p-10 text-center">
              <span className="loading loading-spinner loading-lg text-primary mx-auto" />
              <p className="text-base-content/60 mt-4">
                Verifying certificate...
              </p>
            </div>
          ) : isRevoked ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card bg-base-100 p-10 text-center"
            >
              <ShieldAlert size={56} className="text-warning mx-auto mb-4" />
              <h1 className="text-xl font-bold text-base-content mb-2">
                Certificate Revoked
              </h1>
              <p className="text-base-content/60 mb-6">
                The certificate ID{' '}
                <code className="text-primary">{certificateId}</code> has been
                revoked by the issuer and is no longer valid.
              </p>
              <Link to="/" className="btn btn-outline btn-sm">
                <ArrowLeft size={14} />
                Go Home
              </Link>
            </motion.div>
          ) : notFound ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card bg-base-100 p-10 text-center"
            >
              <XCircle size={56} className="text-error mx-auto mb-4" />
              <h1 className="text-xl font-bold text-base-content mb-2">
                Certificate Not Found
              </h1>
              <p className="text-base-content/60 mb-6">
                The certificate ID{' '}
                <code className="text-primary">{certificateId}</code> does not
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
              {/* Authenticated & Verified stamp */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 18,
                  delay: 0.15,
                }}
                className="card border-2 border-success bg-success/10 p-5 flex flex-row items-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 14,
                    delay: 0.3,
                  }}
                >
                  <CheckCircle size={40} className="text-success shrink-0" />
                </motion.div>
                <div>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-black tracking-tight text-success uppercase"
                  >
                    Authentic &amp; Verified
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-base-content/60"
                  >
                    This certificate is genuine and was officially issued by{' '}
                    {brandName}.
                  </motion.p>
                </div>
              </motion.div>

              {/* Certificate details */}
              <div className="card bg-base-100 border border-base-200">
                <div className="card-body gap-4">
                  <div className="text-center border-b border-base-200 pb-4">
                    <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                      Certificate of
                    </p>
                    <h2 className="text-2xl font-bold text-base-content">
                      {data.certificateTitle}
                    </h2>
                    {data.description && (
                      <p className="text-base-content/60 text-sm mt-1">
                        {data.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-base-content/50 uppercase tracking-wide">
                        Awarded to
                      </p>
                      <p className="font-semibold text-base-content mt-0.5">
                        {data.recipientName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50 uppercase tracking-wide">
                        Issued by
                      </p>
                      <p className="font-semibold text-base-content mt-0.5">
                        {data.issuerName}
                      </p>
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
                          {new Date(data.expiryDate).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-base-200 pt-3">
                    <p className="text-xs text-base-content/40">
                      Certificate ID:{' '}
                      <code className="text-base-content/60">
                        {data.certificateId}
                      </code>
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

              {(showPoweredBy ||
                data?.organization?.whiteLabel.supportEmail) && (
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
