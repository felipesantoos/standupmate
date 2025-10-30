# 🚀 Próximos Passos - Ticket Tracker

## 📍 Você Está Aqui

**Fase 1 (MVP Core):** 70% Completo ✅

**O que já está pronto:**
- ✅ Arquitetura hexagonal completa
- ✅ Domain Layer (Ticket, Template) - 100%
- ✅ Service Layer (TicketService, TemplateService, ExportService) - 100%
- ✅ Repository Interfaces (Ports) - 100%
- ✅ SQLite Adapters (Repositories, Mappers, Schema) - 90%
- ✅ UI básica (Layout, Pages, Context) - 80%
- ✅ Filter Pattern - 100%
- ✅ Testes unitários Domain - 100%
- ✅ Documentação - 100%

---

## 🎯 Completar Fase 1 (30% Restante)

### 1. Integrar SQL.js (HIGH PRIORITY) ⚡

**Por quê:** Habilita toda a persistência

```bash
# Instalar sql.js
npm install sql.js

# Tipos TypeScript
npm install -D @types/sql.js
```

**Arquivos para atualizar:**
- `src/infra/database/sqlite.ts` - Implementar com sql.js real

**Exemplo:**
```typescript
import initSqlJs from 'sql.js';

export class SQLiteDatabase implements Database {
  private db: any = null;

  private async initialize(): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
    
    // Criar ou carregar database
    const data = localStorage.getItem('ticketTracker.db');
    this.db = data
      ? new SQL.Database(Uint8Array.from(atob(data), c => c.charCodeAt(0)))
      : new SQL.Database();

    // Carregar schema
    await this.initializeSchema();
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const results = this.db.exec(sql, params);
    // Convert to array of objects
    // ...
  }
}
```

---

### 2. Implementar Custom Hooks (HIGH PRIORITY) 🎣

Conectar UI com Services usando hooks.

**Criar:**
- `src/app/hooks/useTickets.ts`
- `src/app/hooks/useTemplates.ts`
- `src/app/hooks/useExport.ts`
- `src/app/hooks/useAutoSave.ts`

**Exemplo - useTickets.ts:**
```typescript
import { useState, useEffect } from 'react';
import { Ticket } from '@core/domain/Ticket';
import { TicketService } from '@core/services/TicketService';
import { SQLiteTicketRepository } from '@infra/database/repositories/SQLiteTicketRepository';
import { getDatabase } from '@infra/database/sqlite';

export function useTickets(filter?: TicketFilter) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Factory: Create service with dependencies
  const createService = async () => {
    const db = await getDatabase();
    const repository = new SQLiteTicketRepository(db);
    return new TicketService(repository);
  };

  // Load tickets
  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const service = await createService();
      const result = await service.listTickets(filter);
      setTickets(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticket: Ticket) => {
    const service = await createService();
    const created = await service.createTicket(ticket);
    setTickets([...tickets, created]);
    return created;
  };

  const updateTicket = async (id: string, ticket: Ticket) => {
    const service = await createService();
    const updated = await service.updateTicket(id, ticket);
    setTickets(tickets.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTicket = async (id: string) => {
    const service = await createService();
    await service.deleteTicket(id);
    setTickets(tickets.filter(t => t.id !== id));
  };

  return {
    tickets,
    loading,
    error,
    createTicket,
    updateTicket,
    deleteTicket,
    refresh: loadTickets,
  };
}
```

---

### 3. Implementar Componentes Funcionais (MEDIUM) 🎨

Conectar páginas com hooks.

**TicketsPage.tsx:**
```typescript
import { useTickets } from '@app/hooks/useTickets';

export function TicketsPage() {
  const { tickets, loading, createTicket } = useTickets();

  if (loading) return <Spinner />;

  return (
    <div>
      <button onClick={() => createTicket(newTicket)}>
        Novo Ticket
      </button>
      
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
```

---

### 4. Componentes UI (MEDIUM) 🎨

Criar componentes reutilizáveis.

**Componentes necessários:**
- `src/app/components/ui/Button.tsx`
- `src/app/components/ui/Input.tsx`
- `src/app/components/ui/Card.tsx`
- `src/app/components/ui/Spinner.tsx`
- `src/app/components/ticket/TicketList.tsx`
- `src/app/components/ticket/TicketCard.tsx`
- `src/app/components/ticket/TicketEditor.tsx`

**Dica:** Pode usar Shadcn/ui para componentes base:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card
```

---

### 5. Testes de Integração (LOW - mas importante) 🧪

Testar com SQLite real.

**Exemplo:**
```typescript
// tests/integration/repositories/SQLiteTicketRepository.test.ts
describe('SQLiteTicketRepository Integration', () => {
  it('should save and retrieve ticket', async () => {
    const db = await createTestDatabase();
    const repository = new SQLiteTicketRepository(db);
    
    const ticket = createTestTicket();
    const saved = await repository.save(ticket);
    const found = await repository.findById(saved.id);
    
    expect(found).toEqual(saved);
  });
});
```

---

## 📋 Checklist Fase 1 (Completar 30%)

- [ ] Instalar sql.js
- [ ] Implementar sqlite.ts com sql.js real
- [ ] Testar database real funcionando
- [ ] Criar useTickets hook
- [ ] Criar useTemplates hook
- [ ] Implementar TicketList component
- [ ] Implementar TicketEditor component
- [ ] Conectar pages com hooks
- [ ] Testes de integração (repositories)
- [ ] Seed data ou wizard de onboarding

**Tempo estimado:** 1-2 dias

---

## 🔄 Depois de Completar Fase 1

### Começar Fase 2: Template Builder

**Features:**
- Template CRUD visual
- Drag & Drop com dnd-kit
- Import/Export JSON com UI
- Validação em tempo real
- Templates prontos (marketplace)

**Tempo estimado:** 2 semanas

---

## 💡 Dicas

### Debug
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

### VSCode Extensions Recomendadas
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Error Lens
- Auto Rename Tag

### Atalhos Úteis
- `Cmd+Shift+P` → TypeScript: Restart TS Server
- `Cmd+K Cmd+T` → Change theme
- `Cmd+Shift+F` → Search in files

---

## 📞 Próximas Decisões

### Opcional (não urgente):
1. **Tauri ou Web puro?**
   - Web: Continuar com Vite puro
   - Tauri: Adicionar Tauri wrapper (desktop app)

2. **Shadcn/ui ou custom components?**
   - Shadcn/ui: Componentes prontos, rápido
   - Custom: Mais controle, mais trabalho

3. **Auto-save strategy?**
   - Debounce: Salvar após X segundos sem alteração
   - On blur: Salvar ao sair do campo
   - Manual: Apenas com Cmd+S

---

**Parabéns! Foundation profissional criada! 🎉**

**Continue com confiança - a arquitetura está sólida!** 💪

