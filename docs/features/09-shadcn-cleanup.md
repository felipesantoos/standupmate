# Feature 09: Padronização Shadcn/UI + Limpeza de Logs

## Contexto e Objetivo

**Prioridade:** 🟡 Média  
**Estimativa:** 4-6 horas  
**Tipo:** Code Quality & UX

Padronizar todos os componentes para usar shadcn/ui de forma consistente, remover logs desnecessários, adicionar loading states e empty states com ilustrações.

## Requisitos Técnicos

### Dependências

Já instaladas (shadcn/ui components).

### Ferramentas

- ESLint para detectar `console.log`
- Prettier para formatação consistente

## Arquitetura e Design

### Princípios de Padronização

1. **Consistência**: Todos os componentes seguem mesmos padrões
2. **Shadcn First**: Usar componentes shadcn sempre que possível
3. **Loading States**: Todas as ações assíncronas mostram feedback
4. **Empty States**: Todas as listas vazias têm mensagens informativas
5. **Error Boundaries**: Erros são tratados graciosamente

## Checklist de Padronização

### 1. Componentes UI

#### Botões

- [ ] Substituir botões customizados por `<Button>` do shadcn
- [ ] Usar variants consistentes: `default`, `secondary`, `outline`, `ghost`, `destructive`
- [ ] Usar sizes consistentes: `default`, `sm`, `lg`, `icon`
- [ ] Ícones sempre com className consistente (ex: `h-4 w-4`)

**Padrão:**
```typescript
import { Button } from '@/app/components/ui/button';

// Botão primário
<Button onClick={handleClick}>
  <Plus className="mr-2 h-4 w-4" />
  Create
</Button>

// Botão secundário
<Button variant="outline" onClick={handleClick}>
  Cancel
</Button>

// Botão de perigo
<Button variant="destructive" onClick={handleDelete}>
  <Trash className="mr-2 h-4 w-4" />
  Delete
</Button>

// Botão ícone
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

---

#### Cards

- [ ] Substituir divs por `<Card>` components
- [ ] Usar `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- [ ] Padding e spacing consistentes

**Padrão:**
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

---

#### Forms

- [ ] Usar `<Form>` do shadcn + react-hook-form
- [ ] Usar `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`
- [ ] Validação consistente com Zod

**Padrão:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/app/components/ui/form';

const form = useForm({
  resolver: zodResolver(schema),
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

#### Dialogs/Modals

- [ ] Substituir modals customizados por `<Dialog>` ou `<AlertDialog>`
- [ ] Usar estrutura padrão: `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`

**Padrão:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 2. Loading States

#### Skeleton Loaders

- [ ] Adicionar `<Skeleton>` em todas as listas durante loading
- [ ] Skeleton deve ter mesma estrutura do conteúdo real

**Padrão:**
```typescript
import { Skeleton } from '@/app/components/ui/skeleton';

{isLoading ? (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full" />
    ))}
  </div>
) : (
  // Real content
)}
```

---

#### Spinner

- [ ] Usar `<Spinner>` para ações assíncronas
- [ ] Mostrar em botões durante submit
- [ ] Mostrar em páginas durante fetch inicial

**Padrão:**
```typescript
import { Spinner } from '@/app/components/ui/spinner';

// Em botão
<Button disabled={isLoading}>
  {isLoading && <Spinner className="mr-2 h-4 w-4" />}
  Save
</Button>

// Na página
{isLoading ? (
  <div className="flex justify-center items-center h-64">
    <Spinner className="h-8 w-8" />
  </div>
) : (
  // Content
)}
```

---

### 3. Empty States

- [ ] Adicionar `<Empty>` component em todas as listas vazias
- [ ] Mensagem informativa + ação primária
- [ ] Ícone ou ilustração relevante

**Padrão:**
```typescript
import { Empty } from '@/app/components/ui/empty';
import { FileText } from 'lucide-react';

{tickets.length === 0 && (
  <Empty
    icon={<FileText className="h-12 w-12" />}
    title="No tickets yet"
    description="Create your first ticket to get started"
    action={
      <Button onClick={handleCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Ticket
      </Button>
    }
  />
)}
```

---

### 4. Limpeza de Logs

#### Console Logs

- [ ] Remover todos os `console.log` desnecessários
- [ ] Manter apenas logs em development mode para debugging
- [ ] Usar logger service para logs importantes

**Padrão:**
```typescript
// ❌ Remover
console.log('User clicked button');
console.log(data);

// ✅ Manter apenas em dev
if (import.meta.env.DEV) {
  console.log('Debug: ', data);
}

// ✅ Usar para errors importantes
console.error('Failed to load data:', error);
```

---

#### ESLint Rule

Adicionar em `.eslintrc.json`:

```json
{
  "rules": {
    "no-console": ["warn", { "allow": ["error", "warn"] }]
  }
}
```

---

### 5. Estilos Consistentes

#### Spacing

- [ ] Usar classes Tailwind consistentes
- [ ] Padding: `p-4`, `p-6`, `p-8`
- [ ] Gaps: `gap-2`, `gap-4`, `gap-6`
- [ ] Margins: `mb-4`, `mt-6`, etc.

#### Typography

- [ ] Títulos: `text-2xl font-bold`, `text-xl font-semibold`
- [ ] Subtítulos: `text-sm text-muted-foreground`
- [ ] Body: `text-base`

#### Colors

- [ ] Usar CSS variables do tema
- [ ] `text-primary`, `text-muted-foreground`, `text-destructive`
- [ ] `bg-background`, `bg-card`, `bg-muted`
- [ ] `border-border`

## Arquivos a Revisar

### Páginas

- [ ] `src/app/pages/DashboardPage.tsx`
- [ ] `src/app/pages/TicketsPage.tsx`
- [ ] `src/app/pages/TicketEditPage.tsx`
- [ ] `src/app/pages/TemplatesPage.tsx`
- [ ] `src/app/pages/TemplateBuilderPage.tsx`
- [ ] `src/app/pages/SettingsPage.tsx`
- [ ] `src/app/pages/ReportsPage.tsx`

### Componentes de Ticket

- [ ] `src/app/components/ticket/TicketList.tsx`
- [ ] `src/app/components/ticket/TicketCard.tsx`
- [ ] `src/app/components/ticket/TicketFilters.tsx`
- [ ] `src/app/components/ticket/BatchActions.tsx`
- [ ] `src/app/components/ticket/TagManager.tsx`

### Componentes de Template

- [ ] `src/app/components/template/TemplatePreview.tsx`
- [ ] `src/app/components/template/ImportTemplateModal.tsx`
- [ ] `src/app/components/template/TemplateMarketplace.tsx`

### Componentes de Dashboard

- [ ] `src/app/components/dashboard/DailyStandupCard.tsx`
- [ ] `src/app/components/dashboard/MetricsCards.tsx`
- [ ] `src/app/components/dashboard/ProductivityChart.tsx`

### Layouts

- [ ] `src/app/components/layouts/MainLayout.tsx`
- [ ] `src/app/components/layouts/AppSidebar.tsx`
- [ ] `src/app/components/layouts/NavMain.tsx`

## Plano de Implementação Detalhado

### Fase 1: Limpeza de Logs (1h)

1. **Adicionar ESLint rule**
   - Configurar no-console warning

2. **Revisar todos os arquivos**
   - Buscar por `console.log`
   - Remover ou converter para dev-only

3. **Criar logger service (opcional)**
   ```typescript
   // src/lib/logger.ts
   export const logger = {
     debug: (...args: any[]) => {
       if (import.meta.env.DEV) {
         console.log(...args);
       }
     },
     error: (...args: any[]) => {
       console.error(...args);
     },
     warn: (...args: any[]) => {
       console.warn(...args);
     },
   };
   ```

### Fase 2: Padronização de Componentes (2-3h)

4. **Revisar e padronizar páginas principais**
   - TicketsPage
   - TemplatesPage
   - DashboardPage

5. **Revisar e padronizar componentes**
   - Ticket components
   - Template components
   - Dashboard components

6. **Substituir componentes customizados**
   - Botões
   - Cards
   - Dialogs
   - Forms

### Fase 3: Loading e Empty States (1-2h)

7. **Adicionar Skeletons**
   - Listas de tickets
   - Listas de templates
   - Dashboard cards

8. **Adicionar Empty states**
   - Lista vazia de tickets
   - Lista vazia de templates
   - Dashboard sem dados

9. **Adicionar Spinners**
   - Botões de submit
   - Ações assíncronas

### Fase 4: Refinamentos (1h)

10. **Revisar estilos**
    - Spacing consistente
    - Typography consistente
    - Colors consistentes

11. **Testes finais**
    - Verificar todas as páginas
    - Verificar interações
    - Verificar responsividade

## Checklist de Validação

### Componentes

- [ ] Todos os botões usam `<Button>` do shadcn
- [ ] Todos os cards usam `<Card>` do shadcn
- [ ] Todos os forms usam `<Form>` do shadcn
- [ ] Todos os dialogs usam `<Dialog>` ou `<AlertDialog>`
- [ ] Todos os inputs usam components do shadcn

### Loading States

- [ ] Listas mostram Skeleton durante loading
- [ ] Botões mostram Spinner durante submit
- [ ] Páginas mostram loading state durante fetch
- [ ] Ações assíncronas têm feedback visual

### Empty States

- [ ] Lista de tickets vazia mostra Empty state
- [ ] Lista de templates vazia mostra Empty state
- [ ] Dashboard sem dados mostra Empty state
- [ ] Cada empty state tem ação primária
- [ ] Cada empty state tem ícone ou ilustração

### Logs

- [ ] Sem console.log em produção
- [ ] Console.error mantido para errors
- [ ] Logs de debug só em development
- [ ] ESLint warning para console.log

### Estilos

- [ ] Spacing consistente em todas as páginas
- [ ] Typography consistente
- [ ] Colors usando CSS variables
- [ ] Responsivo em mobile

## Ferramentas Úteis

### Script para Encontrar Console Logs

```bash
# Buscar todos os console.log
grep -r "console.log" src/ --exclude-dir=node_modules

# Buscar todos os console.*
grep -r "console\." src/ --exclude-dir=node_modules
```

### Script para Verificar Componentes Não-Shadcn

```bash
# Buscar por divs com className button/card/etc (potenciais candidatos)
grep -r "className.*button" src/ --exclude-dir=node_modules
grep -r "className.*card" src/ --exclude-dir=node_modules
```

## Exemplo de Antes/Depois

### Antes (Não Padronizado)

```typescript
function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  
  useEffect(() => {
    console.log('Loading tickets...');
    fetchTickets().then(data => {
      console.log('Tickets loaded:', data);
      setTickets(data);
    });
  }, []);
  
  return (
    <div className="p-4">
      <div className="bg-white rounded shadow p-4">
        <h1>Tickets</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Create
        </button>
      </div>
      
      <div>
        {tickets.map(ticket => (
          <div key={ticket.id} className="border p-4 mt-2">
            {ticket.title}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Depois (Padronizado)

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Empty } from '@/app/components/ui/empty';
import { FileText, Plus } from 'lucide-react';

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchTickets()
      .then(data => setTickets(data))
      .catch(error => console.error('Failed to load tickets:', error))
      .finally(() => setIsLoading(false));
  }, []);
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tickets</CardTitle>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {tickets.length === 0 ? (
        <Empty
          icon={<FileText className="h-12 w-12" />}
          title="No tickets yet"
          description="Create your first ticket to get started"
          action={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <Card key={ticket.id}>
              <CardContent className="pt-6">
                {ticket.title}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Critérios de Aceite

- ✅ Sem logs desnecessários no console
- ✅ Componentes padronizados em shadcn
- ✅ Loading skeletons em listas e cards
- ✅ Empty states informativos em listas vazias
- ✅ Spacing e typography consistentes
- ✅ Colors usando CSS variables
- ✅ Todas as ações assíncronas têm feedback visual
- ✅ ESLint warning para console.log
- ✅ Responsivo em mobile

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

