/**
 * useTemplates Hook
 * 
 * Custom hook for template operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { Template } from '@core/domain/Template';
import { createTemplateService } from '@/lib/serviceFactory';

interface UseTemplatesResult {
  templates: Template[];
  defaultTemplate: Template | null;
  loading: boolean;
  error: Error | null;
  createTemplate: (template: Template) => Promise<Template>;
  updateTemplate: (id: string, template: Template) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, newName: string) => Promise<Template>;
  setAsDefault: (id: string) => Promise<Template>;
  importFromJSON: (json: string) => Promise<Template>;
  exportToJSON: (id: string) => Promise<string>;
  refresh: () => Promise<void>;
}

export function useTemplates(autoLoad: boolean = true): UseTemplatesResult {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load all templates
   */
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const service = await createTemplateService();
      
      const [templateList, defaultTpl] = await Promise.all([
        service.listTemplates(),
        service.getDefaultTemplate().catch(() => null),
      ]);

      setTemplates(templateList);
      setDefaultTemplate(defaultTpl);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new template
   */
  const createTemplate = async (template: Template): Promise<Template> => {
    try {
      setError(null);
      const service = await createTemplateService();
      const created = await service.createTemplate(template);
      
      setTemplates(prev => [created, ...prev]);
      
      return created;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Update template
   */
  const updateTemplate = async (id: string, template: Template): Promise<Template> => {
    try {
      setError(null);
      const service = await createTemplateService();
      const updated = await service.updateTemplate(id, template);
      
      setTemplates(prev => prev.map(t => (t.id === id ? updated : t)));
      
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Delete template
   */
  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      setError(null);
      const service = await createTemplateService();
      await service.deleteTemplate(id);
      
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      if (defaultTemplate?.id === id) {
        setDefaultTemplate(null);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Duplicate template
   */
  const duplicateTemplate = async (id: string, newName: string): Promise<Template> => {
    try {
      setError(null);
      const service = await createTemplateService();
      const duplicated = await service.duplicateTemplate(id, newName);
      
      setTemplates(prev => [duplicated, ...prev]);
      
      return duplicated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Set template as default
   */
  const setAsDefault = async (id: string): Promise<Template> => {
    try {
      setError(null);
      const service = await createTemplateService();
      const updated = await service.setAsDefault(id);
      
      // Update all templates (unset others)
      setTemplates(prev =>
        prev.map(t => ({
          ...t,
          isDefault: t.id === id,
        }))
      );
      
      setDefaultTemplate(updated);
      
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Import template from JSON
   */
  const importFromJSON = async (json: string): Promise<Template> => {
    try {
      setError(null);
      const service = await createTemplateService();
      const imported = await service.importFromJSON(json);
      
      setTemplates(prev => [imported, ...prev]);
      
      return imported;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Export template to JSON
   */
  const exportToJSON = async (id: string): Promise<string> => {
    try {
      setError(null);
      const service = await createTemplateService();
      return await service.exportToJSON(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Refresh templates
   */
  const refresh = useCallback(async () => {
    await loadTemplates();
  }, [loadTemplates]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]); // Only depend on autoLoad, not loadTemplates (prevents infinite loop)

  return {
    templates,
    defaultTemplate,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setAsDefault,
    importFromJSON,
    exportToJSON,
    refresh,
  };
}

