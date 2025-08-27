import { DashboardRepository } from "../repository/dashboard.repository";

export class DashboardService {
  private dashboardRepository: DashboardRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
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

  // public async getTotalTickets(organizerId: number) {
  //   return this.dashboardRepository.getTotalTickets(organizerId)
  // }
}
