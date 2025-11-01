# Standupmate – Plano de Implementação (Tauri + Backup JSON)

## Contexto e Decisões
- **Plataforma desktop:** Tauri (leve, recomendado)
- **Backup/Restore do banco:** JSON completo (dump + restore)
- **Manter arquitetura hexagonal**
- **Priorizar RF2 (Template Builder) e UX**

---

## Entregáveis por Tema

### 1. Template Builder (RF2) – Crítico

**Objetivo:** Criar editor visual completo para templates com drag & drop.

**Arquivos a criar:**
- `src/app/pages/TemplateBuilderPage.tsx` - Main editor com layout 3 colunas: Sections | Field Properties | Live Preview
- `src/app/components/template/SectionBuilder.tsx` - Gerenciamento de seções
- `src/app/components/template/FieldBuilder.tsx` - Gerenciamento de campos
- `src/app/components/template/SortableSection.tsx` - Drag & drop de seções
- `src/app/components/template/SortableField.tsx` - Drag & drop de campos
- `src/app/components/template/FieldPropertyEditor.tsx` - Editor de propriedades (type, label, required, validation, options)
- `src/app/components/template/TemplatePreview.tsx` - Preview em tempo real do template
- `src/app/components/template/ImportTemplateModal.tsx` - Modal de importação com validação

**Funcionalidades:**
- Layout 3 colunas: lista de seções/campos | editor de propriedades | preview
- Drag & drop para reordenar seções e campos (usando `@dnd-kit/core`, `@dnd-kit/sortable`)
- Adicionar/remover/editar campos e seções
- Editar propriedades de campos (type, label, required, validation, options)
- Preview em tempo real do template
- Salvar/carregar template por ID
- Rotas: `/templates/builder/new` e `/templates/builder/:id`

**Integração:**
- Conectar com `TemplateService` e `TemplateContext`
- Usar validação Zod para schemas de template

---

### 2. Import/Export de Template (RF5.2, RF5.6)

**Objetivo:** UI completa para importar e exportar templates como JSON.

**Arquivos a criar:**
- `src/app/components/template/ImportTemplateModal.tsx` - Modal com upload de arquivo, validação e preview

**Arquivos a editar:**
- `src/app/pages/TemplatesPage.tsx` - Adicionar botões "Import Template" e "Export Template"

**Funcionalidades:**
- Upload de arquivo JSON (file input)
- Validação de schema JSON antes de importar
- Preview do template antes de confirmar importação
- Tratamento de erros (JSON inválido, schema incompatível)
- Export para JSON com download automático
- Toast notifications para sucesso/erro

---

### 3. Backup/Restore de Dados (JSON dump)

**Objetivo:** Permitir exportar e importar todo o banco de dados como JSON único.

**Arquivos a criar:**
- `src/core/interfaces/secondary/IStorageService.ts` (se não existir)
- `src/infra/storage/JSONBackupService.ts` - Serviço com métodos `exportAll()` e `importAll()`

**Arquivos a editar:**
- `src/app/pages/SettingsPage.tsx` - Adicionar botões "Export database" e "Replace database"

**Funcionalidades:**
- Export: Gerar JSON único contendo todos os templates e tickets
- Import: Ler JSON, validar estrutura, substituir dados (com confirmação)
- Modal de confirmação antes de substituir dados
- Relatório de sucesso/erros (quantos templates/tickets importados)
- Versionamento do schema JSON para compatibilidade futura

**Formato JSON:**
```json
{
  "version": "1.0.0",
  "exportedAt": "2025-01-15T10:00:00Z",
  "templates": [...],
  "tickets": [...]
}
```

---

### 4. Implementation History por Ticket

**Objetivo:** Permitir registrar updates históricos em diferentes campos (útil para daily standup).

**Arquivos a editar:**
- `src/core/domain/Ticket.ts` - Adicionar campo `history: { date: string; notes: string }[]` (ou usar `data.implementation_history`)
- `src/app/pages/TicketEditPage.tsx` - Adicionar seção "Implementation History" com lista de entries e botão "Add entry"
- `src/core/services/ExportService.ts` - Incluir histórico no export MD

**Funcionalidades:**
- Seção no editor de ticket mostrando histórico de implementações
- Cada entry tem: data e notas (campo markdown)
- Botão "Add entry" adiciona nova entrada com data atual preenchida
- Entries ordenadas por data (mais recente primeiro)
- Export MD inclui seção de histórico formatada

**Estrutura:**
```typescript
interface ImplementationHistoryEntry {
  id: string;
  date: string; // ISO date
  notes: string; // Markdown
}
```

---

### 5. Timer e Pomodoro

**Objetivo:** Adicionar timer Pomodoro para foco durante trabalho em tickets.

**Arquivos a criar:**
- `src/app/hooks/usePomodoro.ts` - Hook com lógica de timer (work/break, countdown, persistência)
- `src/app/components/ui/Pomodoro.tsx` - Componente visual do timer

**Arquivos a editar:**
- `src/app/pages/TicketEditPage.tsx` - Integrar widget Pomodoro no editor
- `src/app/components/layouts/MainLayout.tsx` - Adicionar Pomodoro no header (opcional)

**Funcionalidades:**
- Timer configurável (padrão: 25min work, 5min break)
- Botões: Start, Pause, Reset
- Notificação visual/sonora ao finalizar período
- Persistência do estado (localStorage)
- Atalhos de teclado (ex: Cmd+P para iniciar/pausar)
- Exibir tempo restante de forma clara

---

### 6. Melhorias de Status dos Tickets

**Objetivo:** Facilitar atualização de status tanto na lista quanto no editor.

**Arquivos a editar:**
- `src/app/components/ticket/TicketList.tsx` - Adicionar select/dropdown inline para status em cada ticket
- `src/app/pages/TicketsPage.tsx` - Adicionar bulk update na toolbar (selecionar múltiplos + mudar status)
- `src/app/pages/TicketEditPage.tsx` - Adicionar botão dedicado para mudar status + atalho de teclado

**Funcionalidades:**
- Status inline na lista (select dropdown)
- Bulk update: selecionar múltiplos tickets e mudar status de uma vez
- Botão "Mark as Complete" destacado no editor
- Atalho de teclado (ex: Cmd+K para abrir menu de status)
- Feedback visual imediato (toast + atualização na UI)

---

### 7. Rich Text para Campos Markdown

**Objetivo:** Melhorar experiência de edição de campos markdown com editor rich text.

**Arquivos a editar:**
- `src/app/components/ui/markdown-editor.tsx` - Substituir por editor rich text (TipTap ou similar)

**Dependências:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-markdown
```

**Funcionalidades:**
- Editor WYSIWYG com toolbar (bold, italic, lists, links, etc.)
- Preview do markdown renderizado
- Export continua gerando markdown válido
- Suporte a atalhos de teclado (Cmd+B, Cmd+I, etc.)
- Salvar conteúdo como markdown no banco

---

### 8. Tradução para Inglês (i18n)

**Objetivo:** Traduzir toda a UI para inglês.

**Arquivos a criar:**
- `src/lib/i18n.ts` - Sistema simples de i18n (dicionários TypeScript)
- `src/lib/locales/en.ts` - Strings em inglês
- `src/lib/locales/pt-BR.ts` - Strings em português (opcional, para manter compatibilidade)

**Arquivos a editar:**
- Todos os componentes e páginas que contêm texto hardcoded

**Funcionalidades:**
- Sistema simples de i18n (sem biblioteca externa)
- Idioma padrão: inglês
- Função helper `t(key: string)` para traduzir strings
- Substituir todas as strings hardcoded por chamadas `t()`

**Exemplo:**
```typescript
// src/lib/i18n.ts
export const t = (key: string): string => {
  return translations['en'][key] || key;
};

// Uso
<Button>{t('create_ticket')}</Button>
```

---

### 9. Padronização Shadcn/UI + Limpeza de Logs

**Objetivo:** Padronizar componentes e remover logs desnecessários.

**Arquivos a editar:**
- Revisar todas as páginas e componentes para usar `src/app/components/ui/*` (shadcn) de forma consistente
- Remover `console.log`, `console.error` desnecessários (manter apenas erros críticos)
- Adicionar skeletons/loading states usando `src/app/components/ui/skeleton.tsx`
- Adicionar empty states com ilustrações

**Funcionalidades:**
- Substituir componentes customizados por shadcn quando possível
- Padronizar estilos (cores, espaçamento, tipografia)
- Loading skeletons em listas e cards
- Empty states informativos (ex: "No tickets yet")
- Limpeza de logs (manter apenas para debug em dev mode)

---

### 10. Naming, Favicon e UX

**Objetivo:** Melhorar branding e experiência visual.

**Arquivos a editar:**
- `index.html` - Atualizar title e meta tags com novo nome
- `package.json` - Atualizar name e description
- `README.md` - Atualizar referências ao nome
- `public/favicon.svg` - Substituir por favicon melhor (design relacionado a daily standup/tickets)

**Novo nome sugerido:** "Daily Stand Up Assistant" ou "StandupMate"

**Funcionalidades:**
- Novo favicon com design moderno
- Title atualizado em todas as páginas
- Meta tags atualizadas (description, og:title, etc.)
- Logo/branding consistente

---

### 11. Template Padrão Baseado no Markdown

**Objetivo:** Garantir que o template padrão siga exatamente o formato do `docs/problem-solving-roadmap-plan.md`.

**Arquivos a editar:**
- `src/infra/database/seed.ts` - Revisar `seedDefaultTemplate()` para alinhar 100% com o markdown

**Verificações:**
- Campo "Date" na seção 1 (atualmente não existe)
- Campo "Dev" na seção 1 (atualmente não existe)
- Campo "Estimate" na seção 1 (atualmente não existe)
- Todas as 8 seções estão corretas
- Placeholders correspondem ao markdown
- Ordem dos campos corresponde ao markdown

---

### 12. Desktop (Tauri)

**Objetivo:** Configurar e documentar como rodar a versão desktop.

**Verificações:**
- Verificar se projeto tem configuração Tauri (`tauri.conf.json`, `src-tauri/`)
- Se não tiver, adicionar scripts no `package.json`

**Arquivos a criar/editar:**
- `docs/SETUP.md` - Documentação de setup
- `package.json` - Adicionar scripts Tauri se necessário

**Scripts a adicionar (se não existirem):**
```json
{
  "scripts": {
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

**Funcionalidades:**
- Documentar como rodar `npm run tauri:dev` para desenvolvimento
- Documentar como rodar `npm run tauri:build` para build
- Documentar localização do executável gerado
- Verificar se FS operations (backup/restore JSON) funcionam no sandbox do Tauri

---

### 13. Correção: "Import database does not work"

**Objetivo:** Investigar e corrigir o problema de importação do banco.

**Investigação:**
- Verificar fluxo atual de importação em `JSONBackupService` ou similar
- Verificar parsing do JSON
- Verificar validação de schema
- Verificar tratamento de erros
- Verificar atomicidade (rollback em caso de erro)
- Verificar migração de versões do schema

**Arquivos a investigar/editar:**
- `src/infra/storage/JSONBackupService.ts` (quando criado)
- `src/app/pages/SettingsPage.tsx` - Verificar handler de import

**Correções prováveis:**
- Validação de schema mais robusta
- Tratamento de erros melhor (mostrar mensagem clara)
- Atomicidade (transação que faz rollback se falhar)
- Preview antes de importar (para usuário validar)

---

## Estimativas (part-time)

| Tema | Estimativa | Prioridade |
|------|------------|------------|
| Template Builder | 10-15h | 🔴 Alta |
| Import/Export Template UI | 3-4h | 🟡 Média |
| Backup/Restore JSON | 4-6h | 🟡 Média |
| Implementation History | 2-3h | 🟢 Baixa |
| Pomodoro | 3-4h | 🟢 Baixa |
| Status UX | 2-3h | 🟡 Média |
| Rich Text | 3-5h | 🟡 Média |
| i18n + tradução | 4-6h | 🟡 Média |
| shadcn + limpeza | 4-6h | 🟡 Média |
| Naming + favicon | 1h | 🟢 Baixa |
| Template padrão | 1-2h | 🟡 Média |
| Tauri docs/build | 1-2h | 🟡 Média |
| Fix import DB | 2-4h | 🔴 Alta |

**Total estimado:** ~40-60h (5-7 semanas part-time)

---

## Critérios de Aceite

### Template Builder
- ✅ Criar template visualmente (arrastar campos, editar propriedades)
- ✅ Preview em tempo real funciona
- ✅ Salvar template e carregar por ID funciona
- ✅ Drag & drop funciona sem bugs

### Backup/Restore
- ✅ Export gera JSON único com todos os templates e tickets
- ✅ Import substitui dados com confirmação
- ✅ Validação de schema funciona
- ✅ Relatório de sucesso/erros é claro

### Implementation History
- ✅ Adicionar entry funciona
- ✅ Entries aparecem ordenadas por data
- ✅ Export MD inclui histórico formatado

### Pomodoro
- ✅ Timer inicia/pausa/reseta
- ✅ Notificação ao finalizar período
- ✅ Estado persiste entre sessões

### Status UX
- ✅ Mudar status inline na lista funciona
- ✅ Bulk update funciona
- ✅ Feedback visual imediato

### Rich Text
- ✅ Editor WYSIWYG funciona
- ✅ Export continua gerando markdown válido

### i18n
- ✅ Toda UI está em inglês
- ✅ Sistema de i18n é simples e extensível

### Outros
- ✅ Sem logs desnecessários no console
- ✅ Componentes padronizados em shadcn
- ✅ Favicon atualizado
- ✅ Nome do sistema atualizado
- ✅ Template padrão corresponde ao markdown
- ✅ Tauri documentado
- ✅ Import database funciona

---

## Arquivos-chave a criar/editar

### Criar:
- `src/app/pages/TemplateBuilderPage.tsx`
- `src/app/components/template/SectionBuilder.tsx`
- `src/app/components/template/FieldBuilder.tsx`
- `src/app/components/template/FieldPropertyEditor.tsx`
- `src/app/components/template/TemplatePreview.tsx`
- `src/app/components/template/SortableSection.tsx`
- `src/app/components/template/SortableField.tsx`
- `src/app/components/template/ImportTemplateModal.tsx`
- `src/infra/storage/JSONBackupService.ts`
- `src/app/hooks/usePomodoro.ts`
- `src/app/components/ui/Pomodoro.tsx`
- `src/lib/i18n.ts`
- `src/lib/locales/en.ts`

### Editar:
- `src/app/pages/TemplatesPage.tsx`
- `src/app/pages/TicketEditPage.tsx`
- `src/app/pages/TicketsPage.tsx`
- `src/app/pages/SettingsPage.tsx`
- `src/app/components/ticket/TicketList.tsx`
- `src/app/components/ui/markdown-editor.tsx`
- `src/core/domain/Ticket.ts`
- `src/core/services/ExportService.ts`
- `src/infra/database/seed.ts`
- `index.html`
- `package.json`
- `README.md`
- `public/favicon.svg`

---

## Notas de Implementação

### Dependências necessárias:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-markdown
```

### Estrutura JSON do backup:
- Versionamento de schema para migrações futuras
- Formato claro e documentado
- Validação robusta na importação

### Drag & Drop:
- Usar `@dnd-kit` (já instalado)
- Suportar reordenação de seções e campos
- Feedback visual durante drag

### Rich Text:
- TipTap é recomendado (alternativa: CKEditor)
- Converter para markdown no export
- Manter compatibilidade com markdown existente

### i18n:
- Sistema simples (dicionários TypeScript)
- Sem biblioteca externa (para simplicidade)
- Fácil de estender para novos idiomas no futuro

---

## Sequência Recomendada de Implementação

1. **Template Builder** (crítico, maior impacto)
2. **Fix Import DB** (corrigir bug existente)
3. **Backup/Restore JSON** (funcionalidade importante)
4. **Status UX** (melhoria rápida de experiência)
5. **Template padrão** (ajuste simples)
6. **i18n** (tradução completa)
7. **shadcn + limpeza** (polish)
8. **Rich Text** (melhoria de UX)
9. **Implementation History** (feature adicional)
10. **Pomodoro** (nice-to-have)
11. **Naming + favicon** (branding)
12. **Tauri docs** (documentação)

---

## Próximos Passos

1. Revisar e aprovar este plano
2. Começar implementação pela prioridade mais alta (Template Builder)
3. Atualizar este documento conforme progresso
4. Marcar itens como concluídos

---

**Última atualização:** Janeiro 2025
**Status:** Plano aprovado, aguardando implementação
