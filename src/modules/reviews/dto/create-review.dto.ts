export interface CreateReviewData {
  eventId: number;            // ID event yang akan direview (wajib)
  rating: number;             // Rating 1-5 stars (wajib)
  comment?: string;           // Komentar review (opsional)
}

export interface CreateReviewResponse {
  success: boolean;            // Status keberhasilan
  message: string;             // Pesan response
  data: {
    id: number;                // ID review yang baru dibuat
    userId: number;            // ID user yang membuat review
    eventId: number;           // ID event yang direview
    rating: number;            // Rating yang diberikan
    comment: string | null;    // Komentar review
    createdAt: string;         // Waktu dibuat
    user: {                    
      id: number;
      name: string;
      email: string;
    };
    event: {                   
      eventId: number;
      title: string;
      category: string;
      location: string;
    };
  };
}

export interface CreateReviewErrorResponse {
  success: false;              // Status selalu false untuk error
  message: string;             // Pesan error
  errors?: Array<{             // Detail error validasi (opsional)
    field: string;             // Field yang error
    message: string;           // Pesan error untuk field tersebut
  }>;
}

export interface SearchReviewQuery {
  eventId?: number;            // Filter berdasarkan event ID
  userId?: number;             // Filter berdasarkan user ID
  rating?: number;             // Filter berdasarkan rating
  dateFrom?: string;           // Filter tanggal mulai
  dateTo?: string;             // Filter tanggal selesai
  hasComment?: boolean;        // Filter berdasarkan ada tidaknya komentar
  page?: number;               // Halaman untuk pagination
  limit?: number;              // Limit item per halaman
}

export interface UpdateReviewData {
  rating?: number;             // Rating baru (opsional)
  comment?: string;            // Komentar baru (opsional)
}

export interface ReviewWithRelations {
  id: number;                  // ID review
  userId: number;              // ID user
  eventId: number;             // ID event
  rating: number;              // Rating 1-5 stars
  comment: string | null;      // Komentar review
  createdAt: Date;             // Waktu dibuat
  user: {                      
    id: number;
    name: string;
    email: string;
    role: string;
  };
  event: {                     
    eventId: number;
    title: string;
    category: string;
    location: string;
    startsAt: Date;
    endsAt: Date;
    organizer: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export interface PaginatedReviewResponse {
  data: ReviewWithRelations[]; // Array data reviews
  pagination: {
    page: number;              // Halaman saat ini
    limit: number;             // Limit item per halaman
    total: number;             // Total semua reviews
    totalPages: number;        // Total halaman
    hasNext: boolean;          // Apakah ada halaman selanjutnya
    hasPrev: boolean;          // Apakah ada halaman sebelumnya
  };
}

export interface ReviewStats {
  totalReviews: number;        // Total semua reviews
  averageRating: number;       // Rating rata-rata
  ratingDistribution: {        // Distribusi rating
    "1": number;               // Jumlah rating 1 star
    "2": number;               // Jumlah rating 2 stars
    "3": number;               // Jumlah rating 3 stars
    "4": number;               // Jumlah rating 4 stars
    "5": number;               // Jumlah rating 5 stars
  };
  reviewsWithComments: number; // Jumlah reviews dengan komentar
  reviewsWithoutComments: number; // Jumlah reviews tanpa komentar
}

export class CreateReviewDTO implements CreateReviewData {
  // Required fields
  eventId: number = 0;
  rating: number = 5;
  comment: string = "";

  constructor(data?: Partial<CreateReviewData>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validasi eventId
    if (!this.eventId || this.eventId <= 0) {
      errors.push("Event ID harus valid dan lebih dari 0");
    }

    // Validasi rating
    if (!this.rating || this.rating < 1 || this.rating > 5) {
      errors.push("Rating harus antara 1-5");
    }

    // Validasi comment (opsional)
    if (this.comment && this.comment.length > 1000) {
      errors.push("Komentar maksimal 1000 karakter");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
  