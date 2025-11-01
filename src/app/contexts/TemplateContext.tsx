/**
 * Template Context - Primary Adapter
 * 
 * Connects UI with TemplateService following Hexagonal Architecture.
 * Pattern from Colabora guides: Context as Primary Adapter.
 * 
 * Responsibilities:
 * - Manage UI state (loading, error)
 * - Delegate ALL business operations to TemplateService
 * - Expose data and actions to UI components
 * 
 * Does NOT contain business logic - only orchestrates service calls.
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Template } from '@core/domain/Template';
import { diContainer } from '@app/dicontainer/dicontainer';

/**
 * Template Context Type
 * 
 * Following pattern: State + Actions (no setters)
 */
interface TemplateContextType {
  // UI State
  templates: Template[];
  selectedTemplate: Template | null;
  defaultTemplate: Template | null;
  loading: boolean;
  error: string | null;
  
  // Actions (delegate to service)
  fetchTemplates: () => Promise<void>;
  getTemplate: (id: string) => Promise<void>;
  getDefaultTemplate: () => Promise<void>;
  createTemplate: (template: Template) => Promise<Template>;
  updateTemplate: (id: string, template: Template) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, newName: string) => Promise<Template>;
  setAsDefault: (id: string) => Promise<Template>;
  importFromJSON: (json: string) => Promise<Template>;
  exportToJSON: (id: string) => Promise<string>;
  createNewVersion: (id: string) => Promise<Template>;
  canEditTemplate: (id: string) => Promise<boolean>;
  getTemplateVersions: (name: string) => Promise<Template[]>;
  clearError: () => void;
  clearSelectedTemplate: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

/**
 * Template Provider - Primary Adapter
 * 
 * Connects UI with TemplateService via DI Container.
 */
export function TemplateProvider({ children }: { children: ReactNode }) {
  // UI State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [defaultTemplate, setDefaultTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get service from DI Container (synchronous)
  const service = diContainer.templateService;

  /**
   * Fetch all templates
   */
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const templatesList = await service.listTemplates();
      setTemplates(templatesList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading templates';
      setError(errorMessage);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  /**
   * Get single template by ID
   */
  const getTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const template = await service.getTemplate(id);
      setSelectedTemplate(template);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading template';
      setError(errorMessage);
      console.error('Error fetching template:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  /**
   * Get default template
   */
  const getDefaultTemplate = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const template = await service.getDefaultTemplate();
      setDefaultTemplate(template);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading default template';
      setError(errorMessage);
      console.error('Error fetching default template:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  /**
   * Create new template
   */
  const createTemplate = useCallback(async (template: Template): Promise<Template> => {
    setError(null);
    
    try {
      const created = await service.createTemplate(template);
      
      // Update local state
      setTemplates(prev => [created, ...prev]);
      
      return created;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating template';
      setError(errorMessage);
      console.error('Error creating template:', err);
      throw err;
    }
  }, [service]);

  /**
   * Update existing template
   */
  const updateTemplate = useCallback(async (id: string, template: Template): Promise<Template> => {
    setError(null);
    
    try {
      const updated = await service.updateTemplate(id, template);
      
      // Update local state
      setTemplates(prev => prev.map(t => (t.id === id ? updated : t)));
      
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(updated);
      }
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating template';
      setError(errorMessage);
      console.error('Error updating template:', err);
      throw err;
    }
  }, [service, selectedTemplate]);

  /**
   * Delete template
   */
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    setError(null);
    
    try {
      await service.deleteTemplate(id);
      
      // Update local state
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
      
      // If deleted template was default, clear default
      if (defaultTemplate?.id === id) {
        setDefaultTemplate(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting template';
      setError(errorMessage);
      console.error('Error deleting template:', err);
      throw err;
    }
  }, [service, selectedTemplate, defaultTemplate]);

  /**
   * Duplicate template
   */
  const duplicateTemplate = useCallback(async (id: string, newName: string): Promise<Template> => {
    setError(null);
    
    try {
      const duplicated = await service.duplicateTemplate(id, newName);
      
      // Update local state
      setTemplates(prev => [duplicated, ...prev]);
      
      return duplicated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error duplicating template';
      setError(errorMessage);
      console.error('Error duplicating template:', err);
      throw err;
    }
  }, [service]);

  /**
   * Set template as default
   */
  const setAsDefault = useCallback(async (id: string): Promise<Template> => {
    setError(null);
    
    try {
      const updated = await service.setAsDefault(id);
      
      // Update local state
      setTemplates(prev => prev.map(t => (t.id === id ? updated : t)));
      setDefaultTemplate(updated);
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error setting default template';
      setError(errorMessage);
      console.error('Error setting default template:', err);
      throw err;
    }
  }, [service]);

  /**
   * Import template from JSON
   */
  const importFromJSON = useCallback(async (json: string): Promise<Template> => {
    setError(null);
    
    try {
      const imported = await service.importFromJSON(json);
      
      // Update local state
      setTemplates(prev => [imported, ...prev]);
      
      return imported;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error importing template';
      setError(errorMessage);
      console.error('Error importing template:', err);
      throw err;
    }
  }, [service]);

  /**
   * Export template to JSON
   */
  const exportToJSON = useCallback(async (id: string): Promise<string> => {
    setError(null);
    
    try {
      return await service.exportToJSON(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exporting template';
      setError(errorMessage);
      console.error('Error exporting template:', err);
      throw err;
    }
  }, [service]);

  /**
   * Create new version of template
   */
  const createNewVersion = useCallback(async (id: string): Promise<Template> => {
    setError(null);
    
    try {
      const newVersion = await service.createNewVersion(id);
      
      // Update local state
      setTemplates(prev => [newVersion, ...prev]);
      
      return newVersion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating template version';
      setError(errorMessage);
      console.error('Error creating template version:', err);
      throw err;
    }
  }, [service]);

  /**
   * Check if template can be edited
   */
  const canEditTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await service.canEditTemplate(id);
    } catch (err) {
      console.error('Error checking if template can be edited:', err);
      return false;
    }
  }, [service]);

  /**
   * Get all versions of a template
   */
  const getTemplateVersions = useCallback(async (name: string): Promise<Template[]> => {
    setError(null);
    
    try {
      return await service.getTemplateVersions(name);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading template versions';
      setError(errorMessage);
      console.error('Error fetching template versions:', err);
      throw err;
    }
  }, [service]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear selected template
   */
  const clearSelectedTemplate = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchTemplates();
      // Also load default template
      try {
        const defaultTemp = await service.getDefaultTemplate();
        setDefaultTemplate(defaultTemp);
      } catch (err) {
        console.error('No default template found:', err);
      }
    };
    
    loadInitialData();
  }, []); // Empty deps - load only once

  return (
    <TemplateContext.Provider
      value={{
        templates,
        selectedTemplate,
        defaultTemplate,
        loading,
        error,
        fetchTemplates,
        getTemplate,
        getDefaultTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        setAsDefault,
        importFromJSON,
        exportToJSON,
        createNewVersion,
        canEditTemplate,
        getTemplateVersions,
        clearError,
        clearSelectedTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

/**
 * Hook to consume Template Context
 * 
 * Use this hook in components to access template operations.
 */
export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplateContext must be used within TemplateProvider');
  }
  return context;
}

