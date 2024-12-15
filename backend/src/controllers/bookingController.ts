import { Request, Response } from "express";
import BookingService from "../services/bookingService";
import { CustomError } from "../error/customError";
import { handleError } from "../utils/handleError";
import Booking, { bookingDocument } from "../models/bookingModel";

class BookingController {
  async bookAnEvent(req: Request, res: Response): Promise<void> {
    try {
      const vendorId: string = req.query.vendorId as string;
      const roomId: string = req.query.roomId as string;
      const userId: string = req.query.userId as string;

      const { checkIn, checkOut, adultCount, childCount } = req.body;

      // Check if the date range is available
      const isDateRangeAvailable =
        await BookingService.checkIfDateRangeAvailable(
          roomId,
          checkIn,
          checkOut
        );

      if (!isDateRangeAvailable) {
        throw new CustomError("Sorry, this date range is not available!", 404);
      } else {
        try {
          await BookingService.acquireLockForDateRange(
            roomId,
            checkIn,
            checkOut
          );

          const booking = await BookingService.addABooking(
            checkIn,
            checkOut,
            vendorId,
            roomId,
            userId
          );

          await BookingService.releaseLockForDate(roomId, checkIn, checkOut);

          res
            .status(201)
            .json({ booking, message: "Booking done successfully" });
        } catch (error) {
          if (error instanceof CustomError && error.statusCode === 400) {
            res.status(400).json({ message: error.message });
          }

          res.status(400).json({
            message: "Sorry, this date range is currently not available.",
          });
        }
      }
    } catch (error) {
      handleError(res, error, "bookAnEvent");
    }
  }

  async getBookingsByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId: string = req.query.userId as string;
      const page: number = parseInt(req.query.page as string) || 1;
      const pageSize: number = parseInt(req.query.pageSize as string) || 6;
      const { bookings, totalBookings } =
        await BookingService.getAllBookingsByUser(userId, page, pageSize);
      const totalPages = Math.ceil(totalBookings / pageSize);
      res.status(201).json({ bookings, totalPages: totalPages });
    } catch (error) {
      handleError(res, error, "getBookingsByUser");
    }
  }

  async getBookingsById(req: Request, res: Response): Promise<void> {
    try {
      const bookingId: string = req.query.bookingId as string;
      const bookings = await BookingService.getAllBookingsById(bookingId);
      res.status(201).json({ bookings });
    } catch (error) {
      handleError(res, error, "getBookingsById");
    }
  }

  async cancelBookingByUser(req: Request, res: Response): Promise<void> {
    try {
      const bookingId: string = req.query.bookingId as string;
      const status = "Cancelled";
      const bookings = await BookingService.updateStatusById(bookingId, status);
      res.status(201).json({ bookings });
    } catch (error) {
      handleError(res, error, "cancelBookingByUser");
    }
  }

  async getBookingsByVendor(req: Request, res: Response): Promise<void> {
    try {
      const vendorId: string = req.query.vendorId as string;
      const page: number = parseInt(req.query.page as string) || 1;
      const pageSize: number = parseInt(req.query.pageSize as string) || 8;

      const { bookings, totalBookings } =
        await BookingService.getAllBookingsByVendor(vendorId, page, pageSize);
      const totalPages = Math.ceil(totalBookings / pageSize);

      res.status(201).json({ bookings, totalPages: totalPages });
    } catch (error) {
      handleError(res, error, "getBookingsByVendor");
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const bookingId: string = req.query.bookingId as string;
      const status = req.body.status;
      const bookings = await BookingService.updateStatusById(bookingId, status);
      res.status(201).json({ bookings });
    } catch (error) {
      handleError(res, error, "updateStatus");
    }
  }

  async getRefundDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId: string = req.query.userId as string;
      const page: number = parseInt(req.query.page as string) || 1;
      const pageSize: number = parseInt(req.query.pageSize as string) || 4;
      const { refund, totalRefund } = await BookingService.getAllRefunds(
        userId,
        page,
        pageSize
      );
      const totalPages = Math.ceil(totalRefund / pageSize);
      res.status(201).json({ transaction: refund, totalPages: totalPages });
    } catch (error) {
      handleError(res, error, "getRefundDetails");
    }
  }

  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const { hotel, page = 1, limit = 6 } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const filter: any = {};
      if (hotel) {
        filter.hotel = hotel;
      }

      const totalBookings = await Booking.countDocuments(filter);
      const bookings = await Booking.find(filter)
        .populate("userId", "name email")
        .populate("vendorId", "name phone")
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      res.status(200).json({
        bookings,
        totalBookings,
        totalPages: Math.ceil(totalBookings / limitNumber),
        currentPage: pageNumber,
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  }
}

export default new BookingController();
