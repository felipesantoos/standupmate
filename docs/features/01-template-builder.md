# Feature 01: Template Builder (RF2)

## Contexto e Objetivo

**Prioridade:** 🔴 Alta  
**Estimativa:** 10-15 horas  
**Tipo:** Feature Crítica

Criar um editor visual completo para templates com funcionalidade de drag & drop, permitindo que usuários criem e personalizem templates de forma intuitiva sem precisar editar JSON manualmente.

## Requisitos Técnicos

### Dependências Necessárias

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
```

### Bibliotecas Utilizadas

- **@dnd-kit/core**: Core do sistema de drag and drop
- **@dnd-kit/sortable**: Funcionalidade de reordenação
- **@dnd-kit/modifiers**: Modificadores para controle fino do drag
- **zod**: Validação de schemas
- **react-hook-form**: Gerenciamento de formulários

## Arquitetura e Design

### Estrutura de Componentes

```
TemplateBuilderPage (Container Principal)
├── SectionBuilder (Lista de Seções)
│   └── SortableSection (Seção Draggable)
│       └── FieldBuilder (Lista de Campos)
│           └── SortableField (Campo Draggable)
├── FieldPropertyEditor (Painel de Propriedades)
└── TemplatePreview (Preview em Tempo Real)
```

### Layout da Página

**3 Colunas Responsivas:**

1. **Coluna Esquerda (40%)**: Sections & Fields Builder
2. **Coluna Central (30%)**: Field Property Editor
3. **Coluna Direita (30%)**: Live Preview

## Arquivos a Criar

### 1. `src/app/pages/TemplateBuilderPage.tsx`

**Responsabilidade:** Container principal que gerencia estado global do template e coordena os 3 painéis.

**Estrutura:**

```typescript
interface TemplateBuilderPageProps {
  // Para novo template
  mode: 'new' | 'edit';
  // Para edição
  templateId?: string;
}

// Estado principal
const [template, setTemplate] = useState<Template>();
const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
const [isDirty, setIsDirty] = useState(false);

// Handlers principais
const handleAddSection = () => {};
const handleRemoveSection = (sectionId: string) => {};
const handleReorderSections = (sections: Section[]) => {};
const handleAddField = (sectionId: string) => {};
const handleRemoveField = (fieldId: string) => {};
const handleUpdateField = (fieldId: string, updates: Partial<Field>) => {};
const handleSave = async () => {};
const handlePublish = async () => {};
```

**Funcionalidades:**

- Carregamento de template existente (quando `mode === 'edit'`)
- Estado de "dirty" para alertar sobre mudanças não salvas
- Auto-save a cada 30 segundos (usando `useAutoSave` hook)
- Validação antes de salvar
- Navegação com confirmação se houver mudanças não salvas

---

### 2. `src/app/components/template/SectionBuilder.tsx`

**Responsabilidade:** Gerencia a lista de seções com drag & drop.

**Estrutura:**

```typescript
interface SectionBuilderProps {
  sections: Section[];
  onReorder: (sections: Section[]) => void;
  onAddSection: () => void;
  onRemoveSection: (sectionId: string) => void;
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
}
```

**Funcionalidades:**

- Renderizar lista de `SortableSection`
- Botão "Add Section" no topo
- Integração com `@dnd-kit/sortable` para reordenação
- Colapsável (expandir/colapsar seções)
- Contador de campos por seção

---

### 3. `src/app/components/template/SortableSection.tsx`

**Responsabilidade:** Seção individual draggable que contém campos.

**Estrutura:**

```typescript
interface SortableSectionProps {
  section: Section;
  onRemove: () => void;
  onUpdateTitle: (title: string) => void;
  children: React.ReactNode; // FieldBuilder
}
```

**Funcionalidades:**

- Handle de drag visível
- Inline editing do título da seção
- Botão de remoção com confirmação
- Indicador visual durante drag
- Estado de collapsed/expanded persistido em localStorage

---

### 4. `src/app/components/template/FieldBuilder.tsx`

**Responsabilidade:** Lista de campos dentro de uma seção com drag & drop.

**Estrutura:**

```typescript
interface FieldBuilderProps {
  sectionId: string;
  fields: Field[];
  onReorder: (fields: Field[]) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
}
```

**Funcionalidades:**

- Renderizar lista de `SortableField`
- Botão "Add Field" no final da seção
- Reordenação de campos dentro da seção
- Highlight do campo selecionado
- Preview compacto de cada campo (label + type)

---

### 5. `src/app/components/template/SortableField.tsx`

**Responsabilidade:** Campo individual draggable.

**Estrutura:**

```typescript
interface SortableFieldProps {
  field: Field;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
}
```

**Funcionalidades:**

- Handle de drag visível
- Click para selecionar (abre editor de propriedades)
- Botão de remoção
- Badge do tipo de campo (text, number, select, etc.)
- Indicador de "required"
- Indicador visual de campo selecionado

---

### 6. `src/app/components/template/FieldPropertyEditor.tsx`

**Responsabilidade:** Painel de edição de propriedades do campo selecionado.

**Estrutura:**

```typescript
interface FieldPropertyEditorProps {
  field: Field | null;
  onUpdate: (updates: Partial<Field>) => void;
}
```

**Propriedades Editáveis:**

1. **Label** (text input)
2. **Type** (select)
   - text
   - textarea
   - number
   - date
   - select
   - checkbox
   - radio
3. **Required** (toggle)
4. **Placeholder** (text input, condicional ao type)
5. **Validation** (objeto complexo)
   - min/max (para number/text)
   - pattern (regex para text)
6. **Options** (para select/radio)
   - Lista editável de options
   - Cada option tem: label e value

**Funcionalidades:**

- Form controlado com `react-hook-form`
- Validação em tempo real
- Campos condicionais (ex: options só aparece se type = select)
- Botão "Reset to default"
- Indicador de mudanças não salvas

---

### 7. `src/app/components/template/TemplatePreview.tsx`

**Responsabilidade:** Preview em tempo real do template como será renderizado.

**Estrutura:**

```typescript
interface TemplatePreviewProps {
  template: Template;
}
```

**Funcionalidades:**

- Renderizar template usando componentes reais do form
- Scroll sincronizado com seleção (scroll para campo selecionado)
- Modo de preview (não editável)
- Botão de "Toggle device" (desktop/mobile preview)
- Placeholder data para demonstração

---

### 8. `src/app/components/template/ImportTemplateModal.tsx`

**Responsabilidade:** Modal para importar template de arquivo JSON.

**Estrutura:**

```typescript
interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: Template) => void;
}
```

**Funcionalidades:**

- Upload de arquivo JSON (drag & drop ou file input)
- Validação de schema com Zod
- Preview do template antes de importar
- Tratamento de erros detalhado
- Loading state durante validação
- Toast notifications para sucesso/erro

## Plano de Implementação Detalhado

### Fase 1: Setup e Estrutura Base (2-3h)

1. **Instalar dependências**
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
   ```

2. **Criar estrutura de arquivos**
   - Criar todos os 8 arquivos listados acima
   - Criar tipos/interfaces TypeScript necessários

3. **Setup de rotas**
   - Adicionar rotas `/templates/builder/new` e `/templates/builder/:id` no router
   - Configurar navegação no `NavMain.tsx`

### Fase 2: Componentes Base (3-4h)

4. **Implementar `SortableField.tsx`**
   - Componente mais simples
   - Integração básica com `@dnd-kit`
   - Estilos e visual

5. **Implementar `SortableSection.tsx`**
   - Similar ao `SortableField`
   - Container para campos

6. **Implementar `FieldBuilder.tsx`**
   - Lista de `SortableField`
   - Lógica de reordenação

7. **Implementar `SectionBuilder.tsx`**
   - Lista de `SortableSection`
   - Lógica de reordenação de seções

### Fase 3: Editor de Propriedades (2-3h)

8. **Implementar `FieldPropertyEditor.tsx`**
   - Form completo com todos os campos
   - Validação com Zod
   - Campos condicionais
   - Editor de options para select/radio

### Fase 4: Preview e Container Principal (2-3h)

9. **Implementar `TemplatePreview.tsx`**
   - Renderização do template
   - Usar componentes de `DynamicField.tsx`

10. **Implementar `TemplateBuilderPage.tsx`**
    - Layout 3 colunas
    - Estado global
    - Integração com `TemplateService`
    - Auto-save

### Fase 5: Import e Refinamentos (2-3h)

11. **Implementar `ImportTemplateModal.tsx`**
    - Upload de arquivo
    - Validação
    - Preview

12. **Refinamentos finais**
    - Atalhos de teclado
    - Animações
    - Loading states
    - Error boundaries
    - Testes manuais

## Estruturas de Dados

### Template

```typescript
interface Template {
  id: string;
  name: string;
  description?: string;
  version: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}
```

### Section

```typescript
interface Section {
  id: string;
  title: string;
  order: number;
  fields: Field[];
}
```

### Field

```typescript
interface Field {
  id: string;
  sectionId: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  order: number;
  validation?: FieldValidation;
  options?: FieldOption[]; // Para select/radio
}

type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio';

interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

interface FieldOption {
  label: string;
  value: string;
}
```

## Integração com Sistema Existente

### TemplateService

```typescript
// Métodos a utilizar
templateService.createTemplate(template: Template): Promise<Template>
templateService.updateTemplate(id: string, template: Template): Promise<Template>
templateService.getTemplate(id: string): Promise<Template>
templateService.validateTemplate(template: Template): boolean
```

### TemplateContext

```typescript
// Usar contexto para cache e sincronização
const { templates, refreshTemplates } = useTemplateContext();
```

### Navegação

```typescript
// Após salvar
navigate(`/templates`);

// Com confirmação se dirty
const handleNavigate = () => {
  if (isDirty) {
    if (confirm('You have unsaved changes. Are you sure?')) {
      navigate('/templates');
    }
  } else {
    navigate('/templates');
  }
};
```

## Casos de Uso

### Caso 1: Criar Novo Template

1. Usuário clica em "New Template" na página de Templates
2. Navega para `/templates/builder/new`
3. Template começa vazio (ou com 1 seção padrão)
4. Usuário adiciona seções e campos via drag & drop
5. Usuário edita propriedades de cada campo
6. Preview atualiza em tempo real
7. Usuário clica "Save"
8. Template é validado e salvo
9. Usuário é redirecionado para lista de templates

### Caso 2: Editar Template Existente

1. Usuário clica em "Edit" em um template existente
2. Navega para `/templates/builder/:id`
3. Template é carregado do banco
4. Usuário faz modificações
5. Auto-save a cada 30 segundos
6. Usuário clica "Save" ou "Publish"
7. Template é atualizado

### Caso 3: Importar Template

1. Usuário clica em "Import Template"
2. Modal abre com upload de arquivo
3. Usuário faz upload de JSON
4. Sistema valida schema
5. Preview é mostrado
6. Usuário confirma importação
7. Template é criado/atualizado

## Validação e Testes

### Checklist de Validação

- [ ] Drag & drop de seções funciona suavemente
- [ ] Drag & drop de campos funciona suavemente
- [ ] Não é possível arrastar campo para fora da seção
- [ ] Preview atualiza em tempo real ao editar campo
- [ ] Propriedades de campo salvam corretamente
- [ ] Campos condicionais aparecem/desaparecem conforme type
- [ ] Validação de campos funciona (required, min/max, pattern)
- [ ] Auto-save funciona a cada 30 segundos
- [ ] Confirmação ao navegar com mudanças não salvas
- [ ] Import valida schema corretamente
- [ ] Import mostra preview antes de confirmar
- [ ] Erro de validação mostra mensagem clara
- [ ] Loading states aparecem durante save/load
- [ ] Template salvo pode ser carregado e editado novamente
- [ ] Reordenação persiste após save
- [ ] Remover seção remove todos os campos
- [ ] Remover campo atualiza preview
- [ ] Atalhos de teclado funcionam (Cmd+S para salvar)

### Cenários de Erro

- [ ] Template ID inválido ao carregar (404)
- [ ] Falha ao salvar (erro de rede)
- [ ] JSON inválido ao importar
- [ ] Schema incompatível ao importar
- [ ] Validação falha ao salvar

## Possíveis Desafios e Soluções

### Desafio 1: Performance com Muitos Campos

**Problema:** Drag & drop pode ficar lento com 50+ campos.

**Solução:**
- Virtualização de lista com `react-window`
- Lazy rendering de preview
- Debounce de updates

### Desafio 2: Sincronização de Estado

**Problema:** Estado complexo entre 3 painéis.

**Solução:**
- Usar reducer para gerenciar estado do template
- Context API ou Zustand para estado compartilhado
- Callbacks controlados

### Desafio 3: Validação de Schema

**Problema:** Validação de template pode ser complexa.

**Solução:**
- Usar Zod para schemas tipados
- Validação incremental (por campo)
- Mensagens de erro detalhadas

### Desafio 4: Auto-save vs Manual Save

**Problema:** Conflito entre auto-save e intenção do usuário.

**Solução:**
- Auto-save em drafts (separado de publish)
- Indicador visual de "Saving..."
- Botão manual "Publish" para versão final

## Atalhos de Teclado

- `Cmd/Ctrl + S`: Salvar template
- `Cmd/Ctrl + N`: Nova seção
- `Cmd/Ctrl + Shift + N`: Novo campo
- `Delete/Backspace`: Remover item selecionado (com confirmação)
- `Esc`: Desselecionar campo
- `Cmd/Ctrl + Z`: Undo (implementar stack de undo)
- `Cmd/Ctrl + Shift + Z`: Redo

## Critérios de Aceite

- ✅ Criar template visualmente (arrastar campos, editar propriedades)
- ✅ Preview em tempo real funciona
- ✅ Salvar template e carregar por ID funciona
- ✅ Drag & drop funciona sem bugs
- ✅ Validação de template funciona
- ✅ Import de JSON funciona com validação
- ✅ Auto-save funciona
- ✅ Confirmação ao sair com mudanças não salvas
- ✅ Editor de propriedades mostra campos corretos para cada tipo
- ✅ Reordenação persiste após reload

## Recursos Adicionais

### Documentação de Referência

- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### Inspiração de UI

- Notion's database properties editor
- Airtable's field customization
- Google Forms builder
- Typeform builder

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

