# Feature 07: Rich Text para Campos Markdown

## Contexto e Objetivo

**Prioridade:** 🟡 Média  
**Estimativa:** 3-5 horas  
**Tipo:** UX Improvement

Melhorar experiência de edição de campos markdown com editor rich text WYSIWYG, mantendo compatibilidade com markdown plain text.

## Requisitos Técnicos

### Dependências Necessárias

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-markdown
npm install @tiptap/extension-placeholder @tiptap/extension-link
```

### Bibliotecas

- **TipTap**: Editor WYSIWYG moderno e extensível
- **@tiptap/starter-kit**: Extensões básicas (bold, italic, lists, etc.)
- **@tiptap/extension-markdown**: Suporte a markdown

## Arquitetura e Design

### Estrutura do Editor

```
MarkdownEditor Component
    ├── TipTap Editor Instance
    ├── Toolbar (formatting buttons)
    ├── Editor Area (contenteditable)
    └── Preview Tab (optional)
```

### Fluxo de Dados

```
User types in editor
    ↓
TipTap processes input
    ↓
Convert to markdown
    ↓
Update component state
    ↓
Trigger onChange callback
    ↓
Parent component updates
```

## Arquivos a Editar

### 1. `src/app/components/ui/markdown-editor.tsx`

**Mudanças:** Substituir implementação atual por TipTap.

```typescript
import React, { useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Markdown } from '@tiptap/extension-markdown';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  readOnly?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  minHeight = '200px',
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Markdown,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      // Converter para markdown e chamar onChange
      const markdown = editor.storage.markdown.getMarkdown();
      onChange(markdown);
    },
  });

  // Sincronizar value externo com editor
  useEffect(() => {
    if (editor && value !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  if (readOnly) {
    return (
      <div className={cn('prose prose-sm max-w-none', className)}>
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className={cn('border rounded-md', className)}>
      {/* Toolbar */}
      <EditorToolbar editor={editor} />
      
      <Separator />
      
      {/* Editor Area */}
      <EditorContent
        editor={editor}
        className="px-4 py-3 prose prose-sm max-w-none focus-within:outline-none"
        style={{ minHeight }}
      />
    </div>
  );
};

// Toolbar Component
interface EditorToolbarProps {
  editor: Editor;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const ToolbarButton: React.FC<{
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }> = ({ onClick, active, disabled, children, title }) => (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50">
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Cmd+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Cmd+Shift+Z)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Cmd+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Cmd+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Inline Code (Cmd+E)"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Link */}
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive('link')}
        title="Add Link (Cmd+K)"
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
};

// Preview Component (para mostrar markdown renderizado)
export const MarkdownPreview: React.FC<{ content: string; className?: string }> = ({
  content,
  className,
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content,
    editable: false,
  });

  if (!editor) return null;

  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <EditorContent editor={editor} />
    </div>
  );
};
```

## Plano de Implementação Detalhado

### Fase 1: Setup e Dependências (30min)

1. **Instalar dependências**
   ```bash
   npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-markdown @tiptap/extension-placeholder @tiptap/extension-link
   ```

2. **Verificar compatibilidade**
   - Testar importações
   - Verificar versões

### Fase 2: Implementar Editor Base (1.5-2h)

3. **Substituir `markdown-editor.tsx`**
   - Implementar TipTap editor
   - Configurar extensões
   - Setup básico

4. **Implementar Toolbar**
   - Botões de formatação
   - Ícones
   - Estados ativos

5. **Testar editor básico**
   - Typing
   - Formatting
   - Markdown output

### Fase 3: Extensões e Features (1-1.5h)

6. **Adicionar extensões**
   - Links
   - Placeholder
   - Markdown conversion

7. **Implementar keyboard shortcuts**
   - Cmd+B (bold)
   - Cmd+I (italic)
   - Cmd+K (link)
   - etc.

8. **Testar extensões**
   - Links funcionam
   - Placeholders aparecem
   - Shortcuts funcionam

### Fase 4: Polish e Integração (1h)

9. **Styling e UX**
   - Cores consistentes com tema
   - Focus states
   - Hover states
   - Responsive layout

10. **Integração com forms existentes**
    - Testar em `TicketEditPage`
    - Testar em `TemplateBuilder`

11. **Testes finais**
    - Markdown compatibility
    - Copy/paste
    - Performance

## Casos de Uso

### Caso 1: Editar Ticket com Rich Text

1. Developer abre ticket
2. Clica em campo markdown
3. Editor WYSIWYG aparece com toolbar
4. Developer usa botões para formatar:
   - Clica em "Bold" e digita texto em negrito
   - Clica em "List" e adiciona itens
   - Clica em "Link" e adiciona URL
5. Ao salvar, conteúdo é convertido para markdown
6. Markdown é salvo no banco
7. Ao exportar, markdown válido é gerado

### Caso 2: Preview de Markdown Existente

1. Ticket tem markdown existente
2. Developer abre editor
3. Markdown é convertido para rich text
4. Developer vê formatação visual
5. Developer edita usando toolbar
6. Salva e markdown atualizado é gerado

## Validação e Testes

### Checklist de Validação

**Editor:**
- [ ] Editor renderiza corretamente
- [ ] Toolbar mostra todos os botões
- [ ] Typing funciona normalmente
- [ ] Focus states funcionam
- [ ] Min height funciona

**Formatting:**
- [ ] Bold funciona (Cmd+B)
- [ ] Italic funciona (Cmd+I)
- [ ] Strikethrough funciona
- [ ] Inline code funciona
- [ ] H1, H2, H3 funcionam
- [ ] Bullet list funciona
- [ ] Numbered list funciona
- [ ] Blockquote funciona
- [ ] Links funcionam (Cmd+K)

**Markdown:**
- [ ] Output é markdown válido
- [ ] Input markdown é convertido corretamente
- [ ] Copy/paste de markdown funciona
- [ ] Markdown existente é preservado

**UX:**
- [ ] Undo/Redo funcionam
- [ ] Placeholder aparece quando vazio
- [ ] Toolbar buttons mostram estado ativo
- [ ] Read-only mode funciona
- [ ] Responsive em mobile

### Cenários de Erro

- [ ] Markdown inválido no input
- [ ] HTML no input (deve ser sanitizado)
- [ ] Muito texto (performance)

## Possíveis Desafios e Soluções

### Desafio 1: Markdown Compatibility

**Problema:** Alguns markdown pode não converter perfeitamente.

**Solução:**
- Usar extensão oficial `@tiptap/extension-markdown`
- Testar com markdown complexo
- Adicionar custom parsers se necessário

### Desafio 2: Performance com Textos Grandes

**Problema:** Editor pode ficar lento com muito texto.

**Solução:**
- Lazy loading do editor
- Debounce do onChange
- Virtualização para preview

### Desafio 3: Styling Consistency

**Problema:** Prose styling pode conflitar com tema.

**Solução:**
```typescript
// Customizar prose styles
.prose {
  color: var(--foreground);
}

.prose h1, .prose h2, .prose h3 {
  color: var(--foreground);
}

.prose code {
  background: var(--muted);
}
```

### Desafio 4: Link Input UX

**Problema:** `window.prompt` não é ideal para UX.

**Solução:**
- Criar modal customizado para links
- Popover com input inline
- Preview de link ao hover

## Extensões Opcionais

### Code Block com Syntax Highlighting

```bash
npm install @tiptap/extension-code-block-lowlight lowlight
```

```typescript
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';

lowlight.registerLanguage('js', javascript);
lowlight.registerLanguage('ts', typescript);

const extensions = [
  // ...
  CodeBlockLowlight.configure({
    lowlight,
  }),
];
```

### Tables

```bash
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header
```

### Task Lists

```bash
npm install @tiptap/extension-task-list @tiptap/extension-task-item
```

## Atalhos de Teclado

- `Cmd/Ctrl + B`: Bold
- `Cmd/Ctrl + I`: Italic
- `Cmd/Ctrl + E`: Inline code
- `Cmd/Ctrl + Shift + X`: Strikethrough
- `Cmd/Ctrl + K`: Add link
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + Shift + Z`: Redo
- `Cmd/Ctrl + Alt + 1/2/3`: Heading 1/2/3
- `Cmd/Ctrl + Shift + 7`: Bullet list
- `Cmd/Ctrl + Shift + 8`: Numbered list
- `Cmd/Ctrl + Shift + >`: Blockquote

## Critérios de Aceite

- ✅ Editor WYSIWYG funciona
- ✅ Toolbar com todos os botões de formatação
- ✅ Export continua gerando markdown válido
- ✅ Import de markdown existente funciona
- ✅ Atalhos de teclado funcionam
- ✅ Links funcionam
- ✅ Undo/Redo funcionam
- ✅ Placeholder aparece
- ✅ Read-only mode funciona
- ✅ Styling consistente com tema

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

