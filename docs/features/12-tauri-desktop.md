# Feature 12: Desktop (Tauri)

## Contexto e Objetivo

**Prioridade:** 🟡 Média  
**Estimativa:** 1-2 horas  
**Tipo:** Platform/Infrastructure

Configurar e documentar como rodar a versão desktop do StandupMate usando Tauri, incluindo setup, desenvolvimento e build.

## Requisitos Técnicos

### Dependências

**System Requirements:**
- Rust (latest stable)
- Node.js 18+
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft C++ Build Tools
  - **Linux**: webkit2gtk, build-essential

### Tauri Dependencies

```bash
npm install -D @tauri-apps/cli
npm install @tauri-apps/api
```

## Arquitetura e Design

### Tauri Architecture

```
Frontend (React + Vite)
    ↓
Tauri API
    ↓
Rust Backend
    ↓
Native OS APIs
    ↓
System Resources (File System, Window, etc.)
```

### File Structure

```
standupmate/
├── src/                    # React frontend
├── src-tauri/              # Tauri/Rust backend
│   ├── src/
│   │   └── main.rs        # Rust entry point
│   ├── icons/             # App icons
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json
└── vite.config.ts
```

## Verificações e Setup

### Verificar se Tauri Já Está Configurado

1. **Verificar se existe `src-tauri/`**
   ```bash
   ls -la src-tauri/
   ```

2. **Verificar scripts no `package.json`**
   ```json
   {
     "scripts": {
       "tauri:dev": "...",
       "tauri:build": "..."
     }
   }
   ```

### Se Tauri NÃO Estiver Configurado

#### 1. Instalar Tauri CLI

```bash
npm install -D @tauri-apps/cli
npm install @tauri-apps/api
```

#### 2. Inicializar Tauri

```bash
npm run tauri init
```

**Configurações durante init:**
- App name: `StandupMate`
- Window title: `StandupMate`
- Web assets location: `../dist`
- Dev server URL: `http://localhost:5173`
- Frontend dev command: `npm run dev`
- Frontend build command: `npm run build`

## Arquivos a Criar/Editar

### 1. `package.json`

**Adicionar scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:build:debug": "tauri build --debug"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^1.5.0"
  },
  "dependencies": {
    "@tauri-apps/api": "^1.5.0"
  }
}
```

---

### 2. `src-tauri/tauri.conf.json`

**Configuração principal do Tauri:**

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist",
    "withGlobalTauri": false
  },
  "package": {
    "productName": "StandupMate",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "copyFile": true,
        "createDir": true,
        "removeDir": true,
        "removeFile": true,
        "renameFile": true,
        "exists": true,
        "scope": ["$APPDATA/**", "$APPDATA/*"]
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "window": {
        "all": false,
        "close": true,
        "hide": true,
        "show": true,
        "maximize": true,
        "minimize": true,
        "unmaximize": true,
        "unminimize": true,
        "startDragging": true
      },
      "shell": {
        "all": false,
        "open": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.standupmate.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "StandupMate",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

---

### 3. `src-tauri/src/main.rs`

**Rust entry point:**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

### 4. `src-tauri/Cargo.toml`

**Rust dependencies:**

```toml
[package]
name = "standupmate"
version = "1.0.0"
description = "Your daily standup companion"
authors = ["Your Name"]
license = "MIT"
repository = "https://github.com/yourusername/standupmate"
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
tauri = { version = "1.5", features = ["dialog-open", "dialog-save", "fs-all", "shell-open", "window-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

---

### 5. `docs/SETUP.md`

**Documentação de setup:**

```markdown
# StandupMate - Setup Guide

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **Rust**: Latest stable version
- **npm** or **yarn**

### Platform-Specific Requirements

#### macOS
```bash
xcode-select --install
```

#### Windows
- Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

## Installation

### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Clone Repository

```bash
git clone https://github.com/yourusername/standupmate.git
cd standupmate
```

### 3. Install Dependencies

```bash
npm install
```

## Development

### Run Desktop App (Development Mode)

```bash
npm run tauri:dev
```

This will:
1. Start the Vite dev server
2. Launch the Tauri window
3. Enable hot-reload for both frontend and backend

### Run Web Version (Browser)

```bash
npm run dev
```

Then open http://localhost:5173

## Building

### Build Desktop App (Production)

```bash
npm run tauri:build
```

### Build Locations

- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **Linux**: `src-tauri/target/release/bundle/deb/` or `AppImage/`

### Debug Build (Faster, Larger)

```bash
npm run tauri:build:debug
```

## Features

### File System Operations

The app has access to:
- Read/write files in app data directory
- Open file picker dialogs
- Save file dialogs

### Backup/Restore

Backup/restore functionality works seamlessly in Tauri using native file dialogs.

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9
```

### Rust Build Errors

```bash
# Update Rust
rustup update

# Clean build cache
cd src-tauri
cargo clean
```

### WebView2 Error (Windows)

Install WebView2 Runtime:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Resources

- [Tauri Documentation](https://tauri.app)
- [Tauri API Reference](https://tauri.app/v1/api/js/)
- [Rust Documentation](https://doc.rust-lang.org/)
```

---

### 6. Adicionar Ícones

Criar diretório `src-tauri/icons/` com ícones em diferentes tamanhos:

- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

**Usar ferramenta para gerar:**
```bash
# Instalar tauri icon generator
cargo install tauri-cli

# Gerar ícones a partir de PNG 1024x1024
tauri icon path/to/icon.png
```

## Integração com Features Existentes

### Backup/Restore com Tauri

**Usar Tauri Dialog API:**

```typescript
import { save, open } from '@tauri-apps/api/dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';

// Export Database
const handleExportDatabase = async () => {
  const backup = await storageService.exportAll();
  const json = JSON.stringify(backup, null, 2);
  
  // Usar Tauri save dialog
  const filePath = await save({
    defaultPath: `standupmate-backup-${new Date().toISOString().split('T')[0]}.json`,
    filters: [{
      name: 'JSON',
      extensions: ['json']
    }]
  });
  
  if (filePath) {
    await writeTextFile(filePath, json);
    toast.success('Database exported successfully');
  }
};

// Import Database
const handleImportDatabase = async () => {
  // Usar Tauri open dialog
  const selected = await open({
    multiple: false,
    filters: [{
      name: 'JSON',
      extensions: ['json']
    }]
  });
  
  if (selected && typeof selected === 'string') {
    const content = await readTextFile(selected);
    const backup = JSON.parse(content);
    
    // ... validação e import
  }
};
```

---

### SQLite Location

**App data directory:**

```typescript
import { appDataDir } from '@tauri-apps/api/path';

const dataDir = await appDataDir();
const dbPath = `${dataDir}/standupmate.db`;

// macOS: ~/Library/Application Support/com.standupmate.app/
// Windows: C:\Users\<user>\AppData\Roaming\com.standupmate.app\
// Linux: ~/.local/share/com.standupmate.app/
```

## Plano de Implementação Detalhado

### Fase 1: Verificação e Setup (30min)

1. **Verificar se Tauri já existe**
   - Checar `src-tauri/` directory
   - Checar scripts no package.json

2. **Se não existir, instalar Tauri**
   ```bash
   npm install -D @tauri-apps/cli
   npm install @tauri-apps/api
   npm run tauri init
   ```

3. **Configurar `tauri.conf.json`**
   - Allowlist de APIs
   - Window configuration
   - Bundle settings

### Fase 2: Documentação (30min)

4. **Criar `docs/SETUP.md`**
   - Prerequisites
   - Installation steps
   - Development commands
   - Build commands
   - Troubleshooting

5. **Atualizar `README.md`**
   - Adicionar seção "Desktop App"
   - Link para SETUP.md

### Fase 3: Testes (30min)

6. **Testar desenvolvimento**
   ```bash
   npm run tauri:dev
   ```

7. **Testar build**
   ```bash
   npm run tauri:build
   ```

8. **Testar executável gerado**
   - Abrir app
   - Testar funcionalidades
   - Testar file system operations

## Checklist de Validação

### Setup

- [ ] Tauri instalado corretamente
- [ ] `src-tauri/` directory exists
- [ ] `tauri.conf.json` configurado
- [ ] Scripts no `package.json` adicionados
- [ ] Ícones gerados e colocados em `src-tauri/icons/`

### Desenvolvimento

- [ ] `npm run tauri:dev` funciona
- [ ] App window abre corretamente
- [ ] Hot reload funciona (frontend)
- [ ] Tamanho de janela correto (1200x800)
- [ ] Janela é resizable
- [ ] Min size funciona (800x600)

### Build

- [ ] `npm run tauri:build` funciona
- [ ] Executável é gerado
- [ ] Localização do executável documentada
- [ ] App bundle funciona no OS nativo

### Funcionalidades

- [ ] SQLite funciona
- [ ] File operations funcionam (backup/restore)
- [ ] File dialogs funcionam
- [ ] App data directory correto
- [ ] Window controls funcionam

### Documentação

- [ ] `docs/SETUP.md` criado
- [ ] README.md atualizado
- [ ] Prerequisites documentados
- [ ] Build instructions claras
- [ ] Troubleshooting incluído

## Possíveis Desafios e Soluções

### Desafio 1: File System Permissions

**Problema:** Tauri tem sandbox, pode bloquear file operations.

**Solução:**
- Configurar allowlist corretamente em `tauri.conf.json`
- Usar scope adequado: `$APPDATA/**`
- Usar Dialog API para file picker

### Desafio 2: SQLite Path

**Problema:** Database path diferente em cada OS.

**Solução:**
```typescript
import { appDataDir } from '@tauri-apps/api/path';
import { createDir } from '@tauri-apps/api/fs';

const getDbPath = async () => {
  const dataDir = await appDataDir();
  await createDir(dataDir, { recursive: true });
  return `${dataDir}/standupmate.db`;
};
```

### Desafio 3: Build Errors

**Problema:** Build pode falhar por dependências faltantes.

**Solução:**
- Documentar prerequisites claramente
- Script de verificação de dependências
- Links para instalação de ferramentas

## Critérios de Aceite

- ✅ Tauri configurado e funcionando
- ✅ `npm run tauri:dev` funciona para desenvolvimento
- ✅ `npm run tauri:build` funciona para build
- ✅ Executável gerado funciona no OS nativo
- ✅ Documentação completa em `docs/SETUP.md`
- ✅ Localização do executável documentada
- ✅ FS operations (backup/restore JSON) funcionam no sandbox do Tauri
- ✅ SQLite funciona com app data directory
- ✅ File dialogs funcionam
- ✅ Ícones corretos em todas as plataformas

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

