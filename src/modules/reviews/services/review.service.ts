import { ReviewRepository } from "../repository/review.repository"; 
import { 
  CreateReviewData, 
  CreateReviewResponse, 
  SearchReviewQuery,
  UpdateReviewData,
  PaginatedReviewResponse,
  ReviewStats
} from "../dto/create-review.dto";  

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  /**
   * Membuat review baru untuk event
   * @param userId - ID user yang membuat review
   * @param reviewData - Data review yang akan dibuat
   * @returns Response review yang baru dibuat
   */
  async createReview(userId: number, reviewData: CreateReviewData): Promise<CreateReviewResponse> {
    try {
      const { eventId, rating, comment } = reviewData;

      // Validasi input menggunakan DTO
      const reviewDTO = new (await import("../dto/create-review.dto")).CreateReviewDTO(reviewData);
      const validation = reviewDTO.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validasi gagal: ${validation.errors.join(", ")}`);
      }

      // Cek apakah user sudah transaksi event ini dengan status DONE
      const transaction = await this.reviewRepository.checkUserTransaction(userId, eventId);
      if (!transaction) {
        throw new Error("Anda hanya bisa review event yang sudah Anda hadiri");
      }

      // Cek apakah user sudah pernah review event ini
      const existingReview = await this.reviewRepository.checkExistingReview(userId, eventId);
      if (existingReview) {
        throw new Error("Anda sudah pernah review event ini");
      }

      // Buat review melalui repository
      const review = await this.reviewRepository.createReview({
        userId,
        eventId,
        rating,
        ...(comment && { comment })
      });

      return {
        success: true,
        message: "Review berhasil dibuat",
        data: {
          id: review.id,
          userId: review.userId,
          eventId: review.eventId,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
          user: {
            id: review.user.id,
            name: review.user.name,
            email: review.user.email
          },
          event: {
            eventId: review.event.eventId,
            title: review.event.title,
            category: review.event.category,
            location: review.event.location
          }
        }
      };

    } catch (error) {
      throw new Error(`Gagal membuat review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mendapatkan daftar reviews dengan filter dan pagination
   * @param params - Parameter filter dan pagination
   * @returns Reviews dengan informasi pagination
   */
  async getReviews(params: SearchReviewQuery = {}): Promise<PaginatedReviewResponse> {
    try {
      return await this.reviewRepository.getReviews(params);
    } catch (error) {
      throw new Error(`Gagal mendapatkan reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mendapatkan review berdasarkan ID
   * @param reviewId - ID review yang dicari
   * @returns Review detail
   */
  async getReviewById(reviewId: number) {
    try {
      const review = await this.reviewRepository.getReviewById(reviewId);
      if (!review) {
        throw new Error("Review tidak ditemukan");
      }
      return review;
    } catch (error) {
      throw new Error(`Gagal mendapatkan review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update review berdasarkan ID
   * @param reviewId - ID review yang akan diupdate
   * @param userId - ID user yang mengupdate (untuk validasi ownership)
   * @param updateData - Data yang akan diupdate
   * @returns Review yang sudah diupdate
   */
  async updateReview(reviewId: number, userId: number, updateData: UpdateReviewData) {
    try {
      const review = await this.reviewRepository.getReviewById(reviewId);
      if (!review) {
        throw new Error("Review tidak ditemukan");
      }

      // Validasi ownership - user hanya bisa update review sendiri
      if (review.userId !== userId) {
        throw new Error("Anda hanya bisa mengupdate review Anda sendiri");
      }

      // Validasi rating jika diupdate
      if (updateData.rating !== undefined && (updateData.rating < 1 || updateData.rating > 5)) {
        throw new Error("Rating harus antara 1-5");
      }

      // Validasi comment jika diupdate
      if (updateData.comment !== undefined && updateData.comment && updateData.comment.length > 1000) {
        throw new Error("Komentar maksimal 1000 karakter");
      }

      // Update review melalui repository
      const updatedReview = await this.reviewRepository.updateReview(reviewId, updateData);

      return updatedReview;

    } catch (error) {
      throw new Error(`Gagal update review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete review berdasarkan ID
   * @param reviewId - ID review yang akan didelete
   * @param userId - ID user yang mendelete (untuk validasi ownership)
   * @returns Review yang sudah didelete
   */
  async deleteReview(reviewId: number, userId: number) {
    try {
      const review = await this.reviewRepository.getReviewById(reviewId);
      if (!review) {
        throw new Error("Review tidak ditemukan");
      }

      // Validasi ownership - user hanya bisa delete review sendiri
      if (review.userId !== userId) {
        throw new Error("Anda hanya bisa menghapus review Anda sendiri");
      }

      // Delete review melalui repository
      const deletedReview = await this.reviewRepository.deleteReview(reviewId);

      return deletedReview;

    } catch (error) {
      throw new Error(`Gagal delete review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mendapatkan reviews berdasarkan event ID
   * @param eventId - ID event
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Reviews untuk event tertentu
   */
  async getReviewsByEvent(eventId: number, page: number = 1, limit: number = 10) {
    try {
      return await this.reviewRepository.getReviewsByEvent(eventId, page, limit);
    } catch (error) {
      throw new Error(`Gagal mendapatkan reviews event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mendapatkan reviews berdasarkan user ID
   * @param userId - ID user
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Reviews yang dibuat oleh user tertentu
   */
  async getReviewsByUser(userId: number, page: number = 1, limit: number = 10) {
    try {
      return await this.reviewRepository.getReviewsByUser(userId, page, limit);
    } catch (error) {
      throw new Error(`Gagal mendapatkan reviews user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mendapatkan reviews berdasarkan rating
   * @param rating - Rating (1-5)
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Reviews dengan rating tertentu
   */
  async getReviewsByRating(rating: number, page: number = 1, limit: number = 10) {
    try {
      return await this.reviewRepository.getReviewsByRating(rating, page, limit);
    } catch (error) {
      throw new Error(`Gagal mendapatkan reviews berdasarkan rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mendapatkan statistik reviews
   * @param eventId - ID event (opsional)
   * @returns Statistik reviews
   */
  async getReviewStats(eventId?: number): Promise<ReviewStats> {
    try {
      return await this.reviewRepository.getReviewStats(eventId);
    } catch (error) {
      throw new Error(`Gagal mendapatkan statistik reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cek apakah user bisa review event tertentu
   * @param userId - ID user
   * @param eventId - ID event
   * @returns Object dengan status dan alasan
   */
  async canUserReview(userId: number, eventId: number) {
    try {
      // Cek apakah user sudah transaksi event ini
      const transaction = await this.reviewRepository.checkUserTransaction(userId, eventId);
      if (!transaction) {
        return {
          canReview: false,
          reason: "Anda belum menghadiri event ini"
        };
      }

      // Cek apakah user sudah pernah review
      const existingReview = await this.reviewRepository.checkExistingReview(userId, eventId);
      if (existingReview) {
        return {
          canReview: false,
          reason: "Anda sudah pernah review event ini"
        };
      }

      return {
        canReview: true,
        reason: "Anda bisa review event ini"
      };

    } catch (error) {
      throw new Error(`Gagal cek status review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
