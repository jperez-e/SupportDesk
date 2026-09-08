export interface TicketsByCategory {
  categoryId: number;
  categoryName: string;
  ticketCount: number;
}

export interface TicketsByAgent {
  agentId: number;
  agentName: string;
  ticketCount: number;
}

export interface TicketsByDay {
  date: string;
  ticketCount: number;
}

export interface AgentPerformance {
  agentId: number;
  agentName: string;
  resolvedTickets: number;
  averageResolutionHours: number;
}

export interface DashboardSummary {
  totalTickets: number;

  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;

  lowPriorityTickets: number;
  mediumPriorityTickets: number;
  highPriorityTickets: number;
  criticalPriorityTickets: number;

  ticketsByCategory: TicketsByCategory[];

  ticketsByAgent: TicketsByAgent[];

  unassignedTickets: number;

  ticketsLast7Days: number;

  ticketsByDay: TicketsByDay[];

  averageResolutionHours: number;

  agentPerformance: AgentPerformance[];
}