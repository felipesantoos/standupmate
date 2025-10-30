/**
 * Template Context
 * 
 * Global state management for templates.
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { Template } from '@core/domain/Template';

interface TemplateContextType {
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  defaultTemplate: Template | null;
  setDefaultTemplate: (template: Template | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [defaultTemplate, setDefaultTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <TemplateContext.Provider
      value={{
        templates,
        setTemplates,
        selectedTemplate,
        setSelectedTemplate,
        defaultTemplate,
        setDefaultTemplate,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplateContext must be used within TemplateProvider');
  }
  return context;
}

