import { prisma } from "../../../utils/prisma";
import {
  TransactionStatus,
  SearchTransactionQuery,
  TransactionWithRelations,
  PaginatedTransactionResponse,
} from "../dto/create-transaction.dto";

import { CouponType } from "../../coupon/dto/coupon.dto";

export class TransactionRepository {
  /**
   * Mendapatkan daftar transactions dengan filter dan pagination
   * @param params - Parameter filter dan pagination
   * @returns Transactions dengan informasi pagination
   */
  async getTransactions(
    params: SearchTransactionQuery = {}
  ): Promise<PaginatedTransactionResponse> {
    const {
      userId,
      eventId,
      status,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
    } = params;

    // Hitung offset untuk pagination
    const offset = (page - 1) * limit;

    // Build where clause untuk filter
    const whereClause: any = {};

    // Filter berdasarkan user ID
    if (userId) {
      whereClause.userId = userId;
    }

    // Filter berdasarkan event ID
    if (eventId) {
      whereClause.eventId = eventId;
    }

    // Filter berdasarkan status transaction
    if (status) {
      whereClause.status = status;
    }

    // Filter berdasarkan range tanggal
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
    }

    // Filter berdasarkan range jumlah
    if (minAmount !== undefined || maxAmount !== undefined) {
      whereClause.totalIdr = {};
      if (minAmount !== undefined) {
        whereClause.totalIdr.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        whereClause.totalIdr.lte = maxAmount;
      }
    }

    // Query untuk mendapatkan total transactions (untuk pagination)
    const total = await prisma.transaction.count({
      where: whereClause,
    });

    // Query untuk mendapatkan transactions dengan relasi
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        // Include data user
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            points: true,
          },
        },
        // Include data event dengan organizer
        event: {
          select: {
            eventId: true,
            title: true,
            category: true,
            location: true,
            startsAt: true,
            endsAt: true,
            priceIdr: true,
            isFree: true,
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        // Include data coupon
        coupon: {
          select: {
            id: true,
            code: true,
            discountIdr: true,
            type: true,
          },
        },
      },
      // Ordering berdasarkan waktu dibuat (yang terbaru dulu)
      orderBy: {
        createdAt: "desc",
      },
      // Pagination
      skip: offset,
      take: limit,
    });

    // Hitung total halaman
    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions as TransactionWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Mendapatkan transaction berdasarkan ID dengan relasi lengkap
   * @param transactionId - ID transaction yang dicari
   * @returns Transaction detail dengan semua relasi
   */
  async getTransactionById(
    transactionId: number
  ): Promise<TransactionWithRelations | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        // Include data user
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            points: true,
          },
        },
        // Include data event dengan organizer
        event: {
          select: {
            eventId: true,
            title: true,
            category: true,
            location: true,
            startsAt: true,
            endsAt: true,
            priceIdr: true,
            isFree: true,
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        // Include data coupon
        coupon: {
          select: {
            id: true,
            code: true,
            discountIdr: true,
            type: true,
          },
        },
      },
    });

    return transaction as TransactionWithRelations | null;
  }

  /**
   * Membuat transaction baru
   * @param transactionData - Data transaction yang akan dibuat
   * @returns Transaction yang baru dibuat
   */
  async createTransaction(transactionData: {
    userId: number;
    eventId: number;
    status: TransactionStatus;
    totalIdr: number;
    couponId?: number;
  }) {
    const transaction = await prisma.transaction.create({
      data: transactionData,
      include: {
        // Include data user
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            points: true,
          },
        },
        // Include data event
        event: {
          select: {
            eventId: true,
            title: true,
            category: true,
            location: true,
            startsAt: true,
            endsAt: true,
            priceIdr: true,
            isFree: true,
          },
        },
      },
    });

    return transaction;
  }

  /**
   * Update status transaction
   * @param transactionId - ID transaction yang akan diupdate
   * @param updateData - Data yang akan diupdate
   * @returns Transaction yang sudah diupdate
   */
  async updateTransactionStatus(
    transactionId: number,
    updateData: {
      status: TransactionStatus;
      adminNotes?: string;
    }
  ) {
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        // Include data user
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            points: true,
          },
        },
        // Include data event
        event: {
          select: {
            eventId: true,
            title: true,
            category: true,
            location: true,
            startsAt: true,
            endsAt: true,
            priceIdr: true,
            isFree: true,
          },
        },
      },
    });

    return transaction;
  }

  /**
   * Delete transaction berdasarkan ID
   * @param transactionId - ID transaction yang akan didelete
   * @returns Transaction yang sudah didelete
   */
  async deleteTransaction(transactionId: number) {
    const transaction = await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return transaction;
  }

  /**
   * Mendapatkan transactions berdasarkan user ID
   * @param userId - ID user
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Transactions yang dimiliki oleh user tertentu
   */
  async getTransactionsByUser(
    userId: number,
    page: number = 1,
    limit: number = 10
  ) {
    return this.getTransactions({
      userId,
      page,
      limit,
    });
  }

  /**
   * Mendapatkan transactions berdasarkan event ID
   * @param eventId - ID event
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Transactions untuk event tertentu
   */
  async getTransactionsByEvent(
    eventId: number,
    page: number = 1,
    limit: number = 10
  ) {
    return this.getTransactions({
      eventId,
      page,
      limit,
    });
  }

  /**
   * Mendapatkan transactions berdasarkan status
   * @param status - Status transaction
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Transactions dengan status tertentu
   */
  async getTransactionsByStatus(
    status: TransactionStatus,
    page: number = 1,
    limit: number = 10
  ) {
    return this.getTransactions({
      status,
      page,
      limit,
    });
  }
  /**
   * Update status transaction
   * @param transactionId - ID transaction yang akan diupdate
   * @param status - Status baru
   * @returns Transaction yang sudah diupdate
   */

  /**
   * Rollback coupon usage
   * @param couponId - ID coupon
   * @param couponType - Tipe coupon
   */
  public async rollbackCouponUsage(couponId: number, couponType: CouponType) {
    if (couponType === "ORGANIZER") {
      await prisma.coupon.update({
        where: { id: couponId },
        data: {
          status: "AVAILABLE",
          used: { decrement: 1 },
        },
      });
    } else if (couponType === "REFERRAL") {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  /**
   * Mendapatkan statistik transactions
   * @param userId - ID user (opsional)
   * @param eventId - ID event (opsional)
   * @returns Statistik transactions
   */
  async getTransactionStats(userId?: number, eventId?: number) {
    const whereClause: any = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (eventId) {
      whereClause.eventId = eventId;
    }

    const [
      totalTransactions,
      totalRevenue,
      pendingTransactions,
      completedTransactions,
      rejectedTransactions,
    ] = await Promise.all([
      // Total transactions
      prisma.transaction.count({ where: whereClause }),

      // Total revenue dari transactions yang selesai
      prisma.transaction.aggregate({
        where: {
          ...whereClause,
          status: TransactionStatus.DONE,
        },
        _sum: {
          totalIdr: true,
        },
      }),

      // Transactions yang pending
      prisma.transaction.count({
        where: {
          ...whereClause,
          status: TransactionStatus.WAITING_FOR_PAYMENT,
        },
      }),

      // Transactions yang selesai
      prisma.transaction.count({
        where: {
          ...whereClause,
          status: TransactionStatus.DONE,
        },
      }),

      // Transactions yang ditolak
      prisma.transaction.count({
        where: {
          ...whereClause,
          status: TransactionStatus.REJECTED,
        },
      }),
    ]);

    return {
      totalTransactions,
      totalRevenue: totalRevenue._sum.totalIdr || 0,
      pendingTransactions,
      completedTransactions,
      rejectedTransactions,
    };
  }

  /**
   * Mendapatkan transactions yang akan expired (dalam 24 jam)
   * @param limit - Limit item yang ditampilkan
   * @returns Transactions yang akan expired
   */
  async getExpiringTransactions(limit: number = 10) {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const transactions = await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.WAITING_FOR_PAYMENT,
        createdAt: {
          lte: twentyFourHoursAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            eventId: true,
            title: true,
            startsAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    });

    return transactions;
  }
}
