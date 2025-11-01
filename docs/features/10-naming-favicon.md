# Feature 10: Naming, Favicon e UX

## Contexto e Objetivo

**Prioridade:** 🟢 Baixa  
**Estimativa:** 1 hora  
**Tipo:** Branding & UX

Melhorar branding e experiência visual do app com novo nome (StandupMate), favicon moderno, e meta tags atualizadas.

## Requisitos Técnicos

### Dependências

Não requer dependências adicionais.

### Ferramentas

- Favicon generator (ex: RealFaviconGenerator, Figma, etc.)
- SVG editor (opcional)

## Arquitetura e Design

### Identidade Visual

**Nome:** StandupMate  
**Tagline:** "Your daily standup companion"  
**Cores:** Usar tema existente (primary, secondary)  
**Estilo:** Moderno, minimalista, profissional

### Conceito do Favicon

Opções de design:
1. **Checkmark + Calendar**: Simboliza daily standup e tarefas completas
2. **Chat Bubble + Check**: Representa comunicação em standup
3. **Simple "S" Logo**: Letra S estilizada para StandupMate
4. **Kanban Board Icon**: Mini representação de board

## Arquivos a Editar

### 1. `index.html`

**Mudanças:** Atualizar title, meta tags, favicon links.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Primary Meta Tags -->
    <title>StandupMate - Your Daily Standup Companion</title>
    <meta name="title" content="StandupMate - Your Daily Standup Companion" />
    <meta name="description" content="Organize your daily standups, track tickets, and manage tasks efficiently with StandupMate - the ultimate productivity tool for developers." />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://standupmate.app/" />
    <meta property="og:title" content="StandupMate - Your Daily Standup Companion" />
    <meta property="og:description" content="Organize your daily standups, track tickets, and manage tasks efficiently." />
    <meta property="og:image" content="/og-image.png" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://standupmate.app/" />
    <meta property="twitter:title" content="StandupMate - Your Daily Standup Companion" />
    <meta property="twitter:description" content="Organize your daily standups, track tickets, and manage tasks efficiently." />
    <meta property="twitter:image" content="/og-image.png" />
    
    <!-- Theme Color -->
    <meta name="theme-color" content="#0f172a" />
    
    <!-- PWA Meta Tags (optional) -->
    <meta name="application-name" content="StandupMate" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="StandupMate" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 2. `package.json`

**Mudanças:** Atualizar name, description, e outros metadados.

```json
{
  "name": "standupmate",
  "version": "1.0.0",
  "description": "Your daily standup companion - organize tickets, track progress, and manage tasks efficiently",
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://standupmate.app",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/standupmate"
  },
  "keywords": [
    "standup",
    "daily-standup",
    "ticket-management",
    "productivity",
    "task-tracking",
    "developer-tools"
  ],
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

### 3. `README.md`

**Mudanças:** Atualizar todo o README com novo nome e branding.

```markdown
# 🎯 StandupMate

> Your daily standup companion

StandupMate helps developers organize their daily standups, track tickets, and manage tasks efficiently. Built with modern web technologies for a seamless desktop experience.

## Features

- 📝 **Ticket Management**: Create and track tickets with customizable templates
- 📊 **Dashboard**: Visual overview of your progress and metrics
- 🎨 **Template Builder**: Create custom ticket templates with drag & drop
- ⏱️ **Pomodoro Timer**: Stay focused with built-in timer
- 📤 **Export**: Export tickets to Markdown or JSON
- 🌙 **Dark Mode**: Beautiful dark theme support
- 🔄 **Backup & Restore**: Never lose your data

## Tech Stack

- React + TypeScript
- Vite
- Tauri (Desktop)
- SQLite (Local database)
- Tailwind CSS + shadcn/ui
- Hexagonal Architecture

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run desktop app (Tauri)
npm run tauri:dev
```

## Usage

1. Create a template or use the default template
2. Create tickets based on templates
3. Track your progress on the dashboard
4. Export tickets for your daily standup

## Documentation

See the [docs](./docs) folder for detailed documentation:

- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [Feature Specs](./docs/features/)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR.

---

Made with ❤️ for better daily standups
```

---

### 4. `public/favicon.svg`

**Mudanças:** Substituir por novo favicon SVG.

**Opção 1: Checkmark + Calendar Icon**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Calendar outline -->
  <rect x="20" y="25" width="60" height="55" rx="5" fill="none" stroke="url(#grad)" stroke-width="4"/>
  
  <!-- Calendar top bar -->
  <line x1="20" y1="35" x2="80" y2="35" stroke="url(#grad)" stroke-width="4"/>
  
  <!-- Calendar rings -->
  <circle cx="35" cy="25" r="3" fill="url(#grad)"/>
  <circle cx="65" cy="25" r="3" fill="url(#grad)"/>
  
  <!-- Checkmark -->
  <path d="M 35 55 L 45 65 L 65 45" fill="none" stroke="url(#grad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**Opção 2: Simple "S" Logo**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Rounded square background -->
  <rect x="10" y="10" width="80" height="80" rx="15" fill="url(#grad)"/>
  
  <!-- Letter S -->
  <path d="M 65 35 Q 65 25 55 25 L 40 25 Q 30 25 30 35 Q 30 45 40 45 L 60 45 Q 70 45 70 55 Q 70 65 60 65 L 45 65 Q 35 65 35 55" 
        fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>
</svg>
```

---

### 5. Adicionar Arquivos de Favicon Adicionais

Criar no diretório `public/`:

- `favicon.svg` (principal)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `og-image.png` (1200x630 para social media)
- `site.webmanifest` (para PWA)

**`site.webmanifest`:**

```json
{
  "name": "StandupMate",
  "short_name": "StandupMate",
  "description": "Your daily standup companion",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#0f172a",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/"
}
```

---

### 6. Atualizar Logo no Sidebar (opcional)

**`src/app/components/layouts/AppSidebar.tsx`:**

```typescript
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';

<div className="flex items-center gap-3 px-4 py-3">
  <Avatar>
    <AvatarImage src="/logo.svg" alt="StandupMate" />
    <AvatarFallback>SM</AvatarFallback>
  </Avatar>
  <div>
    <h2 className="font-semibold">StandupMate</h2>
    <p className="text-xs text-muted-foreground">Daily Standup Companion</p>
  </div>
</div>
```

## Plano de Implementação Detalhado

### Fase 1: Design do Favicon (20min)

1. **Escolher conceito**
   - Decidir entre opções de design
   - Fazer sketch/mockup

2. **Criar SVG**
   - Usar editor (Figma, Inkscape, ou código SVG)
   - Cores gradientes consistentes com tema

3. **Gerar variantes**
   - PNG 16x16, 32x32
   - Apple touch icon 180x180
   - OG image 1200x630

### Fase 2: Atualizar Meta Tags (15min)

4. **Editar `index.html`**
   - Title
   - Meta description
   - OG tags
   - Twitter cards
   - Favicon links

5. **Criar `site.webmanifest`**
   - PWA configuration
   - Icons
   - Theme color

### Fase 3: Atualizar Documentação (15min)

6. **Editar `package.json`**
   - Name
   - Description
   - Keywords
   - Homepage URL

7. **Editar `README.md`**
   - Novo nome
   - Novo tagline
   - Atualizar todas as referências

### Fase 4: Testes e Validação (10min)

8. **Testar favicon**
   - Navegador (tabs)
   - Bookmarks
   - Mobile home screen

9. **Testar meta tags**
   - Usar debugger do Facebook/Twitter
   - Verificar preview

10. **Verificar consistência**
    - Todas as referências atualizadas
    - Branding consistente

## Ferramentas Úteis

### Favicon Generators

- [RealFaviconGenerator](https://realfavicongenerator.net/) - Gera todos os tamanhos
- [Favicon.io](https://favicon.io/) - Simple favicon generator
- [Figma](https://figma.com) - Design customizado

### Meta Tags Validators

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Meta Tags](https://metatags.io/) - Preview de todas as plataformas

### SVG Optimizers

- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Otimizar SVG
- [SVG to PNG](https://cloudconvert.com/svg-to-png) - Converter para PNG

## Tamanhos de Imagens

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| favicon.svg | Vetorial | Navegadores modernos |
| favicon-16x16.png | 16x16 | Browser tabs |
| favicon-32x32.png | 32x32 | Browser bookmarks |
| apple-touch-icon.png | 180x180 | iOS home screen |
| og-image.png | 1200x630 | Social media sharing |
| icon-192.png | 192x192 | PWA (Android) |
| icon-512.png | 512x512 | PWA (Android) |

## Checklist de Validação

### Favicon

- [ ] `favicon.svg` criado e otimizado
- [ ] `favicon-16x16.png` gerado
- [ ] `favicon-32x32.png` gerado
- [ ] `apple-touch-icon.png` gerado (180x180)
- [ ] `og-image.png` criado (1200x630)
- [ ] Favicon aparece em browser tab
- [ ] Favicon aparece em bookmarks
- [ ] Favicon aparece em mobile home screen

### Meta Tags

- [ ] Title atualizado em `index.html`
- [ ] Meta description atualizada
- [ ] OG tags configuradas
- [ ] Twitter cards configuradas
- [ ] Theme color configurado
- [ ] `site.webmanifest` criado
- [ ] Preview correto no Facebook Debugger
- [ ] Preview correto no Twitter Card Validator

### Branding

- [ ] Nome atualizado para "StandupMate"
- [ ] Tagline definido: "Your daily standup companion"
- [ ] `package.json` atualizado
- [ ] `README.md` atualizado
- [ ] Todas as referências ao nome antigo removidas
- [ ] Logo no sidebar (opcional)

## Exemplo de OG Image

Design sugerido para `og-image.png` (1200x630):

```
┌────────────────────────────────────────────┐
│                                            │
│        [Logo/Icon]                         │
│                                            │
│         StandupMate                        │
│                                            │
│   Your Daily Standup Companion            │
│                                            │
│   📝 Track Tickets  ⏱️ Pomodoro Timer      │
│   📊 Dashboard      🎨 Custom Templates    │
│                                            │
└────────────────────────────────────────────┘
```

## Critérios de Aceite

- ✅ Favicon atualizado e funcionando
- ✅ Favicon aparece em todas as plataformas
- ✅ Title atualizado em todas as páginas
- ✅ Meta tags atualizadas (description, OG, Twitter)
- ✅ Preview correto em social media
- ✅ Nome do sistema atualizado para "StandupMate"
- ✅ package.json atualizado
- ✅ README.md atualizado
- ✅ Branding consistente em todo o app
- ✅ Logo/branding consistente

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

