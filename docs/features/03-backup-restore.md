# Feature 03: Backup/Restore de Dados (JSON dump)

## Contexto e Objetivo

**Prioridade:** 🟡 Média  
**Estimativa:** 4-6 horas  
**Tipo:** Feature

Permitir exportar e importar todo o banco de dados como um único arquivo JSON, possibilitando backup completo e migração de dados entre instalações.

## Requisitos Técnicos

### Dependências

Não requer dependências adicionais.

### Tecnologias Utilizadas

- File API (browser)
- Blob API (browser)
- Zod para validação de schema
- SQLite para transações atômicas

## Arquitetura e Design

### Estrutura do Sistema

```
SettingsPage
    ↓
JSONBackupService
    ├── exportAll() → JSON file
    └── importAll(json) → Database
            ↓
    TemplateRepository + TicketRepository
```

### Fluxo de Export

```
User clicks "Export Database"
    ↓
Fetch all templates from DB
    ↓
Fetch all tickets from DB
    ↓
Create backup JSON object
    ↓
Add metadata (version, timestamp)
    ↓
Stringify JSON
    ↓
Create Blob
    ↓
Trigger download
    ↓
Show success toast
```

### Fluxo de Import

```
User clicks "Import Database"
    ↓
Show file picker
    ↓
Read file content
    ↓
Parse JSON
    ↓
Validate schema version
    ↓
Show confirmation modal with preview
    ↓
User confirms "Replace All Data"
    ↓
Begin transaction
    ├── Clear all existing data
    ├── Import templates
    └── Import tickets
    ↓
Commit transaction (or rollback on error)
    ↓
Show success/error report
    ↓
Refresh app state
```

## Arquivos a Criar

### 1. `src/core/interfaces/secondary/IStorageService.ts`

**Responsabilidade:** Interface para serviço de backup/restore.

```typescript
export interface IStorageService {
  /**
   * Exporta todo o banco de dados para JSON
   */
  exportAll(): Promise<DatabaseBackup>;
  
  /**
   * Importa backup completo, substituindo dados existentes
   * @param backup - Backup a ser importado
   * @param options - Opções de importação
   */
  importAll(backup: DatabaseBackup, options?: ImportOptions): Promise<ImportResult>;
  
  /**
   * Valida estrutura de backup sem importar
   */
  validateBackup(backup: unknown): ValidationResult;
}

export interface DatabaseBackup {
  version: string; // Schema version
  exportedAt: string; // ISO timestamp
  templates: Template[];
  tickets: Ticket[];
  metadata?: {
    appVersion?: string;
    totalTemplates: number;
    totalTickets: number;
  };
}

export interface ImportOptions {
  mode: 'replace' | 'merge'; // Para futuro
  skipValidation?: boolean;
}

export interface ImportResult {
  success: boolean;
  templatesImported: number;
  ticketsImported: number;
  errors: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

---

### 2. `src/infra/storage/JSONBackupService.ts`

**Responsabilidade:** Implementação concreta do serviço de backup.

**Estrutura Completa:**

```typescript
import { IStorageService, DatabaseBackup, ImportOptions, ImportResult, ValidationResult } from '@/core/interfaces/secondary/IStorageService';
import { ITemplateRepository } from '@/core/interfaces/secondary/ITemplateRepository';
import { ITicketRepository } from '@/core/interfaces/secondary/ITicketRepository';
import { z } from 'zod';

const CURRENT_SCHEMA_VERSION = '1.0.0';

// Schema Zod para validação
const BackupSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  templates: z.array(z.any()), // Usar schema completo de Template
  tickets: z.array(z.any()), // Usar schema completo de Ticket
  metadata: z.object({
    appVersion: z.string().optional(),
    totalTemplates: z.number(),
    totalTickets: z.number(),
  }).optional(),
});

export class JSONBackupService implements IStorageService {
  constructor(
    private templateRepository: ITemplateRepository,
    private ticketRepository: ITicketRepository
  ) {}

  async exportAll(): Promise<DatabaseBackup> {
    // Buscar todos os templates
    const templates = await this.templateRepository.findAll();
    
    // Buscar todos os tickets
    const tickets = await this.ticketRepository.findAll();
    
    // Criar backup object
    const backup: DatabaseBackup = {
      version: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      templates,
      tickets,
      metadata: {
        appVersion: '1.0.0', // Ler de package.json
        totalTemplates: templates.length,
        totalTickets: tickets.length,
      },
    };
    
    return backup;
  }

  async importAll(backup: DatabaseBackup, options?: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      templatesImported: 0,
      ticketsImported: 0,
      errors: [],
    };

    try {
      // Validar backup
      if (!options?.skipValidation) {
        const validation = this.validateBackup(backup);
        if (!validation.valid) {
          result.errors = validation.errors;
          return result;
        }
      }

      // Migrar versão se necessário
      const migratedBackup = this.migrateBackup(backup);

      // Iniciar transação (se SQLite suportar)
      // BEGIN TRANSACTION
      
      // Limpar dados existentes
      await this.templateRepository.deleteAll();
      await this.ticketRepository.deleteAll();

      // Importar templates
      for (const template of migratedBackup.templates) {
        try {
          await this.templateRepository.create(template);
          result.templatesImported++;
        } catch (error) {
          result.errors.push(`Failed to import template ${template.id}: ${error.message}`);
        }
      }

      // Importar tickets
      for (const ticket of migratedBackup.tickets) {
        try {
          await this.ticketRepository.create(ticket);
          result.ticketsImported++;
        } catch (error) {
          result.errors.push(`Failed to import ticket ${ticket.id}: ${error.message}`);
        }
      }

      // Se houve erros críticos, fazer rollback
      if (result.errors.length > 0 && result.templatesImported === 0) {
        // ROLLBACK
        throw new Error('Import failed: ' + result.errors.join(', '));
      }

      // COMMIT
      result.success = true;
      
    } catch (error) {
      result.errors.push(`Import failed: ${error.message}`);
      // ROLLBACK em caso de erro
    }

    return result;
  }

  validateBackup(backup: unknown): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      // Validar com Zod
      BackupSchema.parse(backup);
      
      // Validações adicionais
      const b = backup as DatabaseBackup;
      
      // Checar versão
      if (!this.isSupportedVersion(b.version)) {
        result.warnings.push(`Schema version ${b.version} may not be fully supported`);
      }

      // Checar consistência
      if (b.metadata) {
        if (b.metadata.totalTemplates !== b.templates.length) {
          result.warnings.push('Template count mismatch in metadata');
        }
        if (b.metadata.totalTickets !== b.tickets.length) {
          result.warnings.push('Ticket count mismatch in metadata');
        }
      }

    } catch (error) {
      result.valid = false;
      if (error instanceof z.ZodError) {
        result.errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      } else {
        result.errors.push(error.message);
      }
    }

    return result;
  }

  private isSupportedVersion(version: string): boolean {
    const supported = ['1.0.0'];
    return supported.includes(version);
  }

  private migrateBackup(backup: DatabaseBackup): DatabaseBackup {
    // Migrar de versões antigas para versão atual
    if (backup.version === '1.0.0') {
      return backup; // Já está na versão atual
    }
    
    // Futuras migrações aqui
    
    return backup;
  }
}
```

## Arquivos a Editar

### 1. `src/app/pages/SettingsPage.tsx`

**Mudanças:** Adicionar seção de Backup/Restore com botões.

```typescript
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/app/components/ui/alert-dialog';

// No componente SettingsPage:

const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
const [importFile, setImportFile] = useState<File | null>(null);
const [backupPreview, setBackupPreview] = useState<DatabaseBackup | null>(null);

const handleExportDatabase = async () => {
  try {
    // Exportar dados
    const backup = await storageService.exportAll();
    
    // Criar JSON
    const json = JSON.stringify(backup, null, 2);
    
    // Criar blob e download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `standupmate-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Database exported successfully! (${backup.metadata?.totalTemplates} templates, ${backup.metadata?.totalTickets} tickets)`);
  } catch (error) {
    toast.error(`Failed to export database: ${error.message}`);
  }
};

const handleImportFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  try {
    // Ler arquivo
    const content = await file.text();
    const backup = JSON.parse(content);
    
    // Validar
    const validation = storageService.validateBackup(backup);
    if (!validation.valid) {
      toast.error('Invalid backup file: ' + validation.errors.join(', '));
      return;
    }
    
    // Mostrar warnings se houver
    if (validation.warnings.length > 0) {
      toast.warning(validation.warnings.join(', '));
    }
    
    // Salvar para preview e abrir dialog
    setImportFile(file);
    setBackupPreview(backup);
    setIsImportDialogOpen(true);
    
  } catch (error) {
    toast.error(`Failed to read backup file: ${error.message}`);
  }
};

const handleConfirmImport = async () => {
  if (!backupPreview) return;
  
  try {
    // Importar dados
    const result = await storageService.importAll(backupPreview);
    
    if (result.success) {
      toast.success(`Database imported successfully! (${result.templatesImported} templates, ${result.ticketsImported} tickets)`);
      
      // Refresh app
      window.location.reload();
    } else {
      toast.error(`Import failed: ${result.errors.join(', ')}`);
    }
    
    setIsImportDialogOpen(false);
    setBackupPreview(null);
    setImportFile(null);
    
  } catch (error) {
    toast.error(`Import failed: ${error.message}`);
  }
};

// JSX:

<Card>
  <CardHeader>
    <CardTitle>Database Backup & Restore</CardTitle>
    <CardDescription>
      Export or import your entire database as a JSON file
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Export */}
    <div>
      <h4 className="font-medium mb-2">Export Database</h4>
      <p className="text-sm text-muted-foreground mb-3">
        Download all your templates and tickets as a single JSON file
      </p>
      <Button onClick={handleExportDatabase}>
        <Download className="mr-2 h-4 w-4" />
        Export Database
      </Button>
    </div>

    <Separator />

    {/* Import */}
    <div>
      <h4 className="font-medium mb-2">Import Database</h4>
      <p className="text-sm text-muted-foreground mb-3">
        Replace all current data with data from a backup file
      </p>
      <Alert variant="destructive" className="mb-3">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This will permanently delete all existing templates and tickets!
        </AlertDescription>
      </Alert>
      <Button variant="destructive" onClick={() => document.getElementById('backup-file-input')?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        Import Database
      </Button>
      <input
        id="backup-file-input"
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFileSelect}
      />
    </div>
  </CardContent>
</Card>

{/* Confirmation Dialog */}
<AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm Database Import</AlertDialogTitle>
      <AlertDialogDescription>
        You are about to replace all existing data with:
      </AlertDialogDescription>
    </AlertDialogHeader>
    
    {backupPreview && (
      <div className="my-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Exported:</span>
          <span className="font-medium">
            {new Date(backupPreview.exportedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Schema Version:</span>
          <span className="font-medium">{backupPreview.version}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Templates:</span>
          <span className="font-medium">{backupPreview.templates.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tickets:</span>
          <span className="font-medium">{backupPreview.tickets.length}</span>
        </div>
      </div>
    )}
    
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        This action cannot be undone. All current data will be permanently deleted.
      </AlertDescription>
    </Alert>
    
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmImport} className="bg-destructive">
        Yes, Replace All Data
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 2. `src/lib/serviceFactory.ts`

**Mudanças:** Adicionar instância do `JSONBackupService`.

```typescript
import { JSONBackupService } from '@/infra/storage/JSONBackupService';

// ...

export const storageService = new JSONBackupService(
  templateRepository,
  ticketRepository
);
```

## Plano de Implementação Detalhado

### Fase 1: Interface e Service Base (1-2h)

1. **Criar `IStorageService.ts`**
   - Definir interfaces completas
   - Documentar tipos

2. **Criar `JSONBackupService.ts`**
   - Estrutura básica da classe
   - Método `exportAll()` básico

3. **Testar export básico**
   - Verificar JSON gerado
   - Verificar estrutura

### Fase 2: Validação e Migrações (1-2h)

4. **Implementar validação com Zod**
   - Schema completo
   - Método `validateBackup()`

5. **Implementar sistema de migrações**
   - Método `migrateBackup()`
   - Suporte para versão 1.0.0

6. **Testar validações**
   - Casos válidos
   - Casos inválidos
   - Warnings

### Fase 3: Import com Transações (1-2h)

7. **Implementar `importAll()`**
   - Limpar dados existentes
   - Importar templates
   - Importar tickets
   - Tratamento de erros

8. **Adicionar suporte a transações**
   - BEGIN/COMMIT/ROLLBACK
   - Garantir atomicidade

9. **Testar import**
   - Import bem-sucedido
   - Import com erros
   - Rollback funcionando

### Fase 4: UI Integration (1-2h)

10. **Editar `SettingsPage.tsx`**
    - Adicionar seção de backup
    - Botão de export
    - Botão de import
    - Confirmation dialog

11. **Testar fluxo completo**
    - Export → Import
    - Verificar dados
    - Testar confirmação

12. **Polish e refinamentos**
    - Loading states
    - Error handling
    - Success messages

## Estruturas de Dados

### DatabaseBackup Format

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-01-15T14:30:00.000Z",
  "templates": [
    {
      "id": "template-1",
      "name": "Problem Solving Roadmap",
      "description": "Template for daily standup",
      "version": "1.0.0",
      "sections": [...]
    }
  ],
  "tickets": [
    {
      "id": "ticket-1",
      "templateId": "template-1",
      "title": "Fix login bug",
      "status": "in_progress",
      "data": {...},
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-15T14:00:00.000Z"
    }
  ],
  "metadata": {
    "appVersion": "1.0.0",
    "totalTemplates": 1,
    "totalTickets": 1
  }
}
```

## Casos de Uso

### Caso 1: Export Database

1. Usuário navega para Settings
2. Clica em "Export Database"
3. Sistema coleta todos os dados
4. Browser faz download do arquivo JSON
5. Toast mostra sucesso com contadores
6. Arquivo salvo: `standupmate-backup-2025-01-15.json`

### Caso 2: Import Database (Sucesso)

1. Usuário navega para Settings
2. Clica em "Import Database"
3. Seleciona arquivo JSON
4. Sistema valida arquivo
5. Dialog de confirmação abre com preview
6. Usuário confirma
7. Sistema substitui todos os dados
8. App recarrega
9. Toast mostra sucesso

### Caso 3: Import Database (Erro de Validação)

1. Usuário seleciona arquivo inválido
2. Sistema detecta erro de validação
3. Toast mostra erro específico
4. Dialog não abre
5. Usuário pode tentar outro arquivo

## Validação e Testes

### Checklist de Validação

**Export:**
- [ ] Exporta todos os templates
- [ ] Exporta todos os tickets
- [ ] JSON é bem formatado
- [ ] Metadata está correta
- [ ] Timestamp está correto
- [ ] Nome do arquivo é adequado
- [ ] Download funciona

**Validation:**
- [ ] Detecta JSON inválido
- [ ] Detecta schema inválido
- [ ] Detecta versão não suportada
- [ ] Mostra erros detalhados
- [ ] Mostra warnings adequados

**Import:**
- [ ] Valida antes de importar
- [ ] Mostra preview correto
- [ ] Confirmação funciona
- [ ] Limpa dados existentes
- [ ] Importa todos os templates
- [ ] Importa todos os tickets
- [ ] Transação é atômica
- [ ] Rollback funciona em caso de erro
- [ ] App recarrega após import
- [ ] Toast mostra resultado

### Cenários de Erro

- [ ] Arquivo não é JSON
- [ ] Schema incompatível
- [ ] Versão muito antiga
- [ ] Erro ao limpar dados
- [ ] Erro ao importar template
- [ ] Erro ao importar ticket
- [ ] Transação falha

## Possíveis Desafios e Soluções

### Desafio 1: Transações em SQLite

**Problema:** Garantir atomicidade do import.

**Solução:**
```typescript
// Usar transações SQLite
await db.exec('BEGIN TRANSACTION');
try {
  // ... operações
  await db.exec('COMMIT');
} catch (error) {
  await db.exec('ROLLBACK');
  throw error;
}
```

### Desafio 2: Backups Grandes

**Problema:** Arquivos grandes podem travar o browser.

**Solução:**
- Limitar tamanho (avisar se >50MB)
- Usar streaming para files muito grandes
- Comprimir JSON (gzip)

### Desafio 3: Compatibilidade de Versões

**Problema:** Backups antigos podem não ser compatíveis.

**Solução:**
- Sistema de migrações robusto
- Avisos claros sobre compatibilidade
- Documentação de breaking changes

### Desafio 4: Perda de Dados

**Problema:** Import substitui tudo, pode causar perda de dados.

**Solução:**
- Confirmação clara e forte
- Sugerir export antes de import
- Futuro: modo "merge" além de "replace"

## Critérios de Aceite

- ✅ Export gera JSON único com todos os templates e tickets
- ✅ Import substitui dados com confirmação
- ✅ Validação de schema funciona
- ✅ Relatório de sucesso/erros é claro
- ✅ Transações garantem atomicidade
- ✅ Rollback funciona em caso de erro
- ✅ Migrações de versão funcionam
- ✅ Metadata está correta
- ✅ Warnings são mostrados adequadamente
- ✅ App recarrega após import bem-sucedido

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

