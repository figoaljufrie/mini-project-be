export interface TransactionEmailContext {
  organizerName: string;      // transaction.event.organizer.name
  transactionId: number;      // transaction.id
  eventTitle: string;         // transaction.event.title
  totalIdr: number;           // transaction.totalIdr
  transactionDate: string;    // transaction.createdAt.toISOString() or formatted
  reason?: string;            // for rejected case
  dashboardLink?: string;     // frontend link to dashboard
  retryLink?: string;         // frontend link to retry checkout
}