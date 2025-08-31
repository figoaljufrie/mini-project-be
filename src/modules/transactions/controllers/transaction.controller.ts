import { Request, Response } from "express";  
import { TransactionService } from "../services/transaction.service";  
import { CreateTransactionData, UpdateTransactionStatusData } from "../dto/create-transaction.dto";  

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

const transactionService = new TransactionService();

/**
 * Controller untuk membuat transaction baru (pembelian tiket)
 * @param req - Request dengan data eventId, couponId, pointsUsed
 * @param res - Response
 */
export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventId, couponId, pointsUsed } = req.body;
    const userId = req.user.id; // dari auth middleware

    // Validasi input
    if (!eventId) {
      return res.status(400).json({ 
        success: false, 
        message: "Event ID diperlukan" 
      });
    }

    // Data untuk create transaction
    const transactionData: CreateTransactionData = {
      eventId: Number(eventId),
      ...(couponId && { couponId: Number(couponId) }),
      ...(pointsUsed && { pointsUsed: Number(pointsUsed) })
    };

    // Buat transaction melalui service
    const result = await transactionService.createTransaction(userId, transactionData);

    return res.status(201).json(result);

  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk mendapatkan daftar transactions dengan filter
 * @param req - Request dengan query parameters
 * @param res - Response
 */
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      eventId, 
      status, 
      dateFrom, 
      dateTo, 
      minAmount, 
      maxAmount, 
      page, 
      limit 
    } = req.query;

    // Build query parameters
    const queryParams: any = {};
    
    if (userId) queryParams.userId = Number(userId);
    if (eventId) queryParams.eventId = Number(eventId);
    if (status) queryParams.status = status;
    if (dateFrom) queryParams.dateFrom = String(dateFrom);
    if (dateTo) queryParams.dateTo = String(dateTo);
    if (minAmount) queryParams.minAmount = Number(minAmount);
    if (maxAmount) queryParams.maxAmount = Number(maxAmount);
    if (page) queryParams.page = Number(page);
    if (limit) queryParams.limit = Number(limit);

    // Get transactions melalui service
    const result = await transactionService.getTransactions(queryParams);

    return res.json({
      success: true,
      message: "Transactions berhasil diambil",
      data: result
    });

  } catch (error) {
    console.error("Error getting transactions:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk mendapatkan transaction berdasarkan ID
 * @param req - Request dengan transaction ID
 * @param res - Response
 */
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transactionId = Number(id);

    if (isNaN(transactionId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction ID harus berupa angka" 
      });
    }

    // Get transaction melalui service
    const transaction = await transactionService.getTransactionById(transactionId);

    return res.json({
      success: true,
      message: "Transaction berhasil diambil",
      data: transaction
    });

  } catch (error) {
    console.error("Error getting transaction:", error);
    
    if (error instanceof Error && error.message.includes("tidak ditemukan")) {
      return res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk update status transaction (admin only)
 * @param req - Request dengan status baru
 * @param res - Response
 */
export const updateTransactionStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const transactionId = Number(id);

    // Validasi admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin role required." 
      });
    }

    if (isNaN(transactionId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction ID harus berupa angka" 
      });
    }

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status diperlukan" 
      });
    }

    // Data untuk update status
    const updateData: UpdateTransactionStatusData = {
      status: status as any,
      ...(adminNotes && { adminNotes: String(adminNotes) })
    };

    // Update status melalui service
    const updatedTransaction = await transactionService.updateTransactionStatus(transactionId, updateData);

    return res.json({
      success: true,
      message: "Transaction status berhasil diupdate",
      data: updatedTransaction
    });

  } catch (error) {
    console.error("Error updating transaction status:", error);
    
    if (error instanceof Error && error.message.includes("tidak ditemukan")) {
      return res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }

    if (error instanceof Error && error.message.includes("Status transition")) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk cancel transaction (user)
 * @param req - Request dengan transaction ID
 * @param res - Response
 */
export const cancelTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const transactionId = Number(id);
    const userId = req.user.id;

    if (isNaN(transactionId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction ID harus berupa angka" 
      });
    }

    // Cancel transaction melalui service
    const canceledTransaction = await transactionService.cancelTransaction(transactionId, userId);

    return res.json({
      success: true,
      message: "Transaction berhasil dibatalkan",
      data: canceledTransaction
    });

  } catch (error) {
    console.error("Error canceling transaction:", error);
    
    if (error instanceof Error && error.message.includes("tidak ditemukan")) {
      return res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }

    if (error instanceof Error && error.message.includes("tidak dapat dibatalkan")) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    if (error instanceof Error && error.message.includes("orang lain")) {
      return res.status(403).json({ 
        success: false, 
        message: error.message 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk mendapatkan transactions user tertentu
 * @param req - Request dengan user ID
 * @param res - Response
 */
export const getTransactionsByUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const targetUserId = Number(userId);
    const currentUserId = req.user.id;

    // Validasi user yang mengakses
    if (req.user.role !== 'ADMIN' && currentUserId !== targetUserId) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Cannot access other user's transactions." 
      });
    }

    if (isNaN(targetUserId)) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID harus berupa angka" 
      });
    }

    // Get transactions user melalui service
    const result = await transactionService.getTransactionsByUser(
      targetUserId, 
      Number(page) || 1, 
      Number(limit) || 10
    );

    return res.json({
      success: true,
      message: "User transactions berhasil diambil",
      data: result
    });

  } catch (error) {
    console.error("Error getting user transactions:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk mendapatkan statistik transactions
 * @param req - Request dengan query parameters
 * @param res - Response
 */
export const getTransactionStats = async (req: Request, res: Response) => {
  try {
    const { userId, eventId } = req.query;

    // Build parameters
    const params: any = {};
    if (userId) params.userId = Number(userId);
    if (eventId) params.eventId = Number(eventId);

    // Get stats melalui service
    const stats = await transactionService.getTransactionStats(params.userId, params.eventId);

    return res.json({
      success: true,
      message: "Transaction statistics berhasil diambil",
      data: stats
    });

  } catch (error) {
    console.error("Error getting transaction stats:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk mendapatkan transactions yang akan expired
 * @param req - Request dengan limit parameter
 * @param res - Response
 */
export const getExpiringTransactions = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const limitNumber = Number(limit) || 10;

    // Get expiring transactions melalui service
    const transactions = await transactionService.getExpiringTransactions(limitNumber);

    return res.json({
      success: true,
      message: "Expiring transactions berhasil diambil",
      data: transactions
    });

  } catch (error) {
    console.error("Error getting expiring transactions:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};
