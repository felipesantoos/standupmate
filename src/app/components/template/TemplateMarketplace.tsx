/**
 * Template Marketplace Component
 * 
 * Pre-built templates for common use cases.
 */

import { useState } from 'react';
import { Template } from '@core/domain/Template';
import { FieldType } from '@core/domain/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Download, Check } from 'lucide-react';
import { useTemplates } from '@app/hooks/useTemplates';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const MARKETPLACE_TEMPLATES: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Bug Report',
    description: 'Template para reportar e trackear bugs',
    version: '1.0.0',
    isDefault: false,
    author: 'System',
    sections: [
      {
        id: 'bug-info',
        title: '🐛 Informações do Bug',
        order: 0,
        fields: [
          {
            id: 'title',
            label: 'Título do Bug',
            type: FieldType.TEXT,
            required: true,
            placeholder: 'Descrição curta do problema',
            order: 0,
          },
          {
            id: 'severity',
            label: 'Severidade',
            type: FieldType.SELECT,
            required: true,
            options: ['Crítico', 'Alto', 'Médio', 'Baixo'],
            order: 1,
          },
          {
            id: 'environment',
            label: 'Ambiente',
            type: FieldType.SELECT,
            required: true,
            options: ['Produção', 'Staging', 'Desenvolvimento', 'Local'],
            order: 2,
          },
        ],
      },
      {
        id: 'reproduction',
        title: '🔄 Reprodução',
        order: 1,
        fields: [
          {
            id: 'steps',
            label: 'Passos para Reproduzir',
            type: FieldType.MARKDOWN,
            required: true,
            placeholder: '1. Acesse...\n2. Clique em...\n3. Observe...',
            order: 0,
          },
          {
            id: 'expected',
            label: 'Comportamento Esperado',
            type: FieldType.TEXTAREA,
            required: true,
            order: 1,
          },
          {
            id: 'actual',
            label: 'Comportamento Atual',
            type: FieldType.TEXTAREA,
            required: true,
            order: 2,
          },
        ],
      },
      {
        id: 'fix',
        title: '🔧 Solução',
        order: 2,
        fields: [
          {
            id: 'root_cause',
            label: 'Causa Raiz',
            type: FieldType.TEXTAREA,
            required: false,
            order: 0,
          },
          {
            id: 'fix_description',
            label: 'Descrição da Correção',
            type: FieldType.MARKDOWN,
            required: false,
            order: 1,
          },
        ],
      },
    ],
  },
  {
    name: 'Feature Request',
    description: 'Template para novas funcionalidades',
    version: '1.0.0',
    isDefault: false,
    author: 'System',
    sections: [
      {
        id: 'feature-overview',
        title: '💡 Visão Geral',
        order: 0,
        fields: [
          {
            id: 'title',
            label: 'Nome da Feature',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
          {
            id: 'problem',
            label: 'Qual problema resolve?',
            type: FieldType.TEXTAREA,
            required: true,
            placeholder: 'Descreva o problema que esta feature resolve...',
            order: 1,
          },
          {
            id: 'priority',
            label: 'Prioridade',
            type: FieldType.RADIO,
            required: true,
            options: ['Must Have', 'Should Have', 'Nice to Have'],
            order: 2,
          },
        ],
      },
      {
        id: 'requirements',
        title: '📋 Requisitos',
        order: 1,
        fields: [
          {
            id: 'acceptance_criteria',
            label: 'Critérios de Aceitação',
            type: FieldType.MARKDOWN,
            required: true,
            placeholder: '- [ ] Critério 1\n- [ ] Critério 2',
            order: 0,
          },
          {
            id: 'user_stories',
            label: 'User Stories',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'Como [usuário], eu quero [ação] para [benefício]',
            order: 1,
          },
        ],
      },
      {
        id: 'implementation',
        title: '🚀 Implementação',
        order: 2,
        fields: [
          {
            id: 'technical_notes',
            label: 'Notas Técnicas',
            type: FieldType.MARKDOWN,
            required: false,
            order: 0,
          },
          {
            id: 'estimate',
            label: 'Estimativa',
            type: FieldType.TEXT,
            required: false,
            placeholder: '5 dias',
            order: 1,
          },
        ],
      },
    ],
  },
  {
    name: 'Sprint Planning',
    description: 'Template para planejamento de sprints',
    version: '1.0.0',
    isDefault: false,
    author: 'System',
    sections: [
      {
        id: 'sprint-info',
        title: '🎯 Informações da Sprint',
        order: 0,
        fields: [
          {
            id: 'sprint_number',
            label: 'Número da Sprint',
            type: FieldType.NUMBER,
            required: true,
            order: 0,
          },
          {
            id: 'start_date',
            label: 'Data de Início',
            type: FieldType.DATE,
            required: true,
            order: 1,
          },
          {
            id: 'end_date',
            label: 'Data de Término',
            type: FieldType.DATE,
            required: true,
            order: 2,
          },
          {
            id: 'sprint_goal',
            label: 'Objetivo da Sprint',
            type: FieldType.TEXTAREA,
            required: true,
            order: 3,
          },
        ],
      },
      {
        id: 'tasks',
        title: '📝 Tarefas',
        order: 1,
        fields: [
          {
            id: 'planned_tasks',
            label: 'Tarefas Planejadas',
            type: FieldType.MARKDOWN,
            required: true,
            placeholder: '- [ ] Tarefa 1\n- [ ] Tarefa 2',
            order: 0,
          },
          {
            id: 'team_capacity',
            label: 'Capacidade do Time',
            type: FieldType.TEXT,
            required: false,
            placeholder: '40 story points',
            order: 1,
          },
        ],
      },
      {
        id: 'review',
        title: '📊 Review',
        order: 2,
        fields: [
          {
            id: 'completed_tasks',
            label: 'Tarefas Completadas',
            type: FieldType.MARKDOWN,
            required: false,
            order: 0,
          },
          {
            id: 'retrospective',
            label: 'Retrospectiva',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '**O que foi bem:**\n\n**O que melhorar:**\n\n**Action items:**',
            order: 1,
          },
        ],
      },
    ],
  },
  {
    name: 'Research & Investigation',
    description: 'Template para investigações técnicas',
    version: '1.0.0',
    isDefault: false,
    author: 'System',
    sections: [
      {
        id: 'research-topic',
        title: '🔍 Tópico',
        order: 0,
        fields: [
          {
            id: 'title',
            label: 'Título da Investigação',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
          {
            id: 'objective',
            label: 'Objetivo',
            type: FieldType.TEXTAREA,
            required: true,
            placeholder: 'O que queremos descobrir?',
            order: 1,
          },
          {
            id: 'questions',
            label: 'Perguntas a Responder',
            type: FieldType.MARKDOWN,
            required: true,
            placeholder: '- Pergunta 1?\n- Pergunta 2?',
            order: 2,
          },
        ],
      },
      {
        id: 'findings',
        title: '📚 Descobertas',
        order: 1,
        fields: [
          {
            id: 'research_notes',
            label: 'Notas de Pesquisa',
            type: FieldType.MARKDOWN,
            required: false,
            order: 0,
          },
          {
            id: 'pros_cons',
            label: 'Prós e Contras',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '**Prós:**\n- \n\n**Contras:**\n- ',
            order: 1,
          },
        ],
      },
      {
        id: 'conclusion',
        title: '✅ Conclusão',
        order: 2,
        fields: [
          {
            id: 'recommendation',
            label: 'Recomendação',
            type: FieldType.TEXTAREA,
            required: false,
            order: 0,
          },
          {
            id: 'next_steps',
            label: 'Próximos Passos',
            type: FieldType.MARKDOWN,
            required: false,
            order: 1,
          },
        ],
      },
    ],
  },
];

export function TemplateMarketplace() {
  const [installing, setInstalling] = useState<string | null>(null);
  const { createTemplate } = useTemplates();

  const installTemplate = async (templateData: typeof MARKETPLACE_TEMPLATES[0]) => {
    setInstalling(templateData.name);
    
    try {
      const now = new Date();
      const template = new Template(
        uuidv4(),
        templateData.name,
        templateData.description,
        templateData.version,
        false,
        templateData.sections,
        now,
        now,
        templateData.author
      );

      await createTemplate(template);
      toast.success(`Template "${templateData.name}" added successfully.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Template Marketplace</h2>
        <p className="text-muted-foreground">
          Ready-made templates for different types of work
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MARKETPLACE_TEMPLATES.map((template) => (
          <Card key={template.name} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>{template.sections.length} sections</p>
                  <p>
                    {template.sections.reduce((acc, s) => acc + s.fields.length, 0)} fields
                  </p>
                </div>

                <Button
                  onClick={() => installTemplate(template)}
                  disabled={installing === template.name}
                  className="w-full"
                  variant="outline"
                >
                  {installing === template.name ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Install Template
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

