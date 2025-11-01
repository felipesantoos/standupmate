# Apêndice: Referências, Glossário e Recursos

## Índice

- [Glossário de Termos](#glossário-de-termos)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Referências de Bibliotecas](#referências-de-bibliotecas)
- [Recursos de Aprendizado](#recursos-de-aprendizado)
- [Ferramentas Úteis](#ferramentas-úteis)
- [Convenções de Código](#convenções-de-código)
- [FAQ - Perguntas Frequentes](#faq---perguntas-frequentes)

---

## Glossário de Termos

### Conceitos do Domínio

**Ticket**
- Unidade de trabalho representando uma tarefa, bug ou feature
- Contém dados estruturados baseados em um Template
- Estados possíveis: To Do, In Progress, Blocked, Done

**Template**
- Estrutura reutilizável que define seções e campos para tickets
- Composto por Sections e Fields
- Exemplo: "Problem Solving Roadmap"

**Section**
- Agrupamento lógico de campos dentro de um template
- Ex: "Basic Information", "Problem Description"
- Contém múltiplos Fields

**Field**
- Campo individual de dados dentro de uma Section
- Tipos: text, textarea, number, date, select, checkbox, radio
- Pode ter validações e ser required/optional

**Implementation History**
- Log cronológico de updates em um ticket
- Útil para daily standups
- Cada entry tem data e notas (markdown)

**Pomodoro**
- Técnica de gestão de tempo
- Ciclos de trabalho (25min) e descanso (5min)
- Integrado no sistema para foco

### Conceitos Técnicos

**Hexagonal Architecture (Ports & Adapters)**
- Arquitetura que separa lógica de negócio de infraestrutura
- Core: domain, services, interfaces
- Infra: repositories, database, external services

**Repository Pattern**
- Abstração para acesso a dados
- Interface define operações, implementação usa SQLite
- Exemplo: `ITicketRepository`, `SQLiteTicketRepository`

**Service Layer**
- Camada de serviços que orquestra operações de domínio
- Exemplo: `TicketService`, `TemplateService`, `ExportService`

**Domain Model**
- Entidades com lógica de negócio
- Exemplo: `Ticket`, `Template` (classes TypeScript)

**Mapper**
- Converte entre formatos (domain ↔ database, domain ↔ DTO)
- Exemplo: `TicketMapper`, `TemplateMapper`

**Zod Schema**
- Biblioteca de validação TypeScript-first
- Define schemas e valida dados em runtime

**Shadcn/UI**
- Coleção de componentes React reutilizáveis
- Baseada em Radix UI + Tailwind CSS
- Copy-paste, não é biblioteca npm

**TipTap**
- Editor WYSIWYG extensível
- Usado para campos markdown
- Baseado em ProseMirror

**Tauri**
- Framework para apps desktop com web frontend
- Backend em Rust, frontend em JavaScript/TypeScript
- Alternativa leve ao Electron

**i18n (Internationalization)**
- Internacionalização - suporte a múltiplos idiomas
- Sistema de traduções com dicionários

**Optimistic Update**
- Atualizar UI antes de confirmar com backend
- Melhora UX, mas precisa rollback em caso de erro

**Transação (Transaction)**
- Operação atômica no banco de dados
- BEGIN → operações → COMMIT/ROLLBACK
- Garante consistência

---

## Arquitetura do Projeto

### Estrutura de Diretórios

```
standupmate/
├── src/
│   ├── app/                      # Presentation Layer (React)
│   │   ├── components/           # Componentes React
│   │   │   ├── ui/              # Componentes UI (shadcn)
│   │   │   ├── ticket/          # Componentes de tickets
│   │   │   ├── template/        # Componentes de templates
│   │   │   ├── dashboard/       # Componentes do dashboard
│   │   │   └── layouts/         # Layouts e navegação
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Páginas principais
│   │   └── store/               # Context/State management
│   │
│   ├── core/                     # Domain & Application Layer
│   │   ├── domain/              # Entidades de domínio
│   │   ├── services/            # Serviços de aplicação
│   │   ├── interfaces/          # Interfaces (ports)
│   │   │   ├── primary/         # Portas de entrada
│   │   │   └── secondary/       # Portas de saída
│   │   └── exceptions/          # Exceções de domínio
│   │
│   ├── infra/                    # Infrastructure Layer
│   │   ├── database/            # Persistência
│   │   │   ├── repositories/    # Implementações de repos
│   │   │   ├── mappers/         # Mappers domain ↔ DB
│   │   │   └── sqlite.ts        # Cliente SQLite
│   │   └── storage/             # Storage (backup, etc.)
│   │
│   ├── lib/                      # Utilitários e configurações
│   │   ├── i18n.ts              # Sistema de i18n
│   │   ├── serviceFactory.ts    # Dependency injection
│   │   └── utils.ts             # Funções utilitárias
│   │
│   └── styles/                   # Estilos globais
│
├── docs/                         # Documentação
│   ├── features/                 # Specs de features
│   ├── IMPLEMENTATION_PLAN.md    # Plano geral
│   └── APPENDIX.md              # Este arquivo
│
├── public/                       # Assets estáticos
├── src-tauri/                    # Tauri (Desktop)
└── tests/                        # Testes
```

### Camadas da Arquitetura

**1. Presentation Layer (App)**
- React components
- UI/UX
- Hooks para estado e efeitos
- Rotas e navegação

**2. Application Layer (Core/Services)**
- Use cases e lógica de aplicação
- Orquestração de operações
- Interfaces de serviços

**3. Domain Layer (Core/Domain)**
- Entidades de negócio
- Regras de domínio
- Value objects

**4. Infrastructure Layer (Infra)**
- Acesso a dados (SQLite)
- File system
- External services

### Fluxo de Dados

```
User Interaction (UI)
    ↓
React Component
    ↓
Service (via serviceFactory)
    ↓
Domain Logic
    ↓
Repository (interface)
    ↓
Concrete Repository (SQLite)
    ↓
Database
```

---

## Tecnologias Utilizadas

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 18.x | Biblioteca UI |
| TypeScript | 5.x | Tipagem estática |
| Vite | 5.x | Build tool e dev server |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| shadcn/ui | - | Componentes React |
| React Hook Form | 7.x | Gerenciamento de formulários |
| Zod | 3.x | Validação de schemas |
| TipTap | 2.x | Editor WYSIWYG |
| @dnd-kit | 6.x | Drag and drop |
| Sonner | 1.x | Toast notifications |
| Lucide React | - | Ícones |

### Backend/Database

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| SQLite | 3.x | Database local |
| sql.js | 1.x | SQLite para web |

### Desktop

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Tauri | 1.5.x | Desktop app framework |
| Rust | 1.7x+ | Backend do Tauri |

### Dev Tools

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| ESLint | 8.x | Linter JavaScript/TypeScript |
| Prettier | 3.x | Code formatter |
| Vitest | 1.x | Test runner |
| TypeScript | 5.x | Type checker |

---

## Referências de Bibliotecas

### React Hook Form

**Documentação:** https://react-hook-form.com/

**Uso no projeto:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(ticketSchema),
  defaultValues: ticket,
});
```

---

### Zod

**Documentação:** https://zod.dev/

**Uso no projeto:**
```typescript
import { z } from 'zod';

const TemplateSchema = z.object({
  name: z.string().min(1),
  sections: z.array(SectionSchema),
});
```

---

### shadcn/ui

**Documentação:** https://ui.shadcn.com/

**Componentes usados:**
- Button, Card, Dialog, Form, Input, Select
- Table, Tabs, Toast, Tooltip
- Alert, Badge, Skeleton, Spinner

**Adicionar componente:**
```bash
npx shadcn-ui@latest add button
```

---

### TipTap

**Documentação:** https://tiptap.dev/

**Extensões usadas:**
- StarterKit (basic formatting)
- Markdown (markdown support)
- Placeholder
- Link

---

### @dnd-kit

**Documentação:** https://docs.dndkit.com/

**Uso no projeto:**
- Template Builder (drag & drop de sections/fields)
- Reordenação de items

---

### Tailwind CSS

**Documentação:** https://tailwindcss.com/docs

**Configuração:** `tailwind.config.js`

**Classes principais:**
- Layout: `flex`, `grid`, `container`
- Spacing: `p-4`, `m-6`, `gap-2`
- Typography: `text-sm`, `font-bold`
- Colors: `text-primary`, `bg-card`

---

### Tauri

**Documentação:** https://tauri.app/

**APIs usadas:**
- File system: `@tauri-apps/api/fs`
- Dialog: `@tauri-apps/api/dialog`
- Window: `@tauri-apps/api/window`
- Path: `@tauri-apps/api/path`

---

## Recursos de Aprendizado

### Hexagonal Architecture

- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- [DDD, Hexagonal, Onion, Clean, CQRS, … How I put it all together](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)

### React & TypeScript

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Hooks Documentation](https://react.dev/reference/react)

### Tailwind CSS

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### SQLite

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)

### Tauri

- [Tauri Guides](https://tauri.app/v1/guides/)
- [Tauri Examples](https://github.com/tauri-apps/tauri/tree/dev/examples)

---

## Ferramentas Úteis

### Design & Prototyping

- [Figma](https://figma.com) - Design de UI/UX
- [Excalidraw](https://excalidraw.com) - Diagramas e wireframes

### Icons & Assets

- [Lucide Icons](https://lucide.dev/) - Ícones do projeto
- [Heroicons](https://heroicons.com/) - Alternativa de ícones
- [Undraw](https://undraw.co/) - Ilustrações para empty states

### Development

- [VS Code](https://code.visualstudio.com/) - Editor recomendado
- [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### Database

- [DB Browser for SQLite](https://sqlitebrowser.org/) - GUI para SQLite
- [TablePlus](https://tableplus.com/) - Database client

### Testing

- [Postman](https://www.postman.com/) - API testing (se houver backend separado)
- [React Developer Tools](https://react.dev/learn/react-developer-tools) - Debug React

### Validators & Debuggers

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - OG tags
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Twitter cards
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Otimizar SVG

---

## Convenções de Código

### Naming Conventions

**Arquivos:**
- Components: `PascalCase.tsx` (ex: `TicketCard.tsx`)
- Hooks: `camelCase.ts` (ex: `useTickets.ts`)
- Utils: `camelCase.ts` (ex: `formatters.ts`)
- Constants: `UPPER_SNAKE_CASE.ts`

**Variáveis e Funções:**
- Variables: `camelCase` (ex: `ticketData`)
- Functions: `camelCase` (ex: `handleSubmit`)
- Components: `PascalCase` (ex: `TicketCard`)
- Hooks: `use` prefix (ex: `useTickets`)
- Constants: `UPPER_SNAKE_CASE` (ex: `MAX_ITEMS`)

**Types e Interfaces:**
- Interfaces: `IPascalCase` para interfaces de serviço (ex: `ITicketService`)
- Types: `PascalCase` (ex: `TicketData`)
- Enums: `PascalCase` (ex: `TicketStatus`)

### Code Structure

**Imports Order:**
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. External libraries
import { z } from 'zod';
import { toast } from 'sonner';

// 3. Internal absolute imports
import { Button } from '@/app/components/ui/button';
import { useTickets } from '@/app/hooks/useTickets';

// 4. Relative imports
import { TicketCard } from './TicketCard';

// 5. Types
import type { Ticket } from '@/core/domain/Ticket';

// 6. Styles (if any)
import './styles.css';
```

**Component Structure:**
```typescript
// 1. Imports

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 7. Render helpers
  const renderItem = () => {
    // ...
  };
  
  // 8. Early returns
  if (!state) return null;
  
  // 9. JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
};
```

### Comments

```typescript
// Comentários de linha única para explicações breves

/**
 * Comentários de bloco para funções/componentes
 * @param param1 - Descrição do parâmetro
 * @returns Descrição do retorno
 */
function myFunction(param1: string): void {
  // ...
}
```

### Git Commits

**Formato:**
```
type(scope): description

[optional body]
[optional footer]
```

**Types:**
- `feat`: Nova feature
- `fix`: Bug fix
- `docs`: Documentação
- `style`: Formatação, lint
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

**Exemplos:**
```
feat(tickets): add bulk status update
fix(import): resolve validation error handling
docs(readme): update setup instructions
```

---

## FAQ - Perguntas Frequentes

### Geral

**Q: Por que hexagonal architecture?**  
A: Separação clara entre domínio e infraestrutura, facilita testes e manutenção.

**Q: Por que SQLite ao invés de outro banco?**  
A: Local-first, sem necessidade de servidor, perfeito para desktop app.

**Q: Por que Tauri ao invés de Electron?**  
A: Menor tamanho final, melhor performance, menor uso de memória.

---

### Desenvolvimento

**Q: Como adicionar uma nova feature?**  
A:
1. Criar domain entities/services se necessário (core/)
2. Criar repository se necessário (infra/)
3. Criar components (app/)
4. Integrar via serviceFactory

**Q: Como adicionar um novo campo ao template?**  
A: Usar Template Builder UI ou editar diretamente em `seed.ts`

**Q: Como debugar o banco SQLite?**  
A: Usar DB Browser for SQLite para abrir `standupmate.db`

---

### Problemas Comuns

**Q: Port 5173 já está em uso**  
A: `lsof -ti:5173 | xargs kill -9`

**Q: Build do Tauri falha**  
A: Verificar se Rust e dependências de sistema estão instaladas

**Q: Console.log não aparece**  
A: Remover - usar apenas em dev mode com `import.meta.env.DEV`

**Q: Componente shadcn não funciona**  
A: Verificar se foi instalado: `npx shadcn-ui@latest add [component]`

---

## Resumo de Comandos

### Desenvolvimento

```bash
# Web dev
npm run dev

# Desktop dev
npm run tauri:dev

# Build web
npm run build

# Build desktop
npm run tauri:build

# Lint
npm run lint

# Format
npm run format

# Tests
npm run test
```

### Instalação de Componentes

```bash
# shadcn/ui component
npx shadcn-ui@latest add button

# npm package
npm install [package]

# dev dependency
npm install -D [package]
```

### Database

```bash
# Deletar banco (reset)
rm -rf data/

# Ver banco
db-browser-sqlite data/standupmate.db
```

---

**Última atualização:** Janeiro 2025  
**Versão do Documento:** 1.0.0

