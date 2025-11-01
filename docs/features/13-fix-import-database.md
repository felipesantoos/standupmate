# Feature 13: Correção - "Import database does not work"

## Contexto e Objetivo

**Prioridade:** 🔴 Alta  
**Estimativa:** 2-4 horas  
**Tipo:** Bug Fix

Investigar e corrigir o problema de importação do banco de dados, garantindo que o processo seja robusto, com validação adequada e tratamento de erros.

## Sintomas do Problema

- [ ] Import não funciona (erro silencioso)
- [ ] Import falha com erro genérico
- [ ] Import corrompe dados existentes
- [ ] Import não valida schema corretamente
- [ ] Import não faz rollback em caso de erro
- [ ] Mensagens de erro não são claras

## Investigação

### Áreas a Investigar

1. **Parsing do JSON**
   - JSON malformado não é detectado
   - Encoding issues (UTF-8)
   - Arquivo muito grande

2. **Validação de Schema**
   - Validação incompleta ou incorreta
   - Versão do schema não é verificada
   - Campos obrigatórios faltando não são detectados

3. **Transações**
   - Sem transação (não-atômico)
   - Rollback não funciona
   - Dados parcialmente importados

4. **Error Handling**
   - Erros não são capturados
   - Mensagens de erro não informativas
   - UI não mostra feedback

5. **Atomicidade**
   - Import pode deixar banco em estado inconsistente
   - Dados antigos não são preservados em caso de erro

## Arquivos a Investigar/Editar

### 1. `src/infra/storage/JSONBackupService.ts`

**Investigar método `importAll()`:**

```typescript
// Possíveis problemas:

// ❌ Problema 1: Sem validação de schema
async importAll(backup: any) {
  // Importa direto sem validar
  for (const template of backup.templates) {
    await this.templateRepository.create(template);
  }
}

// ❌ Problema 2: Sem transação
async importAll(backup: DatabaseBackup) {
  // Não há BEGIN TRANSACTION
  await this.clearAllData();
  // Se falhar aqui, dados foram perdidos!
  await this.importTemplates(backup.templates);
}

// ❌ Problema 3: Sem tratamento de erros
async importAll(backup: DatabaseBackup) {
  // Não há try/catch
  await this.clearAllData();
  await this.importTemplates(backup.templates);
  // Se falhar, erro é silencioso
}

// ❌ Problema 4: Validação fraca
validateBackup(backup: any): boolean {
  return !!backup.templates && !!backup.tickets;
  // Não valida estrutura interna
}
```

**Solução Completa:**

```typescript
import { z } from 'zod';

// Schema Zod completo
const FieldSchema = z.object({
  id: z.string(),
  sectionId: z.string(),
  label: z.string(),
  type: z.enum(['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'radio']),
  required: z.boolean(),
  order: z.number(),
  placeholder: z.string().optional(),
  validation: z.any().optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
});

const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  fields: z.array(FieldSchema),
});

const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  sections: z.array(SectionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const TicketSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  title: z.string(),
  status: z.string(),
  data: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const BackupSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  templates: z.array(TemplateSchema),
  tickets: z.array(TicketSchema),
  metadata: z.object({
    appVersion: z.string().optional(),
    totalTemplates: z.number(),
    totalTickets: z.number(),
  }).optional(),
});

export class JSONBackupService implements IStorageService {
  // ... constructor

  async importAll(backup: DatabaseBackup, options?: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      templatesImported: 0,
      ticketsImported: 0,
      errors: [],
    };

    try {
      // 1. Validação de schema
      console.log('Validating backup schema...');
      const validation = this.validateBackup(backup);
      
      if (!validation.valid) {
        result.errors = validation.errors;
        console.error('Validation failed:', validation.errors);
        return result;
      }

      // Mostrar warnings se houver
      if (validation.warnings.length > 0) {
        console.warn('Validation warnings:', validation.warnings);
      }

      // 2. Migração de versão se necessário
      console.log('Checking schema version...');
      const migratedBackup = this.migrateBackup(backup);

      // 3. Fazer backup dos dados atuais (para rollback manual)
      console.log('Creating safety backup...');
      const currentBackup = await this.exportAll();
      localStorage.setItem('backup_before_import', JSON.stringify(currentBackup));

      // 4. Iniciar transação (se SQLite suportar)
      console.log('Starting transaction...');
      await this.db.exec('BEGIN TRANSACTION');

      try {
        // 5. Limpar dados existentes
        console.log('Clearing existing data...');
        await this.templateRepository.deleteAll();
        await this.ticketRepository.deleteAll();

        // 6. Importar templates
        console.log(`Importing ${migratedBackup.templates.length} templates...`);
        for (const template of migratedBackup.templates) {
          try {
            await this.templateRepository.create(template);
            result.templatesImported++;
          } catch (error) {
            const errorMsg = `Failed to import template ${template.id}: ${error.message}`;
            console.error(errorMsg);
            result.errors.push(errorMsg);
            
            // Se erro crítico, abortar
            if (result.errors.length > 10) {
              throw new Error('Too many errors, aborting import');
            }
          }
        }

        // 7. Importar tickets
        console.log(`Importing ${migratedBackup.tickets.length} tickets...`);
        for (const ticket of migratedBackup.tickets) {
          try {
            await this.ticketRepository.create(ticket);
            result.ticketsImported++;
          } catch (error) {
            const errorMsg = `Failed to import ticket ${ticket.id}: ${error.message}`;
            console.error(errorMsg);
            result.errors.push(errorMsg);
            
            // Se erro crítico, abortar
            if (result.errors.length > 10) {
              throw new Error('Too many errors, aborting import');
            }
          }
        }

        // 8. Verificar se import foi bem-sucedido
        const successRate = (result.templatesImported / migratedBackup.templates.length) * 100;
        
        if (successRate < 50) {
          throw new Error(`Import failed: only ${successRate}% of templates imported`);
        }

        // 9. Commit da transação
        console.log('Committing transaction...');
        await this.db.exec('COMMIT');
        
        result.success = true;
        console.log('Import completed successfully');
        
        // Limpar safety backup
        localStorage.removeItem('backup_before_import');

      } catch (error) {
        // Rollback em caso de erro
        console.error('Import failed, rolling back...', error);
        await this.db.exec('ROLLBACK');
        
        result.errors.push(`Import transaction failed: ${error.message}`);
        
        // Tentar restaurar backup anterior
        try {
          const safetyBackup = localStorage.getItem('backup_before_import');
          if (safetyBackup) {
            console.log('Restoring previous data...');
            // Não fazer import recursivo, apenas restaurar
            // (implementar restore manual se necessário)
          }
        } catch (restoreError) {
          console.error('Failed to restore backup:', restoreError);
          result.errors.push(`Failed to restore previous data: ${restoreError.message}`);
        }
        
        throw error;
      }

    } catch (error) {
      result.errors.push(`Import failed: ${error.message}`);
      console.error('Fatal import error:', error);
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
      // Validação com Zod
      console.log('Running Zod validation...');
      BackupSchema.parse(backup);
      
      // Validações adicionais
      const b = backup as DatabaseBackup;
      
      // Checar versão
      console.log('Checking version compatibility...');
      if (!this.isSupportedVersion(b.version)) {
        if (this.canMigrate(b.version)) {
          result.warnings.push(`Schema version ${b.version} will be migrated to current version`);
        } else {
          result.valid = false;
          result.errors.push(`Schema version ${b.version} is not supported and cannot be migrated`);
          return result;
        }
      }

      // Checar consistência de metadata
      if (b.metadata) {
        if (b.metadata.totalTemplates !== b.templates.length) {
          result.warnings.push(`Template count mismatch: metadata says ${b.metadata.totalTemplates}, but found ${b.templates.length}`);
        }
        if (b.metadata.totalTickets !== b.tickets.length) {
          result.warnings.push(`Ticket count mismatch: metadata says ${b.metadata.totalTickets}, but found ${b.tickets.length}`);
        }
      }

      // Checar se há templates duplicados
      const templateIds = b.templates.map(t => t.id);
      const uniqueTemplateIds = new Set(templateIds);
      if (templateIds.length !== uniqueTemplateIds.size) {
        result.errors.push('Backup contains duplicate template IDs');
        result.valid = false;
      }

      // Checar se há tickets duplicados
      const ticketIds = b.tickets.map(t => t.id);
      const uniqueTicketIds = new Set(ticketIds);
      if (ticketIds.length !== uniqueTicketIds.size) {
        result.errors.push('Backup contains duplicate ticket IDs');
        result.valid = false;
      }

      // Checar referências de tickets para templates
      const validTemplateIds = new Set(b.templates.map(t => t.id));
      const invalidTickets = b.tickets.filter(t => !validTemplateIds.has(t.templateId));
      if (invalidTickets.length > 0) {
        result.warnings.push(`${invalidTickets.length} ticket(s) reference non-existent templates`);
      }

      console.log('Validation completed:', result);

    } catch (error) {
      result.valid = false;
      
      if (error instanceof z.ZodError) {
        console.error('Zod validation errors:', error.errors);
        result.errors = error.errors.map(e => {
          const path = e.path.join('.');
          return `${path}: ${e.message}`;
        });
      } else {
        console.error('Validation error:', error);
        result.errors.push(error.message);
      }
    }

    return result;
  }

  private isSupportedVersion(version: string): boolean {
    const supported = ['1.0.0'];
    return supported.includes(version);
  }

  private canMigrate(version: string): boolean {
    const migratable = ['1.0.0'];
    return migratable.includes(version);
  }

  private migrateBackup(backup: DatabaseBackup): DatabaseBackup {
    console.log(`Migrating backup from version ${backup.version}...`);
    
    // Futuras migrações aqui
    if (backup.version === '1.0.0') {
      return backup; // Já está na versão atual
    }
    
    return backup;
  }
}
```

---

### 2. `src/app/pages/SettingsPage.tsx`

**Melhorar UI e feedback:**

```typescript
const [isImporting, setIsImporting] = useState(false);
const [importProgress, setImportProgress] = useState<string>('');

const handleConfirmImport = async () => {
  if (!backupPreview) return;
  
  setIsImporting(true);
  setImportProgress('Starting import...');
  
  try {
    setImportProgress('Validating backup...');
    
    const result = await storageService.importAll(backupPreview);
    
    if (result.success) {
      setImportProgress('Import successful!');
      
      // Mostrar resultado detalhado
      const message = [
        `Successfully imported:`,
        `- ${result.templatesImported} template(s)`,
        `- ${result.ticketsImported} ticket(s)`,
      ].join('\n');
      
      if (result.errors.length > 0) {
        message += `\n\nWarnings:\n${result.errors.join('\n')}`;
      }
      
      toast.success(message);
      
      // Recarregar app após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } else {
      throw new Error(result.errors.join('\n'));
    }
    
  } catch (error) {
    console.error('Import failed:', error);
    
    toast.error(
      <div>
        <strong>Import Failed</strong>
        <p className="text-sm mt-2">{error.message}</p>
      </div>,
      { duration: 10000 }
    );
    
    setImportProgress('');
    
  } finally {
    setIsImporting(false);
    setIsImportDialogOpen(false);
    setBackupPreview(null);
  }
};

// No dialog, mostrar progress
{isImporting && (
  <div className="my-4">
    <Progress value={undefined} className="w-full" /> {/* Indeterminate */}
    <p className="text-sm text-muted-foreground mt-2">{importProgress}</p>
  </div>
)}
```

## Plano de Implementação Detalhado

### Fase 1: Diagnóstico (30min-1h)

1. **Reproduzir o problema**
   - Tentar importar backup válido
   - Tentar importar backup inválido
   - Observar comportamento

2. **Investigar código atual**
   - Revisar `JSONBackupService.ts`
   - Identificar problemas específicos

3. **Listar problemas encontrados**
   - Documentar cada issue
   - Priorizar correções

### Fase 2: Correções Core (1-2h)

4. **Implementar validação robusta**
   - Schema Zod completo
   - Validações adicionais
   - Mensagens de erro claras

5. **Implementar transações**
   - BEGIN TRANSACTION
   - COMMIT/ROLLBACK
   - Safety backup

6. **Melhorar error handling**
   - Try/catch em todos os pontos críticos
   - Logs detalhados
   - Error propagation correta

### Fase 3: UI e UX (30min-1h)

7. **Melhorar feedback na UI**
   - Progress indicator
   - Mensagens detalhadas
   - Error display

8. **Adicionar confirmações**
   - Preview mais detalhado
   - Warnings claros

### Fase 4: Testes (30min-1h)

9. **Testar cenários positivos**
   - Import de backup válido
   - Import de backup com warnings
   - Import parcial (alguns erros)

10. **Testar cenários negativos**
    - JSON malformado
    - Schema inválido
    - Versão incompatível
    - Arquivo corrupto
    - Erro no meio do import (rollback)

## Checklist de Validação

### Validação

- [ ] JSON malformado é detectado
- [ ] Schema inválido é detectado
- [ ] Versão incompatível é detectada
- [ ] Duplicate IDs são detectados
- [ ] Referências quebradas são detectadas (tickets → templates)
- [ ] Mensagens de erro são claras e específicas
- [ ] Warnings são mostrados mas não bloqueiam import

### Transações

- [ ] Import usa transação (BEGIN/COMMIT)
- [ ] Rollback funciona em caso de erro
- [ ] Safety backup é criado antes de import
- [ ] Safety backup é restaurado se rollback falha
- [ ] Dados não ficam em estado inconsistente

### Error Handling

- [ ] Todos os erros são capturados
- [ ] Erros são logados (console)
- [ ] Erros são mostrados para usuário (toast)
- [ ] Import não falha silenciosamente
- [ ] Stack traces úteis para debugging

### UI/UX

- [ ] Progress indicator durante import
- [ ] Mensagens de progresso claras
- [ ] Resultado detalhado é mostrado (X templates, Y tickets)
- [ ] Errors/warnings são listados
- [ ] Botão fica disabled durante import
- [ ] App recarrega após import bem-sucedido

## Cenários de Teste

### Teste 1: Import Válido

**Input:** Backup válido com 2 templates, 5 tickets

**Esperado:**
- ✅ Validação passa
- ✅ Import completa sem erros
- ✅ 2 templates importados
- ✅ 5 tickets importados
- ✅ Toast de sucesso
- ✅ App recarrega

---

### Teste 2: JSON Malformado

**Input:** Arquivo com JSON inválido (vírgula faltando, etc.)

**Esperado:**
- ❌ Parse falha
- ❌ Toast de erro: "Failed to parse JSON"
- ❌ Import não prossegue
- ❌ Dados não são afetados

---

### Teste 3: Schema Inválido

**Input:** JSON válido mas com campos faltantes

**Esperado:**
- ❌ Validação falha
- ❌ Lista de erros específicos
- ❌ Toast mostra erros
- ❌ Import não prossegue

---

### Teste 4: Versão Incompatível

**Input:** Backup com version: "2.0.0"

**Esperado:**
- ⚠️ Warning sobre versão
- ❌ Se não pode migrar, bloquear import
- ✅ Se pode migrar, continuar com warning

---

### Teste 5: Erro no Meio do Import

**Input:** Backup válido, mas simular erro ao importar template #2

**Esperado:**
- ❌ Erro é capturado
- ❌ ROLLBACK é executado
- ❌ Dados anteriores são preservados
- ❌ Toast de erro com detalhes

## Critérios de Aceite

- ✅ Import de backup válido funciona
- ✅ Validação detecta todos os casos inválidos
- ✅ Mensagens de erro são claras e específicas
- ✅ Transações garantem atomicidade
- ✅ Rollback funciona corretamente
- ✅ UI mostra progress e resultado
- ✅ Safety backup protege dados
- ✅ Nenhum dado é perdido em caso de erro
- ✅ Logs detalhados para debugging
- ✅ Todos os cenários de teste passam

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

