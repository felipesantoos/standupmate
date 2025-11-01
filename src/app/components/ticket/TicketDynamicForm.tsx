/**
 * Ticket Dynamic Form
 * 
 * Form with dynamic fields based on template, using React Hook Form + Zod.
 * Demonstrates dynamic schema pattern from Colabora guides.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Template } from '@core/domain/Template';
import { Ticket } from '@core/domain/Ticket';
import { createTicketSchema, type TicketFormData } from '@app/schemas/ticket.schema';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@app/components/ui/form';
import { DynamicField } from '@app/components/form/DynamicField';
import { Button } from '@app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';

interface TicketDynamicFormProps {
  template: Template;
  ticket?: Ticket;
  onSubmit: (data: TicketFormData) => void;
  submitLabel?: string;
}

/**
 * Ticket Dynamic Form Component
 * 
 * Example of React Hook Form with dynamic Zod schema
 */
export function TicketDynamicForm({
  template,
  ticket,
  onSubmit,
  submitLabel = 'Save',
}: TicketDynamicFormProps) {
  // Create dynamic schema based on template
  const schema = useMemo(
    () => createTicketSchema(template),
    [template.id, template.version]
  );

  // Initialize form with dynamic schema
  const form = useForm<TicketFormData>({
    resolver: zodResolver(schema),
    defaultValues: ticket?.data || {},
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Render sections and fields dynamically */}
            {template.sections.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {sectionIndex < template.sections.length - 1 && (
                    <Separator className="mt-2" />
                  )}
                </div>

                {section.fields.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          <DynamicField
                            field={field}
                            value={formField.value}
                            onChange={formField.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
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

