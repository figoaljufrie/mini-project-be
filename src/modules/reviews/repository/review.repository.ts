import { prisma } from "../../../utils/prisma"; 
import { SearchReviewQuery, ReviewWithRelations, PaginatedReviewResponse, ReviewStats } from "../dto/create-review.dto";  

export class ReviewRepository {
  
  /**
   * Mendapatkan daftar reviews dengan filter dan pagination
   * @param params - Parameter filter dan pagination
   * @returns Reviews dengan informasi pagination
   */
  async getReviews(params: SearchReviewQuery = {}): Promise<PaginatedReviewResponse> {
    const {
      eventId,
      userId,
      rating,
      dateFrom,
      dateTo,
      hasComment,
      page = 1,
      limit = 10
    } = params;

    // Hitung offset untuk pagination
    const offset = (page - 1) * limit;

    // Build where clause untuk filter
    const whereClause: any = {};

    // Filter berdasarkan event ID
    if (eventId) {
      whereClause.eventId = eventId;
    }

    // Filter berdasarkan user ID
    if (userId) {
      whereClause.userId = userId;
    }

    // Filter berdasarkan rating
    if (rating) {
      whereClause.rating = rating;
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

    // Filter berdasarkan ada tidaknya komentar
    if (hasComment !== undefined) {
      if (hasComment) {
        whereClause.comment = { not: null };
      } else {
        whereClause.comment = null;
      }
    }

    // Query untuk mendapatkan total reviews (untuk pagination)
    const total = await prisma.review.count({
      where: whereClause
    });

    // Query untuk mendapatkan reviews dengan relasi
    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        // Include data user
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
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
            organizer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      // Ordering berdasarkan waktu dibuat (yang terbaru dulu)
      orderBy: {
        createdAt: 'desc'
      },
      // Pagination
      skip: offset,
      take: limit
    });

    // Hitung total halaman
    const totalPages = Math.ceil(total / limit);

    return {
      data: reviews as ReviewWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Mendapatkan review berdasarkan ID dengan relasi lengkap
   * @param reviewId - ID review yang dicari
   * @returns Review detail dengan semua relasi
   */
  async getReviewById(reviewId: number): Promise<ReviewWithRelations | null> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        // Include data user
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
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
            organizer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return review as ReviewWithRelations | null;
  }

  /**
   * Membuat review baru
   * @param reviewData - Data review yang akan dibuat
   * @returns Review yang baru dibuat
   */
  async createReview(reviewData: {
    userId: number;
    eventId: number;
    rating: number;
    comment?: string;
  }) {
    const review = await prisma.review.create({
      data: reviewData,
      include: {
        // Include data user
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        // Include data event
        event: {
          select: {
            eventId: true,
            title: true,
            category: true,
            location: true,
            startsAt: true,
            endsAt: true
          }
        }
      }
    });

    return review;
  }

  /**
   * Update review berdasarkan ID
   * @param reviewId - ID review yang akan diupdate
   * @param updateData - Data yang akan diupdate
   * @returns Review yang sudah diupdate
   */
  async updateReview(reviewId: number, updateData: {
    rating?: number;
    comment?: string;
  }) {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        // Include data user
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        // Include data event
        event: {
          select: {
            eventId: true,
            title: true,
            category: true,
            location: true,
            startsAt: true,
            endsAt: true
          }
        }
      }
    });

    return review;
  }

  /**
   * Delete review berdasarkan ID
   * @param reviewId - ID review yang akan didelete
   * @returns Review yang sudah didelete
   */
  async deleteReview(reviewId: number) {
    const review = await prisma.review.delete({
      where: { id: reviewId }
    });

    return review;
  }

  /**
   * Mendapatkan reviews berdasarkan event ID
   * @param eventId - ID event
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Reviews untuk event tertentu
   */
  async getReviewsByEvent(eventId: number, page: number = 1, limit: number = 10) {
    return this.getReviews({
      eventId,
      page,
      limit
    });
  }

  /**
   * Mendapatkan reviews berdasarkan user ID
   * @param userId - ID user
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Reviews yang dibuat oleh user tertentu
   */
  async getReviewsByUser(userId: number, page: number = 1, limit: number = 10) {
    return this.getReviews({
      userId,
      page,
      limit
    });
  }

  /**
   * Mendapatkan reviews berdasarkan rating
   * @param rating - Rating (1-5)
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Reviews dengan rating tertentu
   */
  async getReviewsByRating(rating: number, page: number = 1, limit: number = 10) {
    return this.getReviews({
      rating,
      page,
      limit
    });
  }

  /**
   * Mendapatkan statistik reviews
   * @param eventId - ID event (opsional)
   * @returns Statistik reviews
   */
  async getReviewStats(eventId?: number): Promise<ReviewStats> {
    const whereClause = eventId ? { eventId } : {};

    const [
      totalReviews,
      averageRating,
      ratingDistribution,
      reviewsWithComments,
      reviewsWithoutComments
    ] = await Promise.all([
      // Total reviews
      prisma.review.count({ where: whereClause }),
      
      // Rating rata-rata
      prisma.review.aggregate({
        where: whereClause,
        _avg: {
          rating: true
        }
      }),
      
      // Distribusi rating
      prisma.review.groupBy({
        by: ['rating'],
        where: whereClause,
        _count: {
          rating: true
        }
      }),
      
      // Reviews dengan komentar
      prisma.review.count({
        where: {
          ...whereClause,
          comment: { not: null }
        }
      }),
      
      // Reviews tanpa komentar
      prisma.review.count({
        where: {
          ...whereClause,
          comment: null
        }
      })
    ]);

    // Build rating distribution object
    const ratingDist: any = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    ratingDistribution.forEach(item => {
      ratingDist[item.rating.toString()] = item._count.rating;
    });

    return {
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      ratingDistribution: ratingDist,
      reviewsWithComments,
      reviewsWithoutComments
    };
  }

  /**
   * Cek apakah user sudah pernah review event tertentu
   * @param userId - ID user
   * @param eventId - ID event
   * @returns Review yang sudah ada atau null
   */
  async checkExistingReview(userId: number, eventId: number) {
    const review = await prisma.review.findFirst({
      where: { userId, eventId }
    });

    return review;
  }

  /**
   * Cek apakah user sudah transaksi event tertentu dengan status DONE
   * @param userId - ID user
   * @param eventId - ID event
   * @returns Transaction yang sudah selesai atau null
   */
  async checkUserTransaction(userId: number, eventId: number) {
    const transaction = await prisma.transaction.findFirst({
      where: { 
        userId, 
        eventId, 
        status: "DONE"
      }
    });

    return transaction;
  }
}
