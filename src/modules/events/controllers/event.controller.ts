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
    handleError(
            res,
            "Failed to get event",
            500,
            (error as Error).message
          );
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
     handleError(
            res,
            "Failed to get event by id",
            500,
            (error as Error).message
          );
  }
};

export const getOrganizerEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Call the service to get events
    const data = await eventService.getEventsByOrganizer(userId);
    return res.json(data); // front-end gets exactly what it expects
  } catch (error) {
    console.error("Error in getOrganizerEvents:", error);
    handleError(
            res,
            "Failed to get Event for organizer",
            500,
            (error as Error).message
          );
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
    handleError(
            res,
            "Failed to create event",
            500,
            (error as Error).message
          );
  }
};
