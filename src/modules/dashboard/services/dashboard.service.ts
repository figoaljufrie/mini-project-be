import { EventRepository } from "../../events/repository/event.repository";
import { MailService } from "../../mail/mail.service";
import { TransactionStatus } from "../../transactions/dto/create-transaction.dto";
import { TransactionRepository } from "../../transactions/repository/transaction.repository";
import { TransactionService } from "../../transactions/services/transaction.service";
import { DashboardRepository } from "../repository/dashboard.repository";

interface UpdateTransactionStatusData {
  status: TransactionStatus;
  adminNotes?: string;
}

interface TransactionEmailContext {
  userName: string;
  eventTitle: string;
  total?: number;
  additionalInfo?: string;
}

export class DashboardService {
  private dashboardRepository: DashboardRepository;
  private transactionRepo: TransactionRepository;
  private eventRepo: EventRepository;
  private mailService: MailService;
  private transactionService: TransactionService;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
    this.transactionRepo = new TransactionRepository();
    this.eventRepo = new EventRepository();
    this.mailService = new MailService();
    this.transactionService = new TransactionService();
  }

  //ambil transaksi dari event yang dibuat:
  public async getTransaction(
    organizerId: number,
    eventId?: number,
    status?: string
  ) {
    return this.dashboardRepository.getTransaction(
      organizerId,
      eventId,
      status
    );
  }

  //ambil total revenue dari semua event yang dibuat:
  public async getTotalrevenue(organizerId: number) {
    const result = await this.dashboardRepository.getTotalRevenue(organizerId);
    return result._sum.totalIdr || 0;
  }

  //ambil total Attendees per event dari semua event yang dibuat:
  public async getTotalAttendees(organizerId: number) {
    const count = await this.dashboardRepository.getTotalAttendees(organizerId);
    return count;
  }

  //ambil transaksi dari ID transaksi tertentu:
  public async getTransactionById(transactionId: number, organizerId: number) {
    const transaction = await this.dashboardRepository.getTransactionById(
      transactionId,
      organizerId
    );

    if (!transaction) {
      throw new Error("Transaction is not found.");
    }

    return transaction;
  }

  //ambil total voucher yang dibuat atau dipakai:
  public async getTotalVoucher(organizerId: number) {
    const result = await this.dashboardRepository.getTotalVouchers(organizerId);
    return result;
  }

  //ambil total event yang dibuat organizer:
  public async getTotalEvents(organizerId: number) {
    return this.dashboardRepository.getTotalEvents(organizerId);
  }

  // Organizer-only: Update transaction status
  public async updateTransactionStatus(
    organizerId: number,
    transactionId: number,
    updateData: UpdateTransactionStatusData
  ) {
    // Get the transaction to validate organizer access
    const transaction = await this.transactionService.getTransactionById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    // Only allow organizer of the event to update
    if (!transaction.event.organizer || transaction.event.organizer.id !== organizerId) {
      throw new Error("You are not allowed to update this transaction");
    }

    // Call the generic transaction service to handle status update, email, seat/coupon rollback
    const updatedTransaction = await this.transactionService.updateTransactionStatus(
      transactionId,
      updateData
    );

    return updatedTransaction;
  }
}
