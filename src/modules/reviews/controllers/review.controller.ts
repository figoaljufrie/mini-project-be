import { Request, Response } from "express";  
import { ReviewService } from "../services/review.service";  
import { CreateReviewData, UpdateReviewData } from "../dto/create-review.dto";  

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

const reviewService = new ReviewService();

/**
 * Controller untuk membuat review baru
 * @param req - Request dengan data eventId, rating, comment
 * @param res - Response
 */
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventId, rating, comment } = req.body;
    const userId = req.user.id; // dari auth middleware

    // Validasi input
    if (!eventId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: "Event ID dan rating diperlukan" 
      });
    }

    // Data untuk create review
    const reviewData: CreateReviewData = {
      eventId: Number(eventId),
      rating: Number(rating),
      ...(comment && { comment: String(comment) })
    };

    // Buat review melalui service
    const result = await reviewService.createReview(userId, reviewData);

    return res.status(201).json(result);

  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk mendapatkan daftar reviews dengan filter
 * @param req - Request dengan query parameters
 * @param res - Response
 */
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { 
      eventId, 
      userId, 
      rating, 
      dateFrom, 
      dateTo, 
      hasComment, 
      page, 
      limit 
    } = req.query;

    // Build query parameters
    const queryParams: any = {};
    
    if (eventId) queryParams.eventId = Number(eventId);
    if (userId) queryParams.userId = Number(userId);
    if (rating) queryParams.rating = Number(rating);
    if (dateFrom) queryParams.dateFrom = String(dateFrom);
    if (dateTo) queryParams.dateTo = String(dateTo);
    if (hasComment !== undefined) queryParams.hasComment = hasComment === 'true';
    if (page) queryParams.page = Number(page);
    if (limit) queryParams.limit = Number(limit);

    // Get reviews melalui service
    const result = await reviewService.getReviews(queryParams);

    return res.json({
      success: true,
      message: "Reviews berhasil diambil",
      data: result
    });

  } catch (error) {
    console.error("Error getting reviews:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk mendapatkan review berdasarkan ID
 * @param req - Request dengan review ID
 * @param res - Response
 */
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviewId = Number(id);

    if (isNaN(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Review ID harus berupa angka" 
      });
    }

    // Get review melalui service
    const review = await reviewService.getReviewById(reviewId);

    return res.json({
      success: true,
      message: "Review berhasil diambil",
      data: review
    });

  } catch (error) {
    console.error("Error getting review:", error);
    
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
 * Controller untuk update review
 * @param req - Request dengan data update
 * @param res - Response
 */
export const updateReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const reviewId = Number(id);

    if (isNaN(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Review ID harus berupa angka" 
      });
    }

    // Data untuk update review
    const updateData: UpdateReviewData = {};
    if (rating !== undefined) updateData.rating = Number(rating);
    if (comment !== undefined) updateData.comment = String(comment);

    // Update review melalui service
    const updatedReview = await reviewService.updateReview(reviewId, userId, updateData);

    return res.json({
      success: true,
      message: "Review berhasil diupdate",
      data: updatedReview
    });

  } catch (error) {
    console.error("Error updating review:", error);
    
    if (error instanceof Error && error.message.includes("tidak ditemukan")) {
      return res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }

    if (error instanceof Error && error.message.includes("hanya bisa mengupdate")) {
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
 * Controller untuk delete review
 * @param req - Request dengan review ID
 * @param res - Response
 */
export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const reviewId = Number(id);

    if (isNaN(reviewId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Review ID harus berupa angka" 
      });
    }

    // Delete review melalui service
    const deletedReview = await reviewService.deleteReview(reviewId, userId);

    return res.json({
      success: true,
      message: "Review berhasil dihapus",
      data: deletedReview
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    
    if (error instanceof Error && error.message.includes("tidak ditemukan")) {
      return res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }

    if (error instanceof Error && error.message.includes("hanya bisa menghapus")) {
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
 * Controller untuk mendapatkan reviews berdasarkan event ID
 * @param req - Request dengan event ID
 * @param res - Response
 */
export const getEventReviews = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { page, limit } = req.query;
    const eventIdNumber = Number(eventId);

    if (isNaN(eventIdNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: "Event ID harus berupa angka" 
      });
    }

    // Get reviews event melalui service
    const result = await reviewService.getReviewsByEvent(
      eventIdNumber, 
      Number(page) || 1, 
      Number(limit) || 10
    );

    return res.json({
      success: true,
      message: "Event reviews berhasil diambil",
      data: result
    });

  } catch (error) {
    console.error("Error getting event reviews:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk mendapatkan reviews berdasarkan user ID
 * @param req - Request dengan user ID
 * @param res - Response
 */
export const getUserReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const targetUserId = Number(userId);
    const currentUserId = req.user.id;

    // Validasi user yang mengakses
    if (req.user.role !== 'ADMIN' && currentUserId !== targetUserId) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Cannot access other user's reviews." 
      });
    }

    if (isNaN(targetUserId)) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID harus berupa angka" 
      });
    }

    // Get reviews user melalui service
    const result = await reviewService.getReviewsByUser(
      targetUserId, 
      Number(page) || 1, 
      Number(limit) || 10
    );

    return res.json({
      success: true,
      message: "User reviews berhasil diambil",
      data: result
    });

  } catch (error) {
    console.error("Error getting user reviews:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk mendapatkan statistik reviews
 * @param req - Request dengan query parameters
 * @param res - Response
 */
export const getReviewStats = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.query;

    // Get stats melalui service
    const stats = await reviewService.getReviewStats(eventId ? Number(eventId) : undefined);

    return res.json({
      success: true,
      message: "Review statistics berhasil diambil",
      data: stats
    });

  } catch (error) {
    console.error("Error getting review stats:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};

/**
 * Controller untuk cek apakah user bisa review event tertentu
 * @param req - Request dengan event ID
 * @param res - Response
 */
export const canUserReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const eventIdNumber = Number(eventId);

    if (isNaN(eventIdNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: "Event ID harus berupa angka" 
      });
    }

    // Cek status review melalui service
    const result = await reviewService.canUserReview(userId, eventIdNumber);

    return res.json({
      success: true,
      message: "Status review berhasil dicek",
      data: result
    });

  } catch (error) {
    console.error("Error checking review status:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};
