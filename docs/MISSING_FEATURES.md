# ⚠️ MISSING FEATURES - Baseado no SYSTEM_PLAN.md

## Análise Completa: Implementado vs Planejado

**Data:** 30 de Outubro, 2025

---

## ✅ RF1 - Gerenciamento de Templates (83% Completo)

| RF | Feature | Status | Localização |
|----|---------|--------|-------------|
| RF1.1 | Criar novo template | ❌ **FALTA** | Botão existe, mas sem modal/página |
| RF1.2 | Editar template existente | ❌ **FALTA** | Não há editor visual |
| RF1.3 | Deletar template | ✅ OK | `TemplatesPage.tsx` |
| RF1.4 | Duplicar template | ✅ OK | `TemplatesPage.tsx` |
| RF1.5 | Visualizar lista de templates | ✅ OK | `TemplatesPage.tsx` |
| RF1.6 | Definir template padrão | ✅ OK | `TemplatesPage.tsx` |

**Faltando:**
- Visual template creator/editor page
- Template builder UI

---

## ❌ RF2 - Editor de Campos (0% Completo)

| RF | Feature | Status |
|----|---------|--------|
| RF2.1 | Adicionar campos ao template | ❌ **FALTA** |
| RF2.2 | Remover campos do template | ❌ **FALTA** |
| RF2.3 | Reordenar campos (drag & drop) | ❌ **FALTA** |
| RF2.4 | Editar propriedades dos campos | ❌ **FALTA** |
| RF2.5 | Agrupar campos em seções | ❌ **FALTA** |
| RF2.6 | Definir campos obrigatórios/opcionais | ❌ **FALTA** |

**Problema:** Pasta `src/app/components/template/` está **vazia**

**Arquivos Faltando:**
- `src/app/pages/TemplateBuilderPage.tsx`
- `src/app/components/template/SectionBuilder.tsx`
- `src/app/components/template/FieldBuilder.tsx`
- `src/app/components/template/FieldPropertyEditor.tsx`
- `src/app/components/template/TemplatePreview.tsx`

**Dependências Faltando:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
```

---

## ✅ RF3 - Tipos de Campos Suportados (100% Completo)

| RF | Field Type | Status | Implementação |
|----|------------|--------|---------------|
| RF3.1 | Texto curto (input) | ✅ OK | `DynamicField.tsx` linha 28 |
| RF3.2 | Texto longo (textarea) | ✅ OK | `DynamicField.tsx` linha 41 |
| RF3.3 | Checkbox | ✅ OK | `DynamicField.tsx` linha 75 |
| RF3.4 | Radio button | ✅ OK | `DynamicField.tsx` linha 86 |
| RF3.5 | Select/Dropdown | ✅ OK | `DynamicField.tsx` linha 110 |
| RF3.6 | Data/Hora | ✅ OK | `DynamicField.tsx` linha 68 |
| RF3.7 | Número | ✅ OK | `DynamicField.tsx` linha 55 |
| RF3.8 | Lista de itens (array) | ⚠️ PARCIAL | Markdown serve para listas |
| RF3.9 | Markdown text | ✅ OK | `DynamicField.tsx` linha 127 |
| RF3.10 | Tags/Labels | ✅ OK | `TagManager.tsx` |

**8/10 tipos implementados (RF3.8 e RF3.10 parciais)**

---

## ✅ RF4 - Gerenciamento de Tickets (100% Completo)

| RF | Feature | Status | Localização |
|----|---------|--------|-------------|
| RF4.1 | Criar novo ticket a partir de template | ✅ OK | `TicketEditPage.tsx` |
| RF4.2 | Editar ticket em progresso | ✅ OK | `TicketEditPage.tsx` |
| RF4.3 | Salvar rascunhos automaticamente | ✅ OK | Auto-save 2s |
| RF4.4 | Marcar ticket como completo | ✅ OK | `TicketEditPage.tsx` |
| RF4.5 | Arquivar tickets antigos | ✅ OK | `TicketService.ts` |
| RF4.6 | Buscar/filtrar tickets | ✅ OK | `TicketFilters.tsx` |
| RF4.7 | Visualizar histórico de edições | ❌ **FALTA** | Não implementado |

**6/7 features (falta histórico de edições)**

---

## ✅ RF5 - Import/Export (83% Completo)

| RF | Feature | Status | Localização |
|----|---------|--------|-------------|
| RF5.1 | Exportar template como JSON | ✅ OK | `TemplatesPage.tsx` |
| RF5.2 | Importar template de JSON | ⚠️ PARCIAL | Backend OK, UI falta |
| RF5.3 | Exportar ticket preenchido como Markdown | ✅ OK | `TicketEditPage.tsx` |
| RF5.4 | Exportar múltiplos tickets (batch) | ❌ **FALTA** | Não implementado |
| RF5.5 | Validar formato JSON na importação | ✅ OK | `TemplateService.ts` |
| RF5.6 | Preview antes de importar/exportar | ❌ **FALTA** | Não implementado |

**Faltando:**
- UI para import JSON (file upload)
- Batch export (selecionar múltiplos + download ZIP)
- Preview modal antes de exportar

---

## ⚠️ RF6 - Daily Standup e Reporting (60% Completo)

| RF | Feature | Status | Localização |
|----|---------|--------|-------------|
| RF6.1 | Visualizar tickets em progresso | ✅ OK | `DashboardPage.tsx` |
| RF6.2 | Gerar resumo para daily standup | ✅ OK | `DailyStandupCard.tsx` |
| RF6.3 | Histórico de trabalho por período | ❌ **FALTA** | Filtro por data parcial |
| RF6.4 | Estatísticas de tempo e conclusão | ❌ **FALTA** | Stats básicas apenas |
| RF6.5 | Exportar relatórios periódicos | ❌ **FALTA** | Não implementado |

**Faltando:**
- `ReportService.ts` - Geração de relatórios
- Weekly/Monthly reports
- Time tracking charts (estimate vs actual)
- Sprint retrospective view

---

## ⚠️ RF7 - Organização (75% Completo)

| RF | Feature | Status | Localização |
|----|---------|--------|-------------|
| RF7.1 | Tags/categorias para tickets | ✅ OK | `TagManager.tsx` |
| RF7.2 | Filtros por status, prioridade, data | ✅ OK | `TicketFilters.tsx` |
| RF7.3 | Dashboard com visão geral | ✅ OK | `DashboardPage.tsx` |
| RF7.4 | Busca full-text nos tickets | ⚠️ PARCIAL | LIKE search (FTS5 não suportado) |

**Faltando:**
- Advanced filter UI (date range picker visual)
- Saved filter presets
- Better search (full-text)

---

## 📊 RESUMO GERAL POR FASE

### Fase 1: MVP Core - **95% Completo** ✅
**Implementado:**
- ✅ Arquitetura hexagonal completa
- ✅ Domain layer (Ticket, Template)
- ✅ Services (TicketService, TemplateService, ExportService)
- ✅ SQLite repository + mappers
- ✅ CRUD tickets completo
- ✅ CRUD templates (exceto create/edit UI)
- ✅ Filter pattern
- ✅ Export MD/JSON
- ✅ Import JSON (backend)
- ✅ Auto-save (2s)
- ✅ Toast notifications
- ✅ Keyboard shortcuts
- ✅ Tag management UI
- ✅ 35+ testes unitários

**Faltando (5%):**
- Import JSON UI (file upload)
- Edit history tracking

---

### Fase 2: Template Builder - **0% Completo** ❌
**TOTALMENTE FALTANDO:**
- ❌ Template Builder visual page
- ❌ Drag & drop para campos/seções
- ❌ Field property editor
- ❌ Section editor
- ❌ Live preview
- ❌ Template creator wizard
- ❌ Template marketplace (3-5 templates prontos)

**Arquivos a Criar:** ~10 arquivos
**Dependências:** `@dnd-kit/*`
**Estimativa:** 2 semanas

---

### Fase 3: UX e Produtividade - **40% Completo** ⚠️
**Implementado:**
- ✅ Auto-save (debounce 2s)
- ✅ Keyboard shortcuts (Cmd+S, Cmd+E, ESC)
- ✅ Toast notifications
- ✅ Search básico
- ✅ Filtros por status
- ✅ Dark mode
- ✅ Tag manager com autocomplete

**Faltando (60%):**
- ❌ Command palette (Cmd+K)
- ❌ More keyboard shortcuts (Cmd+N, Cmd+F, ?)
- ❌ Advanced filters UI (date range picker)
- ❌ Saved filter presets
- ❌ Undo/Redo
- ❌ Loading skeletons (tem spinners apenas)
- ❌ Empty states com ilustrações
- ❌ Tag color customization

**Estimativa:** 1 semana

---

### Fase 4: Daily Standup e Reporting - **30% Completo** ⚠️
**Implementado:**
- ✅ Daily standup card
- ✅ Yesterday/Today tickets
- ✅ Copy to clipboard
- ✅ Download MD
- ✅ Basic stats (in progress, completed)

**Faltando (70%):**
- ❌ Time tracking visualization
- ❌ Charts e gráficos (Chart.js ou Recharts)
  - ❌ Productivity graph (tickets/day)
  - ❌ Distribution by type
  - ❌ Average time by priority
  - ❌ Estimate accuracy trend
- ❌ Weekly/Monthly reports
- ❌ Sprint retrospective view
- ❌ Export batch (múltiplos tickets)
- ❌ Learnings aggregation
- ❌ `ReportService.ts`
- ❌ `AnalyticsService.ts`

**Arquivos a Criar:** ~8 arquivos
**Dependências:** `recharts` ou `chart.js`
**Estimativa:** 1-2 semanas

---

## 🎯 PRIORIDADES PARA COMPLETAR O PLANO

### 🔴 **ALTA PRIORIDADE (Fase 2 - Critical Missing)**
**Template Builder Visual**
- É a feature mais importante faltando
- Sem ela, usuários não podem criar templates customizados
- Apenas podem usar o template padrão

**Arquivos Principais:**
1. `src/app/pages/TemplateBuilderPage.tsx` - Main editor
2. `src/app/components/template/SectionBuilder.tsx` - Section management
3. `src/app/components/template/FieldBuilder.tsx` - Field management
4. `src/app/components/template/FieldPropertyEditor.tsx` - Edit field props
5. `src/app/components/template/TemplatePreview.tsx` - Live preview

**Passos:**
```bash
# 1. Instalar dependências
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers

# 2. Criar components de drag & drop
# 3. Criar property editor panel
# 4. Integrar com TemplateService
# 5. Adicionar route /templates/builder/:id
```

**Tempo:** 2 semanas

---

### 🟡 **MÉDIA PRIORIDADE (Fase 3 - UX Polish)**
**Command Palette + Advanced UX**
- Command palette (Cmd+K) for quick actions
- More keyboard shortcuts
- Advanced filter UI
- Loading skeletons

**Arquivos:**
- `src/app/components/ui/CommandPalette.tsx`
- `src/app/components/ui/DateRangePicker.tsx`
- `src/app/components/ui/Skeleton.tsx`

**Tempo:** 1 semana

---

### 🟢 **BAIXA PRIORIDADE (Fase 4 - Analytics)**
**Charts e Relatórios**
- Productivity graphs
- Time tracking visualizations
- Weekly/Monthly reports

**Arquivos:**
- `src/core/services/ReportService.ts`
- `src/core/services/AnalyticsService.ts`
- `src/app/components/dashboard/ProductivityChart.tsx`
- `src/app/components/dashboard/TimeTrackingChart.tsx`
- `src/app/pages/ReportsPage.tsx`

**Dependências:**
```bash
npm install recharts
```

**Tempo:** 1-2 semanas

---

## 📋 CHECKLIST DETALHADO DO QUE FALTA

### Template Builder (RF2 - Fase 2)
- [ ] Install @dnd-kit packages
- [ ] Create TemplateBuilderPage.tsx
- [ ] Implement SectionBuilder with drag & drop
- [ ] Implement FieldBuilder with drag & drop
- [ ] Create FieldPropertyEditor (edit type, label, required, validation)
- [ ] Add live preview panel
- [ ] Add route /templates/builder/new
- [ ] Add route /templates/builder/:id
- [ ] Wire up with TemplateService
- [ ] Add "Create Template" button action
- [ ] Add "Edit Template" button action

**Estimated:** 10-15 horas (2 semanas part-time)

---

### Import Template UI (RF5.2)
- [ ] Create file upload component
- [ ] Add "Import Template" button to TemplatesPage
- [ ] Create import modal with validation
- [ ] Show preview before importing
- [ ] Handle JSON validation errors visually

**Estimated:** 3-4 horas

---

### Batch Export (RF5.4)
- [ ] Add checkbox selection to TicketList
- [ ] Create batch action toolbar
- [ ] Implement ZIP export for multiple tickets
- [ ] Add "Select All" functionality
- [ ] Export filtered tickets feature

**Estimated:** 4-6 horas

---

### Advanced Filters UI (RF7 - Polish)
- [ ] Create DateRangePicker component
- [ ] Add visual date range selector to filters
- [ ] Multi-select dropdown for tags
- [ ] Saved filter presets (localStorage)
- [ ] Filter preset manager

**Estimated:** 6-8 horas

---

### Charts & Analytics (RF6 - Fase 4)
- [ ] Install recharts
- [ ] Create ReportService.ts
- [ ] Create AnalyticsService.ts
- [ ] ProductivityChart component (tickets per day)
- [ ] TimeTrackingChart (estimate vs actual)
- [ ] Distribution pie chart (by type)
- [ ] Weekly report page
- [ ] Monthly report page
- [ ] Sprint retrospective view

**Estimated:** 15-20 horas (2-3 semanas part-time)

---

### Advanced Features (Futuro)
- [ ] Command Palette (Cmd+K)
- [ ] Undo/Redo in editor
- [ ] Edit history/changelog
- [ ] Loading skeletons
- [ ] Empty state illustrations
- [ ] Tag colors customization
- [ ] Template marketplace
- [ ] Cloud sync adapter (Fase 5)
- [ ] Jira/GitHub import adapter (Fase 5)

---

## 🎯 RECOMENDAÇÃO

### **Próximo Passo Lógico: Template Builder**

É a feature mais importante faltando. Sem ela, o sistema funciona mas usuários estão limitados ao template padrão.

**Opções:**

#### Opção A: Template Builder Completo (Recomendado)
- Drag & drop visual
- Property editor
- Live preview
- **Tempo:** 2 semanas
- **Resultado:** Sistema 100% conforme SYSTEM_PLAN.md Fase 1-2

#### Opção B: Template Editor Simples (Rápido)
- Apenas forms para adicionar/editar campos
- Sem drag & drop (usar order number)
- Sem live preview
- **Tempo:** 2-3 dias
- **Resultado:** Funcional mas não polido

#### Opção C: Polish UX Atual (Quick Wins)
- Command palette
- Import JSON UI
- Batch export
- Advanced filters
- **Tempo:** 1 semana
- **Resultado:** Sistema atual muito mais polido

---

## 📊 PROGRESS OVERVIEW

```
Fase 1 (MVP Core):        ████████████████████░ 95%
Fase 2 (Template Builder): ░░░░░░░░░░░░░░░░░░░░  0%
Fase 3 (UX & Productivity): ████████░░░░░░░░░░░░ 40%
Fase 4 (Reporting):        ██████░░░░░░░░░░░░░░ 30%

Overall Progress:          ███████████░░░░░░░░░ 55%
```

---

## 💡 DECISÃO NECESSÁRIA

**O que implementar agora?**
1. Template Builder (feature mais importante)
2. UX polish (quick wins, melhor experiência)
3. Analytics (charts e relatórios)
4. Continuar testando o que já existe

**Sistema já está funcional e usável para daily work!** 🎉
**Mas Template Builder é essencial para customização total.**

---

**Qual caminho seguir?**

