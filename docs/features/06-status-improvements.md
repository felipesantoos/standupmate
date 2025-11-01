# Feature 06: Melhorias de Status dos Tickets

## Contexto e Objetivo

**Prioridade:** 🟡 Média  
**Estimativa:** 2-3 horas  
**Tipo:** UX Improvement

Facilitar atualização de status de tickets tanto na lista quanto no editor individual, incluindo bulk updates e feedback visual imediato.

## Requisitos Técnicos

### Dependências

Não requer dependências adicionais.

### Componentes Utilizados

- Select dropdown (shadcn/ui)
- Checkbox (shadcn/ui)
- Toast notifications (sonner)
- Command palette (opcional)

## Arquitetura e Design

### Fluxo de Update Inline

```
User clicks status dropdown
    ↓
Select new status
    ↓
Update ticket via service
    ↓
Optimistic UI update
    ↓
Show toast confirmation
```

### Fluxo de Bulk Update

```
User selects multiple tickets (checkboxes)
    ↓
Bulk actions toolbar appears
    ↓
User selects "Change Status"
    ↓
Modal/dropdown shows status options
    ↓
User confirms
    ↓
Update all selected tickets
    ↓
Show result toast (X tickets updated)
```

## Arquivos a Editar

### 1. `src/app/components/ticket/TicketList.tsx`

**Mudanças:** Adicionar dropdown inline de status em cada card.

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';

// No TicketCard ou TicketListItem:

const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

const handleStatusChange = async (ticketId: string, newStatus: string) => {
  setIsUpdatingStatus(true);
  
  try {
    // Optimistic update
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const oldStatus = ticket.status;
    ticket.status = newStatus;
    
    // Update via service
    await ticketService.updateTicket(ticketId, { status: newStatus });
    
    // Refresh list
    await refreshTickets();
    
    toast.success(`Status updated to ${newStatus}`);
    
  } catch (error) {
    // Rollback on error
    toast.error(`Failed to update status: ${error.message}`);
    await refreshTickets(); // Revert optimistic update
  } finally {
    setIsUpdatingStatus(false);
  }
};

// JSX - Adicionar ao TicketCard:

<div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
  <Select
    value={ticket.status}
    onValueChange={(value) => handleStatusChange(ticket.id, value)}
    disabled={isUpdatingStatus}
  >
    <SelectTrigger className="w-[140px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="todo">To Do</SelectItem>
      <SelectItem value="in_progress">In Progress</SelectItem>
      <SelectItem value="blocked">Blocked</SelectItem>
      <SelectItem value="done">Done</SelectItem>
    </SelectContent>
  </Select>
  
  {isUpdatingStatus && <Spinner className="h-4 w-4" />}
</div>
```

**Status Badge com cores:**

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo': return 'bg-gray-500';
    case 'in_progress': return 'bg-blue-500';
    case 'blocked': return 'bg-red-500';
    case 'done': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

// Também mostrar badge visual além do select
<Badge className={getStatusColor(ticket.status)}>
  {ticket.status.replace('_', ' ')}
</Badge>
```

---

### 2. `src/app/pages/TicketsPage.tsx`

**Mudanças:** Adicionar bulk update na toolbar.

```typescript
import { Checkbox } from '@/app/components/ui/checkbox';
import { Button } from '@/app/components/ui/button';
import { CheckSquare, X } from 'lucide-react';
import { BulkUpdateModal } from '@/app/components/ticket/BulkUpdateModal';

// Estados para bulk selection:
const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);

const handleSelectTicket = (ticketId: string, checked: boolean) => {
  const newSelection = new Set(selectedTicketIds);
  if (checked) {
    newSelection.add(ticketId);
  } else {
    newSelection.delete(ticketId);
  }
  setSelectedTicketIds(newSelection);
};

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    setSelectedTicketIds(new Set(filteredTickets.map(t => t.id)));
  } else {
    setSelectedTicketIds(new Set());
  }
};

const handleBulkStatusChange = async (newStatus: string) => {
  const count = selectedTicketIds.size;
  
  try {
    // Update todos os tickets selecionados
    await Promise.all(
      Array.from(selectedTicketIds).map(id =>
        ticketService.updateTicket(id, { status: newStatus })
      )
    );
    
    // Refresh lista
    await refreshTickets();
    
    // Limpar seleção
    setSelectedTicketIds(new Set());
    setIsBulkUpdateModalOpen(false);
    
    toast.success(`${count} ticket(s) updated to ${newStatus}`);
    
  } catch (error) {
    toast.error(`Failed to update tickets: ${error.message}`);
  }
};

// JSX - Toolbar com bulk actions:

{selectedTicketIds.size > 0 && (
  <div className="bg-primary/10 border rounded-lg p-4 mb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CheckSquare className="h-5 w-5 text-primary" />
        <span className="font-medium">
          {selectedTicketIds.size} ticket(s) selected
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button onClick={() => setIsBulkUpdateModalOpen(true)}>
          Change Status
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setSelectedTicketIds(new Set())}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Selection
        </Button>
      </div>
    </div>
  </div>
)}

{/* Checkbox "Select All" no header da lista */}
<div className="flex items-center gap-2 mb-2">
  <Checkbox
    checked={selectedTicketIds.size === filteredTickets.length && filteredTickets.length > 0}
    onCheckedChange={handleSelectAll}
  />
  <span className="text-sm text-muted-foreground">Select All</span>
</div>

{/* Modal de bulk update */}
<BulkUpdateModal
  isOpen={isBulkUpdateModalOpen}
  onClose={() => setIsBulkUpdateModalOpen(false)}
  onConfirm={handleBulkStatusChange}
  selectedCount={selectedTicketIds.size}
/>
```

---

### 3. `src/app/pages/TicketEditPage.tsx`

**Mudanças:** Adicionar botão destacado para mudar status + atalhos.

```typescript
import { Button } from '@/app/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';
import { toast } from 'sonner';

const handleMarkAsComplete = async () => {
  if (!ticket) return;
  
  try {
    ticket.status = 'done';
    await ticketService.updateTicket(ticket.id, { status: 'done' });
    
    toast.success('Ticket marked as complete! 🎉');
    
    // Opcionalmente, redirecionar para lista
    // navigate('/tickets');
    
  } catch (error) {
    toast.error(`Failed to update status: ${error.message}`);
  }
};

const handleToggleInProgress = async () => {
  if (!ticket) return;
  
  const newStatus = ticket.status === 'in_progress' ? 'todo' : 'in_progress';
  
  try {
    ticket.status = newStatus;
    await ticketService.updateTicket(ticket.id, { status: newStatus });
    
    toast.success(`Status updated to ${newStatus}`);
    
  } catch (error) {
    toast.error(`Failed to update status: ${error.message}`);
  }
};

// JSX - Botões de ação rápida no header:

<div className="flex items-center gap-2">
  {ticket.status !== 'done' && (
    <Button onClick={handleMarkAsComplete} variant="default">
      <CheckCircle className="mr-2 h-4 w-4" />
      Mark as Complete
    </Button>
  )}
  
  <Button 
    onClick={handleToggleInProgress} 
    variant="outline"
  >
    {ticket.status === 'in_progress' ? (
      <>
        <Circle className="mr-2 h-4 w-4" />
        Move to To Do
      </>
    ) : (
      <>
        <Circle className="mr-2 h-4 w-4 fill-current" />
        Start Working
      </>
    )}
  </Button>
</div>

// Atalho de teclado:
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K para abrir menu de status
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      // Abrir command palette para status
      setIsStatusMenuOpen(true);
    }
    
    // Cmd/Ctrl + Shift + D para marcar como done
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'd') {
      e.preventDefault();
      handleMarkAsComplete();
    }
  };
  
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [ticket]);
```

---

### 4. `src/app/components/ticket/BulkUpdateModal.tsx` (Criar)

**Responsabilidade:** Modal para confirmar bulk update de status.

```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string) => void;
  selectedCount: number;
}

export const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  const handleConfirm = () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }
    onConfirm(selectedStatus);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Update Status</DialogTitle>
          <DialogDescription>
            Update the status of {selectedCount} selected ticket(s)
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label>New Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Update {selectedCount} Ticket(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

## Plano de Implementação Detalhado

### Fase 1: Status Inline na Lista (1h)

1. **Editar `TicketList.tsx`**
   - Adicionar dropdown inline de status
   - Implementar handler de update
   - Optimistic UI update

2. **Testar inline update**
   - Mudar status de vários tickets
   - Verificar persistência
   - Verificar feedback visual

### Fase 2: Bulk Update (1h)

3. **Editar `TicketsPage.tsx`**
   - Adicionar checkboxes nos cards
   - Implementar seleção múltipla
   - Toolbar de bulk actions

4. **Criar `BulkUpdateModal.tsx`**
   - Modal de confirmação
   - Select de status
   - Handler de bulk update

5. **Testar bulk update**
   - Selecionar múltiplos tickets
   - Atualizar status em massa
   - Verificar resultado

### Fase 3: Quick Actions no Editor (30min)

6. **Editar `TicketEditPage.tsx`**
   - Botão "Mark as Complete"
   - Botão "Toggle In Progress"
   - Atalhos de teclado

7. **Testar quick actions**
   - Verificar botões
   - Verificar atalhos

### Fase 4: Polish (30min)

8. **Refinamentos**
   - Loading states
   - Error handling
   - Success animations

9. **Testes finais**
   - Fluxo completo
   - Edge cases

## Casos de Uso

### Caso 1: Update Inline na Lista

1. Usuário vê lista de tickets
2. Clica no dropdown de status de um ticket
3. Seleciona novo status
4. UI atualiza imediatamente (optimistic)
5. Requisição é enviada ao backend
6. Toast confirma sucesso
7. (Se erro, reverte e mostra mensagem)

### Caso 2: Bulk Update de Múltiplos Tickets

1. Usuário vê lista de tickets
2. Seleciona checkbox em 5 tickets
3. Toolbar de bulk actions aparece
4. Clica em "Change Status"
5. Modal abre
6. Seleciona "Done"
7. Clica em "Update 5 Tickets"
8. Modal fecha
9. Todos os 5 tickets são atualizados
10. Toast mostra "5 tickets updated to Done"
11. Seleção é limpa

### Caso 3: Quick Action no Editor

1. Developer está trabalhando em ticket
2. Finaliza o trabalho
3. Usa atalho Cmd+Shift+D
4. Ticket é marcado como Done
5. Toast mostra "Ticket marked as complete! 🎉"
6. Status badge atualiza

## Validação e Testes

### Checklist de Validação

**Inline Update:**
- [ ] Dropdown mostra status atual
- [ ] Mudar status funciona
- [ ] Optimistic update funciona
- [ ] Error rollback funciona
- [ ] Toast de sucesso aparece
- [ ] Toast de erro aparece (quando falha)
- [ ] Loading indicator aparece
- [ ] Dropdown não fecha ao clicar (stopPropagation)

**Bulk Update:**
- [ ] Checkboxes funcionam
- [ ] Select all funciona
- [ ] Toolbar aparece quando há seleção
- [ ] Contador de selecionados é preciso
- [ ] Modal de bulk update abre
- [ ] Atualização em massa funciona
- [ ] Toast mostra quantidade atualizada
- [ ] Seleção é limpa após update
- [ ] Clear selection funciona

**Quick Actions:**
- [ ] Botão "Mark as Complete" funciona
- [ ] Botão "Toggle In Progress" funciona
- [ ] Atalho Cmd+Shift+D funciona
- [ ] Atalho Cmd+K abre menu de status
- [ ] Botões mostram estado correto

### Cenários de Erro

- [ ] Erro ao atualizar status (network error)
- [ ] Erro em bulk update (some succeed, some fail)
- [ ] Concurrent updates (dois usuários mudando mesmo ticket)

## Possíveis Desafios e Soluções

### Desafio 1: Optimistic Update Conflitos

**Problema:** UI pode ficar inconsistente se update falhar.

**Solução:**
```typescript
const optimisticUpdate = (ticketId: string, newStatus: string) => {
  // Salvar estado anterior
  const previous = tickets.find(t => t.id === ticketId);
  
  // Atualizar UI
  updateTicketInState(ticketId, { status: newStatus });
  
  // Fazer requisição
  ticketService.update(ticketId, { status: newStatus })
    .catch(() => {
      // Reverter em caso de erro
      if (previous) {
        updateTicketInState(ticketId, { status: previous.status });
      }
    });
};
```

### Desafio 2: Bulk Update Performance

**Problema:** Atualizar 100 tickets pode ser lento.

**Solução:**
- Endpoint de bulk update no backend
- Ou usar `Promise.allSettled` para processar em paralelo
- Mostrar progress indicator

```typescript
const bulkUpdate = async (ids: string[], status: string) => {
  const total = ids.length;
  let completed = 0;
  
  const results = await Promise.allSettled(
    ids.map(id => ticketService.update(id, { status }))
  );
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = total - succeeded;
  
  if (failed > 0) {
    toast.warning(`${succeeded} updated, ${failed} failed`);
  } else {
    toast.success(`${succeeded} tickets updated`);
  }
};
```

### Desafio 3: Status Badge Colors

**Problema:** Manter consistência de cores entre componentes.

**Solução:**
- Criar helper function centralizado
- Usar Tailwind theme colors
- Documentar cores padrão

```typescript
// src/lib/statusUtils.ts
export const STATUS_COLORS = {
  todo: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  blocked: 'bg-red-500',
  done: 'bg-green-500',
} as const;

export const getStatusColor = (status: string) => {
  return STATUS_COLORS[status] || STATUS_COLORS.todo;
};
```

## UI/UX Detalhes

### Inline Status Dropdown

```
┌──────────────────────────┐
│ Ticket Title             │
├──────────────────────────┤
│ Status: [In Progress ▼]  │
│                          │
│         ┌────────────┐   │
│         │ To Do      │   │
│         │ In Progress│✓  │
│         │ Blocked    │   │
│         │ Done       │   │
│         └────────────┘   │
└──────────────────────────┘
```

### Bulk Actions Toolbar

```
┌────────────────────────────────────────┐
│ ☑️ 5 ticket(s) selected                 │
│                                        │
│  [Change Status]  [✕ Clear Selection] │
└────────────────────────────────────────┘
```

### Quick Actions Buttons

```
┌────────────────────────────────────┐
│  Ticket Title                      │
│                                    │
│  [✓ Mark as Complete] [○ Start Working]  │
└────────────────────────────────────┘
```

## Atalhos de Teclado

- `Cmd/Ctrl + K`: Abrir menu de status (command palette)
- `Cmd/Ctrl + Shift + D`: Marcar como Done
- `Cmd/Ctrl + Shift + P`: Marcar como In Progress
- `Escape`: Limpar seleção de bulk

## Critérios de Aceite

- ✅ Status inline na lista funciona (select dropdown)
- ✅ Bulk update funciona: selecionar múltiplos + mudar status de uma vez
- ✅ Botão "Mark as Complete" destacado no editor
- ✅ Atalho Cmd+Shift+D marca como complete
- ✅ Atalho Cmd+K abre menu de status
- ✅ Feedback visual imediato (toast + atualização na UI)
- ✅ Optimistic update funciona
- ✅ Error handling com rollback
- ✅ Loading states aparecem
- ✅ Contador de seleção é preciso

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

