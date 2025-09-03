// Import Prisma client untuk akses database
import { prisma } from "../../../utils/prisma";
import {
  EventRepository,
  EventWithRelations,
  PaginatedResponse,
} from "../repository/event.repository";

// Interface untuk parameter pencarian event
interface GetEventsParams {
  category?: string; // Filter berdasarkan kategori event (misal: Music, Sports, Business)
  location?: string; // Filter berdasarkan lokasi event
  searchQuery?: string; // Query pencarian untuk judul event
  upcomingOnly?: boolean; // Hanya event yang akan datang
}

// Interface untuk parameter pembuatan event baru
interface CreateEventParams {
  title: string; // Judul event
  category: string; // Kategori event
  location: string; // Lokasi event
  priceIdr: number; // Harga tiket dalam IDR
  startsAt: string | Date; // Waktu mulai event
  endsAt: string | Date; // Waktu selesai event
  quantity: number; // Jumlah tiket yang tersedia
  description: string; // Deskripsi detail event
  ticketTypes: string; // Jenis tiket (VIP, Regular, dll) - string tunggal sesuai schema
  isFree: boolean; // Apakah event gratis atau berbayar
  organizerId: number; // ID user yang membuat event (organizer)
}

export interface FrontendEvent {
  eventId: number;
  title: string;
  category: string;
  location: string;
  startsAt: string; // string, because front-end expects ISO
  endsAt: string;
  quantity: number;
  priceIdr: number;
  isFree: boolean;
  description: string;
  ticketTypes: string;
  organizer: {
    id: number;
    name: string;
    email: string;
  };
  thumbnailUrl: string;
  thumbnailPublicId: string;
}

// Service class untuk mengelola operasi event
export class EventService {
  /**
   * Mendapatkan daftar event dengan filter opsional
   * @param params - Parameter filter untuk pencarian event
   * @returns Array of events yang sesuai dengan kriteria
   */

  eventRepository = new EventRepository();

  async getEvents(params: GetEventsParams) {
    const { category, location, searchQuery, upcomingOnly = false } = params;

    // Query database untuk mencari event yang sesuai kriteria
    return await prisma.event.findMany({
      where: {
        // Filter berdasarkan kategori jika ada
        ...(category && { category }),
        // Filter berdasarkan lokasi jika ada
        ...(location && { location }),
        // Pencarian berdasarkan judul event (case insensitive) jika ada
        ...(searchQuery && {
          title: { contains: searchQuery, mode: "insensitive" },
        }),
        // Hanya event yang belum dimulai (startsAt >= hari ini)
        startsAt: { gte: new Date() },
      },
      include: {
        // Include data promotions untuk event
        promotions: true,
        // Include data organizer (user yang membuat event)
        organizer: {
          select: {
            id: true, // ID organizer
            name: true, // Nama organizer
            email: true, // Email organizer
          },
        },
      },
      orderBy: {
        // Urutkan berdasarkan waktu mulai (yang paling awal dulu)
        startsAt: "asc",
      },
    });
  }

  /**
   * Mendapatkan detail event berdasarkan ID
   * @param id - ID event yang dicari
   * @returns Event detail dengan semua relasi yang diperlukan
   */
  async getEventById(id: number) {
    try {
      return await prisma.event.findUnique({
        where: { eventId: id },
        include: {
          promotions: true,
          reviews: true,
          organizer: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (error) {
      console.error("Error in getEventById:", error);
      throw new Error("Failed to fetch event by id");
    }
  }

  async getEventsByOrganizer(organizerId: number): Promise<FrontendEvent[]> {
    try {
      const events = await prisma.event.findMany({
        where: { organizerId },
        orderBy: { startsAt: "asc" },
        include: {
          organizer: { select: { id: true, name: true, email: true } },
        },
      });

      // Map ke format FrontendEvent
      return events.map((e) => ({
        eventId: e.eventId,
        title: e.title,
        category: e.category,
        location: e.location,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
        quantity: e.quantity,
        priceIdr: e.priceIdr,
        isFree: e.isFree,
        description: e.description,
        ticketTypes: e.ticketTypes ?? "",
        organizer: {
          id: e.organizer.id,
          name: e.organizer.name,
          email: e.organizer.email,
        },
        thumbnailUrl: e.thumbnailUrl ?? "",
        thumbnailPublicId: e.thumbnailPublicId ?? "",
      }));
    } catch (error) {
      console.error("Error in getEventsByOrganizer:", error);
      throw new Error("Failed to fetch organizer events");
    }
  }

  /**
   * Membuat event baru
   * @param params - Data event yang akan dibuat
   * @returns Event yang baru dibuat dengan data organizer
   */
  async createEvent(params: CreateEventParams) {
    const { startsAt, endsAt, ...eventData } = params;

    // Query database untuk membuat event baru
    return await prisma.event.create({
      data: {
        ...eventData, // Semua data event lainnya
        startsAt: new Date(startsAt), // Convert string ke Date object
        endsAt: new Date(endsAt), // Convert string ke Date object
      },
      include: {
        // Include data organizer untuk response
        organizer: {
          select: {
            id: true, // ID organizer
            name: true, // Nama organizer
            email: true, // Email organizer
          },
        },
      },
    });
  }
}
