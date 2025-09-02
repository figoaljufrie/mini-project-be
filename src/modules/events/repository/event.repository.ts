// Import dependencies yang diperlukan
import { prisma } from "../../../utils/prisma"; // Prisma client untuk akses database
import { EventCategory, SearchEventQuery } from "../dto/create-event.dto"; // Import DTO dan enums

// Interface untuk parameter pencarian event dengan pagination
export interface GetEventsParams {
  category?: EventCategory; // Filter berdasarkan kategori event
  location?: string; // Filter berdasarkan lokasi event
  searchQuery?: string; // Query pencarian judul event
  minPrice?: number; // Filter harga minimum
  maxPrice?: number; // Filter harga maksimum
  dateFrom?: string; // Filter tanggal mulai
  dateTo?: string; // Filter tanggal selesai
  isFree?: boolean; // Filter event gratis/berbayar
  page?: number; // Halaman untuk pagination
  limit?: number; // Limit item per halaman
  organizerId?: number; // Filter berdasarkan organizer
  upcomingOnly?: boolean; // Hanya event yang akan datang
}

// Interface untuk response pagination
export interface PaginatedResponse<T> {
  data: T[]; // Array data events
  pagination: {
    page: number; // Halaman saat ini
    limit: number; // Limit item per halaman
    total: number; // Total semua events
    totalPages: number; // Total halaman
    hasNext: boolean; // Apakah ada halaman selanjutnya
    hasPrev: boolean; // Apakah ada halaman sebelumnya
  };
}

// Interface untuk event dengan relasi lengkap
export interface EventWithRelations {
  eventId: number; // ID event
  title: string; // Judul event
  category: string; // Kategori event
  location: string; // Lokasi event
  startsAt: Date; // Waktu mulai
  endsAt: Date; // Waktu selesai
  quantity: number; // Jumlah tiket
  priceIdr: number; // Harga tiket
  isFree: boolean; // Status gratis
  description: string; // Deskripsi event
  ticketTypes: string | null; // Jenis tiket
  createdAt: Date; // Waktu dibuat
  updatedAt: Date; // Waktu terakhir update
  organizerId: number; // ID organizer
  organizer: {
    // Data organizer
    id: number;
    name: string;
    email: string;
    role: string;
  };
  promotions: Array<{
    // Data promotions
    id: number;
    discount: number;
    startDate: Date;
    endDate: Date;
  }>;
  reviews: Array<{
    // Data reviews
    id: number;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: {
      id: number;
      name: string;
    };
  }>;
  transactions: Array<{
    // Data transactions
    id: number;
    status: string;
    totalIdr: number;
    createdAt: Date;
  }>;
}

// Repository class untuk mengelola operasi database event
export class EventRepository {
  /**
   * Mendapatkan daftar events dengan filter dan pagination
   * @param params - Parameter filter dan pagination
   * @returns Events dengan informasi pagination
   */
  async getEvents(
    params: GetEventsParams = {}
  ): Promise<PaginatedResponse<EventWithRelations>> {
    const {
      category,
      location,
      searchQuery,
      minPrice,
      maxPrice,
      dateFrom,
      dateTo,
      isFree,
      page = 1,
      limit = 10,
      organizerId,
      upcomingOnly = false,
    } = params;

    // Hitung offset untuk pagination
    const offset = (page - 1) * limit;

    // Build where clause untuk filter
    const whereClause: any = {};

    // Filter berdasarkan kategori
    if (category) {
      whereClause.category = category;
    }

    // Filter berdasarkan lokasi (case insensitive)
    if (location) {
      whereClause.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    // Filter berdasarkan pencarian judul (case insensitive)
    if (searchQuery) {
      whereClause.title = {
        contains: searchQuery,
        mode: "insensitive",
      };
    }

    // Filter berdasarkan range harga
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.priceIdr = {};
      if (minPrice !== undefined) {
        whereClause.priceIdr.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        whereClause.priceIdr.lte = maxPrice;
      }
    }

    // Filter berdasarkan range tanggal
    if (dateFrom || dateTo) {
      whereClause.startsAt = {};
      if (dateFrom) {
        whereClause.startsAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.startsAt.lte = new Date(dateTo);
      }
    }

    // Filter berdasarkan status gratis
    if (isFree !== undefined) {
      whereClause.isFree = isFree;
    }

    // Filter berdasarkan organizer
    if (organizerId) {
      whereClause.organizerId = organizerId;
    }

    // Hanya tampilkan event yang belum dimulai
    if (upcomingOnly) {
      whereClause.startsAt = {
        ...whereClause.startsAt,
        gte: new Date(),
      };
    }

    // Query untuk mendapatkan total events (untuk pagination)
    const total = await prisma.event.count({
      where: whereClause,
    });

    // Query untuk mendapatkan events dengan relasi
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        // Include data organizer
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        // Include data promotions
        promotions: {
          select: {
            id: true,
            discount: true,
            startDate: true,
            endDate: true,
          },
        },
        // Include data reviews
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        // Include data transactions
        transactions: {
          select: {
            id: true,
            status: true,
            totalIdr: true,
            createdAt: true,
          },
        },
      },
      // Ordering berdasarkan waktu mulai (yang paling awal dulu)
      orderBy: {
        startsAt: "asc",
      },
      // Pagination
      skip: offset,
      take: limit,
    });

    // Hitung total halaman
    const totalPages = Math.ceil(total / limit);

    return {
      data: events as EventWithRelations[],
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
   * Mendapatkan event berdasarkan ID dengan relasi lengkap
   * @param eventId - ID event yang dicari
   * @returns Event detail dengan semua relasi
   */
  async getEventById(eventId: number): Promise<EventWithRelations | null> {
    const event = await prisma.event.findUnique({
      where: { eventId },
      include: {
        // Include data organizer
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        // Include data promotions
        promotions: {
          select: {
            id: true,
            discount: true,
            startDate: true,
            endDate: true,
          },
        },
        // Include data reviews
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        // Include data transactions
        transactions: {
          select: {
            id: true,
            status: true,
            totalIdr: true,
            createdAt: true,
          },
        },
      },
    });

    return event as EventWithRelations | null;
  }

  /**
   * Membuat event baru
   * @param eventData - Data event yang akan dibuat
   * @returns Event yang baru dibuat
   */
  async createEvent(eventData: {
    title: string;
    category: string;
    location: string;
    priceIdr: number;
    startsAt: Date;
    endsAt: Date;
    quantity: number;
    description: string;
    ticketTypes: string;
    isFree: boolean;
    organizerId: number;
  }) {
    const event = await prisma.event.create({
      data: eventData,
      include: {
        // Include data organizer
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return event;
  }

  /**
   * Update event berdasarkan ID
   * @param eventId - ID event yang akan diupdate
   * @param updateData - Data yang akan diupdate
   * @returns Event yang sudah diupdate
   */
  async updateEvent(
    eventId: number,
    updateData: Partial<{
      title: string;
      category: string;
      location: string;
      priceIdr: number;
      startsAt: Date;
      endsAt: Date;
      quantity: number;
      description: string;
      ticketTypes: string;
      isFree: boolean;
    }>
  ) {
    const event = await prisma.event.update({
      where: { eventId },
      data: updateData,
      include: {
        // Include data organizer
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return event;
  }

  /**
   * Delete event berdasarkan ID
   * @param eventId - ID event yang akan didelete
   * @returns Event yang sudah didelete
   */
  async deleteEvent(eventId: number) {
    const event = await prisma.event.delete({
      where: { eventId },
    });

    return event;
  }

  /**
   * Mendapatkan events berdasarkan organizer ID
   * @param organizerId - ID organizer
   * @param page - Halaman
   * @param limit - Limit item per halaman
   * @returns Events yang dibuat oleh organizer tertentu
   */
  async getEventsByOrganizer(organizerId: number, page = 1, limit = 10) {
    return this.getEvents({ organizerId, page, limit, upcomingOnly: false });
  }

  /**
   * Mendapatkan events yang akan segera dimulai (dalam 7 hari)
   * @param limit - Limit item yang ditampilkan
   * @returns Events yang akan segera dimulai
   */
  async getUpcomingEvents(limit: number = 5) {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const events = await prisma.event.findMany({
      where: {
        startsAt: {
          gte: new Date(),
          lte: sevenDaysFromNow,
        },
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startsAt: "asc",
      },
      take: limit,
    });

    return events;
  }

  /**
   * Mendapatkan statistik events
   * @param organizerId - ID organizer (opsional)
   * @returns Statistik events
   */
  async getEventStats(organizerId?: number) {
    const whereClause = organizerId ? { organizerId } : {};

    const [totalEvents, upcomingEvents, completedEvents, totalRevenue] =
      await Promise.all([
        // Total events
        prisma.event.count({ where: whereClause }),

        // Events yang akan datang
        prisma.event.count({
          where: {
            ...whereClause,
            startsAt: { gte: new Date() },
          },
        }),

        // Events yang sudah selesai
        prisma.event.count({
          where: {
            ...whereClause,
            endsAt: { lt: new Date() },
          },
        }),

        // Total revenue dari transactions
        prisma.transaction.aggregate({
          where: {
            ...whereClause,
            status: "DONE",
          },
          _sum: {
            totalIdr: true,
          },
        }),
      ]);

    return {
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalRevenue: totalRevenue._sum.totalIdr || 0,
    };
  }
}
