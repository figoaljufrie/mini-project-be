// Enum untuk kategori event yang tersedia
export enum EventCategory {
  MUSIC = "MUSIC",           // Event musik, konser, festival
  SPORTS = "SPORTS",         // Event olahraga, turnamen, pertandingan
  BUSINESS = "BUSINESS",     // Event bisnis, seminar, workshop
  TECHNOLOGY = "TECHNOLOGY", // Event teknologi, hackathon, conference
  ARTS = "ARTS",            // Event seni, pameran, pertunjukan
  EDUCATION = "EDUCATION",   // Event pendidikan, training, webinar
  ENTERTAINMENT = "ENTERTAINMENT", // Event hiburan, comedy, theater
  FOOD = "FOOD",            // Event kuliner, food festival, cooking class
  HEALTH = "HEALTH",        // Event kesehatan, fitness, wellness
  OTHER = "OTHER"           // Event lainnya
}

// Enum untuk jenis tiket yang tersedia
export enum TicketType {
  VIP = "VIP",               // Tiket VIP dengan fasilitas premium
  REGULAR = "REGULAR",       // Tiket regular standar
  EARLY_BIRD = "EARLY_BIRD", // Tiket early bird dengan diskon
  STUDENT = "STUDENT",       // Tiket khusus pelajar/mahasiswa
  CORPORATE = "CORPORATE"    // Tiket untuk perusahaan
}

// Interface untuk data event yang akan dibuat (wajib)
export interface CreateEventData {
  title: string;             // Judul event (wajib)
  category: EventCategory;   // Kategori event dari enum (wajib)
  location: string;          // Lokasi event (wajib)
  priceIdr: number;          // Harga tiket dalam IDR (wajib)
  startsAt: string;          // Waktu mulai event dalam format ISO string (wajib)
  endsAt: string;            // Waktu selesai event dalam format ISO string (wajib)
  quantity: number;          // Jumlah tiket yang tersedia (wajib)
  description: string;       // Deskripsi detail event (wajib)
  ticketTypes: string;       // Jenis tiket yang tersedia (wajib)
  isFree: boolean;           // Apakah event gratis atau berbayar (wajib)
}

// Interface untuk data event tambahan (opsional)
export interface CreateEventOptionalData {
  bannerUrl?: string;        // URL banner event (opsional)
  tags?: string[];           // Array tags untuk event (opsional)
  termsAndConditions?: string; // Syarat dan ketentuan (opsional)
  refundPolicy?: string;     // Kebijakan refund (opsional)
  maxAttendees?: number;     // Maksimal peserta (opsional)
  ageRestriction?: string;   // Batasan umur (opsional)
  dressCode?: string;        // Kode berpakaian (opsional)
  facilities?: string[];     // Fasilitas yang tersedia (opsional)
}

// Interface lengkap untuk create event
export interface CreateEventFullData extends CreateEventData, CreateEventOptionalData {}

// DTO class untuk validasi data create event
export class CreateEventDTO implements CreateEventData {
  
  // Required fields
  title: string = "";                    // Judul event (wajib)
  category: EventCategory = EventCategory.OTHER; // Kategori event (wajib)
  location: string = "";                 // Lokasi event (wajib)
  priceIdr: number = 0;                  // Harga tiket dalam IDR (wajib)
  startsAt: string = "";                 // Waktu mulai event (wajib)
  endsAt: string = "";                   // Waktu selesai event (wajib)
  quantity: number = 1;                  // Jumlah tiket yang tersedia (wajib)
  description: string = "";              // Deskripsi detail event (wajib)
  ticketTypes: string = "";              // Jenis tiket yang tersedia (wajib)
  isFree: boolean = false;               // Status event gratis (wajib)

  // Optional fields
  bannerUrl?: string;                    // URL banner event
  tags?: string[];                       // Array tags untuk event
  termsAndConditions?: string;           // Syarat dan ketentuan
  refundPolicy?: string;                 // Kebijakan refund
  maxAttendees?: number;                 // Maksimal peserta
  ageRestriction?: string;               // Batasan umur
  dressCode?: string;                    // Kode berpakaian
  facilities?: string[];                 // Fasilitas yang tersedia

  // Constructor untuk inisialisasi data
  constructor(data?: Partial<CreateEventFullData>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  // Method untuk validasi data
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validasi required fields
    if (!this.title.trim()) {
      errors.push("Judul event tidak boleh kosong");
    }
    if (this.title.length > 200) {
      errors.push("Judul event maksimal 200 karakter");
    }

    if (!this.category) {
      errors.push("Kategori event harus dipilih");
    }

    if (!this.location.trim()) {
      errors.push("Lokasi event tidak boleh kosong");
    }
    if (this.location.length > 500) {
      errors.push("Lokasi event maksimal 500 karakter");
    }

    if (this.priceIdr < 0) {
      errors.push("Harga tiket tidak boleh negatif");
    }

    if (!this.startsAt) {
      errors.push("Waktu mulai event harus diisi");
    }

    if (!this.endsAt) {
      errors.push("Waktu selesai event harus diisi");
    }

    if (this.quantity < 1) {
      errors.push("Jumlah tiket minimal 1");
    }

    if (!this.description.trim()) {
      errors.push("Deskripsi event tidak boleh kosong");
    }
    if (this.description.length > 2000) {
      errors.push("Deskripsi event maksimal 2000 karakter");
    }

    if (!this.ticketTypes.trim()) {
      errors.push("Jenis tiket harus diisi");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Interface untuk response setelah create event berhasil
export interface CreateEventResponse {
  success: boolean;           // Status keberhasilan
  message: string;            // Pesan response
  data: {
    eventId: number;          // ID event yang baru dibuat
    title: string;            // Judul event
    category: EventCategory;  // Kategori event
    location: string;         // Lokasi event
    startsAt: string;         // Waktu mulai
    endsAt: string;           // Waktu selesai
    quantity: number;         // Jumlah tiket
    priceIdr: number;         // Harga tiket
    isFree: boolean;          // Status gratis
    organizerId: number;      // ID organizer
    createdAt: string;        // Waktu dibuat
    updatedAt: string;        // Waktu terakhir update
  };
}

// Interface untuk error response
export interface CreateEventErrorResponse {
  success: false;             // Status selalu false untuk error
  message: string;            // Pesan error
  errors?: Array<{            // Detail error validasi (opsional)
    field: string;            // Field yang error
    message: string;          // Pesan error untuk field tersebut
  }>;
}

// Interface untuk query parameters saat search events
export interface SearchEventQuery {
  category?: EventCategory;   // Filter berdasarkan kategori
  location?: string;          // Filter berdasarkan lokasi
  searchQuery?: string;       // Query pencarian judul
  minPrice?: number;          // Filter harga minimum
  maxPrice?: number;          // Filter harga maksimum
  dateFrom?: string;          // Filter tanggal mulai
  dateTo?: string;            // Filter tanggal selesai
  isFree?: boolean;           // Filter event gratis/berbayar
  page?: number;              // Halaman untuk pagination
  limit?: number;             // Limit item per halaman
}
