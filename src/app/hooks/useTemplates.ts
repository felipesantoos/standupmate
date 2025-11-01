/**
 * useTemplates Hook
 * 
 * Simple hook that consumes TemplateContext.
 * Following Hexagonal Architecture pattern from Colabora guides.
 * 
 * All business logic is in TemplateContext (Primary Adapter).
 * This hook is just a convenient accessor.
 */

import { useTemplateContext } from '@app/contexts/TemplateContext';

/**
 * Hook to access Template Context
 * 
 * Simple wrapper around useTemplateContext for convenience.
 * All operations are delegated to the Context (Primary Adapter).
 * 
 * @returns TemplateContext value
 * @throws Error if used outside TemplateProvider
 */
export function useTemplates() {
  return useTemplateContext();
}
