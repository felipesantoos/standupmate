/**
 * Ticket History Domain Model
 * 
 * Tracks changes to tickets over time.
 */

export enum ChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export interface TicketChange {
  id: string;
  ticketId: string;
  changeType: ChangeType;
  field?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  description: string;
}

export class TicketHistory {
  constructor(
    public ticketId: string,
    public changes: TicketChange[]
  ) {}

  addChange(change: TicketChange): void {
    this.changes.push(change);
  }

  getChangesByType(type: ChangeType): TicketChange[] {
    return this.changes.filter((c) => c.changeType === type);
  }

  getLatestChanges(limit: number = 10): TicketChange[] {
    return this.changes
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getChangesInRange(start: Date, end: Date): TicketChange[] {
    return this.changes.filter(
      (c) => c.timestamp >= start && c.timestamp <= end
    );
  }
}

