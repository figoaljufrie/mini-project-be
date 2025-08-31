export interface CreateTransactionData {
  eventId: number;            
  couponId?: number;         
  pointsUsed?: number;        
}

// Enum untuk status transaction (sesuai dengan schema Prisma)
export enum TransactionStatus {
  WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT",
  WAITING_FOR_ADMIN_CONFIRMATION = "WAITING_FOR_ADMIN_CONFIRMATION",
  DONE = "DONE",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
  CANCELED = "CANCELED"
}

// Interface untuk response setelah create transaction berhasil
export interface CreateTransactionResponse {
  success: boolean;            // Status keberhasilan
  message: string;             // Pesan response
  data: {
    id: number;                // ID transaction yang baru dibuat
    userId: number;            // ID user yang membeli
    eventId: number;           // ID event yang dibeli
    status: TransactionStatus; // Status transaction
    totalIdr: number;          // Total harga dalam IDR
    couponId?: number;         // ID coupon yang digunakan (jika ada)
    createdAt: string;         // Waktu dibuat
    event: {                   // Info event
      title: string;
      category: string;
      location: string;
      startsAt: string;
      endsAt: string;
      priceIdr: number;
      isFree: boolean;
    };
    user: {                    // Info user
      id: number;
      name: string;
      email: string;
      points: number;          // Points yang tersisa
    };
  };
}

// Interface untuk error response
export interface CreateTransactionErrorResponse {
  success: false;              // Status selalu false untuk error
  message: string;             // Pesan error
  errors?: Array<{             // Detail error validasi (opsional)
    field: string;             // Field yang error
    message: string;           // Pesan error untuk field tersebut
  }>;
}

// Interface untuk query parameters saat search transactions
export interface SearchTransactionQuery {
  userId?: number;             // Filter berdasarkan user ID
  eventId?: number;            // Filter berdasarkan event ID
  status?: TransactionStatus;  // Filter berdasarkan status transaction
  dateFrom?: string;           // Filter tanggal mulai
  dateTo?: string;             // Filter tanggal selesai
  minAmount?: number;          // Filter jumlah minimum
  maxAmount?: number;          // Filter jumlah maksimum
  page?: number;               // Halaman untuk pagination
  limit?: number;              // Limit item per halaman
}

// Interface untuk update transaction status
export interface UpdateTransactionStatusData {
  status: TransactionStatus;   // Status baru untuk transaction
  adminNotes?: string;         // Catatan admin (opsional)
}

// Interface untuk transaction dengan relasi lengkap
export interface TransactionWithRelations {
  id: number;                  // ID transaction
  userId: number;              // ID user
  eventId: number;             // ID event
  status: TransactionStatus;   // Status transaction
  totalIdr: number;            // Total harga dalam IDR
  createdAt: Date;             // Waktu dibuat
  couponId?: number;           // ID coupon (opsional)
  
  // Relasi data
  user: {                      // Data user
    id: number;
    name: string;
    email: string;
    points: number;
  };
  event: {                     // Data event
    eventId: number;
    title: string;
    category: string;
    location: string;
    startsAt: Date;
    endsAt: Date;
    priceIdr: number;
    isFree: boolean;
    organizer: {
      id: number;
      name: string;
      email: string;
    };
  };
  coupon?: {                   // Data coupon (opsional)
    id: number;
    code: string;
    discountIdr: number;
    type: string;
  };
}

// Interface untuk response pagination
export interface PaginatedTransactionResponse {
  data: TransactionWithRelations[];  // Array data transactions
  pagination: {
    page: number;              // Halaman saat ini
    limit: number;             // Limit item per halaman
    total: number;             // Total semua transactions
    totalPages: number;        // Total halaman
    hasNext: boolean;          // Apakah ada halaman selanjutnya
    hasPrev: boolean;          // Apakah ada halaman sebelumnya
  };
}
