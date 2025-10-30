/**
 * Database Seed
 * 
 * Creates default template and sample data on first run.
 */

import { v4 as uuidv4 } from 'uuid';
import { Template } from '@core/domain/Template';
import { Ticket } from '@core/domain/Ticket';
import { FieldType, TicketStatus } from '@core/domain/types';
import { SQLiteTemplateRepository } from './repositories/SQLiteTemplateRepository';
import { SQLiteTicketRepository } from './repositories/SQLiteTicketRepository';
import { Database } from './sqlite';

/**
 * Check if database has been seeded
 */
export async function isSeeded(db: Database): Promise<boolean> {
  try {
    const templates = await db.select<{ count: number }>('SELECT COUNT(*) as count FROM templates');
    const hasTemplates = templates.length > 0 && templates[0].count > 0;
    
    if (hasTemplates) {
      console.log('ℹ️ Database already has templates, skipping seed');
    }
    
    return hasTemplates;
  } catch (error) {
    console.error('Error checking if seeded:', error);
    return false;
  }
}

/**
 * Seed default template
 */
export async function seedDefaultTemplate(db: Database): Promise<Template> {
  const now = new Date();
  
  const defaultTemplate = new Template(
    uuidv4(),
    'Daily Work Ticket',
    'Default template for daily work tracking',
    '1.0.0',
    true, // isDefault
    [
      {
        id: 'section-basic',
        title: '📋 Basic Information',
        order: 0,
        fields: [
          {
            id: 'title',
            label: 'Ticket Title',
            type: FieldType.TEXT,
            required: true,
            placeholder: 'e.g. Implement feature X',
            order: 0,
          },
          {
            id: 'description',
            label: 'Description',
            type: FieldType.TEXTAREA,
            required: true,
            placeholder: 'Describe what will be done...',
            order: 1,
            validation: {
              minLength: 10,
              maxLength: 1000,
            },
          },
          {
            id: 'type',
            label: 'Type',
            type: FieldType.SELECT,
            required: true,
            order: 2,
            options: ['Feature', 'Bug Fix', 'Refactor', 'Documentation', 'Test'],
          },
        ],
      },
      {
        id: 'section-planning',
        title: '⏱️ Planning',
        order: 1,
        fields: [
          {
            id: 'estimate',
            label: 'Time Estimate',
            type: FieldType.TEXT,
            required: false,
            placeholder: '2h 30min',
            order: 0,
          },
          {
            id: 'priority',
            label: 'Priority',
            type: FieldType.RADIO,
            required: true,
            order: 1,
            options: ['High', 'Medium', 'Low'],
          },
          {
            id: 'start_date',
            label: 'Start Date',
            type: FieldType.DATE,
            required: false,
            order: 2,
          },
        ],
      },
      {
        id: 'section-execution',
        title: '🚀 Execution',
        order: 2,
        fields: [
          {
            id: 'tasks',
            label: 'Tasks Completed',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Task 1\n- Task 2\n- Task 3',
            order: 0,
          },
          {
            id: 'actual_time',
            label: 'Actual Time',
            type: FieldType.TEXT,
            required: false,
            placeholder: '3h 15min',
            order: 1,
          },
          {
            id: 'blockers',
            label: 'Blockers Found',
            type: FieldType.TEXTAREA,
            required: false,
            placeholder: 'Describe blockers or difficulties...',
            order: 2,
          },
        ],
      },
      {
        id: 'section-notes',
        title: '📝 Notes',
        order: 3,
        fields: [
          {
            id: 'notes',
            label: 'Additional Notes',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'Any additional relevant information...',
            order: 0,
          },
          {
            id: 'learnings',
            label: 'Learnings',
            type: FieldType.TEXTAREA,
            required: false,
            placeholder: 'What I learned from this ticket...',
            order: 1,
          },
        ],
      },
    ],
    now,
    now,
    'System' // author
  );

  const repository = new SQLiteTemplateRepository(db);
  return await repository.save(defaultTemplate);
}

/**
 * Seed sample tickets
 */
export async function seedSampleTickets(db: Database, templateId: string): Promise<Ticket[]> {
  const repository = new SQLiteTicketRepository(db);
  const tickets: Ticket[] = [];

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const now = new Date();

  // Sample ticket 1 - Completed
  const ticket1 = new Ticket(
    uuidv4(),
    templateId,
    '1.0.0',
    TicketStatus.COMPLETED,
    {
      title: 'Implementar Arquitetura Hexagonal',
      description: 'Criar estrutura base do projeto com arquitetura hexagonal, seguindo princípios SOLID.',
      type: 'Feature',
      estimate: '4h',
      priority: 'Alta',
      start_date: twoDaysAgo.toISOString().split('T')[0],
      tasks: `- Criar domain models\n- Implementar repositories\n- Configurar services\n- Setup de testes`,
      actual_time: '5h 30min',
      notes: 'Arquitetura ficou muito boa, extensível e testável.',
      learnings: 'Aprendi sobre Ports & Adapters e como aplicar SOLID na prática.',
    },
    {
      dev: 'User',
      estimate: '4h',
      actualTime: '5h 30min',
    },
    ['architecture', 'hexagonal', 'solid'],
    twoDaysAgo,
    oneDayAgo,
    oneDayAgo
  );
  tickets.push(await repository.save(ticket1));

  // Sample ticket 2 - In Progress
  const ticket2 = new Ticket(
    uuidv4(),
    templateId,
    '1.0.0',
    TicketStatus.IN_PROGRESS,
    {
      title: 'Implementar UI Components',
      description: 'Criar componentes reutilizáveis: Button, Card, Input, etc.',
      type: 'Feature',
      estimate: '3h',
      priority: 'Alta',
      start_date: now.toISOString().split('T')[0],
      tasks: `- ✅ Button component\n- ✅ Card component\n- 🔄 Input component\n- ⏳ Textarea component`,
      actual_time: '2h',
      blockers: 'Preciso decidir sobre biblioteca de componentes (Shadcn/ui vs custom).',
    },
    {
      dev: 'User',
      estimate: '3h',
      actualTime: '2h',
    },
    ['ui', 'components', 'react'],
    threeHoursAgo,
    thirtyMinAgo
  );
  tickets.push(await repository.save(ticket2));

  // Sample ticket 3 - Draft
  const ticket3 = new Ticket(
    uuidv4(),
    templateId,
    '1.0.0',
    TicketStatus.DRAFT,
    {
      title: 'Adicionar Testes de Integração',
      description: 'Criar testes de integração para repositories com SQLite real.',
      type: 'Test',
      priority: 'Média',
    },
    {
      dev: 'User',
    },
    ['testing', 'integration'],
    now,
    now
  );
  tickets.push(await repository.save(ticket3));

  return tickets;
}

/**
 * Track if seeds have been run in this session
 */
let seedsRun = false;
let seedingPromise: Promise<void> | null = null;

/**
 * Run all seeds (with lock to prevent race conditions)
 */
export async function runSeeds(db: Database): Promise<void> {
  // If already seeded in this session, skip
  if (seedsRun) {
    console.log('⏭️ Seeds already run in this session');
    return;
  }

  // If currently seeding (race condition), wait for it to finish
  if (seedingPromise) {
    console.log('⏳ Seeding already in progress, waiting...');
    await seedingPromise;
    return;
  }

  // Check if already seeded in database
  if (await isSeeded(db)) {
    console.log('ℹ️ Database already seeded');
    seedsRun = true;
    return;
  }

  // Create the seeding promise and execute
  seedingPromise = (async () => {
    console.log('🌱 Seeding database...');

    try {
      // Double-check inside the lock
      if (await isSeeded(db)) {
        console.log('ℹ️ Database was seeded by another process');
        seedsRun = true;
        return;
      }

      // Seed default template
      const template = await seedDefaultTemplate(db);
      console.log('✅ Default template created:', template.name);

      // Seed sample tickets
      const tickets = await seedSampleTickets(db, template.id);
      console.log(`✅ ${tickets.length} sample tickets created`);

      console.log('🎉 Database seeded successfully!');
      seedsRun = true;
    } catch (error) {
      console.error('❌ Failed to seed database:', error);
      throw error;
    } finally {
      seedingPromise = null;
    }
  })();

  await seedingPromise;
}

