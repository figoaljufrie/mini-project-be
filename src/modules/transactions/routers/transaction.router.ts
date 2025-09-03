import { Router } from "express"; 
import { 
  createTransaction, 
  getTransactions, 
  getTransactionById, 
  updateTransactionStatus, 
  cancelTransaction, 
  getTransactionsByUser, 
  getTransactionStats, 
  getExpiringTransactions,
  getTransactionsByOrganizer
} from "../controllers/transaction.controller";  
import { authMiddleware, organizerOnly } from "../../../middleware/auth.middleware";

const TransactionRouter = Router();

// ========================================
// TRANSACTION DISCOVERY ENDPOINTS (PUBLIC ACCESS)
// ========================================

// GET /api/transactions - Mendapatkan daftar semua transactions dengan filter opsional
// Query parameters: userId, eventId, status, dateFrom, dateTo, minAmount, maxAmount, page, limit
// Response: Array of transactions dengan informasi pagination
TransactionRouter.get("/", getTransactions as any);

// GET /api/transactions/:id - Mendapatkan detail transaction berdasarkan ID
// Path parameter: id (transaction ID)
// Response: Transaction detail dengan semua relasi (user, event, coupon)
TransactionRouter.get("/:id", getTransactionById as any);

// GET /api/transactions/stats - Mendapatkan statistik transactions
// Query parameters: userId, eventId (opsional)
// Response: Statistik transactions (total, revenue, pending, completed, rejected)
TransactionRouter.get("/stats", getTransactionStats as any);

// GET /api/transactions/expiring - Mendapatkan transactions yang akan expired
// Query parameters: limit (opsional, default: 10)
// Response: Array of transactions yang akan expired dalam 24 jam
TransactionRouter.get("/expiring", getExpiringTransactions as any);

// ========================================
// TRANSACTION MANAGEMENT ENDPOINTS (PROTECTED)
// ========================================

// POST /api/transactions - Membuat transaction baru (pembelian tiket)
// Middleware: authMiddleware (validasi JWT token)
// Request body: eventId (wajib), couponId (opsional), pointsUsed (opsional)
// Response: Transaction yang baru dibuat dengan data event dan user
TransactionRouter.post("/create-transaction", authMiddleware, createTransaction as any);

// PUT /api/transactions/:id/status - Update status transaction (ADMIN ONLY)
// Middleware: authMiddleware (validasi JWT token) + admin role check
// Path parameter: id (transaction ID)
// Request body: status (wajib), adminNotes (opsional)
// Response: Transaction yang sudah diupdate
TransactionRouter.put("/:id/status", authMiddleware, updateTransactionStatus as any);

TransactionRouter.get("/organizer/me", authMiddleware, getTransactionsByOrganizer as any);

// DELETE /api/transactions/:id - Cancel transaction (USER OWNER ONLY)
// Middleware: authMiddleware (validasi JWT token)
// Path parameter: id (transaction ID)
// Response: Transaction yang sudah dibatalkan
TransactionRouter.delete("/:id", authMiddleware, cancelTransaction as any);

// ========================================
// USER-SPECIFIC TRANSACTION ENDPOINTS (PROTECTED)
// ========================================

// GET /api/transactions/user/:userId - Mendapatkan transactions user tertentu
// Middleware: authMiddleware (validasi JWT token)
// Path parameter: userId (user ID)
// Query parameters: page, limit (opsional)
// Response: Transactions user dengan informasi pagination
// Access: User hanya bisa akses transaksi sendiri, Admin bisa akses semua
TransactionRouter.get("/user/:userId", authMiddleware, getTransactionsByUser as any);

// ========================================
// ADMIN-ONLY ENDPOINTS (ADMIN ROLE REQUIRED)
// ========================================

// GET /api/transactions/admin/all - Mendapatkan semua transactions untuk admin
// Middleware: authMiddleware + admin role check
// Query parameters: semua filter yang tersedia
// Response: Semua transactions dengan informasi lengkap
// Note: Endpoint ini bisa digunakan untuk admin dashboard
TransactionRouter.get("/admin/all", authMiddleware, getTransactions as any);

// ========================================
// ANALYTICS ENDPOINTS (ADMIN ROLE REQUIRED)
// ========================================

// GET /api/transactions/admin/analytics - Mendapatkan analytics lengkap untuk admin
// Middleware: authMiddleware + admin role check
// Query parameters: userId, eventId, dateRange (opsional)
// Response: Analytics lengkap dengan charts dan metrics
// Note: Endpoint ini untuk admin dashboard analytics
TransactionRouter.get("/admin/analytics", authMiddleware, getTransactionStats as any);

TransactionRouter.patch("/:id/payment-update", authMiddleware, getTransactionStats as any);


// Export router untuk digunakan di app.ts
export { TransactionRouter };
