import { Router } from "express"; 
import { 
  createReview, 
  getReviews, 
  getReviewById, 
  updateReview, 
  deleteReview, 
  getEventReviews, 
  getUserReviews, 
  getReviewStats, 
  canUserReview 
} from "../controllers/review.controller"; 
import { authMiddleware, organizerOnly } from "../../../middleware/auth.middleware";

const ReviewRouter = Router();

// ========================================
// REVIEW DISCOVERY ENDPOINTS (PUBLIC ACCESS)
// ========================================

// GET /api/reviews - Mendapatkan daftar semua reviews dengan filter opsional
// Query parameters: eventId, userId, rating, dateFrom, dateTo, hasComment, page, limit
// Response: Array of reviews dengan informasi pagination
ReviewRouter.get("/", getReviews as any);

// GET /api/reviews/:id - Mendapatkan detail review berdasarkan ID
// Path parameter: id (review ID)
// Response: Review detail dengan semua relasi (user, event)
ReviewRouter.get("/:id", getReviewById as any);

// GET /api/reviews/stats - Mendapatkan statistik reviews
// Query parameters: eventId (opsional)
// Response: Statistik reviews (total, average rating, rating distribution)
ReviewRouter.get("/stats", getReviewStats as any);

// ========================================
// REVIEW MANAGEMENT ENDPOINTS (PROTECTED)
// ========================================

// POST /api/reviews - Membuat review baru untuk event
// Middleware: authMiddleware (validasi JWT token)
// Request body: eventId (wajib), rating (wajib), comment (opsional)
// Response: Review yang baru dibuat dengan data event dan user
ReviewRouter.post("/", authMiddleware, createReview as any);

// PUT /api/reviews/:id - Update review berdasarkan ID (USER OWNER ONLY)
// Middleware: authMiddleware (validasi JWT token)
// Path parameter: id (review ID)
// Request body: rating (opsional), comment (opsional)
// Response: Review yang sudah diupdate
ReviewRouter.put("/:id", authMiddleware, updateReview as any);

// DELETE /api/reviews/:id - Delete review berdasarkan ID (USER OWNER ONLY)
// Middleware: authMiddleware (validasi JWT token)
// Path parameter: id (review ID)
// Response: Review yang sudah dihapus
ReviewRouter.delete("/:id", authMiddleware, deleteReview as any);

// ========================================
// EVENT-SPECIFIC REVIEW ENDPOINTS (PUBLIC ACCESS)
// ========================================

// GET /api/reviews/event/:eventId - Mendapatkan reviews untuk event tertentu
// Path parameter: eventId (event ID)
// Query parameters: page, limit (opsional)
// Response: Reviews event dengan informasi pagination
ReviewRouter.get("/event/:eventId", getEventReviews as any);

// ========================================
// USER-SPECIFIC REVIEW ENDPOINTS (PROTECTED)
// ========================================

// GET /api/reviews/user/:userId - Mendapatkan reviews user tertentu
// Middleware: authMiddleware (validasi JWT token)
// Path parameter: userId (user ID)
// Query parameters: page, limit (opsional)
// Response: Reviews user dengan informasi pagination
// Access: User hanya bisa akses review sendiri, Admin bisa akses semua
ReviewRouter.get("/user/:userId", authMiddleware, getUserReviews as any);

// ========================================
// REVIEW STATUS ENDPOINTS (PROTECTED)
// ========================================

// GET /api/reviews/can-review/:eventId - Cek apakah user bisa review event tertentu
// Middleware: authMiddleware (validasi JWT token)
// Path parameter: eventId (event ID)
// Response: Status apakah user bisa review event tersebut
ReviewRouter.get("/can-review/:eventId", authMiddleware, canUserReview as any);

// ========================================
// ADMIN-ONLY ENDPOINTS (ADMIN ROLE REQUIRED)
// ========================================

// GET /api/reviews/admin/all - Mendapatkan semua reviews untuk admin
// Middleware: authMiddleware + admin role check
// Query parameters: semua filter yang tersedia
// Response: Semua reviews dengan informasi lengkap
// Note: Endpoint ini bisa digunakan untuk admin dashboard
ReviewRouter.get("/admin/all", authMiddleware, getReviews as any);

// ========================================
// ANALYTICS ENDPOINTS (ADMIN ROLE REQUIRED)
// ========================================

// GET /api/reviews/admin/analytics - Mendapatkan analytics lengkap untuk admin
// Middleware: authMiddleware + admin role check
// Query parameters: eventId, dateRange (opsional)
// Response: Analytics lengkap dengan charts dan metrics
// Note: Endpoint ini untuk admin dashboard analytics
ReviewRouter.get("/admin/analytics", authMiddleware, getReviewStats as any);

// Export router untuk digunakan di app.ts
export { ReviewRouter };
