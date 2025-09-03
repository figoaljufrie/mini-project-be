import { Request, Response } from "express";
import { EventService } from "../services/event.service";
import { handleError } from "../../../helpers/handleError";

const eventService = new EventService();

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { category, location, q, upcomingOnly } = req.query;

    // Hanya kirim parameter yang ada nilainya (tidak undefined)
    const params: any = {};
    if (category) params.category = String(category);
    if (location) params.location = String(location);
    if (q) params.searchQuery = String(q);
    if (upcomingOnly !== undefined) {
      // Convert query string to boolean
      params.upcomingOnly = upcomingOnly === "true";
    }

    const events = await eventService.getEvents(params);
    return res.json(events);
  } catch (error: any) {
    console.error("Error in getEvents controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(Number(id));

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrganizerEvents = async (req: Request, res: Response) => {
  try {
    const userId = (res.locals.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { page, limit } = req.query;
    const data = await eventService.getEventsByOrganizer(
      userId,
      Number(page) || 1,
      Number(limit) || 20
    );

    return res.json(data.data);
  } catch (error) {
    return handleError(res, "Failed to get organizer events.", 500, (error as Error).message);
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      category,
      location,
      priceIdr,
      startsAt,
      endsAt,
      quantity,
      description,
      ticketTypes,
      isFree,
    } = req.body;

    // Type assertion untuk mengakses user dari auth middleware
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const event = await eventService.createEvent({
      title,
      category,
      location,
      priceIdr,
      startsAt,
      endsAt,
      quantity,
      description,
      ticketTypes,
      isFree,
      organizerId: userId,
    });

    return res.status(201).json(event);
  } catch (error) {
    return  handleError(res, "Failed to login.", 500, (error as Error).message);
  }
};
