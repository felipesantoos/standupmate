# Feature 11: Template Padrão Baseado no Markdown

## Contexto e Objetivo

**Prioridade:** 🟡 Média  
**Estimativa:** 1-2 horas  
**Tipo:** Data/Config

Garantir que o template padrão criado no seed do banco de dados siga exatamente o formato especificado no documento `problem-solving-roadmap-plan.md`, incluindo todos os campos e seções na ordem correta.

## Requisitos Técnicos

### Dependências

Não requer dependências adicionais.

### Referência

Baseado no formato do arquivo: `docs/problem-solving-roadmap-plan.md` (se existir) ou estrutura especificada.

## Arquitetura e Design

### Estrutura do Template Padrão

O template "Problem Solving Roadmap" deve ter as seguintes seções e campos:

### Seção 1: Basic Information

| Campo | Tipo | Required | Ordem |
|-------|------|----------|-------|
| Title | text | ✅ | 1 |
| Date | date | ✅ | 2 |
| Dev | text | ✅ | 3 |
| Status | select | ✅ | 4 |
| Estimate | text | ❌ | 5 |
| Tags | text | ❌ | 6 |

**Status Options:**
- To Do
- In Progress
- Blocked
- Done

---

### Seção 2: Problem Description

| Campo | Tipo | Required | Ordem |
|-------|------|----------|-------|
| What is the problem? | textarea | ✅ | 1 |
| Why is this important? | textarea | ❌ | 2 |
| Expected outcome | textarea | ❌ | 3 |

---

### Seção 3: Context & Research

| Campo | Tipo | Required | Ordem |
|-------|------|----------|-------|
| Related tickets/issues | textarea | ❌ | 1 |
| Documentation links | textarea | ❌ | 2 |
| Similar problems solved | textarea | ❌ | 3 |

---

### Seção 4: Root Cause Analysis

| Campo | Tipo | Required | Ordem |
|-------|------|----------|-------|
| What is causing the problem? | textarea | ❌ | 1 |
| How did we discover it? | textarea | ❌ | 2 |
| Affected components | textarea | ❌ | 3 |

---

### Seção 5: Solution Plan

| Campo | Tipo | Required | Ordem |
|-------|------|----------|-------|
| Proposed solution | textarea | ✅ | 1 |
| Alternative approaches | textarea | ❌ | 2 |
| Risks and considerations | textarea | ❌ | 3 |

---

### Seção 6: Implementation Steps

| Campo | Tipo | Required | Ordem |
|-------|------|----------|-------|
| Steps to implement | textarea | ✅ | 1 |
| Files to change | textarea | ❌ | 2 |
| Dependencies needed | textarea | ❌ | 3 |

---

### Seção 7: Testing & Validation

| Campo | Tipo | Required | Ordem |
|-------|------|----------|-------|
| Test cases | textarea | ❌ | 1 |
| Acceptance criteria | textarea | ✅ | 2 |
| How to validate | textarea | ❌ | 3 |

---

### Seção 8: Notes & Follow-up

| Campo | Tipo | Required | Ordem |
|-------|------|----------|-------|
| Additional notes | textarea | ❌ | 1 |
| Follow-up tasks | textarea | ❌ | 2 |
| Lessons learned | textarea | ❌ | 3 |

## Arquivo a Editar

### `src/infra/database/seed.ts`

**Mudanças:** Revisar e corrigir `seedDefaultTemplate()` para alinhar 100% com a estrutura acima.

```typescript
import { Template, Section, Field } from '@/core/domain/Template';

export const seedDefaultTemplate = async (repository: ITemplateRepository): Promise<void> => {
  // Verificar se já existe
  const existing = await repository.findByName('Problem Solving Roadmap');
  if (existing) {
    console.log('Default template already exists');
    return;
  }

  const template = new Template({
    id: 'template-default',
    name: 'Problem Solving Roadmap',
    description: 'Comprehensive template for tracking and solving development problems',
    version: '1.0.0',
    sections: createDefaultSections(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await repository.create(template);
  console.log('Default template created successfully');
};

const createDefaultSections = (): Section[] => {
  return [
    // Seção 1: Basic Information
    {
      id: 'section-1',
      title: 'Basic Information',
      order: 1,
      fields: [
        {
          id: 'field-1-1',
          sectionId: 'section-1',
          label: 'Title',
          type: 'text',
          required: true,
          placeholder: 'Brief description of the ticket',
          order: 1,
        },
        {
          id: 'field-1-2',
          sectionId: 'section-1',
          label: 'Date',
          type: 'date',
          required: true,
          order: 2,
        },
        {
          id: 'field-1-3',
          sectionId: 'section-1',
          label: 'Dev',
          type: 'text',
          required: true,
          placeholder: 'Developer name',
          order: 3,
        },
        {
          id: 'field-1-4',
          sectionId: 'section-1',
          label: 'Status',
          type: 'select',
          required: true,
          order: 4,
          options: [
            { label: 'To Do', value: 'todo' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Blocked', value: 'blocked' },
            { label: 'Done', value: 'done' },
          ],
        },
        {
          id: 'field-1-5',
          sectionId: 'section-1',
          label: 'Estimate',
          type: 'text',
          required: false,
          placeholder: 'e.g., 2 hours, 1 day, 1 week',
          order: 5,
        },
        {
          id: 'field-1-6',
          sectionId: 'section-1',
          label: 'Tags',
          type: 'text',
          required: false,
          placeholder: 'bug, feature, enhancement, etc.',
          order: 6,
        },
      ],
    },
    
    // Seção 2: Problem Description
    {
      id: 'section-2',
      title: 'Problem Description',
      order: 2,
      fields: [
        {
          id: 'field-2-1',
          sectionId: 'section-2',
          label: 'What is the problem?',
          type: 'textarea',
          required: true,
          placeholder: 'Describe the problem in detail...',
          order: 1,
        },
        {
          id: 'field-2-2',
          sectionId: 'section-2',
          label: 'Why is this important?',
          type: 'textarea',
          required: false,
          placeholder: 'Business impact, user impact, technical debt...',
          order: 2,
        },
        {
          id: 'field-2-3',
          sectionId: 'section-2',
          label: 'Expected outcome',
          type: 'textarea',
          required: false,
          placeholder: 'What does success look like?',
          order: 3,
        },
      ],
    },
    
    // Seção 3: Context & Research
    {
      id: 'section-3',
      title: 'Context & Research',
      order: 3,
      fields: [
        {
          id: 'field-3-1',
          sectionId: 'section-3',
          label: 'Related tickets/issues',
          type: 'textarea',
          required: false,
          placeholder: 'Links to related tickets, GitHub issues, JIRA, etc.',
          order: 1,
        },
        {
          id: 'field-3-2',
          sectionId: 'section-3',
          label: 'Documentation links',
          type: 'textarea',
          required: false,
          placeholder: 'Relevant documentation, Stack Overflow, articles...',
          order: 2,
        },
        {
          id: 'field-3-3',
          sectionId: 'section-3',
          label: 'Similar problems solved',
          type: 'textarea',
          required: false,
          placeholder: 'How were similar problems solved before?',
          order: 3,
        },
      ],
    },
    
    // Seção 4: Root Cause Analysis
    {
      id: 'section-4',
      title: 'Root Cause Analysis',
      order: 4,
      fields: [
        {
          id: 'field-4-1',
          sectionId: 'section-4',
          label: 'What is causing the problem?',
          type: 'textarea',
          required: false,
          placeholder: 'Root cause analysis...',
          order: 1,
        },
        {
          id: 'field-4-2',
          sectionId: 'section-4',
          label: 'How did we discover it?',
          type: 'textarea',
          required: false,
          placeholder: 'Bug report, monitoring, code review...',
          order: 2,
        },
        {
          id: 'field-4-3',
          sectionId: 'section-4',
          label: 'Affected components',
          type: 'textarea',
          required: false,
          placeholder: 'Which parts of the system are affected?',
          order: 3,
        },
      ],
    },
    
    // Seção 5: Solution Plan
    {
      id: 'section-5',
      title: 'Solution Plan',
      order: 5,
      fields: [
        {
          id: 'field-5-1',
          sectionId: 'section-5',
          label: 'Proposed solution',
          type: 'textarea',
          required: true,
          placeholder: 'Detailed solution approach...',
          order: 1,
        },
        {
          id: 'field-5-2',
          sectionId: 'section-5',
          label: 'Alternative approaches',
          type: 'textarea',
          required: false,
          placeholder: 'Other ways to solve this problem...',
          order: 2,
        },
        {
          id: 'field-5-3',
          sectionId: 'section-5',
          label: 'Risks and considerations',
          type: 'textarea',
          required: false,
          placeholder: 'Potential risks, edge cases, breaking changes...',
          order: 3,
        },
      ],
    },
    
    // Seção 6: Implementation Steps
    {
      id: 'section-6',
      title: 'Implementation Steps',
      order: 6,
      fields: [
        {
          id: 'field-6-1',
          sectionId: 'section-6',
          label: 'Steps to implement',
          type: 'textarea',
          required: true,
          placeholder: '1. First step\n2. Second step\n3. ...',
          order: 1,
        },
        {
          id: 'field-6-2',
          sectionId: 'section-6',
          label: 'Files to change',
          type: 'textarea',
          required: false,
          placeholder: 'List of files that need to be modified...',
          order: 2,
        },
        {
          id: 'field-6-3',
          sectionId: 'section-6',
          label: 'Dependencies needed',
          type: 'textarea',
          required: false,
          placeholder: 'npm packages, libraries, services...',
          order: 3,
        },
      ],
    },
    
    // Seção 7: Testing & Validation
    {
      id: 'section-7',
      title: 'Testing & Validation',
      order: 7,
      fields: [
        {
          id: 'field-7-1',
          sectionId: 'section-7',
          label: 'Test cases',
          type: 'textarea',
          required: false,
          placeholder: 'Unit tests, integration tests, manual tests...',
          order: 1,
        },
        {
          id: 'field-7-2',
          sectionId: 'section-7',
          label: 'Acceptance criteria',
          type: 'textarea',
          required: true,
          placeholder: 'How do we know this is done and working?',
          order: 2,
        },
        {
          id: 'field-7-3',
          sectionId: 'section-7',
          label: 'How to validate',
          type: 'textarea',
          required: false,
          placeholder: 'Steps to validate the fix...',
          order: 3,
        },
      ],
    },
    
    // Seção 8: Notes & Follow-up
    {
      id: 'section-8',
      title: 'Notes & Follow-up',
      order: 8,
      fields: [
        {
          id: 'field-8-1',
          sectionId: 'section-8',
          label: 'Additional notes',
          type: 'textarea',
          required: false,
          placeholder: 'Any additional information, thoughts, or context...',
          order: 1,
        },
        {
          id: 'field-8-2',
          sectionId: 'section-8',
          label: 'Follow-up tasks',
          type: 'textarea',
          required: false,
          placeholder: 'Tasks to do after this ticket is complete...',
          order: 2,
        },
        {
          id: 'field-8-3',
          sectionId: 'section-8',
          label: 'Lessons learned',
          type: 'textarea',
          required: false,
          placeholder: 'What did we learn? What would we do differently?',
          order: 3,
        },
      ],
    },
  ];
};
```

## Plano de Implementação Detalhado

### Fase 1: Verificação da Estrutura Atual (15min)

1. **Revisar `seed.ts` atual**
   - Listar campos existentes
   - Comparar com especificação
   - Identificar campos faltantes

2. **Criar checklist de diferenças**
   - Campos faltantes
   - Ordem incorreta
   - Tipos incorretos
   - Placeholders incorretos

### Fase 2: Correção do Template (30min)

3. **Atualizar função `createDefaultSections()`**
   - Adicionar campos faltantes:
     - Date (seção 1)
     - Dev (seção 1)
     - Estimate (seção 1)
   - Corrigir ordem dos campos
   - Atualizar placeholders
   - Corrigir tipos de campos

4. **Verificar todas as 8 seções**
   - Seção 1: Basic Information ✓
   - Seção 2: Problem Description ✓
   - Seção 3: Context & Research ✓
   - Seção 4: Root Cause Analysis ✓
   - Seção 5: Solution Plan ✓
   - Seção 6: Implementation Steps ✓
   - Seção 7: Testing & Validation ✓
   - Seção 8: Notes & Follow-up ✓

### Fase 3: Testes (15min)

5. **Limpar banco e reseed**
   ```bash
   # Deletar banco existente
   rm -rf data/

   # Rodar app (vai fazer seed automático)
   npm run dev
   ```

6. **Verificar template criado**
   - Navegar para `/templates`
   - Abrir template "Problem Solving Roadmap"
   - Verificar todas as seções e campos
   - Verificar ordem
   - Verificar tipos

7. **Criar ticket de teste**
   - Criar novo ticket usando template
   - Preencher todos os campos
   - Verificar que campos aparecem corretamente
   - Exportar para markdown e verificar formato

## Checklist de Validação

### Seção 1: Basic Information

- [ ] Campo "Title" existe (text, required)
- [ ] Campo "Date" existe (date, required)
- [ ] Campo "Dev" existe (text, required)
- [ ] Campo "Status" existe (select, required)
- [ ] Campo "Estimate" existe (text, optional)
- [ ] Campo "Tags" existe (text, optional)
- [ ] Status tem 4 opções: To Do, In Progress, Blocked, Done
- [ ] Campos estão na ordem correta

### Seção 2: Problem Description

- [ ] Campo "What is the problem?" existe (textarea, required)
- [ ] Campo "Why is this important?" existe (textarea, optional)
- [ ] Campo "Expected outcome" existe (textarea, optional)
- [ ] Campos estão na ordem correta

### Seção 3: Context & Research

- [ ] Campo "Related tickets/issues" existe (textarea, optional)
- [ ] Campo "Documentation links" existe (textarea, optional)
- [ ] Campo "Similar problems solved" existe (textarea, optional)
- [ ] Campos estão na ordem correta

### Seção 4: Root Cause Analysis

- [ ] Campo "What is causing the problem?" existe (textarea, optional)
- [ ] Campo "How did we discover it?" existe (textarea, optional)
- [ ] Campo "Affected components" existe (textarea, optional)
- [ ] Campos estão na ordem correta

### Seção 5: Solution Plan

- [ ] Campo "Proposed solution" existe (textarea, required)
- [ ] Campo "Alternative approaches" existe (textarea, optional)
- [ ] Campo "Risks and considerations" existe (textarea, optional)
- [ ] Campos estão na ordem correta

### Seção 6: Implementation Steps

- [ ] Campo "Steps to implement" existe (textarea, required)
- [ ] Campo "Files to change" existe (textarea, optional)
- [ ] Campo "Dependencies needed" existe (textarea, optional)
- [ ] Campos estão na ordem correta

### Seção 7: Testing & Validation

- [ ] Campo "Test cases" existe (textarea, optional)
- [ ] Campo "Acceptance criteria" existe (textarea, required)
- [ ] Campo "How to validate" existe (textarea, optional)
- [ ] Campos estão na ordem correta

### Seção 8: Notes & Follow-up

- [ ] Campo "Additional notes" existe (textarea, optional)
- [ ] Campo "Follow-up tasks" existe (textarea, optional)
- [ ] Campo "Lessons learned" existe (textarea, optional)
- [ ] Campos estão na ordem correta

### Geral

- [ ] Template tem exatamente 8 seções
- [ ] Seções estão na ordem correta (1-8)
- [ ] Nome do template: "Problem Solving Roadmap"
- [ ] Description está presente
- [ ] Todos os IDs são únicos
- [ ] Placeholders são informativos
- [ ] Campos required/optional corretos

## Possíveis Desafios e Soluções

### Desafio 1: Banco Já Tem Template Antigo

**Problema:** Template antigo já existe com estrutura diferente.

**Solução:**
```typescript
// Adicionar lógica de migração
export const migrateTemplate = async (repository: ITemplateRepository): Promise<void> => {
  const existing = await repository.findByName('Problem Solving Roadmap');
  
  if (existing) {
    // Deletar template antigo
    await repository.delete(existing.id);
    console.log('Old template deleted');
  }
  
  // Criar novo template
  await seedDefaultTemplate(repository);
};
```

### Desafio 2: Tickets Existentes Baseados no Template Antigo

**Problema:** Tickets criados com template antigo podem quebrar.

**Solução:**
- Tickets mantêm dados no formato JSON flexível
- Campos faltantes aparecem vazios
- Adicionar migration script se necessário

## Exemplo de Markdown Exportado

Após correção, o markdown exportado deve seguir este formato:

```markdown
# [Title do Ticket]

**Date:** 2025-01-15
**Dev:** John Doe
**Status:** In Progress
**Estimate:** 2 hours
**Tags:** bug, urgent

## Problem Description

### What is the problem?
[Description...]

### Why is this important?
[Impact...]

### Expected outcome
[Success criteria...]

## Context & Research

### Related tickets/issues
[Links...]

### Documentation links
[References...]

### Similar problems solved
[Previous solutions...]

## Root Cause Analysis

### What is causing the problem?
[Root cause...]

### How did we discover it?
[Discovery method...]

### Affected components
[Components list...]

## Solution Plan

### Proposed solution
[Solution details...]

### Alternative approaches
[Alternatives...]

### Risks and considerations
[Risks...]

## Implementation Steps

### Steps to implement
1. First step
2. Second step
3. ...

### Files to change
- file1.ts
- file2.tsx

### Dependencies needed
- package1
- package2

## Testing & Validation

### Test cases
[Test scenarios...]

### Acceptance criteria
[Criteria...]

### How to validate
[Validation steps...]

## Notes & Follow-up

### Additional notes
[Notes...]

### Follow-up tasks
[Tasks...]

### Lessons learned
[Lessons...]
```

## Critérios de Aceite

- ✅ Template tem campo "Date" na seção 1
- ✅ Template tem campo "Dev" na seção 1
- ✅ Template tem campo "Estimate" na seção 1
- ✅ Todas as 8 seções estão corretas
- ✅ Ordem dos campos corresponde à especificação
- ✅ Placeholders são informativos
- ✅ Tipos de campos corretos
- ✅ Required/optional corretos
- ✅ Criar ticket funciona corretamente
- ✅ Export markdown segue formato esperado

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

