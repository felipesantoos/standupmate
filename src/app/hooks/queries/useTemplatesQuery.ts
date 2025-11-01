/**
 * useTemplatesQuery - React Query Hook
 * 
 * Fetches templates list and default template.
 * Implements server state caching pattern from Colabora guides.
 */

import { useQuery } from '@tanstack/react-query';
import { diContainer } from '@app/dicontainer/dicontainer';

/**
 * Query key factory for templates
 * Ensures consistent cache keys across the app
 */
export const templatesKeys = {
  all: ['templates'] as const,
  lists: () => [...templatesKeys.all, 'list'] as const,
  list: () => [...templatesKeys.lists()] as const,
  details: () => [...templatesKeys.all, 'detail'] as const,
  detail: (id: string) => [...templatesKeys.details(), id] as const,
  default: () => [...templatesKeys.all, 'default'] as const,
};

/**
 * Hook to query templates list
 * 
 * @returns React Query result with templates array
 */
export function useTemplatesQuery() {
  const service = diContainer.templateService;
  
  return useQuery({
    queryKey: templatesKeys.list(),
    queryFn: async () => {
      return await service.listTemplates();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (templates mudam menos)
  });
}

/**
 * Hook to query a single template
 * 
 * @param id - Template ID
 * @param enabled - Whether to run the query
 * @returns React Query result with template
 */
export function useTemplateQuery(id: string | undefined, enabled = true) {
  const service = diContainer.templateService;
  
  return useQuery({
    queryKey: id ? templatesKeys.detail(id) : ['templates', 'detail', 'empty'],
    queryFn: async () => {
      if (!id) throw new Error('Template ID is required');
      return await service.getTemplate(id);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to query default template
 * 
 * @returns React Query result with default template
 */
export function useDefaultTemplateQuery() {
  const service = diContainer.templateService;
  
  return useQuery({
    queryKey: templatesKeys.default(),
    queryFn: async () => {
      return await service.getDefaultTemplate();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (default template raramente muda)
  });
}

