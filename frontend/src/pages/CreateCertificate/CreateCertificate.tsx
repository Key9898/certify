import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, ExternalLink, Wand2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TemplateGallery } from '@/components/template/TemplateGallery';
import { CertificateEditor } from '@/components/certificate/CertificateEditor';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useTemplates } from '@/hooks/useTemplates';
import { useAppUser } from '@/context/AuthContext';
import { useDemo } from '@/context/DemoContext';
import { createCertificate, generatePdf } from '@/utils/certificateApi';
import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR, ROUTES } from '@/utils/constants';
import { QUICK_SPRING, SOFT_SPRING, TAP_PRESS, STAGGER_CONTAINER, REVEAL_ITEM } from '@/utils/motion';
import type { Template } from '@/types';
import type { CertificateFormData } from '@/components/certificate/CertificateForm/CertificateForm.types';

type Step = 'select-template' | 'fill-details' | 'success';

interface SuccessState {
  certificateId: string;
  pdfUrl?: string;
  recipientName: string;
}

const STEP_ORDER: Array<Exclude<Step, 'success'>> = ['select-template', 'fill-details'];

export const CreateCertificate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appUser, isLoadingUser } = useAppUser();
  const { isDemoMode, setMockCertificates } = useDemo();
  const { templates, isLoading: tmplLoading, error: tmplError } = useTemplates();

  const preselectedId = (location.state as { templateId?: string })?.templateId;
  const preselected = templates.find((template) => template._id === preselectedId) ?? null;

  const [step, setStep] = useState<Step>(preselected ? 'fill-details' : 'select-template');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(preselected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editorKey = [
    selectedTemplate?._id || 'no-template',
    appUser?.settings.defaultLogo || appUser?.organization?.whiteLabel.logoUrl || 'no-logo',
    appUser?.organization?.whiteLabel.primaryColor ||
      appUser?.settings.defaultColors.primary ||
      DEFAULT_PRIMARY_COLOR,
    appUser?.organization?.whiteLabel.secondaryColor ||
      appUser?.settings.defaultColors.secondary ||
      DEFAULT_SECONDARY_COLOR,
  ].join(':');

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleProceedToEditor = () => {
    if (selectedTemplate) {
      setStep('fill-details');
    }
  };

  const handleSubmit = async (formData: CertificateFormData) => {
    if (!selectedTemplate) return;

    setIsSubmitting(true);
    setError(null);

    if (isDemoMode) {
      const demoId = `cert-demo-${Date.now()}`;

      setMockCertificates((prev) => [
        {
          _id: demoId,
          templateId: selectedTemplate._id,
          recipientName: formData.recipientName,
          recipientEmail: formData.recipientEmail || undefined,
          certificateTitle: formData.certificateTitle,
          description: formData.description || undefined,
          issueDate: formData.issueDate,
          issuerName: formData.issuerName,
          certificateId: `DEMO${Date.now()}`,
          pdfUrl: undefined,
          createdBy: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setSuccess({
        certificateId: demoId,
        pdfUrl: undefined,
        recipientName: formData.recipientName,
      });
      setStep('success');
      setIsSubmitting(false);
      return;
    }

    try {
      const dto = {
        templateId: formData.templateId,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail || undefined,
        certificateTitle: formData.certificateTitle,
        description: formData.description || undefined,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate || undefined,
        issuerName: formData.issuerName,
        issuerSignature: formData.issuerSignature || undefined,
        organizationLogo: formData.organizationLogo || undefined,
        customFields: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        },
      };

      const certResult = await createCertificate(dto);
      const certId = certResult.data?._id;

      if (!certId) {
        throw new Error('Failed to create certificate');
      }

      setIsGeneratingPdf(true);

      let pdfUrl: string | undefined;
      try {
        const pdfResult = await generatePdf(certId);
        pdfUrl = pdfResult.data?.pdfUrl;
      } catch {
        // Keep the create flow successful even when PDF generation needs a retry later.
      } finally {
        setIsGeneratingPdf(false);
      }

      setSuccess({
        certificateId: certId,
        pdfUrl,
        recipientName: formData.recipientName,
      });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SOFT_SPRING}
          className="mb-10"
        >
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {step === 'fill-details' && (
                <motion.button
                  type="button"
                  className="btn btn-ghost btn-circle border border-base-200 bg-base-100 shadow-sm transition-all hover:border-primary/30"
                  onClick={() => setStep('select-template')}
                  aria-label="Back to selection"
                  whileHover={{ x: -3 }}
                  whileTap={TAP_PRESS}
                  transition={QUICK_SPRING}
                >
                  <ArrowLeft size={20} />
                </motion.button>
              )}
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                  <Wand2 size={12} />
                  Certificate Wizard
                </div>
                <h1 className="text-3xl font-black tracking-tight text-base-content md:text-4xl">
                  Issue Single Record
                </h1>
                <p className="mt-2 text-sm font-medium text-base-content/50">
                  {step === 'select-template' 
                    ? 'Begin by picking a high-fidelity template from your library.' 
                    : 'Personalize the recipient details and branding parameters.'}
                </p>
              </div>
            </div>

            <motion.div 
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="visible"
              className="grid min-w-[320px] gap-3 sm:grid-cols-2"
            >
              {STEP_ORDER.map((currentStep, index) => {
                const isActive = step === currentStep;
                const isComplete = step === 'fill-details' && currentStep === 'select-template';

                return (
                  <motion.div
                    key={currentStep}
                    variants={REVEAL_ITEM}
                    className={`relative overflow-hidden rounded border px-5 py-3 transition-colors ${
                      isActive 
                        ? 'border-primary/30 bg-primary/5 shadow-sm' 
                        : isComplete
                          ? 'border-success/30 bg-success/5'
                          : 'border-base-200 bg-base-100/50 grayscale'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40">
                        Step {index + 1}
                      </p>
                      {isComplete && <CheckCircle size={12} className="text-success" />}
                    </div>
                    <p className={`mt-1 text-xs font-black uppercase tracking-widest ${
                      isActive || isComplete ? 'text-base-content' : 'text-base-content/30'
                    }`}>
                      {currentStep === 'select-template' ? 'Theme Base' : 'Personalize'}
                    </p>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-base-200">
                      <motion.div
                        className={`h-full ${isComplete ? 'bg-success' : 'bg-primary'}`}
                        initial={{ scaleX: 0, transformOrigin: 'left' }}
                        animate={{ scaleX: isActive || isComplete ? 1 : 0 }}
                        transition={SOFT_SPRING}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="create-error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={QUICK_SPRING}
              className="alert alert-error mb-8 rounded border-none font-bold shadow-lg shadow-error/10"
            >
              <span>{error}</span>
            </motion.div>
          )}

          {tmplError && (
            <motion.div
              key="template-error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={QUICK_SPRING}
              className="alert alert-error mb-8 rounded border-none font-bold shadow-lg shadow-error/10"
            >
              <span>{tmplError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 'select-template' ? (
            <motion.div
              key="select-template"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={SOFT_SPRING}
            >
              <TemplateGallery
                templates={templates}
                selectedId={selectedTemplate?._id}
                onSelect={handleSelectTemplate}
                isLoading={tmplLoading}
              />

              <AnimatePresence>
                {selectedTemplate && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={SOFT_SPRING}
                    className="fixed bottom-8 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4 md:max-w-xl"
                  >
                    <div className="card flex flex-col items-center gap-6 border border-base-200 bg-base-100/90 p-5 shadow-[0_45px_90px_-25px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:flex-row sm:p-6">
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                          Design Selection
                        </p>
                        <h3 className="mt-1 text-lg font-black tracking-tight text-base-content">
                          {selectedTemplate.name}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                          {selectedTemplate.category} Theme
                        </p>
                      </div>
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full rounded-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 sm:w-auto"
                        onClick={handleProceedToEditor}
                      >
                        Next Step
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="fill-details"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={SOFT_SPRING}
            >
              <div className="card rounded border border-base-200 bg-base-100 p-8 shadow-2xl shadow-base-300/10">
                {isLoadingUser ? (
                  <div className="flex flex-col items-center py-20 text-center">
                    <motion.div
                      className="mb-4 h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-sm font-black uppercase tracking-widest text-base-content/40">
                      Syncing Branding Assets...
                    </p>
                  </div>
                ) : (
                  <CertificateEditor
                    key={editorKey}
                    template={selectedTemplate!}
                    onComplete={handleSubmit}
                    isSubmitting={isSubmitting || isGeneratingPdf}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Modal
          isOpen={step === 'success' && !!success}
          onClose={() => navigate(ROUTES.CERTIFICATES)}
          title=""
          size="md"
        >
          {success && (
            <div className="px-4 py-8 text-center sm:px-8 sm:py-12">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={QUICK_SPRING}
                className="relative mb-8 inline-flex"
              >
                <div className="absolute inset-0 animate-ping rounded-full bg-success/20 opacity-40" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle size={48} />
                </div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SOFT_SPRING, delay: 0.1 }}
                className="text-3xl font-black tracking-tight text-base-content"
              >
                Issuance Successful
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SOFT_SPRING, delay: 0.15 }}
                className="mt-4 text-lg font-medium text-base-content/60"
              >
                The record for <span className="font-black text-base-content">{success.recipientName}</span> has been verified and stored in the ledger.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SOFT_SPRING, delay: 0.2 }}
                className="mt-10 grid gap-3"
              >
                {success.pdfUrl && (
                  <motion.a
                    href={success.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary h-14 w-full rounded-sm text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    whileHover={{ y: -3 }}
                    whileTap={TAP_PRESS}
                  >
                    <ExternalLink size={20} className="mr-2" />
                    Secure Download
                  </motion.a>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 rounded-sm font-black uppercase tracking-widest"
                    onClick={() => navigate(ROUTES.CERTIFICATES)}
                  >
                    All Records
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-12 rounded-sm bg-base-200/50 font-black uppercase tracking-widest hover:bg-base-200"
                    onClick={() => {
                      setStep('select-template');
                      setSelectedTemplate(null);
                      setSuccess(null);
                    }}
                  >
                    Issue New
                  </Button>
                </div>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-base-content/20"
              >
                Hashed ID: {success.certificateId.slice(0, 16)}...
              </motion.p>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};
