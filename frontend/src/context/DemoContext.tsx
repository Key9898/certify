/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { MOCK_USER } from '@/demo/mocks/users';
import { MOCK_TEMPLATES } from '@/demo/mocks/templates';
import { MOCK_CERTIFICATES } from '@/demo/mocks/certificates';
import { MOCK_INTEGRATIONS } from '@/demo/mocks/integrations';
import type { User } from '@/types';
import type { Template } from '@/types';
import type { Certificate } from '@/types';
import type { Integration } from '@/types';

interface DemoContextValue {
  isDemoMode: boolean;
  mockUser: User;
  mockTemplates: Template[];
  mockCertificates: Certificate[];
  mockIntegrations: Integration[];
  setMockCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>;
  setMockIntegrations: React.Dispatch<React.SetStateAction<Integration[]>>;
}

const DemoContext = createContext<DemoContextValue>({
  isDemoMode: false,
  mockUser: MOCK_USER,
  mockTemplates: MOCK_TEMPLATES,
  mockCertificates: MOCK_CERTIFICATES,
  mockIntegrations: MOCK_INTEGRATIONS,
  setMockCertificates: () => {},
  setMockIntegrations: () => {},
});

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mockCertificates, setMockCertificates] =
    useState<Certificate[]>(MOCK_CERTIFICATES);
  const [mockIntegrations, setMockIntegrations] =
    useState<Integration[]>(MOCK_INTEGRATIONS);

  return (
    <DemoContext.Provider
      value={{
        isDemoMode: true,
        mockUser: MOCK_USER,
        mockTemplates: MOCK_TEMPLATES,
        mockCertificates,
        mockIntegrations,
        setMockCertificates,
        setMockIntegrations,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
