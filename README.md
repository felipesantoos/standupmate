# 🤝 StandupMate

**Your Daily Standup Assistant**

Sistema flexível e dinâmico para rastreamento de trabalho, permitindo planejar, registrar informações importantes e acompanhar o progresso de tickets. Projetado para facilitar suas daily standups com arquitetura hexagonal profissional.

---

## ✨ Features

- ✅ **Templates Customizáveis** - Crie e gerencie templates de formulários
- ✅ **Tracking de Tickets** - Acompanhe progresso de trabalho
- ✅ **Export para Markdown** - Mantenha documentação compatível
- ✅ **Import/Export JSON** - Compartilhe templates
- ✅ **Daily Standup** - Gere resumos automáticos
- ✅ **Full-text Search** - Busca rápida com SQLite FTS5
- ✅ **Dark Mode** - Tema claro/escuro/sistema
- ✅ **Offline-First** - Todos os dados locais

---

## 🏗️ Arquitetura

Este projeto segue **Arquitetura Hexagonal (Ports & Adapters)** com **SOLID Principles**, alinhado 100% com os padrões do projeto Colabora.

```
src/
├── core/                    # 🎯 DOMAIN LAYER (Hexagon Center)
│   ├── domain/             # Entidades de negócio puras
│   │   ├── Ticket.ts       # Modelo de Ticket
│   │   ├── Template.ts     # Modelo de Template
│   │   └── types.ts        # Types compartilhados
│   ├── interfaces/         # Ports (abstrações)
│   │   ├── primary/        # 🔵 Primary Ports (Use Cases)
│   │   └── secondary/      # 🟢 Secondary Ports (Data Access)
│   ├── services/           # Lógica de aplicação
│   └── exceptions/         # Exceções de domínio
│
├── infra/                  # 🔌 INFRASTRUCTURE LAYER (Secondary Adapters)
│   └── database/
│       ├── repositories/   # SQLite implementations
│       ├── mappers/        # Domain ↔ DB transformations
│       ├── sqlite.ts       # Database client
│       └── seed.ts         # Database seeds
│
└── app/                    # 🖥️ APPLICATION LAYER (Primary Adapters)
    ├── dicontainer/       # ✨ Dependency Injection
    │   └── dicontainer.ts # Singleton DI Container
    ├── contexts/          # React Contexts (Primary Adapters)
    │   ├── TicketContext.tsx
    │   └── TemplateContext.tsx
    ├── hooks/             # Custom React hooks
    │   ├── useTickets.ts  # Consome TicketContext
    │   └── useTemplates.ts
    ├── components/        # React components
    └── pages/             # Page components
```

### Fluxo de Dados

```
Component → Hook → Context (Primary Adapter) → Service → Repository (Secondary Adapter) → Database
```

### Princípios SOLID Aplicados

- ✅ **Single Responsibility**: Cada camada tem uma responsabilidade clara
- ✅ **Open/Closed**: Extensível via novos adapters sem modificar core
- ✅ **Liskov Substitution**: Repositories intercambiáveis via interfaces
- ✅ **Interface Segregation**: Interfaces focadas e específicas
- ✅ **Dependency Inversion**: Services dependem de abstrações, não implementações

### Dependency Injection

- **DI Container síncrono** gerencia services e repositories
- **Lazy initialization** - services criados apenas quando necessários
- **Singleton pattern** - uma instância por service
- **Fácil de testar** - mock do container em testes

📚 **Documentação completa:** [HEXAGONAL_ARCHITECTURE.md](./docs/HEXAGONAL_ARCHITECTURE.md)

---

## 🛠️ Stack Técnica

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form** + Zod - Forms & validation
- **Context API** - State management

### Database
- **SQLite** - Local database
- **FTS5** - Full-text search

### Testing
- **Vitest** - Unit tests
- **Testing Library** - Component tests
- **80%+ Coverage** - Quality assurance

### DevOps
- **ESLint** + Prettier - Code quality
- **TypeScript strict** - Type safety
- **Vite** - Fast build tool

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm ou yarn

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd standupmate

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Run tests
npm test

# 5. Build for production
npm run build
```

---

## 📁 Estrutura do Projeto

```
standupmate/
├── src/
│   ├── core/                       # Core business logic
│   │   ├── domain/                 # Domain models (pure TS)
│   │   │   ├── Ticket.ts          # Ticket entity
│   │   │   ├── Template.ts        # Template entity
│   │   │   └── types.ts           # Shared types
│   │   ├── interfaces/            # Ports (abstractions)
│   │   │   ├── primary/           # Service interfaces
│   │   │   │   ├── ITicketService.ts
│   │   │   │   ├── ITemplateService.ts
│   │   │   │   └── IExportService.ts
│   │   │   └── secondary/         # Repository interfaces
│   │   │       ├── ITicketRepository.ts
│   │   │       └── ITemplateRepository.ts
│   │   ├── services/              # Business logic
│   │   │   ├── TicketService.ts
│   │   │   ├── TemplateService.ts
│   │   │   ├── ExportService.ts
│   │   │   └── filters/
│   │   │       ├── BaseFilter.ts
│   │   │       └── TicketFilter.ts
│   │   └── exceptions/            # Domain exceptions
│   │       └── DomainExceptions.ts
│   ├── infra/                      # Infrastructure (adapters)
│   │   └── database/
│   │       ├── sqlite.ts          # DB connection
│   │       ├── schema.sql         # DB schema
│   │       ├── repositories/      # Repository implementations
│   │       │   ├── SQLiteTicketRepository.ts
│   │       │   └── SQLiteTemplateRepository.ts
│   │       └── mappers/           # DB ↔ Domain
│   │           ├── TicketMapper.ts
│   │           └── TemplateMapper.ts
│   ├── app/                        # Application (UI)
│   │   ├── components/
│   │   │   └── layouts/
│   │   │       └── MainLayout.tsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TicketsPage.tsx
│   │   │   ├── TicketEditPage.tsx
│   │   │   ├── TemplatesPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── store/                  # Context API
│   │   │   ├── TicketContext.tsx
│   │   │   ├── TemplateContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   └── App.tsx
│   └── styles/
│       └── global.css
└── tests/
    ├── unit/                       # Unit tests
    │   ├── domain/
    │   │   ├── Ticket.test.ts
    │   │   └── Template.test.ts
    │   └── services/
    └── integration/                # Integration tests
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Watch mode
npm test -- --watch
```

### Coverage Goals
- Domain Layer: **100%**
- Service Layer: **90%+**
- Repository Layer: **80%+**
- Overall: **80%+**

---

## 📚 Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Arquitetura hexagonal detalhada
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) - Guia para desenvolvedores
- [`docs/TESTING.md`](docs/TESTING.md) - Estratégia de testes
- [`SYSTEM_PLAN.md`](../problem-solving-roadmap/SYSTEM_PLAN.md) - Plano completo do sistema

---

## 🗺️ Roadmap

### ✅ Fase 1: MVP Core (Atual)
- [x] Setup projeto com arquitetura hexagonal
- [x] Domain Layer (Ticket, Template)
- [x] Service Layer (TicketService, TemplateService, ExportService)
- [x] Repository Interfaces (Ports)
- [x] SQLite Adapters (Repositories, Mappers)
- [x] UI básica (Layout, Pages)
- [ ] Testes (Unit + Integration)

### 🔄 Fase 2: Template Builder (Próxima)
- [ ] Template CRUD visual
- [ ] Drag & Drop (dnd-kit)
- [ ] Import/Export JSON com UI
- [ ] Validação de templates
- [ ] Templates prontos (marketplace)

### 📅 Fase 3: UX e Produtividade
- [ ] Auto-save (debounce)
- [ ] Atalhos de teclado
- [ ] Full-text search
- [ ] Dashboard com estatísticas
- [ ] Tags e filtros avançados

### 📊 Fase 4: Reporting
- [ ] Daily standup automático
- [ ] Time tracking
- [ ] Relatórios customizáveis
- [ ] Export em batch

---

## 🏆 Benefícios da Arquitetura

### Testabilidade
```typescript
// Unit test: mock repository (rápido!)
const mockRepo = new MockTicketRepository();
const service = new TicketService(mockRepo);

// Integration test: real SQLite (confiável!)
const realRepo = new SQLiteTicketRepository(db);
const service = new TicketService(realRepo);
```

### Extensibilidade
```typescript
// Hoje: SQLite local
const repo = new SQLiteTicketRepository();

// Amanhã: Cloud sync (sem mudar domínio!)
const repo = new CloudSyncRepository();

// Testes: In-memory (rápido!)
const repo = new InMemoryRepository();
```

### Reutilização
```
Domain Layer escrito UMA VEZ, usado em:
- Desktop app (Tauri)
- Web app (Vite)
- Mobile app (React Native)
- CLI tool (Node.js)
```

---

## 📚 Documentação

### Arquitetura

- **[HEXAGONAL_ARCHITECTURE.md](./docs/HEXAGONAL_ARCHITECTURE.md)** - Guia completo da arquitetura hexagonal
  - Estrutura de camadas
  - Fluxo de dados
  - Dependency Injection Container
  - Padrões e convenções
  - Exemplos práticos

### Features

- **[IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)** - Plano geral de implementação
- **[features/](./docs/features/)** - Especificações detalhadas de cada feature
  - 13 documentos com planos step-by-step
  - Estruturas de dados
  - Casos de uso
  - Critérios de aceite

### Referências

Baseado nos guias de arquitetura do projeto Colabora:
- **Hexagonal Architecture** (Ports & Adapters)
- **SOLID Principles**
- **Clean Architecture**
- **Design Patterns** (Repository, Service, Mapper, DI, Filter)

---

## 📝 License

MIT

---

## 👤 Author

Felipe Santos

---

**Built with ❤️ following best practices and SOLID principles**

