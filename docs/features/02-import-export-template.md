# Feature 02: Import/Export de Template (RF5.2, RF5.6)

## Contexto e Objetivo

**Prioridade:** 🟡 Média  
**Estimativa:** 3-4 horas  
**Tipo:** Feature

Criar UI completa para importar e exportar templates como arquivos JSON, permitindo compartilhamento de templates entre usuários e backup individual de templates.

## Requisitos Técnicos

### Dependências

Não requer dependências adicionais - usa APIs nativas do browser.

### APIs do Browser Utilizadas

- **File API**: Para upload de arquivos
- **Blob API**: Para gerar arquivos para download
- **FileReader API**: Para ler conteúdo de arquivos

## Arquitetura e Design

### Fluxo de Export

```
User Click "Export Template"
    ↓
Template → JSON.stringify()
    ↓
Create Blob
    ↓
Create download link
    ↓
Trigger download
    ↓
Show success toast
```

### Fluxo de Import

```
User selects JSON file
    ↓
Read file content
    ↓
Parse JSON
    ↓
Validate schema (Zod)
    ↓
Show preview modal
    ↓
User confirms
    ↓
Save to database
    ↓
Refresh template list
    ↓
Show success toast
```

## Arquivos a Criar

### 1. `src/app/components/template/ImportTemplateModal.tsx`

**Responsabilidade:** Modal completo para importação de template com validação e preview.

**Estrutura:**

```typescript
interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (template: Template) => void;
}

// Estados internos
const [file, setFile] = useState<File | null>(null);
const [template, setTemplate] = useState<Template | null>(null);
const [errors, setErrors] = useState<string[]>([]);
const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
```

**Funcionalidades:**

1. **Step 1: Upload**
   - Drag & drop zone
   - File input button
   - Validação de tipo de arquivo (.json)
   - Validação de tamanho (max 5MB)

2. **Step 2: Preview**
   - Mostra nome do template
   - Mostra número de seções
   - Mostra número total de campos
   - Lista resumida de seções/campos
   - Botões: "Cancel" e "Import"

3. **Step 3: Importing**
   - Loading spinner
   - Mensagem "Importing template..."

**Validações:**

```typescript
// Schema de validação com Zod
const TemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    order: z.number(),
    fields: z.array(z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'radio']),
      required: z.boolean(),
      order: z.number(),
      // ... outros campos
    }))
  }))
});
```

## Arquivos a Editar

### 1. `src/app/pages/TemplatesPage.tsx`

**Mudanças:**

Adicionar botões de Import/Export na toolbar:

```typescript
// Na toolbar, adicionar:
<div className="flex gap-2">
  <Button onClick={handleExportTemplate}>
    <Download className="mr-2 h-4 w-4" />
    Export Template
  </Button>
  <Button onClick={() => setImportModalOpen(true)}>
    <Upload className="mr-2 h-4 w-4" />
    Import Template
  </Button>
</div>

// Modal de import
<ImportTemplateModal
  isOpen={importModalOpen}
  onClose={() => setImportModalOpen(false)}
  onSuccess={handleImportSuccess}
/>
```

**Handlers:**

```typescript
const handleExportTemplate = (template: Template) => {
  // Gerar JSON
  const json = JSON.stringify(template, null, 2);
  
  // Criar blob
  const blob = new Blob([json], { type: 'application/json' });
  
  // Criar download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Show success toast
  toast.success('Template exported successfully');
};

const handleImportSuccess = async (template: Template) => {
  // Salvar template
  await templateService.createTemplate(template);
  
  // Refresh lista
  await refreshTemplates();
  
  // Fechar modal
  setImportModalOpen(false);
  
  // Show success toast
  toast.success('Template imported successfully');
};
```

## Plano de Implementação Detalhado

### Fase 1: Export Básico (1h)

1. **Adicionar botão "Export" no `TemplatesPage.tsx`**
   - No card de cada template
   - Na lista de templates

2. **Implementar função de export**
   - Serializar template para JSON
   - Criar blob e download

3. **Testar export**
   - Verificar JSON gerado
   - Verificar nome do arquivo
   - Verificar formato

### Fase 2: Import Modal - Upload (1h)

4. **Criar `ImportTemplateModal.tsx`**
   - Estrutura básica do modal
   - Drag & drop zone
   - File input

5. **Implementar upload de arquivo**
   - Handler de file change
   - Handler de drag & drop
   - Validação de tipo/tamanho

6. **Implementar parsing**
   - FileReader para ler conteúdo
   - JSON.parse com try/catch
   - Mensagens de erro claras

### Fase 3: Validação e Preview (1h)

7. **Implementar validação com Zod**
   - Schema completo
   - Validar template
   - Coletar erros

8. **Implementar preview**
   - Layout do preview
   - Informações do template
   - Lista de seções/campos

### Fase 4: Importação e Integração (1h)

9. **Implementar importação**
   - Salvar no banco
   - Gerar novos IDs se necessário
   - Tratamento de duplicatas

10. **Integrar com `TemplatesPage.tsx`**
    - Botão de import
    - Modal state
    - Refresh após import

11. **Testes finais**
    - Fluxo completo
    - Casos de erro
    - UX polish

## Estruturas de Dados

### Template JSON Format

```json
{
  "name": "Problem Solving Roadmap",
  "description": "Template for daily standup",
  "version": "1.0.0",
  "sections": [
    {
      "id": "section-1",
      "title": "Basic Information",
      "order": 1,
      "fields": [
        {
          "id": "field-1",
          "label": "Title",
          "type": "text",
          "required": true,
          "order": 1,
          "placeholder": "Enter ticket title"
        },
        {
          "id": "field-2",
          "label": "Status",
          "type": "select",
          "required": true,
          "order": 2,
          "options": [
            { "label": "To Do", "value": "todo" },
            { "label": "In Progress", "value": "in_progress" },
            { "label": "Done", "value": "done" }
          ]
        }
      ]
    }
  ],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### Validation Error Format

```typescript
interface ValidationError {
  field: string;
  message: string;
  path: string[]; // Ex: ['sections', '0', 'fields', '2', 'type']
}
```

## Casos de Uso

### Caso 1: Exportar Template

**Pré-condição:** Usuário tem templates criados

1. Usuário navega para `/templates`
2. Usuário clica em menu (...) de um template
3. Usuário clica em "Export"
4. Browser faz download de arquivo JSON
5. Toast de sucesso é mostrado
6. Arquivo é salvo em Downloads com nome: `{template-name}.json`

### Caso 2: Importar Template Válido

**Pré-condição:** Usuário tem arquivo JSON de template

1. Usuário navega para `/templates`
2. Usuário clica em "Import Template"
3. Modal abre
4. Usuário arrasta arquivo JSON para drop zone
5. Sistema lê e valida arquivo
6. Preview é mostrado com detalhes do template
7. Usuário clica em "Import"
8. Sistema salva template no banco
9. Modal fecha
10. Template aparece na lista
11. Toast de sucesso é mostrado

### Caso 3: Importar Template Inválido

**Pré-condição:** Usuário tem arquivo JSON inválido

1. Usuário navega para `/templates`
2. Usuário clica em "Import Template"
3. Modal abre
4. Usuário seleciona arquivo JSON
5. Sistema lê arquivo
6. Sistema detecta erros de validação
7. Erros são mostrados em lista clara:
   - "Missing required field: name"
   - "Invalid field type at sections[0].fields[2]"
8. Usuário corrige arquivo ou cancela
9. Usuário tenta novamente ou fecha modal

## Validação e Testes

### Checklist de Validação

**Export:**
- [ ] Exportar template gera JSON válido
- [ ] Nome do arquivo é correto (slug do nome)
- [ ] JSON contém todos os campos necessários
- [ ] JSON é formatado (pretty print)
- [ ] Download funciona em todos os browsers
- [ ] Toast de sucesso é mostrado

**Import:**
- [ ] Drag & drop funciona
- [ ] File input funciona
- [ ] Validação rejeita arquivo não-JSON
- [ ] Validação rejeita arquivo muito grande (>5MB)
- [ ] Parsing detecta JSON inválido
- [ ] Schema validation detecta campos faltantes
- [ ] Schema validation detecta tipos inválidos
- [ ] Preview mostra informações corretas
- [ ] Importação salva no banco corretamente
- [ ] Lista de templates atualiza após import
- [ ] Modal fecha após import bem-sucedido
- [ ] Toast de sucesso é mostrado
- [ ] Erros são mostrados de forma clara

### Cenários de Erro

**Export:**
- [ ] Template muito grande (>10MB) - Avisar usuário
- [ ] Erro ao serializar JSON - Mostrar erro técnico

**Import:**
- [ ] Arquivo não é JSON - "Invalid JSON file"
- [ ] JSON malformado - "Failed to parse JSON: {error}"
- [ ] Schema inválido - Lista detalhada de erros
- [ ] Erro ao salvar - "Failed to save template: {error}"
- [ ] Template com nome duplicado - Perguntar se quer sobrescrever

## Possíveis Desafios e Soluções

### Desafio 1: IDs Duplicados

**Problema:** Template importado pode ter IDs que já existem no banco.

**Solução:**
```typescript
const regenerateIds = (template: Template): Template => {
  return {
    ...template,
    id: generateId(),
    sections: template.sections.map(section => ({
      ...section,
      id: generateId(),
      fields: section.fields.map(field => ({
        ...field,
        id: generateId()
      }))
    }))
  };
};
```

### Desafio 2: Versões Incompatíveis

**Problema:** Template exportado em versão antiga pode ser incompatível.

**Solução:**
- Incluir `version` no JSON
- Implementar migrations para versões antigas
- Mostrar aviso se versão for muito antiga

```typescript
const migrateTemplate = (template: any, fromVersion: string): Template => {
  if (fromVersion === '1.0.0') {
    // Migrar de 1.0.0 para 2.0.0
    return {
      ...template,
      version: '2.0.0',
      // ... transformações
    };
  }
  return template;
};
```

### Desafio 3: Templates Muito Grandes

**Problema:** JSON pode ser muito grande e travar o browser.

**Solução:**
- Limitar tamanho de arquivo (5MB)
- Usar Web Workers para parsing de arquivos grandes
- Mostrar loading durante parsing

### Desafio 4: Nomes Duplicados

**Problema:** Template importado pode ter nome igual a existente.

**Solução:**
```typescript
const handleDuplicateName = async (template: Template) => {
  const existing = await templateService.getByName(template.name);
  
  if (existing) {
    const confirmed = await confirm(
      'A template with this name already exists. Do you want to rename it?'
    );
    
    if (confirmed) {
      template.name = `${template.name} (Copy)`;
    } else {
      throw new Error('Import cancelled');
    }
  }
};
```

## UI/UX Detalhes

### Drag & Drop Zone

```typescript
<div
  className={cn(
    "border-2 border-dashed rounded-lg p-8 text-center",
    isDragging ? "border-primary bg-primary/5" : "border-gray-300"
  )}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
>
  <Upload className="mx-auto h-12 w-12 text-gray-400" />
  <p className="mt-2 text-sm text-gray-600">
    Drag and drop your template JSON file here
  </p>
  <p className="text-xs text-gray-500">or</p>
  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
    Choose File
  </Button>
  <input
    ref={fileInputRef}
    type="file"
    accept=".json"
    className="hidden"
    onChange={handleFileChange}
  />
</div>
```

### Preview Layout

```typescript
<div className="space-y-4">
  <div>
    <h3 className="font-semibold">{template.name}</h3>
    {template.description && (
      <p className="text-sm text-gray-600">{template.description}</p>
    )}
  </div>
  
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <span className="text-gray-600">Sections:</span>
      <span className="ml-2 font-medium">{template.sections.length}</span>
    </div>
    <div>
      <span className="text-gray-600">Fields:</span>
      <span className="ml-2 font-medium">{totalFields}</span>
    </div>
  </div>
  
  <Accordion type="single" collapsible>
    {template.sections.map(section => (
      <AccordionItem key={section.id} value={section.id}>
        <AccordionTrigger>{section.title}</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-1 text-sm">
            {section.fields.map(field => (
              <li key={field.id}>
                {field.label} ({field.type})
                {field.required && <Badge>Required</Badge>}
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
</div>
```

### Error Display

```typescript
{errors.length > 0 && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Validation Errors</AlertTitle>
    <AlertDescription>
      <ul className="list-disc list-inside space-y-1 text-sm">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </AlertDescription>
  </Alert>
)}
```

## Critérios de Aceite

- ✅ Export gera JSON válido e bem formatado
- ✅ Nome do arquivo exportado é baseado no nome do template
- ✅ Import aceita drag & drop de arquivos
- ✅ Import aceita seleção de arquivos
- ✅ Validação rejeita arquivos não-JSON
- ✅ Validação rejeita schemas inválidos
- ✅ Erros de validação são mostrados de forma clara
- ✅ Preview mostra informações corretas do template
- ✅ Importação salva template no banco
- ✅ Lista atualiza após importação bem-sucedida
- ✅ Toasts informativos são mostrados
- ✅ IDs duplicados são tratados (regenerados)
- ✅ Nomes duplicados são tratados

## Recursos Adicionais

### Exemplo de Template JSON Completo

Ver arquivo: `docs/examples/template-example.json`

### Bibliotecas de Referência

- [File API MDN](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Zod Documentation](https://zod.dev/)

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

