import { useState, useCallback } from 'react';
import { generatePdf } from '@/utils/certificateApi';

export const usePdf = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (certificateId: string): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generatePdf(certificateId);
      return result.data?.pdfUrl || null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'PDF generation failed';
      setError(msg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const download = useCallback((pdfUrl: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename || 'certificate.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return { generate, download, isGenerating, error };
};
