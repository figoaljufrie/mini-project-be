import { TransactionRepository } from "../repository/transaction.repository";
import { EventRepository } from "../../events/repository/event.repository";
import { UserService } from "../../users/services/user.service";
import { CouponService } from "../../coupon/services/coupon.service";
import {
  CreateTransactionData,
  CreateTransactionResponse,
  TransactionStatus,
  SearchTransactionQuery,
  UpdateTransactionStatusData,
  PaginatedTransactionResponse,
} from "../dto/create-transaction.dto";
import { MailService } from "../../mail/mail.service";
import Mail from "nodemailer/lib/mailer";
import { prisma } from "../../../utils/prisma";

interface TransactionEmailContext {
  userName: string;
  eventTitle: string;
  total?: number;
  additionalInfo?: string;
}

// Service class untuk mengelola business logic transaction
export class TransactionService {
  private transactionRepository: TransactionRepository;
  private eventRepository: EventRepository;
  private userService: UserService;
  private couponService: CouponService = new CouponService();
  private mailService: MailService;

  constructor() {
    this.transactionRepository = new TransactionRepository();
    this.eventRepository = new EventRepository();
    this.userService = new UserService();
    this.couponService = new CouponService();
    this.mailService = new MailService();
  }

  /**
   * Membuat transaction baru untuk pembelian tiket event
   * @param userId - ID user yang membeli
   * @param transactionData - Data transaction yang akan dibuat
   * @returns Response transaction yang baru dibuat
   */
  async createTransaction(
    userId: number,
    transactionData: CreateTransactionData
  ): Promise<CreateTransactionResponse> {
    try {
      const { eventId, couponId, pointsUsed = 0 } = transactionData;

      // Validasi event exists dan masih tersedia
      const event = await this.eventRepository.getEventById(eventId);
      if (!event) {
        throw new Error("Event tidak ditemukan");
      }

      if (event.quantity <= 0) {
        throw new Error("Tiket event sudah habis");
      }

      // Validasi event belum dimulai
      if (new Date() >= event.startsAt) {
        throw new Error("Event sudah dimulai atau selesai");
      }

      // Hitung total harga
      let totalPrice = event.isFree ? 0 : event.priceIdr;

      // Validasi dan apply coupon jika ada
      if (couponId) {
        const coupon = await this.couponService.findById(couponId);
        if (!coupon) throw new Error("Coupon tidak ditemukan");

        totalPrice = Math.max(0, totalPrice - coupon.discountIdr);

        // Decrease coupon quota
        await this.couponService.useCoupon(coupon.id);
        // TODO: Implement coupon validation logic
        // const coupon = await this.couponService.validateCoupon(couponId, userId, eventId);
        // if (coupon) {
        //   totalPrice = Math.max(0, totalPrice - coupon.discountIdr);
        // }
      }

      // Validasi dan apply points jika ada
      if (pointsUsed > 0) {
        const user = await this.userService.findById(userId);
        if (!user) {
          throw new Error("User tidak ditemukan");
        }

        if (user.points < pointsUsed) {
          throw new Error("Points tidak cukup");
        }

        // TODO: Implement points deduction logic
        // await this.userService.updatePoints(userId, -pointsUsed);

        // Kurangi total harga
        totalPrice = Math.max(0, totalPrice - pointsUsed);
      }

      // Buat transaction
      const transaction = await this.transactionRepository.createTransaction({
        userId,
        eventId,
        status: TransactionStatus.WAITING_FOR_PAYMENT,
        totalIdr: totalPrice,
        ...(couponId && { couponId }),
      });

      // Kurangi quantity event
      await this.eventRepository.updateEvent(eventId, {
        quantity: event.quantity - 1,
      });

      return {
        success: true,
        message: "Transaction berhasil dibuat",
        data: {
          id: transaction.id,
          userId: transaction.userId,
          eventId: transaction.eventId,
          status: transaction.status as TransactionStatus,
          totalIdr: transaction.totalIdr,
          ...(transaction.couponId && { couponId: transaction.couponId }),
          createdAt: transaction.createdAt.toISOString(),
          event: {
            title: transaction.event?.title || "",
            category: transaction.event?.category || "",
            location: transaction.event?.location || "",
            startsAt: transaction.event?.startsAt.toISOString() || "",
            endsAt: transaction.event?.endsAt.toISOString() || "",
            priceIdr: transaction.event?.priceIdr || 0,
            isFree: transaction.event?.isFree || false,
          },
          user: {
            id: transaction.user?.id || 0,
            name: transaction.user?.name || "",
            email: transaction.user?.email || "",
            points: transaction.user?.points || 0,
          },
        },
      };
    } catch (error) {
      throw new Error(
        `Gagal membuat transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Mendapatkan daftar transactions dengan filter dan pagination
   * @param params - Parameter filter dan pagination
   * @returns Transactions dengan informasi pagination
   */
  async getTransactions(
    params: SearchTransactionQuery = {}
  ): Promise<PaginatedTransactionResponse> {
    try {
      return await this.transactionRepository.getTransactions(params);
    } catch (error) {
      throw new Error(
        `Gagal mendapatkan transactions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

   async getTransactionsByOrganizer(organizerId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const transactions = await prisma.transaction.findMany({
      where: {
        event: { organizerId }
      },
      include: {
        user: true,
        event: true,
        coupon: true
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    });

    const total = await prisma.transaction.count({
      where: { event: { organizerId } }
    });

    return { transactions, total, page, limit };
  }

  /**
   * Mendapatkan transaction berdasarkan ID
   * @param transactionId - ID transaction yang dicari
   * @returns Transaction detail
   */
  async getTransactionById(transactionId: number) {
    try {
      const transaction = await this.transactionRepository.getTransactionById(
        transactionId
      );
      if (!transaction) {
        throw new Error("Transaction tidak ditemukan");
      }
      return transaction;
    } catch (error) {
      throw new Error(
        `Gagal mendapatkan transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update status transaction (untuk admin)
   * @param transactionId - ID transaction yang akan diupdate
   * @param updateData - Data yang akan diupdate
   * @returns Transaction yang sudah diupdate
   */
  async updateTransactionStatus(
    transactionId: number,
    updateData: UpdateTransactionStatusData
  ) {
    try {
      const transaction = await this.transactionRepository.getTransactionById(
        transactionId
      );
      if (!transaction) {
        throw new Error("Transaction tidak ditemukan");
      }

      // Validasi status transition
      if (
        !this.isValidStatusTransition(
          transaction.status as TransactionStatus,
          updateData.status
        )
      ) {
        throw new Error(
          `Status transition tidak valid: ${transaction.status} -> ${updateData.status}`
        );
      }

      // Update status
      const updatedTransaction =
        await this.transactionRepository.updateTransactionStatus(
          transactionId,
          updateData
        );

      // Jika status berubah ke DONE, tambahkan points ke user (opsional)
      if (updateData.status === TransactionStatus.DONE) {
        const context: TransactionEmailContext = {
          userName: transaction.user.name,
          eventTitle: transaction.event.title,
          total: transaction.totalIdr,
        };

        await this.mailService.sendMail(
          transaction.user.email,
          "Congratulations! Your ticket purchase is confirmed!",
          "transaction-accepted", // name of your hbs template
          context
        );

        // Optional: reward points logic
      } else if (updateData.status === TransactionStatus.REJECTED) {
        const context: TransactionEmailContext = {
          userName: transaction.user.name,
          eventTitle: transaction.event.title,
          additionalInfo:
            "Your payment has been rejected. Seats have been restored.",
        };

        await this.mailService.sendMail(
          transaction.user.email,
          "Transaction Rejected",
          "transaction-rejected", // name of your hbs template
          context
        );

        // Rollback event seat
        const event = await this.eventRepository.getEventById(
          transaction.eventId
        );
        if (event) {
          await this.eventRepository.updateEvent(transaction.eventId, {
            quantity: event.quantity + 1,
          });
        }
      }

      return updatedTransaction;
    } catch (error) {
      throw new Error(
        `Gagal update transaction status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Cancel transaction (untuk user)
   * @param transactionId - ID transaction yang akan dibatalkan
   * @param userId - ID user yang membatalkan
   * @returns Transaction yang sudah dibatalkan
   */
  async cancelTransaction(transactionId: number, userId: number) {
    try {
      const transaction = await this.transactionRepository.getTransactionById(
        transactionId
      );
      if (!transaction) {
        throw new Error("Transaction tidak ditemukan");
      }

      // Validasi user yang membatalkan
      if (transaction.userId !== userId) {
        throw new Error("Tidak dapat membatalkan transaction orang lain");
      }

      // Validasi status yang bisa dibatalkan
      if (transaction.status !== TransactionStatus.WAITING_FOR_PAYMENT) {
        throw new Error("Transaction tidak dapat dibatalkan");
      }

      // Update status ke CANCELED
      const canceledTransaction =
        await this.transactionRepository.updateTransactionStatus(
          transactionId,
          {
            status: TransactionStatus.CANCELED,
          }
        );

      // Kembalikan quantity event
      const event = await this.eventRepository.getEventById(
        transaction.eventId
      );
      if (event) {
        await this.eventRepository.updateEvent(transaction.eventId, {
          quantity: event.quantity + 1,
        });
      }

      // Kembalikan points jika ada yang digunakan
      // TODO: Implement points refund logic

      return canceledTransaction;
    } catch (error) {
      throw new Error(
        `Gagal cancel transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Mendapatkan transactions berdasarkan user ID
   * @param userId - ID user
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Transactions user
   */
  async getTransactionsByUser(
    userId: number,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      return await this.transactionRepository.getTransactionsByUser(
        userId,
        page,
        limit
      );
    } catch (error) {
      throw new Error(
        `Gagal mendapatkan transactions user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Mendapatkan statistik transactions
   * @param userId - ID user (opsional)
   * @param eventId - ID event (opsional)
   * @returns Statistik transactions
   */
  async getTransactionStats(userId?: number, eventId?: number) {
    try {
      return await this.transactionRepository.getTransactionStats(
        userId,
        eventId
      );
    } catch (error) {
      throw new Error(
        `Gagal mendapatkan statistik transactions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Mendapatkan transactions yang akan expired
   * @param limit - Limit item yang ditampilkan
   * @returns Transactions yang akan expired
   */
  async getExpiringTransactions(limit: number = 10) {
    try {
      return await this.transactionRepository.getExpiringTransactions(limit);
    } catch (error) {
      throw new Error(
        `Gagal mendapatkan expiring transactions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Validasi status transition yang diizinkan
   * @param currentStatus - Status saat ini
   * @param newStatus - Status baru
   * @returns Apakah transition valid
   */
  private isValidStatusTransition(
    currentStatus: TransactionStatus,
    newStatus: TransactionStatus
  ): boolean {
    const validTransitions: Record<TransactionStatus, TransactionStatus[]> = {
      [TransactionStatus.WAITING_FOR_PAYMENT]: [
        TransactionStatus.WAITING_FOR_ADMIN_CONFIRMATION,
        TransactionStatus.CANCELED,
        TransactionStatus.EXPIRED,
      ],
      [TransactionStatus.WAITING_FOR_ADMIN_CONFIRMATION]: [
        TransactionStatus.DONE,
        TransactionStatus.REJECTED,
      ],
      [TransactionStatus.DONE]: [], // Final status
      [TransactionStatus.REJECTED]: [], // Final status
      [TransactionStatus.EXPIRED]: [], // Final status
      [TransactionStatus.CANCELED]: [], // Final status
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
