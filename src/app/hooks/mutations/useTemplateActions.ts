/**
 * Template Mutation Hooks
 * 
 * CRUD mutations for templates.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { diContainer } from '@app/dicontainer/dicontainer';
import { Template } from '@core/domain/Template';
import { templatesKeys } from '../queries/useTemplatesQuery';

/**
 * Hook to create a template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const service = diContainer.templateService;
  
  return useMutation({
    mutationFn: (template: Template) => service.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templatesKeys.all });
    },
  });
}

/**
 * Hook to update a template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const service = diContainer.templateService;
  
  return useMutation({
    mutationFn: ({ id, template }: { id: string; template: Template }) => 
      service.updateTemplate(id, template),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: templatesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: templatesKeys.lists() });
    },
  });
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const service = diContainer.templateService;
  
  return useMutation({
    mutationFn: (id: string) => service.deleteTemplate(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: templatesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templatesKeys.lists() });
    },
  });
}

/**
 * Hook to set template as default
 */
export function useSetDefaultTemplate() {
  const queryClient = useQueryClient();
  const service = diContainer.templateService;
  
  return useMutation({
    mutationFn: (id: string) => service.setAsDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templatesKeys.all });
    },
  });
}

