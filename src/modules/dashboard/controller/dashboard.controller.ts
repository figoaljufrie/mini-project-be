import { Request, Response } from "express";
import { handleSuccess } from "../../../helpers/handleSuccess";
import { handleError } from "../../../helpers/handleError";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();

    this.getTransaction = this.getTransaction.bind(this);
    this.getTotalRevenue = this.getTotalRevenue.bind(this);
    this.getTotalAttendees = this.getTotalAttendees.bind(this);
    this.getTransactionById = this.getTransactionById.bind(this);
    this.getTotalVouchers = this.getTotalVouchers.bind(this);
    this.getTotalEvents = this.getTotalEvents.bind(this);
    this.updateTransactionStatus = this.updateTransactionStatus.bind(this);
  }

  public async getTransaction(req: Request, res: Response) {
    try {
      const { eventId, status } = req.query;
      const user = (req as any).user;

      const transactions = await this.dashboardService.getTransaction(
        user.id,
        eventId ? Number(eventId) : undefined,
        status ? String(status) : undefined
      );

      handleSuccess(
        res,
        "Successfully get all transactions",
        transactions,
        200
      );
    } catch (error) {
      handleError(
        res,
        "Failed to get All Transactions.",
        500,
        (error as Error).message
      );
    }
  }

  public async getTotalRevenue(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const revenues = await this.dashboardService.getTotalrevenue(user.id);
      handleSuccess(res, "Successfully get total revenues", revenues, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to Get Total Revenue",
        500,
        (error as Error).message
      );
    }
  }

  public async getTotalAttendees(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const attendees = await this.dashboardService.getTotalAttendees(user.id);
      handleSuccess(res, "Successfully get all attendees", attendees, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to Get All Attendees",
        500,
        (error as Error).message
      );
    }
  }

  public async getTransactionById(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      const user = (req as any).user;

      const transaction = await this.dashboardService.getTransactionById(
        Number(transactionId),
        user.id
      );

      handleSuccess(
        res,
        "Successfully get transaction By Id",
        transaction,
        200
      );
    } catch (error) {
      handleError(
        res,
        "Failed to Get Transaction By Id",
        500,
        (error as Error).message
      );
    }
  }

  public async getTotalVouchers(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const totalVouchers = await this.dashboardService.getTotalVoucher(
        user.id
      );
      handleSuccess(res, "Successfully get Total Vouchers", totalVouchers, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to get Total Vouchers",
        500,
        (error as Error).message
      );
    }
  }

  public async getTotalEvents(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const totalEvents = await this.dashboardService.getTotalEvents(user.id);
      handleSuccess(res, "Successfully get Total Events", totalEvents, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to get Total Events",
        500,
        (error as Error).message
      );
    }
  }

  // Organizer-only: update transaction status
  public async updateTransactionStatus(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      const updateData = req.body;
      const user = (req as any).user; // assuming user info is attached

      const updatedTransaction =
        await this.dashboardService.updateTransactionStatus(
          user.id, // <--- organizerId
          Number(transactionId),
          updateData
        );

      handleSuccess(
        res,
        "Transaction status updated successfully",
        updatedTransaction,
        200
      );
    } catch (error) {
      handleError(
        res,
        "Failed to update transaction status",
        500,
        (error as Error).message
      );
    }
  }
}
