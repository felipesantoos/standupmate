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
    'Problem Solving Roadmap',
    'Structured approach to problem-solving based on engineering best practices',
    '1.0.0',
    true, // isDefault
    [
      {
        id: 'section-what',
        title: '1️⃣ What Needs to Be Done?',
        order: 0,
        fields: [
          {
            id: 'ticket_title',
            label: 'Ticket Title',
            type: FieldType.TEXT,
            required: true,
            placeholder: 'Clear and concise title',
            order: 0,
          },
          {
            id: 'ticket_id',
            label: 'Ticket ID/Link',
            type: FieldType.TEXT,
            required: false,
            placeholder: 'JIRA-123, GitHub #456, etc.',
            order: 1,
          },
          {
            id: 'description',
            label: 'Ticket Description',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'What needs to be done and why is it important?',
            order: 2,
            validation: {
              minLength: 20,
            },
          },
          {
            id: 'ticket_type',
            label: 'Ticket Type',
            type: FieldType.SELECT,
            required: false,
            order: 3,
            options: ['Feature/Implementation', 'Bug', 'Investigation', 'Documentation', 'Tech Debt'],
          },
          {
            id: 'priority',
            label: 'Priority',
            type: FieldType.SELECT,
            required: false,
            order: 4,
            options: ['🔴 P0 Critical', '🟠 P1 High', '🟡 P2 Medium', '🟢 P3 Low'],
          },
        ],
      },
      {
        id: 'section-done',
        title: '2️⃣ How Will I Know I\'m Done?',
        order: 1,
        fields: [
          {
            id: 'acceptance_criteria',
            label: 'Acceptance Criteria',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Criterion 1\n- Criterion 2\n- Criterion 3',
            order: 0,
          },
          {
            id: 'done_checklist',
            label: 'Done When',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Code implemented and tested\n- Code review approved\n- Merged and deployed',
            order: 1,
          },
        ],
      },
      {
        id: 'section-preparation',
        title: '3️⃣ Am I Prepared?',
        order: 2,
        fields: [
          {
            id: 'blockers',
            label: 'Blockers and Dependencies',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'People, access, technical dependencies, knowledge gaps...',
            order: 0,
          },
          {
            id: 'preparation_checklist',
            label: 'Preparation Checklist',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Branch created\n- Environment running\n- Code explored\n- Documentation read',
            order: 1,
          },
          {
            id: 'complexity',
            label: 'Complexity Estimate',
            type: FieldType.RADIO,
            required: false,
            order: 2,
            options: ['🟢 Simple', '🟡 Medium', '🟠 High', '🔴 Very High'],
          },
        ],
      },
      {
        id: 'section-plan',
        title: '4️⃣ What\'s the Plan?',
        order: 3,
        fields: [
          {
            id: 'initial_plan',
            label: 'Initial Approach (Your Thoughts)',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '1. Step one\n2. Step two\n3. Step three',
            order: 0,
          },
          {
            id: 'ai_suggestion',
            label: 'AI Suggested Plan',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'What did the AI suggest?',
            order: 1,
          },
          {
            id: 'final_plan',
            label: 'Final Consolidated Plan',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Step 1 (15min): ...\n- Step 2 (30min): ...\n- Step 3 (20min): ...',
            order: 2,
          },
          {
            id: 'time_estimate',
            label: 'Time Estimate',
            type: FieldType.TEXT,
            required: false,
            placeholder: '2h 30min',
            order: 3,
          },
          {
            id: 'checkpoint',
            label: 'Intermediate Checkpoint',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'What should be ready halfway through?',
            order: 4,
          },
          {
            id: 'plan_b',
            label: 'Plan B (Alternative Approach)',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'What if things go wrong? When to escalate?',
            order: 5,
          },
        ],
      },
      {
        id: 'section-execution',
        title: '5️⃣ Executing',
        order: 4,
        fields: [
          {
            id: 'start_time',
            label: 'Start Time',
            type: FieldType.TEXT,
            required: false,
            placeholder: '10:30',
            order: 0,
          },
          {
            id: 'target_end',
            label: 'Target End Time',
            type: FieldType.TEXT,
            required: false,
            placeholder: '13:00',
            order: 1,
          },
          {
            id: 'step_progress',
            label: 'Step Progress',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Step 1 - Start: 10:30 | End: 10:45\n- Step 2 - Start: 10:45 | End: 11:30',
            order: 2,
          },
          {
            id: 'problems_encountered',
            label: '🔥 Problems/Surprises',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'Unexpected issues or challenges...',
            order: 3,
          },
          {
            id: 'plan_changes',
            label: '🔄 Changes to Plan',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'How did the plan evolve during execution?',
            order: 4,
          },
          {
            id: 'learnings',
            label: '💡 Learnings and Insights',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'What did you learn while working?',
            order: 5,
          },
          {
            id: 'quick_wins',
            label: '⚡ Quick Wins',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'Good things that happened...',
            order: 6,
          },
        ],
      },
      {
        id: 'section-delivery',
        title: '6️⃣ Before Delivery',
        order: 5,
        fields: [
          {
            id: 'code_quality',
            label: '🧹 Code Quality Checklist',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Linter passed\n- No console.logs\n- Descriptive names\n- Error handling',
            order: 0,
          },
          {
            id: 'testing',
            label: '🧪 Testing Checklist',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Unit tests\n- Manual testing\n- Edge cases\n- Real data',
            order: 1,
          },
          {
            id: 'impact',
            label: '🌍 Impact and Performance',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Files affected\n- Performance verified\n- No regressions',
            order: 2,
          },
          {
            id: 'documentation',
            label: '📚 Documentation',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- README updated\n- Comments added\n- Examples provided',
            order: 3,
          },
          {
            id: 'git_deploy',
            label: '🔀 Git and Deploy',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: '- Commits clear\n- Branch synced\n- PR created\n- Reviewers assigned',
            order: 4,
          },
        ],
      },
      {
        id: 'section-daily',
        title: '7️⃣ For the Daily',
        order: 6,
        fields: [
          {
            id: 'yesterday',
            label: 'Yesterday',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'What did you accomplish?',
            order: 0,
          },
          {
            id: 'today',
            label: 'Today',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'What are you working on?',
            order: 1,
          },
          {
            id: 'next_steps',
            label: 'Next Steps',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'What comes next?',
            order: 2,
          },
          {
            id: 'daily_blockers',
            label: 'Blockers',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'Any blockers or help needed?',
            order: 3,
          },
        ],
      },
      {
        id: 'section-retrospective',
        title: '8️⃣ Retrospective',
        order: 7,
        fields: [
          {
            id: 'completion_time',
            label: 'Completion Time',
            type: FieldType.TEXT,
            required: false,
            placeholder: '14:30',
            order: 0,
          },
          {
            id: 'actual_time',
            label: 'Total Time Spent',
            type: FieldType.TEXT,
            required: false,
            placeholder: '3h 45min',
            order: 1,
          },
          {
            id: 'within_estimate',
            label: 'Within Estimate?',
            type: FieldType.RADIO,
            required: false,
            order: 2,
            options: ['✅ Yes', '❌ No - Over', '❌ No - Under'],
          },
          {
            id: 'summary',
            label: 'Summary of Implementation',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'Brief summary of what was done...',
            order: 3,
          },
          {
            id: 'what_worked',
            label: 'What Worked Well?',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'Positive aspects...',
            order: 4,
          },
          {
            id: 'what_could_improve',
            label: 'What Could Have Been Better?',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'Areas for improvement...',
            order: 5,
          },
          {
            id: 'biggest_challenge',
            label: 'Biggest Challenge',
            type: FieldType.TEXT,
            required: false,
            placeholder: 'Main obstacle faced...',
            order: 6,
          },
          {
            id: 'main_learning',
            label: 'Main Learning',
            type: FieldType.TEXT,
            required: false,
            placeholder: 'Key takeaway...',
            order: 7,
          },
          {
            id: 'process_improvements',
            label: 'Process Improvements for Next Time',
            type: FieldType.MARKDOWN,
            required: false,
            placeholder: 'What to do differently next time...',
            order: 8,
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
      ticket_title: 'Implementar Arquitetura Hexagonal',
      description: 'Criar estrutura base do projeto com arquitetura hexagonal, seguindo princípios SOLID.',
      ticket_type: 'Feature/Implementation',
      priority: '🟠 P1 High',
      actual_time: '5h 30min',
      learnings: 'Aprendi sobre Ports & Adapters e como aplicar SOLID na prática.',
      summary: 'Implementei a estrutura base com domain, repositories e services seguindo arquitetura hexagonal.',
      what_worked: 'A separação de responsabilidades ficou muito clara e testável.',
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
      ticket_title: 'Implementar UI Components',
      description: 'Criar componentes reutilizáveis: Button, Card, Input, etc.',
      ticket_type: 'Feature/Implementation',
      priority: '🟠 P1 High',
      time_estimate: '3h',
      blockers: 'Preciso decidir sobre biblioteca de componentes (Shadcn/ui vs custom).',
      step_progress: '- Button component (DONE)\n- Card component (DONE)\n- Input component (IN PROGRESS)\n- Textarea component (TODO)',
      daily_blockers: 'Preciso decidir sobre biblioteca de componentes (Shadcn/ui vs custom).',
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
      ticket_title: 'Adicionar Testes de Integração',
      description: 'Criar testes de integração para repositories com SQLite real.',
      ticket_type: 'Feature/Implementation',
      priority: '🟡 P2 Medium',
      blockers: 'Preciso estudar como fazer testes com SQLite em memória.',
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

      // Seed sample tickets (now using correct field IDs matching the template)
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

