/**
 * Template Basic Info Form
 * 
 * Form for template name, description, version using React Hook Form + Zod.
 * Demonstrates integration pattern from Colabora guides.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateBasicInfoSchema, type TemplateBasicInfoFormData } from '@app/schemas/template.schema';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@app/components/ui/form';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { Button } from '@app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';

interface TemplateBasicInfoFormProps {
  defaultValues?: TemplateBasicInfoFormData;
  onSubmit: (data: TemplateBasicInfoFormData) => void;
  submitLabel?: string;
}

/**
 * Template Basic Info Form Component
 * 
 * Example of React Hook Form + Zod integration
 */
export function TemplateBasicInfoForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
}: TemplateBasicInfoFormProps) {
  const form = useForm<TemplateBasicInfoFormData>({
    resolver: zodResolver(templateBasicInfoSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      version: '1.0.0',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Daily Standup"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 3 characters, maximum 200 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose of this template..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Version Field */}
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1.0.0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: x.y.z (e.g., 1.0.0)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

