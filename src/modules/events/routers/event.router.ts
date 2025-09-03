import { Router } from "express"; 
import { createEvent, getEvents, getEventById, getOrganizerEvents } from "../controllers/event.controller"; 
import { authMiddleware, organizerOnly } from "../../../middleware/auth.middleware";

const EventRouter = Router();

// ========================================
// EVENT DISCOVERY ENDPOINTS (PUBLIC ACCESS)
// ========================================

// GET /api/events - Mendapatkan daftar semua event dengan filter opsional
// Query parameters: category, location, q (search query)
// Response: Array of events dengan data organizer dan promotions
EventRouter.get("/", getEvents);

// GET /api/events/:id - Mendapatkan detail event berdasarkan ID
// Path parameter: id (event ID)
// Response: Event detail dengan promotions, reviews, dan organizer info
EventRouter.get("/get-eventby/:id", getEventById);

// ========================================
// EVENT MANAGEMENT ENDPOINTS (PROTECTED)
// ========================================

// POST /api/events - Membuat event baru (ORGANIZER ONLY)
// Middleware: authMiddleware (validasi JWT token) + organizerOnly (validasi role)
// Request body: title, category, location, priceIdr, startsAt, endsAt, quantity, description, ticketTypes, isFree
// Response: Event yang baru dibuat dengan data organizer
EventRouter.post("/", authMiddleware, organizerOnly, createEvent);

// OrganizerOnly routes:
EventRouter.get("/organizer", authMiddleware, organizerOnly, getOrganizerEvents);
EventRouter.post("/", authMiddleware, organizerOnly, createEvent);

// Export router untuk digunakan di app.ts
export { EventRouter };
